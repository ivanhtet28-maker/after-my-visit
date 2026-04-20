import { DEMO_PATIENT, DEMO_VISITS_V2, DEMO_ACTION_ITEMS_V2, DEMO_MEDICATIONS_V2 } from "./demoPatient";

const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

export const DEMO_DOCTOR = {
  id: "demo-doctor-id",
  first_name: "Dr. Helen",
  last_name: "Zhao",
  clinic_name: "Werribee Plaza Medical Centre",
  speciality: "General Practitioner",
  role: "doctor",
};

export const DEMO_DOCTOR_PATIENTS = [
  {
    id: "demo-karen-id",
    first_name: "Karen",
    last_name: "Mitchell",
    age: 58,
    state: "VIC",
    conditions: "Type 2 Diabetes, Hypertension, High Cholesterol",
    last_visit_date: twoDaysAgo.toISOString().split("T")[0],
    total_visits: 3,
    status: "active",
  },
  {
    id: "demo-patient-2",
    first_name: "James",
    last_name: "Thompson",
    age: 34,
    state: "VIC",
    conditions: "Anxiety, Chronic lower back pain",
    last_visit_date: oneWeekAgo.toISOString().split("T")[0],
    total_visits: 2,
    status: "active",
  },
  {
    id: "demo-patient-3",
    first_name: "Priya",
    last_name: "Sharma",
    age: 45,
    state: "VIC",
    conditions: "Asthma, Iron deficiency",
    last_visit_date: threeWeeksAgo.toISOString().split("T")[0],
    total_visits: 1,
    status: "active",
  },
];

// Visits for patient 2 - James Thompson
const JAMES_VISITS = [
  {
    id: "demo-james-visit-1",
    user_id: "demo-patient-2",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: oneWeekAgo.toISOString().split("T")[0],
    recording_duration: 540,
    status: "complete",
    created_at: oneWeekAgo.toISOString(),
    updated_at: oneWeekAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi James, how have you been since our last appointment?\n\nPatient: Not great to be honest. The back pain has been flaring up again, especially in the mornings. And I've been feeling pretty anxious about work.\n\nDoctor: I'm sorry to hear that. Let's talk about both. How's the back pain on a scale of one to ten?\n\nPatient: About a six most days. Sometimes a seven when I've been sitting at my desk for too long.\n\nDoctor: And the anxiety, are you still taking the Sertraline?\n\nPatient: Yeah, fifty milligrams daily. It helps a bit but I still get these waves of anxiety, especially before meetings.\n\nDoctor: Okay. For the back, I think we should try some physiotherapy. I'll refer you to a physio who specialises in lower back issues. For the anxiety, let's consider increasing the Sertraline to one hundred milligrams and see how you go over the next month.\n\nPatient: Sounds good. Will the physio be covered by Medicare?\n\nDoctor: I'll set you up with a chronic disease management plan, which gives you five Medicare-subsidised physio sessions. I'd also recommend trying to get up and stretch every thirty minutes when you're at your desk.`,
    summary: {
      quick_summary: "Follow-up for chronic lower back pain and anxiety management. Back pain rated 6-7/10, current anxiety medication partially effective.",
      chief_complaint: "Flare-up of chronic lower back pain and ongoing anxiety symptoms",
      key_discussion_points: ["Back pain severity and triggers", "Current anxiety medication efficacy", "Workplace ergonomics"],
      assessment: "Chronic lower back pain with workplace aggravation. Generalised anxiety partially controlled on current Sertraline dose.",
      plan: ["Referral to physiotherapy for lower back management", "Increase Sertraline from 50mg to 100mg daily", "Chronic disease management plan for Medicare-subsidised physio"],
      doctors_recommendations: [
        { number: 1, text: "Start physiotherapy — referral provided for back pain specialist" },
        { number: 2, text: "Increase Sertraline to 100mg daily from next week" },
        { number: 3, text: "Stretch every 30 minutes during desk work" },
      ],
      action_items: [
        { description: "Book physiotherapy appointment", category: "referral", due_date_suggestion: "Within 1 week" },
        { description: "Increase Sertraline to 100mg daily", category: "medication", due_date_suggestion: "Next week" },
        { description: "Follow up in 4 weeks to review progress", category: "follow_up", due_date_suggestion: "In 4 weeks" },
      ],
      medications: [
        { name: "Sertraline", dosage: "100mg", frequency: "Once daily in the morning", explanation: "Increased dose to better manage anxiety symptoms", is_pbs: true },
      ],
      referrals: [
        { to: "Physiotherapist", reason: "Chronic lower back pain management", next_steps: "Book appointment, 5 sessions covered by Medicare under chronic disease plan" },
      ],
      follow_up_questions: ["How is the increased Sertraline dose going?", "Has the physiotherapy helped with the back pain?"],
      medical_terms: [
        { term: "Chronic disease management plan", explanation: "A Medicare plan that gives you subsidised allied health appointments (like physio) for ongoing conditions" },
      ],
      urgency_flags: [],
    },
  },
  {
    id: "demo-james-visit-2",
    user_id: "demo-patient-2",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: twoWeeksAgo.toISOString().split("T")[0],
    recording_duration: 420,
    status: "complete",
    created_at: twoWeeksAgo.toISOString(),
    updated_at: twoWeeksAgo.toISOString(),
    recording_url: null,
    transcript: null,
    summary: {
      quick_summary: "Initial consultation for anxiety and lower back pain. Started on Sertraline 50mg and recommended lifestyle modifications.",
      chief_complaint: "New patient presenting with anxiety and chronic lower back pain",
      key_discussion_points: ["Anxiety history and triggers", "Back pain onset and duration", "Lifestyle factors"],
      assessment: "Generalised anxiety disorder with workplace stress component. Mechanical lower back pain likely postural.",
      plan: ["Start Sertraline 50mg daily", "Workplace ergonomic assessment", "Review in 2 weeks"],
      doctors_recommendations: [
        { number: 1, text: "Start Sertraline 50mg once daily in the morning" },
        { number: 2, text: "Regular exercise — aim for 30 minutes walking daily" },
      ],
      action_items: [
        { description: "Start Sertraline 50mg daily", category: "medication", due_date_suggestion: "Immediately" },
        { description: "Follow up in 2 weeks", category: "follow_up", due_date_suggestion: "In 2 weeks" },
      ],
      medications: [
        { name: "Sertraline", dosage: "50mg", frequency: "Once daily in the morning", explanation: "Antidepressant that also helps manage anxiety", is_pbs: true },
      ],
      referrals: [],
      follow_up_questions: [],
      medical_terms: [],
      urgency_flags: [],
    },
  },
];

// Visits for patient 3 - Priya Sharma
const PRIYA_VISITS = [
  {
    id: "demo-priya-visit-1",
    user_id: "demo-patient-3",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: threeWeeksAgo.toISOString().split("T")[0],
    recording_duration: 480,
    status: "complete",
    created_at: threeWeeksAgo.toISOString(),
    updated_at: threeWeeksAgo.toISOString(),
    recording_url: null,
    transcript: null,
    summary: {
      quick_summary: "Asthma review and iron deficiency follow-up. Asthma well controlled on current preventer. Iron levels improving.",
      chief_complaint: "Routine asthma review and iron level check",
      key_discussion_points: ["Asthma control frequency", "Iron supplement tolerance", "Blood test results"],
      assessment: "Asthma well controlled on Seretide. Iron levels improving (ferritin 28, up from 12).",
      plan: ["Continue current asthma preventer", "Continue iron supplements for another 3 months", "Repeat blood test in 3 months"],
      doctors_recommendations: [
        { number: 1, text: "Continue Seretide 250/25 — two puffs twice daily" },
        { number: 2, text: "Continue Ferrograd C — one tablet daily" },
        { number: 3, text: "Repeat full blood count and iron studies in 3 months" },
      ],
      action_items: [
        { description: "Repeat blood test in 3 months", category: "test", due_date_suggestion: "In 3 months" },
        { description: "Continue iron supplements daily", category: "medication", due_date_suggestion: "Ongoing" },
      ],
      medications: [
        { name: "Seretide 250/25", dosage: "2 puffs", frequency: "Twice daily", explanation: "Preventer inhaler for asthma — keeps airways open and reduces inflammation", is_pbs: true },
        { name: "Ferrograd C", dosage: "1 tablet", frequency: "Once daily", explanation: "Iron supplement with vitamin C to help absorption", is_pbs: false },
      ],
      referrals: [],
      follow_up_questions: [],
      medical_terms: [
        { term: "Ferritin", explanation: "A protein that stores iron in your body. Low levels mean low iron stores." },
      ],
      urgency_flags: [],
    },
  },
];

// Get all visits across all patients for the doctor dashboard
export function getDoctorVisitsForPatient(patientId: string) {
  switch (patientId) {
    case "demo-karen-id":
      return DEMO_VISITS_V2;
    case "demo-patient-2":
      return JAMES_VISITS;
    case "demo-patient-3":
      return PRIYA_VISITS;
    default:
      return [];
  }
}

export function getDoctorVisitById(visitId: string) {
  const allVisits = [...DEMO_VISITS_V2, ...JAMES_VISITS, ...PRIYA_VISITS];
  return allVisits.find((v) => v.id === visitId) || null;
}

export function getPatientById(patientId: string) {
  return DEMO_DOCTOR_PATIENTS.find((p) => p.id === patientId) || null;
}

export const DEMO_ALL_DOCTOR_VISITS = [
  ...DEMO_VISITS_V2.map((v) => ({ ...v, patient_name: "Karen Mitchell" })),
  ...JAMES_VISITS.map((v) => ({ ...v, patient_name: "James Thompson" })),
  ...PRIYA_VISITS.map((v) => ({ ...v, patient_name: "Priya Sharma" })),
].sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());

export const DEMO_DOCTOR_STATS = {
  totalPatients: DEMO_DOCTOR_PATIENTS.length,
  totalVisits: DEMO_ALL_DOCTOR_VISITS.length,
  visitsThisMonth: DEMO_ALL_DOCTOR_VISITS.filter((v) => {
    const visitDate = new Date(v.visit_date);
    const now = new Date();
    return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
  }).length,
  pendingFollowUps: 4,
};
