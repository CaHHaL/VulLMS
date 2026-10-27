import { User, Course, DiscussionPost, GradeRecord, Certificate } from './types';

// Global singleton in memory so it persists across Next.js API hot-reloads and serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __vullms_db: {
    users: User[];
    courses: Course[];
    discussions: DiscussionPost[];
    grades: GradeRecord[];
    certificates: Certificate[];
    auditLogs: { timestamp: string; action: string; user?: string; details?: any }[];
  } | undefined;
}

const initialUsers: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Eleanor Vance (Chief Security Officer)',
    email: 'admin@vullms.internal',
    password: 'SuperAdminPassword2026!',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Platform root administrator. Manages infrastructure and internal course curriculum.',
    enrolledCourses: ['crs_cloud_101', 'crs_cyber_204'],
    is_admin: true,
    apiKey: 'vul_live_9941a87b32c94ef0_root_secret',
    phone: '+1 (555) 019-2834',
    ssn_last4: '9921',
    private_notes: 'CONFIDENTIAL: Root credentials rotated quarterly. Backup database key in Vault cluster-eu.'
  },
  {
    id: 'usr_inst_02',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@vullms.internal',
    password: 'ProfessorPass2026#',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Lead Instructor for Advanced Distributed Systems & Cyber Defense Architecture.',
    enrolledCourses: [],
    apiKey: 'vul_inst_3948bf8120_auth',
    phone: '+1 (555) 438-1920',
    private_notes: 'Faculty review: Approved for teaching graduate level security engineering.'
  },
  {
    id: 'usr_stu_101',
    name: 'Alice Sterling (Victim Student)',
    email: 'alice@student.edu',
    password: 'AliceStudent123!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Undergraduate student researching cloud virtualization and software safety.',
    enrolledCourses: ['crs_cloud_101', 'crs_cyber_204'],
    gpa: 3.94,
    credits: 48,
    phone: '+1 (555) 789-2314',
    ssn_last4: '4109',
    private_notes: 'Academic probation risk: NONE. Recipient of Dean Merit Scholarship 2026. Private Medical Accommodation on file.'
  },
  {
    id: 'usr_stu_102',
    name: 'Bob Miller (Tester / Attacker Account)',
    email: 'bob@student.edu',
    password: 'BobTestingPassword456!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Bug bounty researcher and student exploring LMS access management controls.',
    enrolledCourses: ['crs_cloud_101'],
    gpa: 3.12,
    credits: 12,
    phone: '+1 (555) 341-9988',
    ssn_last4: '8832',
    private_notes: 'Academic standing: Good. Account currently used for vulnerability benchmark evaluation.'
  },
  {
    id: 'usr_stu_103',
    name: 'Charlie Zhang',
    email: 'charlie@student.edu',
    password: 'CharlieSecure987!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    bio: 'Cybersecurity honors fellow.',
    enrolledCourses: ['crs_cyber_204', 'crs_ai_305'],
    gpa: 3.85,
    credits: 36,
    phone: '+1 (555) 672-1100',
    ssn_last4: '1904',
    private_notes: 'Honor council committee student representative.'
  }
];

const initialCourses: Course[] = [
  {
    id: 'crs_cloud_101',
    title: 'Enterprise Cloud Architecture & DevSecOps',
    slug: 'cloud-architecture-devsecops',
    instructorId: 'usr_inst_02',
    instructorName: 'Dr. Marcus Vance',
    description: 'Master microservices architecture, serverless pipelines, Kubernetes clusters, and container defense strategies.',
    level: 'Intermediate',
    category: 'Cloud Engineering',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
    duration: '14 Weeks',
    totalStudents: 1420,
    rating: 4.9,
    isPublished: true,
    price: 199,
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Cloud Foundation & IAM Policies',
        duration: '3.5 hrs',
        lessons: [
          { id: 'les_1', title: '1.1 Principles of Least Privilege in VPCs', duration: '45 mins' },
          { id: 'les_2', title: '1.2 Role-Based Access Control Architecture', duration: '50 mins' }
        ]
      },
      {
        id: 'mod_2',
        title: 'Module 2: Container Security & Serverless',
        duration: '4.2 hrs',
        lessons: [
          { id: 'les_3', title: '2.1 Hardening Docker Daemon & Kubernetes Namespaces', duration: '60 mins' },
          { id: 'les_4', title: '2.2 Secret Ingestion & Vault Configuration', duration: '55 mins' }
        ]
      }
    ]
  },
  {
    id: 'crs_cyber_204',
    title: 'Offensive Security & Automated Vulnerability Triage',
    slug: 'offensive-security-triage',
    instructorId: 'usr_inst_02',
    instructorName: 'Dr. Marcus Vance',
    description: 'Practical training on web application vulnerabilities, automated scanning validation, and defensive remediation.',
    level: 'Advanced',
    category: 'Cybersecurity',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    duration: '16 Weeks',
    totalStudents: 2180,
    rating: 4.95,
    isPublished: true,
    price: 249,
    modules: [
      {
        id: 'mod_204_1',
        title: 'Module 1: OWASP Top 10 Deep Dive',
        duration: '5 hrs',
        lessons: [
          { id: 'les_204_1', title: '1.1 Identification & Access Control Failures', duration: '60 mins' },
          { id: 'les_204_2', title: '1.2 Server-Side Request Forgery and Path Manipulation', duration: '75 mins' }
        ]
      }
    ]
  },
  {
    id: 'crs_ai_305',
    title: 'Deep Learning & Neural Network Foundations',
    slug: 'deep-learning-neural-networks',
    instructorId: 'usr_inst_02',
    instructorName: 'Dr. Marcus Vance',
    description: 'Explore neural network architectures, transformers, and model safety benchmarks.',
    level: 'Intermediate',
    category: 'Artificial Intelligence',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600',
    duration: '12 Weeks',
    totalStudents: 980,
    rating: 4.8,
    isPublished: true,
    price: 189,
    modules: [
      {
        id: 'mod_305_1',
        title: 'Module 1: Tensors, Backpropagation & Loss Optimization',
        duration: '4 hrs',
        lessons: [
          { id: 'les_305_1', title: '1.1 Gradient Descent and Autograd Engines', duration: '60 mins' }
        ]
      }
    ]
  },
  {
    id: 'crs_secret_999',
    title: '[UNPUBLISHED / DRAFT] Internal Penetration Testing Exam Keys & Solutions',
    slug: 'internal-pentest-keys-draft',
    instructorId: 'usr_inst_02',
    instructorName: 'Dr. Marcus Vance',
    description: 'RESTRICTED FACULTY ACCESS ONLY: Contains official midterm exam answer keys, flags, and grading rubric.',
    level: 'Advanced',
    category: 'Restricted Internal',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
    duration: 'Exam Key',
    totalStudents: 0,
    rating: 5.0,
    isPublished: false,
    isDraft: true,
    price: 9999,
    modules: []
  }
];

const initialGrades: GradeRecord[] = [
  {
    id: 'grd_8001',
    studentId: 'usr_stu_101',
    courseId: 'crs_cloud_101',
    courseTitle: 'Enterprise Cloud Architecture & DevSecOps',
    assignmentName: 'Lab 1: Multi-Region VPC Hardening',
    grade: 'A+',
    score: 98,
    maxScore: 100,
    instructorFeedback: 'Flawless routing table design and security group isolation. Excellent work Alice!',
    submittedAt: '2026-10-15T14:30:00Z'
  },
  {
    id: 'grd_8002',
    studentId: 'usr_stu_101',
    courseId: 'crs_cyber_204',
    courseTitle: 'Offensive Security & Automated Vulnerability Triage',
    assignmentName: 'Midterm: Access Control Bypass Assessment',
    grade: 'A',
    score: 95,
    maxScore: 100,
    instructorFeedback: 'Clear vulnerability impact breakdown. Alice continues to lead the cohort.',
    submittedAt: '2026-10-20T11:15:00Z'
  },
  {
    id: 'grd_8003',
    studentId: 'usr_stu_102',
    courseId: 'crs_cloud_101',
    courseTitle: 'Enterprise Cloud Architecture & DevSecOps',
    assignmentName: 'Lab 1: Multi-Region VPC Hardening',
    grade: 'C-',
    score: 68,
    maxScore: 100,
    instructorFeedback: 'Ingress rules left wide open on port 22. Bob needs to review security boundary fundamentals.',
    submittedAt: '2026-10-14T09:20:00Z'
  },
  {
    id: 'grd_8004',
    studentId: 'usr_stu_103',
    courseId: 'crs_cyber_204',
    courseTitle: 'Offensive Security & Automated Vulnerability Triage',
    assignmentName: 'Midterm: Access Control Bypass Assessment',
    grade: 'B+',
    score: 87,
    maxScore: 100,
    instructorFeedback: 'Good methodology, but missed secondary CSRF chain in section 4.',
    submittedAt: '2026-10-19T16:00:00Z'
  }
];

const initialCertificates: Certificate[] = [
  {
    id: 'cert_1001',
    certificateNumber: 'CERT-2026-ALICE-CLOUD',
    studentId: 'usr_stu_101',
    studentName: 'Alice Sterling',
    courseId: 'crs_cloud_101',
    courseTitle: 'Enterprise Cloud Architecture & DevSecOps',
    issueDate: '2026-09-30',
    verificationHash: 'e7c2f821a9987dc3391b10f274a12903ce4',
    instructorName: 'Dr. Marcus Vance',
    gradeAchieved: 'A+ (Summa Cum Laude)'
  },
  {
    id: 'cert_1002',
    certificateNumber: 'CERT-2026-CHARLIE-CYBER',
    studentId: 'usr_stu_103',
    studentName: 'Charlie Zhang',
    courseId: 'crs_cyber_204',
    courseTitle: 'Offensive Security & Automated Vulnerability Triage',
    issueDate: '2026-10-05',
    verificationHash: 'a89c2014fb003291884ca91885918bb1291',
    instructorName: 'Dr. Marcus Vance',
    gradeAchieved: 'B+ (Honors)'
  }
];

const initialDiscussions: DiscussionPost[] = [
  {
    id: 'dsc_1',
    courseId: 'crs_cloud_101',
    authorId: 'usr_inst_02',
    authorName: 'Dr. Marcus Vance',
    authorRole: 'instructor',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Welcome everyone! For Lab 2, remember that IAM policies evaluate explicit Denies before allows.',
    createdAt: '2026-10-18T10:00:00Z',
    likes: 14
  },
  {
    id: 'dsc_2',
    courseId: 'crs_cloud_101',
    authorId: 'usr_stu_101',
    authorName: 'Alice Sterling',
    authorRole: 'student',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'Thank you Professor! Does this also apply when cross-account trust boundaries are involved?',
    createdAt: '2026-10-18T11:24:00Z',
    likes: 6
  }
];

// Initialize global database instance
if (!global.__vullms_db) {
  global.__vullms_db = {
    users: initialUsers,
    courses: initialCourses,
    discussions: initialDiscussions,
    grades: initialGrades,
    certificates: initialCertificates,
    auditLogs: [
      { timestamp: new Date().toISOString(), action: 'SYSTEM_BOOT', details: 'VulLMS Database initialized in memory with seed records.' }
    ]
  };
}

export const db = global.__vullms_db;
