'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  FileImage,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptUploadProps {
  bookingId: string;
  amount: number;
  payidEmail: string;
  onUploadComplete?: (receiptUrl: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function ReceiptUpload({
  bookingId,
  amount,
  payidEmail,
  onUploadComplete,
  onUploadError,
  className,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ReceiptUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedFile({
      file,
      preview,
      status: 'uploading',
    });

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', bookingId);
      formData.append('amount', amount.toString());

      const response = await fetch('/api/payments/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const result = await response.json();

      setUploadedFile(prev => prev ? {
        ...prev,
        status: 'success',
      } : null);

      onUploadComplete?.(result.receiptUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setUploadedFile(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage,
      } : null);

      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [bookingId, amount, validateFile, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const removeFile = useCallback(() => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  }, [uploadedFile]);

  const capturePhoto = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileUpload(target.files[0]);
      }
    };
    input.click();
  }, [handleFileUpload]);

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Upload Payment Receipt</CardTitle>
        <CardDescription>
          Upload a screenshot or photo of your PayID payment confirmation to {payidEmail}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">Payment Amount</span>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              ${amount.toFixed(2)} AUD
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">PayID Email</span>
            <span className="text-sm text-blue-700 font-mono">{payidEmail}</span>
          </div>
        </div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Upload your payment receipt
                  </h3>
                  <p className="text-xs text-gray-500">
                    Drag and drop, or click to select a file
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="w-full sm:w-auto"
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={capturePhoto}
                    className="w-full sm:w-auto"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileInput}
                  className="hidden"
                />

                <p className="text-xs text-gray-400">
                  Supports JPEG, PNG, WebP up to {maxFileSize}MB
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={uploadedFile.preview}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="p-1 h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {uploadedFile.status === 'uploading' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-600">Uploading...</span>
                      </>
                    )}
                    {uploadedFile.status === 'success' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Upload successful</span>
                      </>
                    )}
                    {uploadedFile.status === 'error' && (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Upload failed</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {uploadedFile.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> Make sure your receipt clearly shows the payment amount,
            recipient email, and transaction timestamp. This helps us verify your payment quickly.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}