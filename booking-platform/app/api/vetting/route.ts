import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { submitVettingSchema, reviewVettingSchema } from '@/lib/validators';
import { logAction, AuditActions, getRequestMetadata } from '@/lib/audit';
import { notifyClientVettingStatus } from '@/lib/whatsapp';
import { formatPhoneForWhatsApp } from '@/lib/utils';
import { generateSecureFilename } from '@/lib/encryption';

/**
 * POST /api/vetting
 * Client submits vetting application
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can submit vetting' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = submitVettingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if user already has a pending or approved application
    const { data: existingApp, error: existingError } = await serviceClient
      .from('vetting_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: `You already have a ${existingApp.status} vetting application` },
        { status: 400 }
      );
    }

    // Generate secure filename for ID document
    const secureFilename = generateSecureFilename(data.file_name, user.id);

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('ids')
      .createSignedUploadUrl(secureFilename);

    if (uploadError) {
      console.error('Upload URL generation error:', uploadError);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }

    // Create vetting application
    const { data: application, error: appError } = await serviceClient
      .from('vetting_applications')
      .insert({
        user_id: user.id,
        status: 'pending',
        id_document_url: secureFilename,
        id_expiry_date: data.id_expiry_date,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError) {
      console.error('Vetting application creation error:', appError);
      return NextResponse.json({ error: 'Failed to create vetting application' }, { status: 500 });
    }

    // Log the action
    const metadata = getRequestMetadata(request.headers);
    await logAction({
      user_id: user.id,
      action: AuditActions.VETTING_SUBMITTED,
      resource_type: 'vetting_application',
      resource_id: application.id,
      details: {
        id_expiry_date: data.id_expiry_date,
      },
      ...metadata,
    });

    return NextResponse.json({
      application,
      upload_url: uploadData.signedUrl,
      upload_path: uploadData.path,
    });
  } catch (error) {
    console.error('Vetting submission exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/vetting
 * Get vetting applications (for admin or current user)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let query = supabase
      .from('vetting_applications')
      .select(`
        *,
        user:users!user_id(*),
        reviewed_by_user:users!reviewed_by(*)
      `)
      .order('submitted_at', { ascending: false });

    // Filter based on role
    if (profile.role === 'client') {
      query = query.eq('user_id', user.id);
    }
    // Admins see all applications (no filter)

    const { data: applications, error: applicationsError } = await query;

    if (applicationsError) {
      console.error('Vetting applications fetch error:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch vetting applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Vetting fetch exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/vetting
 * Admin reviews vetting application
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can review vetting' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reviewVettingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get application with user details
    const { data: application, error: appError } = await serviceClient
      .from('vetting_applications')
      .select(`
        *,
        user:users!user_id(*)
      `)
      .eq('id', data.application_id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application
    const { data: updatedApp, error: updateError } = await serviceClient
      .from('vetting_applications')
      .update({
        status: data.status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: data.rejection_reason || null,
        notes: data.notes || null,
      })
      .eq('id', data.application_id)
      .select()
      .single();

    if (updateError) {
      console.error('Vetting update error:', updateError);
      return NextResponse.json({ error: 'Failed to update vetting' }, { status: 500 });
    }

    // Log the action
    const metadata = getRequestMetadata(request.headers);
    await logAction({
      user_id: user.id,
      action: data.status === 'approved'
        ? AuditActions.VETTING_APPROVED
        : AuditActions.VETTING_REJECTED,
      resource_type: 'vetting_application',
      resource_id: data.application_id,
      details: {
        user_id: application.user_id,
        status: data.status,
        rejection_reason: data.rejection_reason,
      },
      ...metadata,
    });

    // Notify client
    if (application.user && application.user.phone) {
      try {
        const clientPhone = formatPhoneForWhatsApp(application.user.phone);
        await notifyClientVettingStatus(clientPhone, data.status, data.rejection_reason);
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    return NextResponse.json({ application: updatedApp });
  } catch (error) {
    console.error('Vetting review exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
