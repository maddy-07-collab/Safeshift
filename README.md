# FairShift 360 — Fair Work, Fair Pay, Safer Workplaces

> **Aligned with United Nations Sustainable Development Goal 8 (Decent Work and Economic Growth).**  
> An ethical workforce management web application engineered to prevent forced and unrecorded overtime, guarantee transparent pay computation, protect whistleblowers, verify worker skill credentials, and safeguard against workplace fatigue.

---

## 🌟 Key Features

1. **Multilingual Interface:**
   - Full native localization in **English, தமிழ் (Tamil), हिन्दी (Hindi), తెలుగు (Telugu), and മലയാളം (Malayalam)**.
   - Dynamic language switching that maintains user authentication state and active view.

2. **Attendance & Shift Clock-In Engine:**
   - Live real-time shift stopwatch with 15-minute rest break toggle.
   - Automatic separation between standard 8-hour daily shifts and statutory 1.5x/2.0x overtime.
   - Verifiable attendance history table.

3. **Explain My Pay (Transparent Earnings):**
   - Step-by-step breakdown of regular hours, overtime premiums, hourly rates, and gross earnings.
   - Explicit statutory deductions: Employees' Provident Fund (EPF 12%), Employees' State Insurance (ESI 0.75%), and Labor Welfare contributions.
   - Interactive **Pay Discrepancy Reporting** ticketing system directly audited by payroll.

4. **Safe Voice (Confidential Hazard Reporting):**
   - Whistleblower protection allowing confidential or 100% anonymous hazard submissions.
   - Generates auditable tracking codes (e.g., `SV-2026-8941`).
   - Real-time reference code lookup to track remediation timeline and supervisory actions without exposing worker identity.

5. **Anonymous Workplace Feedback Box:**
   - Direct line to management with sender identities completely stripped from data records.

6. **Skill Passport:**
   - Portable digital ledger of verified vocational certifications, safety inductions, and licenses with expiration alerts.

7. **Fatigue & Rest Safeguards:**
   - Real-time tracking against the international ILO 48-hour weekly legal ceiling.
   - Automatic warnings triggered after 6 continuous hours of work.
   - Enforcement of the mandatory 11-hour rest window between consecutive shifts.

8. **Role-Based & Sector-Separated Dashboards:**
   - **School / College Sector:** Staff (Teacher/Faculty) and Administrator.
   - **Factory & Manufacturing Sector:** Worker/Operator, Supervisor, and HR/Admin.
   - Strict security: Public self-registration is restricted to Worker/Staff roles; supervisor and admin credentials require formal sign-off.

---

## 🧪 Try Demo Accounts (1-Click Instant Testing)

The app comes pre-loaded with simulated persona credentials in **Simulated Demo Mode**:

| Sector | Role | Demo Email | Demo Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **School** | Staff | `school.staff@fairshift.demo` | `SchoolDemo@360` | Teacher shifts, lab safety reports, skill passport |
| **School** | Admin | `school.admin@fairshift.demo` | `AdminDemo@360` | Institutional workforce oversight, facility hazards |
| **Factory** | Worker | `factory.worker@fairshift.demo` | `WorkerDemo@360` | Clock in/out, overtime tracking, Safe Voice, pay breakdown |
| **Factory** | Supervisor | `factory.supervisor@fairshift.demo` | `SupervisorDemo@360` | Shift approval queue, safety remediation actions |
| **Factory** | HR / Admin | `factory.hr@fairshift.demo` | `FactoryAdmin@360` | Plant compliance, dispute adjustments, workforce analytics |

*Note: In Simulated Demo Mode, all data is stored in the browser's `localStorage` and persists between reloads.*

---

## 🚀 Running the Application

### Option 1: Direct Browser Launch (Zero Build Step)
1. Clone or download the repository files.
2. Double-click `index.html` or open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).
3. No Node.js, npm, or bundler installation is required!

### Option 2: Static Hosting via Python or Node
If testing local HTTP headers:
```bash
# Using Python 3:
python3 -m http.server 8000
# Then open: http://localhost:8000

# Or using npx serve:
npx serve .
```

---

## ☁️ Deploying as a Static Website

### Deploying to GitHub Pages
1. Push this repository to GitHub.
2. In your repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder.
5. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Deploying to Vercel (Zero-Config Supported)
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Vercel automatically detects the configured `vercel.json` and Vite framework:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Vercel will deploy without build errors or 404s.

### Deploying to Netlify
1. Log into [Netlify](https://www.netlify.com).
2. Drag and drop the project folder directly onto the Netlify dashboard, or connect your Git repository.
3. Set **Build command** to `npm run build` and **Publish directory** to `dist` (or blank / `.` for raw static).
4. Deploy site instantly.

---

## 🗄️ Supabase PostgreSQL Setup & Security

FairShift 360 includes `supabase-schema.sql` ready to run on any Supabase project:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of `supabase-schema.sql` and run the script.
4. Go to **Project Settings** > **API** to copy:
   - **Project URL**
   - **anon / public key**
5. In FairShift 360, click the top **Simulated Demo Mode Active** badge, enter your URL and public Anon key, and click **Save & Connect**.

### Security & Privacy Architecture:
- **Zero Secret Key Exposure:** Only the public `anon` key is ever used in the frontend. Never expose the `service_role` key.
- **Row Level Security (RLS):**
  - Workers can only query their own attendance and pay records.
  - Supervisors and Admins can only view records belonging to their assigned sector (`school` or `factory`).
  - The `anonymous_feedback` table has no user foreign key column, providing cryptographic certainty against deanonymization.
  - Sensitive personal records (home addresses, date of birth) are protected behind strict owner-only RLS policies.
