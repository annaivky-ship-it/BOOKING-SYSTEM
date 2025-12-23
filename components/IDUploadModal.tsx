import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, Check, LoaderCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface IDUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    clientName: string;
    onSuccess: (filePath: string) => void;
    onError: (error: string) => void;
}

const IDUploadModal: React.FC<IDUploadModalProps> = ({
    isOpen,
    onClose,
    bookingId,
    clientName,
    onSuccess,
    onError,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const validateFile = (selectedFile: File) => {
          setError(null);

          if (!ALLOWED_TYPES.includes(selectedFile.type)) {
                  const errorMsg = 'Invalid file type. Please upload a PDF or image (JPEG, PNG, WebP).';
                  setError(errorMsg);
                  return false;
          }

          if (selectedFile.size > MAX_FILE_SIZE) {
                  const errorMsg = 'File size exceeds 10MB limit. Please choose a smaller file.';
                  setError(errorMsg);
                  return false;
          }

          return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile && validateFile(selectedFile)) {
                  setFile(selectedFile);
                  setError(null);
          }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();

          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile && validateFile(droppedFile)) {
                  setFile(droppedFile);
                  setError(null);
          }
    };

    const handleUpload = async () => {
          if (!file) {
                  setError('Please select a file to upload.');
                  return;
          }

          setUploading(true);
          setError(null);

          try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${bookingId}_${Date.now()}.${fileExt}`;
                  const filePath = `id_documents/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                    .from('id_documents')
                    .upload(filePath, file, { upsert: true });

            if (uploadError) {
                      throw new Error(uploadError.message || 'Upload failed');
            }

            // Get the public URL
            const { data: publicData } = supabase.storage
                    .from('id_documents')
                    .getPublicUrl(filePath);

            onSuccess(publicData.publicUrl || filePath);
                  setSuccess(true);
                  setFile(null);

            // Auto-close after 2 seconds
            setTimeout(() => {
                      setSuccess(false);
                      onClose();
            }, 2000);
          } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
                  setError(errorMessage);
                  onError(errorMessage);
          } finally {
                  setUploading(false);
          }
    };

    if (!isOpen) return null;

    return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
                  {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                              <FileText className="text-blue-500" size={24} />
                                              Upload Client ID
                                  </h2>h2>
                                  <button
                                                onClick={onClose}
                                                disabled={uploading}
                                                className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                              >
                                              <X size={24} />
                                  </button>button>
                        </div>div>
                
                  {/* Content */}
                        <div className="p-6 space-y-4">
                                  <div>
                                              <p className="text-sm text-zinc-300 mb-2">
                                                            Uploading ID for: <span className="font-semibold text-orange-400">{clientName}</span>span>
                                              </p>p>
                                              <p className="text-xs text-zinc-500">Booking ID: {bookingId}</p>p>
                                  </div>div>
                        
                          {/* File Upload Area */}
                                  <div
                                                onDrop={handleDrop}
                                                onDragOver={(e) => e.preventDefault()}
                                                className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group"
                                              >
                                    {file ? (
                                                              <div className="flex flex-col items-center gap-2">
                                                                              <Check size={32} className="text-green-500" />
                                                                              <p className="text-sm font-semibold text-white">{file.name}</p>p>
                                                                              <p className="text-xs text-zinc-400">
                                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                              </p>p>
                                                              </div>div>
                                                            ) : (
                                                              <>
                                                                              <Upload size={32} className="text-zinc-400 group-hover:text-blue-400 mx-auto mb-2" />
                                                                              <p className="text-sm font-semibold text-zinc-300 mb-1">
                                                                                                Drag and drop your file here
                                                                              </p>p>
                                                                              <p className="text-xs text-zinc-500 mb-4">or</p>p>
                                                                              <label className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                                                                                                Browse your computer
                                                                                                <input
                                                                                                                      type="file"
                                                                                                                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                                                                                      onChange={handleFileSelect}
                                                                                                                      className="hidden"
                                                                                                                      disabled={uploading}
                                                                                                                    />
                                                                              </label>label>
                                                              </>>
                                                            )}
                                  </div>div>
                        
                          {/* File Info */}
                                  <div className="bg-zinc-800/50 rounded-lg p-3">
                                              <p className="text-xs font-semibold text-zinc-300 mb-2">Supported formats:</p>p>
                                              <div className="flex flex-wrap gap-2">
                                                {['PDF', 'JPEG', 'PNG', 'WebP'].map((format) => (
                            <span key={format} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                              {format}
                            </span>span>
                          ))}
                                              </div>div>
                                              <p className="text-xs text-zinc-500 mt-2">Maximum file size: 10MB</p>p>
                                  </div>div>
                        
                          {/* Error Message */}
                          {error && (
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-3">
                                      <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-red-300">{error}</p>p>
                        </div>div>
                                  )}
                        
                          {/* Success Message */}
                          {success && (
                        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 flex gap-3">
                                      <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-green-300">ID document uploaded successfully!</p>p>
                        </div>div>
                                  )}
                        </div>div>
                
                  {/* Footer */}
                        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                                  <button
                                                onClick={onClose}
                                                disabled={uploading}
                                                className="px-6 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 font-medium"
                                              >
                                              Cancel
                                  </button>button>
                                  <button
                                                onClick={handleUpload}
                                                disabled={!file || uploading}
                                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                                              >
                                    {uploading ? (
                                                              <>
                                                                              <LoaderCircle size={18} className="animate-spin" />
                                                                              Uploading...
                                                              </>>
                                                            ) : (
                                                              <>
                                                                              <Upload size={18} />
                                                                              Upload ID
                                                              </>>
                                                            )}
                                  </button>button>
                        </div>div>
                </div>div>
          </div>div>
        );
};

export default IDUploadModal;</></></></div>
