export const DEMO_PROFILE = {
  id: "demo-user-id",
  first_name: "Ivan",
  state: "VIC",
  age_range: "26-35",
  has_regular_gp: true,
  ongoing_conditions: "Hypertension",
  current_medications: "Amlodipine 5mg",
  onboarding_complete: true,
  subscription_tier: "plus",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_VISITS = [
  {
    id: "demo-visit-1",
    user_id: "demo-user-id",
    doctor_name: "Dr. Sarah Chen",
    clinic_name: "Point Cook Family Medical Centre",
    visit_type: "gp",
    visit_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    recording_duration: 480,
    status: "complete",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    recording_url: null,
    transcript:
      "Doctor: Good morning, how are you going today? Patient: Not too bad, thanks. I have been checking my blood pressure like you asked and it is still a bit high. Doctor: Let me have a look at your readings. Yes, I can see the average is around 145 over 92. The Amlodipine 5mg does not seem to be bringing it down enough. I think we need to increase the dose to 10mg. Patient: Is that safe? Doctor: Absolutely, 10mg is a very common dose. You might feel a little dizzy for the first day or two but that usually settles. I also want to order some blood tests to check your kidney function and cholesterol. Just a routine check. Patient: OK, do I need to fast for that? Doctor: Yes, nothing to eat or drink except water for 10 to 12 hours before. You can go to any pathology lab, it is all bulk billed. I also want you to try and get 30 minutes of walking in each day and cut back on the salt. Patient: Alright, I will try. When should I come back? Doctor: Let us book you in for 4 weeks from now and we will review the blood results then. Any questions? Patient: No, I think that covers it. Thanks doctor. Doctor: No worries, take care.",
    summary: {
      quick_summary:
        "Routine check-up for ongoing high blood pressure management. Medication adjusted from 5mg to 10mg Amlodipine. Blood test ordered to check kidney function and cholesterol levels.",
      chief_complaint:
        "Follow-up appointment for hypertension (high blood pressure) management and general health check",
      key_discussion_points: [
        "Blood pressure readings have been slightly elevated over the past month (average 145/92)",
        "Current Amlodipine 5mg dosage not achieving target levels",
        "Discussion about lifestyle factors — reducing salt intake and increasing daily walking",
        "Blood tests ordered for kidney function and cholesterol",
      ],
      assessment:
        "Blood pressure is not adequately controlled on current medication. No signs of end-organ damage. The doctor recommends increasing medication and monitoring closely. Overall health is good for age.",
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
        {
          name: "Amlodipine",
          dosage: "10mg",
          frequency: "Once daily in the morning",
          explanation: "A blood pressure medication that relaxes your blood vessels so blood can flow more easily. This is an increase from your previous 5mg dose.",
          is_pbs: true,
        },
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
      ],
      urgency_flags: [],
    },
  },
  {
    id: "demo-visit-2",
    user_id: "demo-user-id",
    doctor_name: "Dr. James Nguyen",
    clinic_name: "Western Orthopaedics — Werribee",
    visit_type: "specialist",
    visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    recording_duration: 960,
    status: "complete",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    recording_url: null,
    transcript:
      "Doctor: Hi there, I am Dr Nguyen. Your GP Dr Chen referred you for your knee. Tell me what is been going on. Patient: My right knee has been hurting for about 3 months now, especially going up and down stairs. Doctor: I have reviewed your MRI results. There is a small tear in the medial meniscus, that is the cartilage on the inner side of your knee. The good news is there is no arthritis and no ligament damage. Patient: Does that mean I need surgery? Doctor: Not necessarily. I would recommend trying physiotherapy first, two sessions per week for about six weeks. If that does not improve things, then we can discuss arthroscopy which is keyhole surgery. Patient: OK, what about exercise? Doctor: Switch to low impact for now. Swimming and cycling are great. Avoid running and jumping. Use ice for 15 minutes after activity if the knee swells up, and you can take Ibuprofen 400mg with food as needed. Patient: And the Medicare rebate for today? Doctor: You will get a rebate but there is a gap of about 85 dollars. My reception can help you claim on the spot. Let us book a review in 8 weeks to see how the physio is going.",
    summary: {
      quick_summary:
        "Orthopaedic consultation for persistent right knee pain. MRI results reviewed — shows mild meniscus tear. Conservative treatment recommended before considering surgery. Physiotherapy referral provided.",
      chief_complaint: "Right knee pain for 3 months, getting worse with stairs and exercise. Referred by GP Dr. Chen.",
      key_discussion_points: [
        "MRI shows a small tear in the medial meniscus (inner part of knee cartilage)",
        "No significant arthritis or ligament damage",
        "Conservative treatment is the recommended first approach",
        "Surgery (arthroscopy) only if physio doesn't help after 8-12 weeks",
        "Medicare rebate for the consultation — out-of-pocket gap of $85",
      ],
      assessment:
        "Small medial meniscus tear in right knee, likely from gradual wear. No surgical intervention needed at this stage. Good prognosis with physiotherapy and activity modification.",
      plan: [
        "Start physiotherapy — 2 sessions per week for 6 weeks",
        "Avoid high-impact activities (running, jumping) for now",
        "Use ice for 15 minutes after activity if knee swells",
        "Take Ibuprofen 400mg with food as needed for pain",
        "Review in 8 weeks to assess progress",
      ],
      doctors_recommendations: [
        { number: 1, text: "Book physiotherapy ASAP — find a physio experienced with knee rehabilitation" },
        { number: 2, text: "Switch from running to swimming or cycling for exercise" },
        { number: 3, text: "Take Ibuprofen 400mg with food as needed (max 3 times per day)" },
        { number: 4, text: "Ice the knee for 15 minutes after any activity that causes swelling" },
        { number: 5, text: "Book follow-up with Dr. Nguyen in 8 weeks" },
      ],
      action_items: [
        { description: "Book physiotherapy appointments — 2x per week for 6 weeks", category: "referral", due_date_suggestion: "This week" },
        { description: "Switch exercise to low-impact (swimming, cycling)", category: "lifestyle", due_date_suggestion: "Immediately" },
        { description: "Claim Medicare rebate for specialist consultation", category: "follow_up", due_date_suggestion: "This week" },
        { description: "Book follow-up with Dr. Nguyen in 8 weeks", category: "follow_up", due_date_suggestion: "Within 2 weeks" },
      ],
      medications: [
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "As needed with food, up to 3 times daily",
          explanation: "An anti-inflammatory painkiller that reduces swelling and pain in your knee. Take it with food to protect your stomach.",
          is_pbs: false,
        },
      ],
      referrals: [
        {
          to: "Physiotherapist",
          reason: "Knee rehabilitation for medial meniscus tear",
          next_steps: "Book with a physio experienced in knee rehab. Ask your GP about a Chronic Disease Management plan for Medicare rebates on physio.",
        },
      ],
      follow_up_questions: [
        "How will I know if the physio is working or if I need surgery?",
        "Can I still go to the gym for upper body exercises?",
        "Is this tear something that will get worse over time?",
        "Can I get a Medicare rebate for physiotherapy?",
      ],
      medical_terms: [
        { term: "medial meniscus", explanation: "A C-shaped piece of cartilage on the inner side of your knee that acts as a shock absorber" },
        { term: "arthroscopy", explanation: "Keyhole surgery where a tiny camera is inserted into the knee through small cuts to repair damage" },
        { term: "conservative treatment", explanation: "Non-surgical approach — using physiotherapy, rest, and medication instead of surgery" },
        { term: "MRI", explanation: "Magnetic Resonance Imaging — a scan using magnets to see inside your body without radiation" },
      ],
      urgency_flags: [],
    },
  },
  {
    id: "demo-visit-3",
    user_id: "demo-user-id",
    doctor_name: "Dr. Priya Patel",
    clinic_name: "InstantConsult Telehealth",
    visit_type: "telehealth",
    visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    recording_duration: 420,
    status: "complete",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    recording_url: null,
    transcript:
      "Doctor: Hi, I am Dr Patel. What can I help you with today? Patient: I have had this dry cough for about 3 weeks now. It started after I had a cold but the cold is gone and the cough will not go away. Doctor: Any fever, shortness of breath, or chest pain? Patient: No, nothing like that. Just the cough. Doctor: Are you a smoker? Patient: No, never. Doctor: Any history of asthma? Patient: No. Doctor: This sounds like a post-viral cough, which is very common. The cold virus irritates your airways and the cough can hang around for weeks. I think there might be some post-nasal drip contributing as well. I would recommend trying Loratadine, which is an antihistamine, 10mg once daily for 2 weeks. Also try honey in warm water. Patient: Do I need antibiotics? Doctor: No, this is not a bacterial infection so antibiotics would not help. If the cough has not settled in 2 more weeks, I would want you to see a GP in person. And if you develop difficulty breathing, a fever over 38.5, or cough up any blood, go straight to emergency. Patient: OK, thanks doctor.",
    summary: {
      quick_summary:
        "Telehealth consultation for persistent dry cough lasting 3 weeks. Likely post-viral cough. Prescribed antihistamines and a follow-up if symptoms persist.",
      chief_complaint: "Dry cough lasting 3 weeks, started after a cold. Not getting better.",
      key_discussion_points: [
        "Cough started after a viral upper respiratory infection 3 weeks ago",
        "No fever, no shortness of breath, no chest pain",
        "Non-smoker, no history of asthma",
        "Post-nasal drip likely contributing to the cough",
        "No need for antibiotics — this is viral",
      ],
      assessment:
        "Post-viral cough with possible post-nasal drip. No red flags for anything serious. Should resolve within 2-4 more weeks with symptomatic treatment.",
      plan: [
        "Trial of Loratadine (antihistamine) for 2 weeks",
        "Honey and warm drinks for symptomatic relief",
        "Return if cough persists beyond 2 more weeks",
        "No antibiotics needed",
      ],
      doctors_recommendations: [
        { number: 1, text: "Take Loratadine 10mg once daily for 2 weeks" },
        { number: 2, text: "Try honey in warm water or tea for cough relief" },
        { number: 3, text: "See a GP in person if cough continues past 2 more weeks" },
        { number: 4, text: "Go to emergency if you develop difficulty breathing, fever over 38.5°C, or cough up blood" },
      ],
      action_items: [
        { description: "Buy Loratadine 10mg from pharmacy (over the counter)", category: "medication", due_date_suggestion: "Today" },
        { description: "Monitor cough — if not improving in 2 weeks, book in-person GP visit", category: "follow_up", due_date_suggestion: "In 2 weeks" },
      ],
      medications: [
        {
          name: "Loratadine",
          dosage: "10mg",
          frequency: "Once daily",
          explanation: "An antihistamine that reduces post-nasal drip which may be triggering your cough. Non-drowsy so safe to take during the day.",
          is_pbs: false,
        },
      ],
      referrals: [],
      follow_up_questions: [
        "What symptoms should make me go to emergency?",
        "Could this cough be related to allergies?",
        "Should I get a chest X-ray if it doesn't go away?",
      ],
      medical_terms: [
        { term: "post-viral cough", explanation: "A cough that lingers after a cold or flu — very common and can last 3-8 weeks" },
        { term: "post-nasal drip", explanation: "Mucus dripping from the back of your nose down your throat, triggering coughing" },
        { term: "upper respiratory infection", explanation: "An infection of the nose, throat, and airways — commonly known as a cold" },
      ],
      urgency_flags: ["⚠️ Seek emergency care if you develop difficulty breathing, fever over 38.5°C, or cough up blood"],
    },
  },
];

export const DEMO_ACTION_ITEMS = [
  { id: "demo-action-1", user_id: "demo-user-id", visit_id: "demo-visit-1", description: "Pick up new Amlodipine 10mg prescription from pharmacy", due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "complete", category: "medication", completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-2", user_id: "demo-user-id", visit_id: "demo-visit-1", description: "Book blood test at Melbourne Pathology or QML", due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "test", completed_at: null, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-3", user_id: "demo-user-id", visit_id: "demo-visit-1", description: "Book follow-up with Dr. Chen in 4 weeks", due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-4", user_id: "demo-user-id", visit_id: "demo-visit-1", description: "Start tracking blood pressure twice daily", due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-5", user_id: "demo-user-id", visit_id: "demo-visit-2", description: "Book physiotherapy appointments — 2x per week", due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-6", user_id: "demo-user-id", visit_id: "demo-visit-2", description: "Claim Medicare rebate for specialist consultation", due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-7", user_id: "demo-user-id", visit_id: "demo-visit-3", description: "Buy Loratadine 10mg from pharmacy", due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "complete", category: "medication", completed_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-action-8", user_id: "demo-user-id", visit_id: "demo-visit-3", description: "Monitor cough — book GP if not improving", due_date: new Date().toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEMO_MEDICATIONS = [
  { id: "demo-med-1", user_id: "demo-user-id", visit_id: "demo-visit-1", name: "Amlodipine", dosage: "10mg", frequency: "Once daily in the morning", prescribing_doctor: "Dr. Sarah Chen", date_prescribed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: true, plain_explanation: "A blood pressure medication that relaxes your blood vessels so blood can flow more easily.", status: "active", created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-med-2", user_id: "demo-user-id", visit_id: "demo-visit-2", name: "Ibuprofen", dosage: "400mg", frequency: "As needed with food, up to 3x daily", prescribing_doctor: "Dr. James Nguyen", date_prescribed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: false, plain_explanation: "An anti-inflammatory painkiller for knee swelling and pain. Always take with food.", status: "active", created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-med-3", user_id: "demo-user-id", visit_id: "demo-visit-3", name: "Loratadine", dosage: "10mg", frequency: "Once daily", prescribing_doctor: "Dr. Priya Patel", date_prescribed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: false, plain_explanation: "An antihistamine that reduces post-nasal drip triggering your cough. Non-drowsy.", status: "active", created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEMO_CHAT_MESSAGES = [
  { id: "demo-chat-1", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "user", content: "What does the eGFR blood test check for?", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-chat-2", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "assistant", content: "The eGFR (estimated Glomerular Filtration Rate) is a blood test that measures how well your kidneys are filtering waste from your blood. Dr. Chen ordered this because some blood pressure medications can affect kidney function, so it's a routine check to make sure everything is working well.\n\nA normal eGFR is above 90. It's nothing to worry about — it's just good preventive care.\n\nWould you like to know more about what to expect with the blood test?", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
  { id: "demo-chat-3", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "user", content: "Will the new 10mg dose make me dizzy?", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
  { id: "demo-chat-4", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "assistant", content: "It's possible to feel slightly dizzy when your blood pressure medication dose increases, especially in the first few days as your body adjusts. Here are a few tips:\n\n• Stand up slowly from sitting or lying down\n• Stay well hydrated throughout the day\n• Avoid alcohol for the first week\n\nIf you feel persistently dizzy or faint, contact Dr. Chen's clinic at Point Cook Family Medical Centre. Most people adjust to the new dose within a few days without any issues.\n\nRemember, this is general information based on your visit — always check with Dr. Chen if you're concerned.", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 150000).toISOString() },
  { id: "demo-chat-5", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "user", content: "How much will the blood test cost?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-chat-6", user_id: "demo-user-id", visit_id: "demo-visit-1", role: "assistant", content: "Good news — blood tests ordered by your GP with a pathology referral are typically bulk billed through Medicare, meaning there's no out-of-pocket cost to you.\n\nJust take the pathology request form Dr. Chen gave you to any collection centre like Melbourne Pathology, QML, or Australian Clinical Labs. You'll need to fast for 10-12 hours before the test since it includes cholesterol.\n\nMost centres accept walk-ins, or you can book online for a specific time to avoid waiting.", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
];
