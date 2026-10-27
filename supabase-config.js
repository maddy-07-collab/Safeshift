/**
 * FairShift 360 - Supabase Configuration & Simulated Demo Adapter
 * Supports official @supabase/supabase-js CDN library.
 * If live Supabase URL/Anon Key are not configured, seamlessly operates
 * in full Simulated Demo Mode with persistent localStorage storage and realistic data.
 */

const DEFAULT_DEMO_USERS = [
  {
    id: "usr_school_staff_01",
    email: "school.staff@fairshift.demo",
    password: "SchoolDemo@360",
    name: "Ananya Sharma",
    sector: "school",
    role: "staff",
    roleTitle: "Senior Science Teacher",
    department: "Secondary Education",
    hourlyRate: 350, // in INR
    phone: "+91 98450 11223",
    address: "Staff Quarter 4B, Campus View, Bengaluru",
    dob: "1988-06-14",
    avatar: "AS",
    weeklyHours: 36
  },
  {
    id: "usr_school_admin_01",
    email: "school.admin@fairshift.demo",
    password: "AdminDemo@360",
    name: "Dr. K. Ramanathan",
    sector: "school",
    role: "admin",
    roleTitle: "Dean of Institutional Operations",
    department: "Administration",
    hourlyRate: 650,
    phone: "+91 98450 44556",
    address: "Admin Enclave, Campus View, Bengaluru",
    dob: "1974-11-03",
    avatar: "KR",
    weeklyHours: 42
  },
  {
    id: "usr_factory_worker_01",
    email: "factory.worker@fairshift.demo",
    password: "WorkerDemo@360",
    name: "Ramesh Babu",
    sector: "factory",
    role: "worker",
    roleTitle: "CNC Precision Machinist",
    department: "Line 2 - Metal Fabrication",
    hourlyRate: 240,
    phone: "+91 97412 77889",
    address: "Plot 42, Industrial Colony, Hosur",
    dob: "1994-04-22",
    avatar: "RB",
    weeklyHours: 44
  },
  {
    id: "usr_factory_supervisor_01",
    email: "factory.supervisor@fairshift.demo",
    password: "SupervisorDemo@360",
    name: "Pooja Varma",
    sector: "factory",
    role: "supervisor",
    roleTitle: "Fabrication Floor Supervisor",
    department: "Line 2 - Production Quality",
    hourlyRate: 420,
    phone: "+91 98840 99001",
    address: "Flat 12A, Green Towers, Hosur",
    dob: "1989-08-19",
    avatar: "PV",
    weeklyHours: 46
  },
  {
    id: "usr_factory_hr_01",
    email: "factory.hr@fairshift.demo",
    password: "FactoryAdmin@360",
    name: "Siddharth Menon",
    sector: "factory",
    role: "admin",
    roleTitle: "General Manager - People & Safety Compliance",
    department: "HR & Plant Compliance",
    hourlyRate: 600,
    phone: "+91 98110 33445",
    address: "Tech Park Residences, Electronic City, Bengaluru",
    dob: "1982-01-15",
    avatar: "SM",
    weeklyHours: 40
  }
];

const INITIAL_SHIFTS = [
  // Factory Worker (Ramesh)
  {
    id: "shf_101",
    userId: "usr_factory_worker_01",
    sector: "factory",
    date: "2026-10-26",
    type: "Morning Shift (A)",
    clockIn: "06:00",
    clockOut: "14:30",
    breakMinutes: 30,
    regularHours: 8.0,
    overtimeHours: 0.5,
    status: "verified",
    notes: "Machining run completed on CNC-04"
  },
  {
    id: "shf_102",
    userId: "usr_factory_worker_01",
    sector: "factory",
    date: "2026-10-25",
    type: "Morning Shift (A)",
    clockIn: "06:00",
    clockOut: "16:00",
    breakMinutes: 30,
    regularHours: 8.0,
    overtimeHours: 1.5,
    status: "verified",
    notes: "Extended for batch delivery deadline"
  },
  {
    id: "shf_103",
    userId: "usr_factory_worker_01",
    sector: "factory",
    date: "2026-10-24",
    type: "Morning Shift (A)",
    clockIn: "06:00",
    clockOut: "14:00",
    breakMinutes: 30,
    regularHours: 7.5,
    overtimeHours: 0,
    status: "verified",
    notes: "Normal shift operations"
  },
  // School Staff (Ananya)
  {
    id: "shf_201",
    userId: "usr_school_staff_01",
    sector: "school",
    date: "2026-10-26",
    type: "Academic Day",
    clockIn: "08:15",
    clockOut: "16:15",
    breakMinutes: 45,
    regularHours: 7.25,
    overtimeHours: 0,
    status: "verified",
    notes: "Physics practical labs and grading"
  },
  {
    id: "shf_202",
    userId: "usr_school_staff_01",
    sector: "school",
    date: "2026-10-25",
    type: "Academic Day + Science Club",
    clockIn: "08:00",
    clockOut: "17:30",
    breakMinutes: 45,
    regularHours: 7.25,
    overtimeHours: 1.25,
    status: "verified",
    notes: "Mentoring robotics team for inter-school exhibit"
  }
];

const INITIAL_SAFETY_REPORTS = [
  {
    id: "rep_saf_01",
    refCode: "SV-2026-8941",
    sector: "factory",
    authorId: "usr_factory_worker_01",
    isAnonymous: true,
    category: "Hazardous Equipment / Machinery",
    priority: "high",
    location: "Fabrication Unit 2 - Press Guard #4",
    description: "Emergency stop safety interlock on Hydraulic Stamping Press #4 flickers and fails to trip immediately when tested during shift start. Risk of hand entrapment.",
    createdAt: "2026-10-25 09:30",
    status: "investigating",
    timeline: [
      { date: "2026-10-25 09:30", text: "Report filed anonymously under Safe Voice protocol." },
      { date: "2026-10-25 11:15", text: "Assigned to Supervisor Pooja Varma. Maintenance team flagged." }
    ]
  },
  {
    id: "rep_saf_02",
    refCode: "SV-2026-8812",
    sector: "factory",
    authorId: "usr_factory_worker_01",
    isAnonymous: false,
    authorName: "Ramesh Babu",
    category: "Chemical Spill / Inadequate Ventilation",
    priority: "critical",
    location: "Degreasing Bay B",
    description: "Exhaust ventilation duct rattling loose with solvent fumes accumulating at head level. Two workers reported dizziness.",
    createdAt: "2026-10-22 14:10",
    status: "resolved",
    timeline: [
      { date: "2026-10-22 14:10", text: "Incident recorded with Critical priority." },
      { date: "2026-10-22 14:40", text: "Floor evacuation of Degreasing Bay B." },
      { date: "2026-10-23 10:00", text: "Ventilation motor replaced and air quality sensor verified normal." }
    ]
  },
  {
    id: "rep_saf_03",
    refCode: "SV-2026-9023",
    sector: "school",
    authorId: "usr_school_staff_01",
    isAnonymous: true,
    category: "Hazardous Equipment / Machinery",
    priority: "medium",
    location: "Senior Science Chemistry Lab 102",
    description: "Fume hood sash counterweight cable frayed and sticking; glass cannot close completely during acid titration experiments.",
    createdAt: "2026-10-24 11:20",
    status: "reported",
    timeline: [
      { date: "2026-10-24 11:20", text: "Anonymous report received by School Facility Admin." }
    ]
  }
];

const INITIAL_DISPUTES = [
  {
    id: "dsp_01",
    sector: "factory",
    userId: "usr_factory_worker_01",
    workerName: "Ramesh Babu",
    date: "2026-10-25",
    hoursDisputed: 2.0,
    amountDisputed: 720,
    reason: "Saturday emergency maintenance overtime was recorded at 1.0x instead of double overtime (2.0x statutory rate).",
    status: "pending",
    submittedAt: "2026-10-26 10:00"
  }
];

const INITIAL_FEEDBACK = [
  {
    id: "fdb_01",
    sector: "factory",
    category: "Hygiene, Canteen & Restrooms",
    text: "Drinking water filter on shop floor 2 needs filter cartridge replacement. Water tastes metallic since Thursday.",
    createdAt: "2026-10-25 15:45",
    status: "received"
  },
  {
    id: "fdb_02",
    sector: "school",
    category: "Workplace Culture & Fairness",
    text: "Request for teacher prep periods to be protected from ad-hoc substitution duty so lesson plans don't fall behind.",
    createdAt: "2026-10-24 16:30",
    status: "under_review"
  }
];

const INITIAL_SKILLS = [
  {
    id: "skl_01",
    userId: "usr_factory_worker_01",
    sector: "factory",
    title: "Precision CNC Machine Operator (Level 3)",
    issuer: "National Skill Development Corporation (NSDC)",
    dateCompleted: "2024-03-15",
    validUntil: "2028-03-15",
    verified: true
  },
  {
    id: "skl_02",
    userId: "usr_factory_worker_01",
    sector: "factory",
    title: "OSHA Industrial Safety & Hazardous Materials Handling",
    issuer: "State Factory Inspectorate",
    dateCompleted: "2025-08-10",
    validUntil: "2027-08-10",
    verified: true
  },
  {
    id: "skl_03",
    userId: "usr_factory_worker_01",
    sector: "factory",
    title: "First Aid & CPR First Responder",
    issuer: "Red Cross Society",
    dateCompleted: "2026-01-20",
    validUntil: "2028-01-20",
    verified: true
  },
  {
    id: "skl_04",
    userId: "usr_school_staff_01",
    sector: "school",
    title: "Advanced STEM Laboratory Safety & Hazardous Waste",
    issuer: "State Council of Educational Research & Training",
    dateCompleted: "2025-05-18",
    validUntil: "2028-05-18",
    verified: true
  },
  {
    id: "skl_05",
    userId: "usr_school_staff_01",
    sector: "school",
    title: "Child Safeguarding & POSH Compliance Protocol",
    issuer: "Central Board of Education",
    dateCompleted: "2026-02-10",
    validUntil: "2027-02-10",
    verified: true
  }
];

class SupabaseService {
  constructor() {
    this.client = null;
    this.isDemo = true;
    this.url = "";
    this.anonKey = "";
    this.init();
  }

  init() {
    // Check if configuration exists in localStorage
    const savedConfig = localStorage.getItem("fairshift_supabase_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.url && parsed.anonKey && window.supabase && window.supabase.createClient) {
          this.url = parsed.url;
          this.anonKey = parsed.anonKey;
          this.client = window.supabase.createClient(parsed.url, parsed.anonKey);
          this.isDemo = false;
        }
      } catch (e) {
        console.warn("Could not initialize saved Supabase config, defaulting to Simulated Demo Mode", e);
      }
    }

    // Ensure simulated data tables are initialized in localStorage
    this.initSimulatedStorage();
  }

  initSimulatedStorage() {
    if (!localStorage.getItem("fairshift_users")) {
      localStorage.setItem("fairshift_users", JSON.stringify(DEFAULT_DEMO_USERS));
    }
    if (!localStorage.getItem("fairshift_shifts")) {
      localStorage.setItem("fairshift_shifts", JSON.stringify(INITIAL_SHIFTS));
    }
    if (!localStorage.getItem("fairshift_safety_reports")) {
      localStorage.setItem("fairshift_safety_reports", JSON.stringify(INITIAL_SAFETY_REPORTS));
    }
    if (!localStorage.getItem("fairshift_disputes")) {
      localStorage.setItem("fairshift_disputes", JSON.stringify(INITIAL_DISPUTES));
    }
    if (!localStorage.getItem("fairshift_feedback")) {
      localStorage.setItem("fairshift_feedback", JSON.stringify(INITIAL_FEEDBACK));
    }
    if (!localStorage.getItem("fairshift_skills")) {
      localStorage.setItem("fairshift_skills", JSON.stringify(INITIAL_SKILLS));
    }
  }

  resetDemoData() {
    localStorage.setItem("fairshift_users", JSON.stringify(DEFAULT_DEMO_USERS));
    localStorage.setItem("fairshift_shifts", JSON.stringify(INITIAL_SHIFTS));
    localStorage.setItem("fairshift_safety_reports", JSON.stringify(INITIAL_SAFETY_REPORTS));
    localStorage.setItem("fairshift_disputes", JSON.stringify(INITIAL_DISPUTES));
    localStorage.setItem("fairshift_feedback", JSON.stringify(INITIAL_FEEDBACK));
    localStorage.setItem("fairshift_skills", JSON.stringify(INITIAL_SKILLS));
  }

  connectLive(url, anonKey) {
    if (!url || !anonKey) {
      throw new Error("Both Supabase URL and Anon Key are required.");
    }
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase CDN library not loaded in browser.");
    }
    this.client = window.supabase.createClient(url, anonKey);
    this.url = url;
    this.anonKey = anonKey;
    this.isDemo = false;
    localStorage.setItem("fairshift_supabase_config", JSON.stringify({ url, anonKey }));
    return true;
  }

  disconnectLive() {
    this.client = null;
    this.url = "";
    this.anonKey = "";
    this.isDemo = true;
    localStorage.removeItem("fairshift_supabase_config");
  }

  isLive() {
    return !this.isDemo && this.client !== null;
  }

  // Generic data getters & setters with offline demo fallback
  getUsers() {
    return JSON.parse(localStorage.getItem("fairshift_users") || "[]");
  }

  saveUsers(users) {
    localStorage.setItem("fairshift_users", JSON.stringify(users));
  }

  getShifts(sector = null, userId = null) {
    const list = JSON.parse(localStorage.getItem("fairshift_shifts") || "[]");
    return list.filter(item => {
      if (sector && item.sector !== sector) return false;
      if (userId && item.userId !== userId) return false;
      return true;
    });
  }

  addShift(shift) {
    const list = JSON.parse(localStorage.getItem("fairshift_shifts") || "[]");
    list.unshift(shift);
    localStorage.setItem("fairshift_shifts", JSON.stringify(list));
    return shift;
  }

  getSafetyReports(sector = null, userId = null, role = null) {
    const list = JSON.parse(localStorage.getItem("fairshift_safety_reports") || "[]");
    return list.filter(item => {
      if (sector && item.sector !== sector) return false;
      // Workers only see their own reports. Supervisors/Admins see all reports in their sector.
      if (role === "worker" || role === "staff") {
        if (userId && item.authorId !== userId) return false;
      }
      return true;
    });
  }

  addSafetyReport(report) {
    const list = JSON.parse(localStorage.getItem("fairshift_safety_reports") || "[]");
    list.unshift(report);
    localStorage.setItem("fairshift_safety_reports", JSON.stringify(list));
    return report;
  }

  updateSafetyReportStatus(reportId, newStatus, resolutionNote = "") {
    const list = JSON.parse(localStorage.getItem("fairshift_safety_reports") || "[]");
    const found = list.find(r => r.id === reportId || r.refCode === reportId);
    if (found) {
      found.status = newStatus;
      if (!found.timeline) found.timeline = [];
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
      found.timeline.push({
        date: timestamp,
        text: resolutionNote || `Status updated to ${newStatus}`
      });
      localStorage.setItem("fairshift_safety_reports", JSON.stringify(list));
    }
    return found;
  }

  getDisputes(sector = null, userId = null) {
    const list = JSON.parse(localStorage.getItem("fairshift_disputes") || "[]");
    return list.filter(item => {
      if (sector && item.sector !== sector) return false;
      if (userId && item.userId !== userId) return false;
      return true;
    });
  }

  addDispute(dispute) {
    const list = JSON.parse(localStorage.getItem("fairshift_disputes") || "[]");
    list.unshift(dispute);
    localStorage.setItem("fairshift_disputes", JSON.stringify(list));
    return dispute;
  }

  resolveDispute(disputeId) {
    const list = JSON.parse(localStorage.getItem("fairshift_disputes") || "[]");
    const item = list.find(d => d.id === disputeId);
    if (item) {
      item.status = "resolved";
      localStorage.setItem("fairshift_disputes", JSON.stringify(list));
    }
    return item;
  }

  getFeedback(sector = null) {
    const list = JSON.parse(localStorage.getItem("fairshift_feedback") || "[]");
    return list.filter(item => {
      if (sector && item.sector !== sector) return false;
      return true;
    });
  }

  addFeedback(feedback) {
    const list = JSON.parse(localStorage.getItem("fairshift_feedback") || "[]");
    list.unshift(feedback);
    localStorage.setItem("fairshift_feedback", JSON.stringify(list));
    return feedback;
  }

  getSkills(userId) {
    const list = JSON.parse(localStorage.getItem("fairshift_skills") || "[]");
    return list.filter(item => item.userId === userId);
  }

  addSkill(skill) {
    const list = JSON.parse(localStorage.getItem("fairshift_skills") || "[]");
    list.unshift(skill);
    localStorage.setItem("fairshift_skills", JSON.stringify(list));
    return skill;
  }
}

// Global instance attached to window
window.FairShiftSupabase = new SupabaseService();
