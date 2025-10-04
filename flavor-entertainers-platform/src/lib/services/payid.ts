import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PayIDAccount, PayIDTransaction, PayIDTransactionWithDetails } from '@/lib/types/database';

export class PayIDService {
  private supabase = createClientComponentClient();

  // Australian PayID Registry configuration
  private readonly PAYID_REGISTRY_URL = process.env.PAYID_REGISTRY_URL || 'https://payid.com.au/api';
  private readonly BANK_NETWORKS = {
    'Commonwealth Bank': { bsb_prefix: '06', name: 'CBA' },
    'Westpac': { bsb_prefix: '03', name: 'WBC' },
    'ANZ': { bsb_prefix: '01', name: 'ANZ' },
    'NAB': { bsb_prefix: '08', name: 'NAB' },
    'Bendigo Bank': { bsb_prefix: '63', name: 'BEN' },
    'ING': { bsb_prefix: '92', name: 'ING' },
    'Macquarie Bank': { bsb_prefix: '18', name: 'MBL' },
    'Bank of Queensland': { bsb_prefix: '12', name: 'BOQ' },
    'Suncorp Bank': { bsb_prefix: '48', name: 'SUN' },
    'Newcastle Permanent': { bsb_prefix: '65', name: 'NPB' }
  };

  /**
   * Setup a new PayID account for a user
   */
  async setupPayIDAccount(data: {
    payid_identifier: string;
    payid_type: 'email' | 'phone' | 'abn';
    account_name: string;
    bank_name: string;
    bsb?: string;
    account_number?: string;
  }): Promise<{ success: boolean; account?: PayIDAccount; error?: string }> {
    try {
      const response = await fetch('/api/payid/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Setup failed' };
      }

      return { success: true, account: result.payid_account };
    } catch (error) {
      console.error('PayID setup error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Verify a PayID account
   */
  async verifyPayIDAccount(
    accountId: string,
    verificationCode?: string,
    verificationMethod: 'email_verification' | 'sms_verification' | 'document_verification' = 'email_verification'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/payid/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payid_account_id: accountId,
          verification_code: verificationCode,
          verification_method: verificationMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Verification failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('PayID verification error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get user's PayID accounts
   */
  async getPayIDAccounts(): Promise<{
    success: boolean;
    accounts?: (PayIDAccount & { transaction_stats: any })[];
    error?: string;
  }> {
    try {
      const response = await fetch('/api/payid/accounts');
      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to fetch accounts' };
      }

      return { success: true, accounts: result.accounts };
    } catch (error) {
      console.error('PayID accounts fetch error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Send a PayID payment
   */
  async sendPayment(data: {
    recipient_payid: string;
    amount: number;
    description: string;
    reference?: string;
    booking_id?: string;
  }): Promise<{
    success: boolean;
    transaction?: PayIDTransaction;
    transaction_id?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/payid/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Payment failed' };
      }

      return {
        success: true,
        transaction: result.transaction,
        transaction_id: result.transaction_id,
      };
    } catch (error) {
      console.error('PayID payment error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get PayID transactions
   */
  async getTransactions(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{
    success: boolean;
    transactions?: PayIDTransactionWithDetails[];
    total?: number;
    has_more?: boolean;
    error?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.status) searchParams.set('status', params.status);

      const response = await fetch(`/api/payid/transactions?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to fetch transactions' };
      }

      return {
        success: true,
        transactions: result.transactions,
        total: result.total,
        has_more: result.has_more,
      };
    } catch (error) {
      console.error('PayID transactions fetch error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update PayID account status
   */
  async updateAccountStatus(
    accountId: string,
    action: 'activate' | 'deactivate' | 'set_primary'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/payid/accounts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Update failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('PayID account update error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Delete/deactivate PayID account
   */
  async deleteAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/payid/accounts?account_id=${accountId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Deletion failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('PayID account deletion error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Validate PayID format based on type
   */
  validatePayIDFormat(identifier: string, type: 'email' | 'phone' | 'abn'): boolean {
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(identifier);

      case 'phone':
        // Australian phone number format
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        return phoneRegex.test(identifier.replace(/\s+/g, ''));

      case 'abn':
        // Australian Business Number format (11 digits)
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(identifier.replace(/\s+/g, ''));

      default:
        return false;
    }
  }

  /**
   * Get bank information from BSB
   */
  getBankFromBSB(bsb: string): { name: string; code: string } | null {
    const cleanBSB = bsb.replace(/\D/g, '');
    if (cleanBSB.length !== 6) return null;

    const prefix = cleanBSB.substring(0, 2);

    for (const [bankName, config] of Object.entries(this.BANK_NETWORKS)) {
      if (config.bsb_prefix === prefix) {
        return { name: bankName, code: config.name };
      }
    }

    return null;
  }

  /**
   * Format PayID identifier for display
   */
  formatPayIDIdentifier(identifier: string, type: 'email' | 'phone' | 'abn'): string {
    switch (type) {
      case 'phone':
        // Format Australian phone number
        const cleanPhone = identifier.replace(/\D/g, '');
        if (cleanPhone.startsWith('61')) {
          return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
        } else if (cleanPhone.startsWith('0')) {
          return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
        }
        return identifier;

      case 'abn':
        // Format ABN with spaces
        const cleanABN = identifier.replace(/\D/g, '');
        if (cleanABN.length === 11) {
          return `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8)}`;
        }
        return identifier;

      case 'email':
      default:
        return identifier;
    }
  }

  /**
   * Calculate PayID transaction fees (for display purposes)
   */
  calculateFees(amount: number): { fee: number; net: number } {
    // PayID transactions are typically free for consumers
    // This is for display/estimation purposes only
    const fee = 0;
    const net = amount - fee;

    return { fee, net };
  }

  /**
   * Get transaction status color for UI
   */
  getTransactionStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get available Australian banks for PayID
   */
  getAvailableBanks(): Array<{ name: string; code: string; bsb_prefix: string }> {
    return Object.entries(this.BANK_NETWORKS).map(([name, config]) => ({
      name,
      code: config.name,
      bsb_prefix: config.bsb_prefix,
    }));
  }

  /**
   * Generate payment instructions for PayID
   */
  generatePaymentInstructions(
    payidIdentifier: string,
    amount: number,
    reference: string,
    accountName?: string
  ): string {
    return `
Payment Instructions:

1. Open your banking app or online banking
2. Select "Pay Someone" or "New Payment"
3. Enter PayID: ${payidIdentifier}
${accountName ? `4. Verify account name: ${accountName}` : '4. Verify the account name matches the booking'}
5. Amount: $${amount.toFixed(2)} AUD
6. Reference: ${reference}
7. Complete the payment

Your booking will be confirmed once payment is received.
`.trim();
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'AUD'): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

// Singleton instance
export const payidService = new PayIDService();

// Legacy compatibility exports
export const createPayIDAccount = payidService.setupPayIDAccount.bind(payidService);
export const validatePayID = async (identifier: string) => {
  if (payidService.validatePayIDFormat(identifier, 'email') ||
      payidService.validatePayIDFormat(identifier, 'phone')) {
    return { isValid: true, accountName: 'Mock Account', bankName: 'Mock Bank' };
  }
  return { isValid: false, error: 'Invalid PayID format' };
};
export const formatCurrency = payidService.formatCurrency.bind(payidService);

/**
 * Calculate payment fees (legacy compatibility)
 */
export function calculatePaymentFees(amount: number, method: string = 'payid'): {
  feeAmount: number;
  netAmount: number;
  feePercentage: number;
} {
  let feePercentage = 0;

  switch (method) {
    case 'payid':
      feePercentage = 0; // PayID is typically free
      break;
    case 'credit_card':
      feePercentage = 0.029; // 2.9%
      break;
    case 'bank_transfer':
      feePercentage = 0.01; // 1.0%
      break;
    default:
      feePercentage = 0;
  }

  const feeAmount = Math.round(amount * feePercentage * 100) / 100;
  const netAmount = amount - feeAmount;

  return {
    feeAmount,
    netAmount,
    feePercentage: feePercentage * 100
  };
}