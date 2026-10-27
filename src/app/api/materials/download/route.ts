import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Vulnerability: Path Traversal / Arbitrary File Read (OWASP A01: Broken Access Control)
// Uses path.join without verifying that the resolved path stays within the public/materials boundary
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({
        error: 'Missing file query parameter',
        example: '/api/materials/download?file=syllabus-cloud.txt'
      }, { status: 400 });
    }

    // Insecure path resolution: allowing directory traversal sequences (../ or ..\)
    const baseDir = path.join(process.cwd(), 'public', 'materials');
    const targetFilePath = path.join(baseDir, fileName);

    // Notice: Lack of path verification check (e.g. targetFilePath.startsWith(baseDir))
    if (!fs.existsSync(targetFilePath)) {
      return NextResponse.json({
        error: `File not found at resolved system path: ${targetFilePath}`,
        attemptedPath: targetFilePath
      }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const isText = fileName.endsWith('.txt') || fileName.endsWith('.json') || fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.md');

    if (isText) {
      return new Response(fileBuffer.toString('utf-8'), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-VulLMS-Path-Traversal-Target': targetFilePath
        }
      });
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.basename(fileName)}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
