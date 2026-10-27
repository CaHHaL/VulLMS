import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const publishedCourses = db.courses.filter(c => c.isPublished);
  return NextResponse.json({
    courses: publishedCourses,
    count: publishedCourses.length
  });
}
