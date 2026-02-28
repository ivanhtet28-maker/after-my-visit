import { supabase } from "@/integrations/supabase/client";
import { format, subDays, addDays, subWeeks } from "date-fns";

const DEMO_PREFIX = "demo-";

const visit1Summary = {
  quick_summary: "Routine check-up for ongoing high blood pressure management. Medication adjusted from 5mg to 10mg Amlodipine. Blood test ordered to check kidney function and cholesterol levels.",
  chief_complaint: "Follow-up appointment for hypertension (high blood pressure) management and general health check",
  key_discussion_points: [
    "Blood pressure readings have been slightly elevated over the past month (average 145/92)",
    "Current Amlodipine 5mg dosage not achieving target levels",
    "Discussion about lifestyle factors — reducing salt intake and increasing daily walking",
    "Medicare Health Assessment eligibility discussed",
  ],
  assessment: "Blood pressure is not adequately controlled on current medication. No signs of end-organ damage. The doctor recommends increasing medication and monitoring closely. Overall health is good for age.",
  plan: [
    "Increase Amlodipine from 5mg to 10mg daily",
    "Blood test for kidney function (eGFR), cholesterol panel, and HbA1c",
    "Follow-up appointment in 4 weeks to review blood test results",
    "Continue daily 30-minute walks",
    "Reduce sodium intake — aim for less than 2000mg per day",
  ],
  doctors_recommendations: [
    { number: 1, text: "Increase Amlodipine to 10mg — take one tablet each morning with breakfast" },
    { number: 2, text: "Get blood test done within the next week at any pathology lab (referral provided)" },
    { number: 3, text: "Book follow-up appointment in 4 weeks" },
    { number: 4, text: "Download a blood pressure tracking app and record readings twice daily" },
    { number: 5, text: "Aim for 30 minutes of walking daily — even a 15-minute walk at lunch helps" },
  ],
  action_items: [
    { description: "Pick up new Amlodipine 10mg prescription from pharmacy", category: "medication", due_date_suggestion: "Today" },
    { description: "Book blood test at Melbourne Pathology or QML", category: "test", due_date_suggestion: "Within 1 week" },
    { description: "Book follow-up with Dr. Chen in 4 weeks", category: "follow_up", due_date_suggestion: "Within 1 week" },
    { description: "Start tracking blood pressure twice daily", category: "lifestyle", due_date_suggestion: "Today" },
    { description: "Reduce salt in diet — check food labels for sodium content", category: "lifestyle", due_date_suggestion: "Ongoing" },
  ],
  medications: [
    { name: "Amlodipine", dosage: "10mg", frequency: "Once daily in the morning", explanation: "A blood pressure medication that relaxes your blood vessels so blood can flow more easily. This is an increase from your previous 5mg dose.", is_pbs: true },
  ],
  referrals: [],
  follow_up_questions: [
    "What should I do if I feel dizzy after increasing my medication?",
    "Are there any foods I should specifically avoid with Amlodipine?",
    "What blood pressure reading should I be aiming for at home?",
    "Should I be concerned about the kidney function test?",
  ],
  medical_terms: [
    { term: "hypertension", explanation: "High blood pressure — when the force of blood pushing against your artery walls is consistently too high" },
    { term: "Amlodipine", explanation: "A calcium channel blocker medication that lowers blood pressure by relaxing blood vessels" },
    { term: "eGFR", explanation: "Estimated Glomerular Filtration Rate — a blood test that measures how well your kidneys are filtering waste" },
    { term: "HbA1c", explanation: "A blood test that shows your average blood sugar levels over the past 2-3 months, used to screen for diabetes" },
    { term: "end-organ damage", explanation: "Damage to major organs (heart, kidneys, eyes, brain) that can happen from long-term uncontrolled high blood pressure" },
  ],
  urgency_flags: [],
};

const visit2Summary = {
  quick_summary: "Orthopaedic consultation for persistent right knee pain. MRI results reviewed — shows mild meniscus tear. Conservative treatment recommended before considering surgery. Physiotherapy referral provided.",
  chief_complaint: "Right knee pain for 3 months, getting worse with stairs and exercise. Referred by GP Dr. Chen.",
  key_discussion_points: [
    "MRI shows a small tear in the medial meniscus (inner part of knee cartilage)",
    "No significant arthritis or ligament damage",
    "Conservative treatment is the recommended first approach",
    "Surgery (arthroscopy) would only be considered if physio doesn't help after 8-12 weeks",
    "Medicare rebate for the consultation was discussed — out-of-pocket gap of $85",
  ],
  assessment: "Small medial meniscus tear in right knee, likely from gradual wear. No surgical intervention needed at this stage. Good prognosis with physiotherapy and activity modification.",
  plan: [
    "Start physiotherapy — 2 sessions per week for 6 weeks",
    "Avoid high-impact activities (running, jumping) for now",
    "Use ice for 15 minutes after activity if knee swells",
    "Take anti-inflammatory medication (Ibuprofen) as needed for pain",
    "Review in 8 weeks to assess progress",
  ],
  doctors_recommendations: [
    { number: 1, text: "Book physiotherapy ASAP — Dr. Nguyen recommends a physio experienced with knee rehabilitation" },
    { number: 2, text: "Switch from running to swimming or cycling for exercise" },
    { number: 3, text: "Take Ibuprofen 400mg with food as needed for pain (max 3 times per day)" },
    { number: 4, text: "Ice the knee for 15 minutes after any activity that causes swelling" },
    { number: 5, text: "Book follow-up with Dr. Nguyen in 8 weeks" },
  ],
  action_items: [
    { description: "Book physiotherapy appointments — 2x per week for 6 weeks", category: "referral", due_date_suggestion: "This week" },
    { description: "Buy ice pack for knee management", category: "lifestyle", due_date_suggestion: "Today" },
    { description: "Switch exercise to low-impact (swimming, cycling)", category: "lifestyle", due_date_suggestion: "Immediately" },
    { description: "Book follow-up with Dr. Nguyen in 8 weeks", category: "follow_up", due_date_suggestion: "Within 2 weeks" },
    { description: "Claim Medicare rebate for today's consultation", category: "follow_up", due_date_suggestion: "This week" },
  ],
  medications: [
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed with food, up to 3 times daily", explanation: "An anti-inflammatory painkiller that reduces swelling and pain in your knee. Take it with food to protect your stomach.", is_pbs: false },
  ],
  referrals: [
    { to: "Physiotherapist", reason: "Knee rehabilitation for medial meniscus tear", next_steps: "Book with a physio experienced in knee rehab. Your GP can provide a referral for Medicare rebate under a Chronic Disease Management plan if eligible." },
  ],
  follow_up_questions: [
    "How will I know if the physio is working or if I need surgery?",
    "Can I still go to the gym for upper body exercises?",
    "Is this tear something that will get worse over time?",
    "Can I get a Medicare rebate for physiotherapy?",
  ],
  medical_terms: [
    { term: "medial meniscus", explanation: "A C-shaped piece of cartilage on the inner side of your knee that acts as a shock absorber between your thigh bone and shin bone" },
    { term: "arthroscopy", explanation: "Keyhole surgery where a tiny camera is inserted into the knee joint through small cuts to repair or remove damaged tissue" },
    { term: "conservative treatment", explanation: "Non-surgical treatment approach — using physiotherapy, rest, and medication instead of surgery" },
    { term: "MRI", explanation: "Magnetic Resonance Imaging — a scan that uses magnets to create detailed pictures of the inside of your body without radiation" },
  ],
  urgency_flags: [],
};

const visit3Summary = {
  quick_summary: "Telehealth consultation for persistent dry cough lasting 3 weeks. Likely post-viral cough. Prescribed a short course of antihistamines and a follow-up if symptoms persist beyond another 2 weeks.",
  chief_complaint: "Dry cough lasting 3 weeks, started after a cold. Not getting better.",
  key_discussion_points: [
    "Cough started after a viral upper respiratory infection 3 weeks ago",
    "No fever, no shortness of breath, no chest pain",
    "Non-smoker, no history of asthma",
    "Post-nasal drip likely contributing to the cough",
    "No need for antibiotics as this is viral",
  ],
  assessment: "Post-viral cough with possible post-nasal drip. No red flags for anything serious. Should resolve within 2-4 more weeks with symptomatic treatment.",
  plan: [
    "Trial of Loratadine (antihistamine) for 2 weeks",
    "Honey and warm drinks for symptomatic relief",
    "Return if cough persists beyond 2 more weeks or if new symptoms develop",
    "No antibiotics needed — this is not a bacterial infection",
  ],
  doctors_recommendations: [
    { number: 1, text: "Take Loratadine 10mg once daily for 2 weeks" },
    { number: 2, text: "Try honey in warm water or tea for cough relief" },
    { number: 3, text: "See a GP in person if cough continues past 2 more weeks" },
    { number: 4, text: "Come to emergency if you develop difficulty breathing, fever over 38.5°C, or cough up blood" },
  ],
  action_items: [
    { description: "Buy Loratadine 10mg from pharmacy (over the counter)", category: "medication", due_date_suggestion: "Today" },
    { description: "Monitor cough — if not improving in 2 weeks, book in-person GP visit", category: "follow_up", due_date_suggestion: "In 2 weeks" },
  ],
  medications: [
    { name: "Loratadine", dosage: "10mg", frequency: "Once daily", explanation: "An antihistamine that reduces post-nasal drip which may be triggering your cough. Non-drowsy so safe to take during the day.", is_pbs: false },
  ],
  referrals: [],
  follow_up_questions: [
    "What symptoms should make me go to emergency?",
    "Could this cough be related to allergies?",
    "Should I get a chest X-ray if it doesn't go away?",
  ],
  medical_terms: [
    { term: "post-viral cough", explanation: "A cough that lingers after a cold or flu — very common and can last 3-8 weeks even though the infection is gone" },
    { term: "post-nasal drip", explanation: "Mucus dripping from the back of your nose down your throat, which irritates and triggers coughing" },
    { term: "upper respiratory infection", explanation: "An infection of the nose, throat, and airways — commonly known as a cold or flu" },
  ],
  urgency_flags: ["⚠️ Seek emergency care if you develop difficulty breathing, fever over 38.5°C, or cough up blood"],
};

function dueDate(suggestion: string, visitDate: Date): string {
  const now = new Date();
  if (suggestion.includes("Today") || suggestion.includes("Immediately")) return format(visitDate, "yyyy-MM-dd");
  if (suggestion.includes("1 week") || suggestion.includes("This week")) return format(addDays(visitDate, 7), "yyyy-MM-dd");
  if (suggestion.includes("2 weeks")) return format(addDays(visitDate, 14), "yyyy-MM-dd");
  if (suggestion.includes("4 weeks")) return format(addDays(visitDate, 28), "yyyy-MM-dd");
  if (suggestion.includes("8 weeks")) return format(addDays(visitDate, 56), "yyyy-MM-dd");
  return format(addDays(now, 14), "yyyy-MM-dd");
}

export async function seedDemoData(userId: string) {
  const now = new Date();
  const visit1Date = subDays(now, 3);
  const visit2Date = subWeeks(now, 1);
  const visit3Date = subWeeks(now, 2);

  // Insert 3 visits
  const visits = [
    { user_id: userId, doctor_name: "Dr. Sarah Chen", clinic_name: "Point Cook Family Medical Centre", visit_type: "gp", visit_date: format(visit1Date, "yyyy-MM-dd"), status: "complete", recording_duration: 480, summary: visit1Summary as any },
    { user_id: userId, doctor_name: "Dr. James Nguyen", clinic_name: "Western Orthopaedics — Werribee", visit_type: "specialist", visit_date: format(visit2Date, "yyyy-MM-dd"), status: "complete", recording_duration: 960, summary: visit2Summary as any },
    { user_id: userId, doctor_name: "Dr. Priya Patel", clinic_name: "InstantConsult Telehealth", visit_type: "telehealth", visit_date: format(visit3Date, "yyyy-MM-dd"), status: "complete", recording_duration: 420, summary: visit3Summary as any },
  ];

  const { data: insertedVisits, error: visitError } = await supabase
    .from("visits")
    .insert(visits)
    .select();

  if (visitError || !insertedVisits) throw new Error("Failed to seed visits: " + visitError?.message);

  // Insert action items for each visit
  const allActions: any[] = [];
  const summaries = [visit1Summary, visit2Summary, visit3Summary];
  const visitDates = [visit1Date, visit2Date, visit3Date];

  for (let i = 0; i < insertedVisits.length; i++) {
    const v = insertedVisits[i];
    const s = summaries[i];
    const vDate = visitDates[i];
    for (const item of s.action_items) {
      const dd = dueDate(item.due_date_suggestion, vDate);
      const isPast = new Date(dd) < now;
      // Make some items complete for variety
      const isComplete = (i === 2 && item.category === "medication") || (i === 0 && item.description.includes("prescription"));
      allActions.push({
        user_id: userId,
        visit_id: v.id,
        description: item.description,
        category: item.category,
        due_date: dd,
        status: isComplete ? "complete" : "pending",
        completed_at: isComplete ? now.toISOString() : null,
      });
    }
  }

  await supabase.from("action_items").insert(allActions);

  // Insert medications
  const allMeds: any[] = [];
  for (let i = 0; i < insertedVisits.length; i++) {
    const v = insertedVisits[i];
    const s = summaries[i];
    for (const med of s.medications) {
      allMeds.push({
        user_id: userId,
        visit_id: v.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        plain_explanation: med.explanation,
        is_pbs: med.is_pbs,
        prescribing_doctor: visits[i].doctor_name,
        date_prescribed: visits[i].visit_date,
      });
    }
  }

  await supabase.from("medications").insert(allMeds);

  // Insert sample chat messages for visit 1
  const v1Id = insertedVisits[0].id;
  const chatMessages = [
    { user_id: userId, visit_id: v1Id, role: "user", content: "What does the eGFR blood test check for?" },
    { user_id: userId, visit_id: v1Id, role: "assistant", content: "The eGFR (estimated Glomerular Filtration Rate) is a blood test that measures how well your kidneys are filtering waste from your blood. Dr. Chen ordered this because some blood pressure medications can affect kidney function, so it's a routine check to make sure everything is working well. A normal eGFR is above 90. It's nothing to worry about — it's just good preventive care. Would you like to know more about what to expect with the blood test?" },
    { user_id: userId, visit_id: v1Id, role: "user", content: "Will the new 10mg dose make me dizzy?" },
    { user_id: userId, visit_id: v1Id, role: "assistant", content: "It's possible to feel slightly dizzy when your blood pressure medication dose increases, especially in the first few days as your body adjusts. Here are a few tips from your visit: stand up slowly from sitting or lying down, stay well hydrated, and avoid alcohol for the first week. If you feel persistently dizzy or faint, contact Dr. Chen's clinic at Point Cook Family Medical Centre. Most people adjust to the new dose within a few days without any issues." },
    { user_id: userId, visit_id: v1Id, role: "user", content: "How much will the blood test cost?" },
    { user_id: userId, visit_id: v1Id, role: "assistant", content: "Good news — blood tests ordered by your GP with a pathology referral are typically bulk billed through Medicare, meaning there's no out-of-pocket cost to you. Just take the pathology request form Dr. Chen gave you to any collection centre like Melbourne Pathology, QML, or Australian Clinical Labs. You'll need to fast for 10-12 hours before the test since it includes cholesterol. Most centres accept walk-ins, or you can book online for a specific time." },
  ];

  await supabase.from("chat_messages").insert(chatMessages);

  return insertedVisits;
}

export async function clearDemoData(userId: string) {
  // Delete in order of dependencies
  const { data: visits } = await supabase.from("visits").select("id").eq("user_id", userId);
  if (visits) {
    const visitIds = visits.map((v) => v.id);
    if (visitIds.length > 0) {
      await supabase.from("chat_messages").delete().in("visit_id", visitIds);
      await supabase.from("action_items").delete().in("visit_id", visitIds);
      await supabase.from("medications").delete().in("visit_id", visitIds);
      await supabase.from("visits").delete().eq("user_id", userId);
    }
  }
  // Also delete orphaned items
  await supabase.from("action_items").delete().eq("user_id", userId);
  await supabase.from("medications").delete().eq("user_id", userId);
}
