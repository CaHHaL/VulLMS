export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar: string;
  bio?: string;
  enrolledCourses: string[];
  gpa?: number;
  credits?: number;
  is_admin?: boolean;
  phone?: string;
  ssn_last4?: string;
  private_notes?: string;
  apiKey?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructorId: string;
  instructorName: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  duration: string;
  totalStudents: number;
  rating: number;
  isPublished: boolean;
  isDraft?: boolean;
  price: number;
  modules: {
    id: string;
    title: string;
    duration: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      videoUrl?: string;
      content?: string;
    }[];
  }[];
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  assignmentName: string;
  grade: string;
  score: number;
  maxScore: number;
  instructorFeedback: string;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  verificationHash: string;
  instructorName: string;
  gradeAchieved: string;
}
