# VulLMS — Vulnerable Learning Management System

VulLMS is an enterprise-grade Learning Management System (LMS) with 15 intentionally engineered, realistic vulnerabilities designed for testing and benchmarking **automated bug bounty report triage engines** and web application security scanners.

## Features
- **Modern Next.js (App Router) + TypeScript** design with sleek cyber theme and glassmorphism UI.
- **Top Bar Persona Switcher**: Instantly switch between Root Admin (`usr_admin_01`), Instructor Dr. Marcus (`usr_inst_02`), Victim Student Alice (`usr_stu_101`), and Bug Bounty Tester Bob (`usr_stu_102`).
- **Complete LMS Features**: Course catalogs, curriculum modules, interactive discussion board, academic performance dashboard, graduation certificates, user profile editor, and admin portal.
- **15 Realistic Flaws**: Covering OWASP Top 10 (2021) and OWASP API Security Top 10 (2023).
- **Interactive Security Documentation Hub**: Built-in at `/security-docs` with direct endpoint links, triage signals, and copyable route paths.
- **Full Markdown Catalog**: See [`VULNERABILITY_CATALOG.md`](./VULNERABILITY_CATALOG.md).

---

## Getting Started Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Vercel

VulLMS is 100% self-contained and ready for zero-configuration deployment on **Vercel**:

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: VulLMS benchmark release"
   git remote add origin https://github.com/<your-username>/VulLMS.git
   git push -u origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and click **"Deploy"**.

---

## Testing Credentials

| User | Role | Email | Password | User ID |
| :--- | :--- | :--- | :--- | :--- |
| **Eleanor Vance** | Admin | `admin@vullms.internal` | `SuperAdminPassword2026!` | `usr_admin_01` |
| **Dr. Marcus Vance** | Instructor | `marcus.vance@vullms.internal` | `ProfessorPass2026#` | `usr_inst_02` |
| **Alice Sterling** | Victim Student | `alice@student.edu` | `AliceStudent123!` | `usr_stu_101` |
| **Bob Miller** | Tester / Attacker | `bob@student.edu` | `BobTestingPassword456!` | `usr_stu_102` |
