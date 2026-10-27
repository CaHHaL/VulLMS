import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const sanitizedUsers = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    gpa: u.gpa,
    credits: u.credits
  }));

  return NextResponse.json({
    users: sanitizedUsers,
    count: sanitizedUsers.length
  });
}
