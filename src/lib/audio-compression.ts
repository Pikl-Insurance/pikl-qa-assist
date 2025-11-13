import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Compress audio file to meet OpenAI Whisper API size requirements
 * Reduces sample rate to 16kHz (sufficient for speech) and uses higher compression
 */
export async function compressAudioIfNeeded(
  inputPath: string,
  filename: string
): Promise<{ path: string; compressed: boolean; originalSize: number; finalSize: number }> {
  try {
    // Check file size
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    console.log(`[COMPRESSION] Checking file: ${filename}`);
    console.log(`[COMPRESSION] Input path: ${inputPath}`);
    console.log(`[COMPRESSION] Original size: ${formatBytes(originalSize)} (${originalSize} bytes)`);
    console.log(`[COMPRESSION] Size limit: ${formatBytes(MAX_FILE_SIZE)} (${MAX_FILE_SIZE} bytes)`);

    // If file is under 25MB, no compression needed
    if (originalSize <= MAX_FILE_SIZE) {
      console.log(`[COMPRESSION] ✓ File is under limit, no compression needed`);
      return {
        path: inputPath,
        compressed: false,
        originalSize,
        finalSize: originalSize,
      };
    }

    console.log(`[COMPRESSION] ⚠ File exceeds limit by ${formatBytes(originalSize - MAX_FILE_SIZE)}, starting compression...`);

    // Create output path with .mp3 extension
    // AssemblyAI and Whisper both support MP3, so keep it as MP3 (much smaller than WAV)
    const outputPath = inputPath.replace(/\.(wav|m4a|mp3)$/i, '_compressed.mp3');

    // Compress to MP3 (very efficient for speech)
    // Use 32kbps for aggressive compression - perfect for speech (~3.8MB per minute)
    console.log(`[COMPRESSION] Converting to MP3 at 32kbps...`);
    const mp3Command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-ar', '16000',           // Sample rate: 16kHz (sufficient for speech)
      '-ac', '1',               // Mono audio (reduces size by ~50% if stereo)
      '-b:a', '32k',            // Bit rate: 32kbps
      '-y',
      `"${outputPath}"`
    ].join(' ');

    console.log(`[COMPRESSION] Running: ${mp3Command}`);
    await execAsync(mp3Command);

    // Check compressed file size
    const compressedStats = await fs.stat(outputPath);
    const finalSize = compressedStats.size;
    console.log(`[COMPRESSION] ✓ MP3 created: ${formatBytes(finalSize)} (${finalSize} bytes)`);

    const reductionPercent = ((1 - finalSize / originalSize) * 100).toFixed(1);
    console.log(
      `[COMPRESSION] ========================================\n` +
      `[COMPRESSION] Compression complete:\n` +
      `[COMPRESSION]   Original: ${formatBytes(originalSize)} (${originalSize} bytes)\n` +
      `[COMPRESSION]   Final:    ${formatBytes(finalSize)} (${finalSize} bytes)\n` +
      `[COMPRESSION]   Saved:    ${formatBytes(originalSize - finalSize)} (${reductionPercent}% reduction)\n` +
      `[COMPRESSION] ========================================`
    );

    // Warn if still too large (shouldn't happen with MP3 compression)
    if (finalSize > MAX_FILE_SIZE) {
      console.warn(
        `Warning: Compressed file is still ${(finalSize / 1024 / 1024).toFixed(2)}MB (over 25MB limit). ` +
        `This may fail transcription.`
      );
    }

    // Clean up original file
    await fs.unlink(inputPath).catch(() => {});

    return {
      path: outputPath,
      compressed: true,
      originalSize,
      finalSize,
    };
  } catch (error) {
    console.error('Audio compression error:', error);
    throw new Error(`Failed to compress audio: ${(error as Error).message}`);
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
