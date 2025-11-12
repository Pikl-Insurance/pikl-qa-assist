'use client';

import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function UploadPage() {
  const handleUpload = (files: File[]) => {
    console.log('Uploading files:', files);
    // TODO: Implement actual upload logic in Task 6 (API route)
    // For now, just log the files
    files.forEach((file) => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Call Recordings</h1>
        <p className="text-muted-foreground mt-2">
          Upload WAV files for automatic transcription and AI-powered quality analysis
        </p>
      </div>

      <FileUpload onUpload={handleUpload} />
    </div>
  );
}
