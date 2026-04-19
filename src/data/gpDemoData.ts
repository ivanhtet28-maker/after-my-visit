// GP Portal demo data — 5 diverse Australian patient personas
// Used by /gp/* routes when demo mode is on. Hardcoded, no Supabase calls.

export interface GpDemoPatient {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: "Female" | "Male" | "Non-binary";
  state: string;
  conditions: string[];
  medications: { name: string; dosage: string; frequency: string; is_pbs: boolean }[];
  alerts: string[]; // e.g. "Allergy: Penicillin"
  shared_at: string; // ISO date when patient shared records
  last_visit_date: string;
  last_visit_summary: string;
  pending_actions: number;
  unread: boolean;
  risk_level: "low" | "moderate" | "high";
  avatar_color: string; // tailwind bg class hint
  visits: {
    id: string;
    visit_date: string;
    doctor_name: string;
    clinic_name: string;
    visit_type: string;
    quick_summary: string;
    chief_complaint: string;
    assessment: string;
    plan: string[];
    urgency_flags?: string[];
  }[];
  labs?: {
    name: string;
    value: string;
    unit: string;
    status: "normal" | "high" | "low" | "borderline";
    date: string;
  }[];
  next_appointment?: { date: string; time: string; reason: string };
}

export const GP_DEMO_DOCTOR = {
  first_name: "Sarah",
  last_name: "Chen",
  title: "Dr",
  ahpra: "MED0001234567",
  practice: "Bondi Junction Medical Centre",
  state: "NSW",
  email: "sarah.chen@bjmc.com.au",
};

export const GP_DEMO_PATIENTS: GpDemoPatient[] = [
  {
    id: "gp-pt-1",
    first_name: "Karen",
    last_name: "Mitchell",
    age: 58,
    gender: "Female",
    state: "NSW",
    conditions: ["Type 2 Diabetes", "Hypertension", "Hyperlipidaemia"],
    medications: [
      { name: "Metformin XR", dosage: "1000mg", frequency: "Twice daily", is_pbs: true },
      { name: "Perindopril", dosage: "5mg", frequency: "Once daily", is_pbs: true },
      { name: "Atorvastatin", dosage: "40mg", frequency: "Nightly", is_pbs: true },
    ],
    alerts: ["Allergy: Sulfa drugs"],
    shared_at: "2025-04-15",
    last_visit_date: "2025-04-12",
    last_visit_summary: "HbA1c improved to 7.1%. Continue current regimen, review in 3 months.",
    pending_actions: 2,
    unread: true,
    risk_level: "moderate",
    avatar_color: "bg-primary/15 text-primary",
    visits: [
      {
        id: "gp-v-1a",
        visit_date: "2025-04-12",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "Routine diabetes review. HbA1c improved from 7.8% to 7.1%. BP well controlled.",
        chief_complaint: "3-monthly diabetes and BP review",
        assessment: "T2DM with improving glycaemic control. HTN stable on perindopril.",
        plan: ["Continue Metformin XR 1000mg BD", "Repeat HbA1c, lipids, eGFR in 3 months", "Annual diabetic eye check due"],
      },
      {
        id: "gp-v-1b",
        visit_date: "2025-01-08",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "HbA1c 7.8% — uptitrated Metformin to 1000mg BD.",
        chief_complaint: "Quarterly review",
        assessment: "Suboptimal glycaemic control",
        plan: ["Increase Metformin", "Dietitian referral", "Repeat bloods in 3 months"],
      },
    ],
    labs: [
      { name: "HbA1c", value: "7.1", unit: "%", status: "borderline", date: "2025-04-10" },
      { name: "LDL Cholesterol", value: "2.1", unit: "mmol/L", status: "normal", date: "2025-04-10" },
      { name: "eGFR", value: "78", unit: "mL/min", status: "normal", date: "2025-04-10" },
    ],
    next_appointment: { date: "2025-07-12", time: "10:30 AM", reason: "Diabetes review" },
  },
  {
    id: "gp-pt-2",
    first_name: "Liam",
    last_name: "O'Brien",
    age: 24,
    gender: "Male",
    state: "VIC",
    conditions: ["Generalised Anxiety", "Mild Depression"],
    medications: [
      { name: "Sertraline", dosage: "50mg", frequency: "Once daily", is_pbs: true },
    ],
    alerts: ["Mental Health Care Plan active"],
    shared_at: "2025-04-18",
    last_visit_date: "2025-04-17",
    last_visit_summary: "Anxiety symptoms improving on sertraline. Continuing CBT with psychologist.",
    pending_actions: 1,
    unread: true,
    risk_level: "moderate",
    avatar_color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    visits: [
      {
        id: "gp-v-2a",
        visit_date: "2025-04-17",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "MHCP review. K10 down from 28 to 19. Continuing sertraline + CBT.",
        chief_complaint: "Mental Health Care Plan review",
        assessment: "GAD with good response to combined SSRI + psychological therapy",
        plan: ["Continue Sertraline 50mg", "4 more sessions with psychologist", "Review in 6 weeks"],
        urgency_flags: ["Monitor mood — review in 6 weeks"],
      },
    ],
    next_appointment: { date: "2025-05-29", time: "2:00 PM", reason: "MHCP review" },
  },
  {
    id: "gp-pt-3",
    first_name: "Margaret",
    last_name: "Whitfield",
    age: 78,
    gender: "Female",
    state: "QLD",
    conditions: ["Atrial Fibrillation", "Osteoarthritis", "Mild Cognitive Impairment", "CKD Stage 3"],
    medications: [
      { name: "Apixaban", dosage: "2.5mg", frequency: "Twice daily", is_pbs: true },
      { name: "Bisoprolol", dosage: "2.5mg", frequency: "Once daily", is_pbs: true },
      { name: "Paracetamol Osteo", dosage: "665mg", frequency: "Three times daily", is_pbs: false },
      { name: "Cholecalciferol", dosage: "1000IU", frequency: "Once daily", is_pbs: false },
    ],
    alerts: ["Falls risk", "Allergy: Codeine", "Reduced renal function — adjust dosing"],
    shared_at: "2025-04-10",
    last_visit_date: "2025-04-16",
    last_visit_summary: "Post-fall review. No fracture. Home Care Package referral initiated.",
    pending_actions: 4,
    unread: true,
    risk_level: "high",
    avatar_color: "bg-destructive/15 text-destructive",
    visits: [
      {
        id: "gp-v-3a",
        visit_date: "2025-04-16",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "Reviewed after fall at home (no injury). Started falls prevention plan.",
        chief_complaint: "Fall at home 3 days ago",
        assessment: "Mechanical fall, no fracture. Multifactorial falls risk — polypharmacy, OA, MCI.",
        plan: ["OT home assessment referral", "Physio for balance training", "Review medications for sedation", "ACAT referral for HCP Level 2"],
        urgency_flags: ["High falls risk — coordinate care urgently"],
      },
      {
        id: "gp-v-3b",
        visit_date: "2025-03-02",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "AF rate well controlled. eGFR stable at 42.",
        chief_complaint: "Quarterly review",
        assessment: "Stable AF on apixaban + bisoprolol. CKD stable.",
        plan: ["Continue current meds", "Repeat U&E in 3 months"],
      },
    ],
    labs: [
      { name: "eGFR", value: "42", unit: "mL/min", status: "low", date: "2025-04-15" },
      { name: "Creatinine", value: "118", unit: "umol/L", status: "high", date: "2025-04-15" },
      { name: "Hb", value: "118", unit: "g/L", status: "low", date: "2025-04-15" },
    ],
    next_appointment: { date: "2025-05-02", time: "9:00 AM", reason: "Care plan review" },
  },
  {
    id: "gp-pt-4",
    first_name: "Aisha",
    last_name: "Rahman",
    age: 34,
    gender: "Female",
    state: "VIC",
    conditions: ["Pregnancy (24 weeks)", "Gestational Diabetes Screening due"],
    medications: [
      { name: "Pregnancy Multivitamin", dosage: "1 tablet", frequency: "Once daily", is_pbs: false },
      { name: "Iron Polymaltose", dosage: "100mg", frequency: "Once daily", is_pbs: false },
    ],
    alerts: ["Pregnant — 24 weeks", "Mild iron deficiency"],
    shared_at: "2025-04-14",
    last_visit_date: "2025-04-14",
    last_visit_summary: "24-week antenatal check. Fundal height appropriate. OGTT booked.",
    pending_actions: 2,
    unread: false,
    risk_level: "low",
    avatar_color: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
    visits: [
      {
        id: "gp-v-4a",
        visit_date: "2025-04-14",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "24-week shared antenatal visit. Baby active, growth on track.",
        chief_complaint: "Routine antenatal review",
        assessment: "Uncomplicated singleton pregnancy at 24+3. Mild iron deficiency improving.",
        plan: ["Book 26-28w OGTT", "Continue iron + multivitamin", "Whooping cough vax at 28w", "Review in 4 weeks"],
      },
    ],
    labs: [
      { name: "Ferritin", value: "22", unit: "ug/L", status: "low", date: "2025-04-12" },
      { name: "Hb", value: "115", unit: "g/L", status: "normal", date: "2025-04-12" },
    ],
    next_appointment: { date: "2025-05-12", time: "11:15 AM", reason: "28-week antenatal + OGTT review" },
  },
  {
    id: "gp-pt-5",
    first_name: "Jack",
    last_name: "Tran",
    age: 42,
    gender: "Male",
    state: "NSW",
    conditions: ["Chronic Lower Back Pain", "Post L4/L5 Discectomy (2024)"],
    medications: [
      { name: "Duloxetine", dosage: "60mg", frequency: "Once daily", is_pbs: true },
      { name: "Paracetamol", dosage: "1g", frequency: "Four times daily PRN", is_pbs: false },
    ],
    alerts: ["Chronic pain — opioid-sparing plan", "WorkCover claim active"],
    shared_at: "2025-04-08",
    last_visit_date: "2025-04-11",
    last_visit_summary: "Pain 4/10 (down from 7/10). Continuing physio + duloxetine. Graduated RTW plan.",
    pending_actions: 3,
    unread: false,
    risk_level: "moderate",
    avatar_color: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    visits: [
      {
        id: "gp-v-5a",
        visit_date: "2025-04-11",
        doctor_name: "Dr Sarah Chen",
        clinic_name: "Bondi Junction Medical Centre",
        visit_type: "gp",
        quick_summary: "Chronic pain review. Significant improvement on duloxetine + active rehab.",
        chief_complaint: "6-week chronic pain plan review",
        assessment: "Chronic LBP post-discectomy, improving with multimodal approach.",
        plan: ["Continue duloxetine + paracetamol PRN", "Weekly physio x 6", "Graduated RTW — 4hr days", "Review in 4 weeks"],
      },
    ],
    next_appointment: { date: "2025-05-09", time: "3:30 PM", reason: "Chronic pain & RTW review" },
  },
];

export const GP_DEMO_TODAY_APPOINTMENTS = [
  { time: "9:00 AM", patient_id: "gp-pt-3", reason: "Care plan review", duration: 30 },
  { time: "10:30 AM", patient_id: "gp-pt-1", reason: "Diabetes review", duration: 20 },
  { time: "11:15 AM", patient_id: "gp-pt-4", reason: "Antenatal", duration: 20 },
  { time: "2:00 PM", patient_id: "gp-pt-2", reason: "MHCP review", duration: 30 },
  { time: "3:30 PM", patient_id: "gp-pt-5", reason: "Chronic pain review", duration: 20 },
];

export const GP_DEMO_STATS = {
  shared_patients: GP_DEMO_PATIENTS.length,
  unread_visits: GP_DEMO_PATIENTS.filter((p) => p.unread).length,
  high_risk: GP_DEMO_PATIENTS.filter((p) => p.risk_level === "high").length,
  appointments_today: GP_DEMO_TODAY_APPOINTMENTS.length,
  pending_actions_total: GP_DEMO_PATIENTS.reduce((sum, p) => sum + p.pending_actions, 0),
};

export function getGpPatient(id: string) {
  return GP_DEMO_PATIENTS.find((p) => p.id === id);
}
