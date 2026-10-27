import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: Stored Cross-Site Scripting (Stored XSS - OWASP A03)
// Stores raw unescaped HTML content from users and returns it to be rendered directly into DOM
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const posts = db.discussions.filter(d => d.courseId === courseId);

    return NextResponse.json({
      success: true,
      courseId,
      discussions: posts
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const courseId = params.id;
    const body = await req.json();

    const { content } = body;
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const author = session.user || db.users[2]; // Default to student

    // VULNERABILITY: Content is stored directly WITHOUT sanitization (e.g. DOMPurify or HTML escaping)
    const newPost = {
      id: `dsc_${Date.now()}`,
      courseId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      authorAvatar: author.avatar,
      content: content, // Raw unescaped payload stored here
      createdAt: new Date().toISOString(),
      likes: 0
    };

    db.discussions.push(newPost);

    return NextResponse.json({
      success: true,
      message: 'Discussion post created successfully',
      post: newPost
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
