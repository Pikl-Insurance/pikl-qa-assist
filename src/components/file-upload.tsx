'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileAudio, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCallFilename, validateBatch } from '@/lib/metadata-parser';
import { UploadProgressTracker } from '@/components/upload-progress-tracker';
import type { UploadProgress, CallMetadata } from '@/types';

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number; // in bytes
  onUpload?: (files: File[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (will auto-compress for Whisper API)
const MAX_FILES = 50;
const ACCEPTED_TYPES = {
  'audio/wav': ['.wav'],
  'audio/x-wav': ['.wav'],
};

export function FileUpload({
  maxFiles = MAX_FILES,
  maxSize = MAX_FILE_SIZE,
  onUpload,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, CallMetadata>>({});
  const [uploadedCalls, setUploadedCalls] = useState<Array<{ callId: string; filename: string }>>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Clear previous errors
      setErrors([]);
      const newErrors: string[] = [];
      const duplicateWarnings: string[] = [];

      // Handle rejected files
      rejectedFiles.forEach((rejection) => {
        const file = rejection.file;
        rejection.errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            newErrors.push(`${file.name}: File size exceeds 50MB upload limit`);
          } else if (error.code === 'file-invalid-type') {
            newErrors.push(`${file.name}: Only WAV files are accepted`);
          } else {
            newErrors.push(`${file.name}: ${error.message}`);
          }
        });
      });

      // Check total number of files
      if (files.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed per batch`);
        setErrors(newErrors);
        return;
      }

      // Check for duplicates against existing calls
      try {
        const response = await fetch('/api/calls');
        const result = await response.json();
        const existingCalls = result.data?.calls || [];
        const existingFilenames = new Set(existingCalls.map((call: any) => call.filename));

        acceptedFiles.forEach((file) => {
          if (existingFilenames.has(file.name)) {
            duplicateWarnings.push(`⚠️ ${file.name}: Already uploaded - will skip to avoid duplication`);
          }
        });
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      }

      // Validate filenames and extract metadata
      const newMetadata = { ...metadata };
      acceptedFiles.forEach((file) => {
        const parseResult = parseCallFilename(file.name);
        if (!parseResult.success) {
          newErrors.push(`${file.name}: ${parseResult.error}`);
        } else {
          newMetadata[file.name] = parseResult.metadata!;
        }
      });

      if (newErrors.length > 0 || duplicateWarnings.length > 0) {
        setErrors([...duplicateWarnings, ...newErrors]);
      }

      // Add accepted files
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      setMetadata(newMetadata);

      // Initialize progress for new files
      const newProgress = { ...uploadProgress };
      acceptedFiles.forEach((file) => {
        newProgress[file.name] = {
          filename: file.name,
          progress: 0,
          status: 'pending',
        };
      });
      setUploadProgress(newProgress);
    },
    [files, maxFiles, uploadProgress, metadata]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize,
    maxFiles,
    multiple: true,
  });

  const removeFile = (fileName: string) => {
    setFiles(files.filter((f) => f.name !== fileName));
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);

    const newMetadata = { ...metadata };
    delete newMetadata[fileName];
    setMetadata(newMetadata);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const uploadedCallsList: Array<{ callId: string; filename: string }> = [];
    const progressUpdates = { ...uploadProgress };

    // Process files one at a time in a queue
    for (const file of files) {
      // Update to uploading status
      progressUpdates[file.name] = { ...progressUpdates[file.name], status: 'uploading', progress: 50 };
      setUploadProgress({ ...progressUpdates });

      try {
        // Create FormData for single file
        const formData = new FormData();
        formData.append('files', file);

        // Upload to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.data?.calls && result.data.calls.length > 0) {
          // Mark file as complete
          progressUpdates[file.name] = {
            ...progressUpdates[file.name],
            status: 'complete',
            progress: 100,
          };
          setUploadProgress({ ...progressUpdates });

          // Add to uploaded calls list
          uploadedCallsList.push({
            callId: result.data.calls[0].id,
            filename: result.data.calls[0].filename,
          });
        } else {
          // Mark file as error
          progressUpdates[file.name] = {
            ...progressUpdates[file.name],
            status: 'error',
            progress: 0,
            error: result.error || 'Upload failed',
          };
          setUploadProgress({ ...progressUpdates });
        }

        // Small delay between uploads to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);

        // Mark as error
        progressUpdates[file.name] = {
          ...progressUpdates[file.name],
          status: 'error',
          progress: 0,
          error: 'Network error',
        };
        setUploadProgress({ ...progressUpdates });
      }
    }

    // Set uploaded calls for progress tracking
    if (uploadedCallsList.length > 0) {
      setUploadedCalls(uploadedCallsList);

      // Call parent callback if provided
      if (onUpload) {
        onUpload(files);
      }
    }

    // Clear files after upload completes
    setTimeout(() => {
      setFiles([]);
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-dashed'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />

          {isDragActive ? (
            <p className="text-lg font-semibold text-primary">Drop files here</p>
          ) : (
            <>
              <p className="text-lg font-semibold mb-2">
                Drag and drop WAV files here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse your computer
              </p>
              <Button variant="secondary" size="sm">
                Select Files
              </Button>
            </>
          )}

          <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
            <p>Maximum file size: 50MB (auto-compressed if needed)</p>
            <p>Maximum files per batch: {maxFiles}</p>
            <p>Accepted format: WAV audio files</p>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* File List - hide when processing is shown to avoid confusion */}
      {files.length > 0 && uploadedCalls.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Selected Files ({files.length})
            </h3>
            <Button onClick={handleUpload} size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((file) => {
              const progress = uploadProgress[file.name];
              const meta = metadata[file.name];
              return (
                <Card key={file.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileAudio className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>

                          {/* Display extracted metadata */}
                          {meta && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                <span className="font-semibold">Extracted Metadata:</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                  <span className="text-muted-foreground">Agent:</span>{' '}
                                  <span className="font-medium">{meta.agentName}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Agent ID:</span>{' '}
                                  <span className="font-medium">{meta.agentId}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Phone:</span>{' '}
                                  <span className="font-medium">{meta.phoneNumber}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Call ID:</span>{' '}
                                  <span className="font-medium">{meta.callId}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {progress && progress.status !== 'pending' && (
                            <div className="mt-2 space-y-2">
                              <Progress value={progress.progress} />
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    progress.status === 'complete'
                                      ? 'default'
                                      : progress.status === 'error'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {progress.status}
                                </Badge>
                                {progress.status === 'complete' && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.name)}
                        disabled={progress?.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Trackers for Uploaded Calls */}
      {uploadedCalls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Uploaded Calls ({uploadedCalls.length})</h3>
            {uploadedCalls.some(call => call.callId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedCalls([])}
              >
                Clear All
              </Button>
            )}
          </div>
          {uploadedCalls.map((call) => (
            <UploadProgressTracker
              key={call.callId}
              callId={call.callId}
              filename={call.filename}
              // Don't remove on complete - keep them visible so user can click "View Analysis"
            />
          ))}
        </div>
      )}
    </div>
  );
}
