const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
const fiveWeeksAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000);
const sixWeeksPlusThree = new Date(Date.now() - 39 * 24 * 60 * 60 * 1000);
const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
const nineDaysAgo = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);

export const DEMO_PATIENT = {
  id: "demo-karen-id",
  first_name: "Karen",
  last_name: "Mitchell",
  age: 58,
  age_range: "56-65",
  state: "VIC",
  suburb: "Werribee",
  occupation: "School admin (part-time)",
  height_cm: 165,
  weight_kg: 82.4,
  bmi: 30.3,
  blood_type: "A+",
  has_regular_gp: true,
  regular_gp: "Dr. Helen Zhao",
  regular_clinic: "Werribee Plaza Medical Centre",
  ongoing_conditions: "Type 2 Diabetes, Hypertension, High Cholesterol, Knee Osteoarthritis, Vitamin D deficiency, GORD",
  current_medications: "Metformin 1000mg, Perindopril 5mg, Atorvastatin 40mg, Empagliflozin 10mg, Vitamin D 1000IU, Pantoprazole 40mg",
  onboarding_complete: true,
  subscription_tier: "plus",
  created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_CONDITIONS = [
  { name: "Type 2 Diabetes Mellitus", since: "March 2019", icd10: "E11.9", status: "active" },
  { name: "Essential Hypertension", since: "July 2018", icd10: "I10", status: "active" },
  { name: "Hypercholesterolaemia", since: "January 2020", icd10: "E78.0", status: "active" },
  { name: "Osteoarthritis right knee", since: "November 2025", icd10: "M17.11", status: "active" },
  { name: "Vitamin D deficiency", since: "June 2024", icd10: "E55.9", status: "active" },
  { name: "Gastro-oesophageal reflux disease", since: "August 2022", icd10: "K21.0", status: "managed" },
];

export const DEMO_VISITS_V2 = [
  // ── Visit 1 — GP check-up (2 days ago) ──
  {
    id: "demo-v2-visit-1",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: twoDaysAgo.toISOString().split("T")[0],
    recording_duration: 720,
    status: "complete",
    bulk_billed: true,
    out_of_pocket: 0,
    created_at: twoDaysAgo.toISOString(),
    updated_at: twoDaysAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Morning Karen, come on in. How are you going?
Patient: Not too bad thanks Helen. A bit tired but otherwise OK.
Doctor: Let's have a look at your bloods that came back. So your HbA1c has gone up a bit — it was 7.2 last time and now it's sitting at 7.8.
Patient: Oh. That's not great is it?
Doctor: Look, it's not a disaster but it does tell us we need to do something about it. Have there been any changes with your diet or exercise?
Patient: Honestly, over Christmas and New Year I was terrible. Lots of eating out, the grandkids were around, you know how it is. And my knee was playing up so I wasn't walking as much.
Doctor: Yeah, that would do it. The good news is your kidney function is fine, your liver is fine. Your cholesterol though — your LDL has crept up to 2.8. I think we need to bump up your Atorvastatin from 20 to 40mg.
Patient: OK, is that a big jump?
Doctor: No, it's very standard. You might get some mild muscle aches but most people are fine on 40. Let me know if you notice anything.
Patient: Sure.
Doctor: Now, for the diabetes, I spoke with Dr. Sharma — your endocrinologist — and she recommended adding a medication called Empagliflozin, also known as Jardiance. It works differently to Metformin. It helps your kidneys flush out extra sugar through your urine.
Patient: That sounds a bit weird. Will I be going to the toilet more?
Doctor: You might wee a bit more, especially in the first couple of weeks. It's really important to drink plenty of water. The upside is it's also good for your heart and kidneys, and some people lose a couple of kilos on it.
Patient: Oh well, I could do with that! 
Doctor: Ha, couldn't we all. So you'll take 10mg once a day in the morning. Keep your Metformin the same — 1000mg twice daily with meals. And keep the Perindopril going, your blood pressure was 138 over 85 today which is acceptable.
Patient: Is that OK though? It seems a bit high.
Doctor: For someone with diabetes, we like it under 140 over 90 ideally, so you're just under. If it starts creeping up we'll look at adjusting, but for now it's fine.
Patient: OK.
Doctor: Your Vitamin D is still a bit low — it's 42, we want it above 50. Keep taking your 1000 units daily, especially through winter.
Patient: I keep forgetting to take it.
Doctor: Try keeping it next to your toothbrush. That's what I tell all my patients. Now, how's the knee going with the physio?
Patient: Actually much better. The exercises are really helping. Dr. Nguyen said the X-ray looked stable.
Doctor: Excellent, that's good news. Keep going with the physio for another four weeks.
Patient: Will do.
Doctor: One more thing — you're due for your flu vaccination. Because you have diabetes it's free under Medicare. Do you want me to do that today?
Patient: Oh yeah, might as well get it done.
Doctor: Perfect. I'll get the nurse to do that before you leave. Now, I want you to check your blood sugar before and after dinner for the next two weeks. Dr. Sharma mentioned your CGM showed spikes after your evening meal, so let's keep an eye on that.
Patient: OK, I can do that.
Doctor: Great. Let's book you in for six weeks' time. We'll redo the HbA1c then and do your diabetes cycle of care review — that's where we check your eyes, feet, and do a full diabetes assessment. You'll need to see the podiatrist and get a retinal photo before that appointment.
Patient: Right, I'll sort that out.
Doctor: Any questions?
Patient: No, I think that's everything. Thanks Helen.
Doctor: No worries Karen. Pick up your scripts from reception and don't forget to drink lots of water with the new tablet. See you in six weeks.`,
    summary: {
      quick_summary: "Diabetes review — HbA1c risen to 7.8% (was 7.2%). New medication Empagliflozin added to Metformin. Cholesterol medication Atorvastatin increased from 20mg to 40mg. Blood pressure stable. Vitamin D still low. Flu vaccination given. Knee improving with physio.",
      chief_complaint: "Diabetes management review and blood test results discussion",
      key_discussion_points: [
        "HbA1c risen from 7.2% to 7.8% — likely due to holiday diet and reduced exercise",
        "Empagliflozin (Jardiance) 10mg being added to existing Metformin — works by flushing excess sugar through kidneys",
        "Atorvastatin increased from 20mg to 40mg nightly — LDL cholesterol crept up to 2.8",
        "Blood pressure 138/85 — acceptable for diabetic patient (target <140/90)",
        "Vitamin D 42 nmol/L — still below target of 50, continue supplementation",
        "Right knee improving with physiotherapy — continue 4 more weeks",
        "Flu vaccination given today — free under Medicare for diabetic patients",
        "Diabetes cycle of care review due at next visit — needs podiatrist and retinal photo first",
      ],
      assessment: "Type 2 diabetes control has worsened slightly, likely related to holiday dietary indiscretions and reduced physical activity due to knee pain. Addition of Empagliflozin is appropriate given cardiovascular and renal benefits. Cholesterol requires further optimisation with increased statin dose. Blood pressure is borderline acceptable. Overall condition stable with good engagement in care.",
      plan: [
        "Start Empagliflozin (Jardiance) 10mg once daily in the morning",
        "Increase Atorvastatin from 20mg to 40mg, take nightly",
        "Continue Perindopril 5mg daily for blood pressure",
        "Continue Vitamin D 1000IU daily — keep next to toothbrush as reminder",
        "Continue physiotherapy for right knee — 4 more weeks",
        "Flu vaccination administered today",
        "Follow-up in 6 weeks for HbA1c recheck and diabetes cycle of care review",
        "Arrange podiatrist visit and retinal photography before next appointment",
      ],
      doctors_recommendations: [
        { number: 1, text: "Start Empagliflozin 10mg — take one tablet each morning with breakfast. Drink at least 2 litres of water daily." },
        { number: 2, text: "Increase Atorvastatin to 40mg — take one tablet at night. Report any unusual muscle aches." },
        { number: 3, text: "Book fasting blood test in 6 weeks — needs to include HbA1c, lipids, kidney function, and liver function." },
        { number: 4, text: "Book follow-up appointment with Dr. Zhao in 6 weeks for diabetes cycle of care review." },
        { number: 5, text: "Download a blood pressure tracking app and record readings each morning before medication." },
        { number: 6, text: "Aim for 30 minutes of walking daily — start with 15 minutes if knee is sore." },
        { number: 7, text: "Check blood sugar before and after dinner for the next 2 weeks to track evening spikes." },
      ],
      action_items: [
        { description: "Pick up new Empagliflozin and updated Atorvastatin scripts from pharmacy", category: "medication", due_date_suggestion: "Today", status: "complete" },
        { description: "Book fasting blood test for 6 weeks' time", category: "test", due_date_suggestion: "Within 1 week" },
        { description: "Book follow-up with Dr. Zhao in 6 weeks", category: "follow_up", due_date_suggestion: "Within 1 week" },
        { description: "Check blood sugar before and after dinner daily for 2 weeks", category: "lifestyle", due_date_suggestion: "Today" },
        { description: "Continue physio for knee — 2 sessions per week for 4 more weeks", category: "lifestyle", due_date_suggestion: "Ongoing" },
        { description: "Buy a 2-litre water bottle to track daily water intake", category: "lifestyle", due_date_suggestion: "This week" },
        { description: "Flu vaccination — done today at the clinic", category: "vaccination", due_date_suggestion: "Today", status: "complete" },
      ],
      medications: [
        { name: "Empagliflozin (Jardiance)", dosage: "10mg", frequency: "Once daily in the morning", explanation: "A newer diabetes medication that works by helping your kidneys remove excess sugar through your urine. It also has benefits for your heart and kidneys. You may notice you need to wee more often, especially at first — this is normal and means the medication is working. Drink plenty of water.", is_pbs: true },
        { name: "Atorvastatin", dosage: "40mg (increased from 20mg)", frequency: "Once daily at night", explanation: "A cholesterol-lowering medication that reduces the 'bad' LDL cholesterol in your blood. Taking it at night works best because your body makes more cholesterol while you sleep. The dose has been increased because your cholesterol levels crept up.", is_pbs: true },
      ],
      referrals: [],
      follow_up_questions: [
        "What should I do if I feel dizzy or lightheaded on the new Empagliflozin?",
        "Are there any foods I should avoid while taking Empagliflozin?",
        "What blood pressure reading should I be aiming for at home?",
        "Should I be worried about the kidney function test?",
        "What exactly happens at a diabetes cycle of care review?",
      ],
      medical_terms: [
        { term: "HbA1c", explanation: "A blood test that shows your average blood sugar levels over the past 2-3 months. Think of it as a 'report card' for your diabetes control. Normal is below 6%, and for diabetics the target is usually below 7%." },
        { term: "Empagliflozin", explanation: "Also called Jardiance. A type of diabetes medication called an SGLT2 inhibitor that helps your kidneys filter out excess sugar into your urine, lowering your blood sugar levels." },
        { term: "Atorvastatin", explanation: "A statin medication that reduces cholesterol production in your liver. Commonly known by the brand name Lipitor." },
        { term: "LDL cholesterol", explanation: "Low-density lipoprotein — often called 'bad' cholesterol. High levels can build up in your arteries and increase your risk of heart disease and stroke." },
        { term: "Perindopril", explanation: "An ACE inhibitor blood pressure medication. It relaxes blood vessels to help lower blood pressure and also provides kidney protection for diabetic patients." },
        { term: "diabetes cycle of care", explanation: "An annual comprehensive health check for diabetic patients covered by Medicare. Includes checking your eyes (retinal photo), feet (podiatrist), kidneys, blood sugar control, and general wellbeing." },
      ],
      urgency_flags: [],
    },
  },

  // ── Visit 2 — Orthopaedic specialist (10 days ago) ──
  {
    id: "demo-v2-visit-2",
    user_id: "demo-karen-id",
    doctor_name: "Dr. James Nguyen",
    clinic_name: "Western Orthopaedics — Werribee",
    visit_type: "specialist",
    visit_date: tenDaysAgo.toISOString().split("T")[0],
    recording_duration: 600,
    status: "complete",
    bulk_billed: false,
    out_of_pocket: 95,
    created_at: tenDaysAgo.toISOString(),
    updated_at: tenDaysAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi Karen, come in. How's the knee been going since we last spoke?
Patient: Actually much better, Dr. Nguyen. The physio has been really helpful. I can do the stairs now without hanging onto the railing.
Doctor: That's great to hear. And the pain — where would you rate it now on a scale of one to ten?
Patient: Maybe a three or four most days. It used to be a seven.
Doctor: Excellent improvement. Let me have a look at your latest X-ray. So the joint space is maintained — that means the cartilage hasn't gotten any thinner since last time. That's exactly what we want to see.
Patient: Oh good. So it's not getting worse?
Doctor: Not on the imaging, no. And given how well you're responding to physio, I don't think we need to talk about surgery or injections at this stage.
Patient: That's a relief.
Doctor: I do want you to keep going with physio for another four weeks, then transition to a home exercise program. Your physio can set that up for you.
Patient: OK, that makes sense.
Doctor: Now, I noticed you're taking Ibuprofen for the pain. Given your diabetes and blood pressure, I'd prefer you switch to Paracetamol — two 500mg tablets, three times a day. It's gentler on your kidneys and stomach.
Patient: Oh, I didn't realise Ibuprofen was a problem.
Doctor: It can be with your other medications. Paracetamol is safer long-term for you. And honestly, losing even five kilos would make a noticeable difference to the knee.
Patient: I know, I know. I'm trying.
Doctor: I know you are. Let's review in three months. If things are still going well, we might be able to space the reviews out further.
Patient: Sounds good. Oh — can your receptionist help me claim the Medicare rebate today?
Doctor: Absolutely, she'll sort that out for you on the way out. Today's gap is about ninety-five dollars.
Patient: Ouch. But worth it.
Doctor: You're doing really well Karen. Keep up the physio.`,
    summary: {
      quick_summary: "Ortho follow-up for right knee osteoarthritis. Good progress with physiotherapy — pain dropped from 7/10 to 3-4/10. X-ray shows no worsening. Continue physio 4 more weeks then home exercise program. Switch from Ibuprofen to Paracetamol. Review in 3 months.",
      chief_complaint: "Follow-up for right knee osteoarthritis — assessing physio progress and reviewing imaging.",
      key_discussion_points: [
        "Knee pain significantly improved — from 7/10 to 3-4/10 with physiotherapy",
        "X-ray shows maintained joint space — no worsening of osteoarthritis",
        "No need for surgery or injections at this stage",
        "Continue physio for 4 more weeks, then transition to home exercise program",
        "Switch from Ibuprofen to Paracetamol — safer with diabetes and blood pressure medications",
        "5kg weight loss would significantly reduce knee stress",
        "Medicare rebate processed — out-of-pocket gap $95",
      ],
      assessment: "Right knee osteoarthritis responding well to conservative physiotherapy management. X-ray imaging stable with maintained joint space. No indication for surgical intervention. Medication adjustment required due to comorbidities.",
      plan: [
        "Continue physiotherapy — 2 sessions per week for 4 more weeks",
        "Physiotherapist to create home exercise program for transition",
        "Switch pain relief from Ibuprofen to Paracetamol 1000mg up to 3 times daily",
        "Continue weight loss efforts — aim for 5kg reduction",
        "Review in 3 months with Dr. Nguyen",
      ],
      doctors_recommendations: [
        { number: 1, text: "Continue physiotherapy twice weekly for 4 more weeks — you're making excellent progress" },
        { number: 2, text: "Ask your physio to create a home exercise program for when formal sessions end" },
        { number: 3, text: "Switch from Ibuprofen to Paracetamol 1000mg (two 500mg tablets) up to 3 times daily" },
        { number: 4, text: "Work towards losing 5kg — even small reductions make a big difference to knee stress" },
        { number: 5, text: "Book follow-up in 3 months — if things are going well, reviews can be spaced further" },
      ],
      action_items: [
        { description: "Continue physio — 2 sessions per week for 4 more weeks", category: "referral", due_date_suggestion: "Ongoing" },
        { description: "Ask physio for a written home exercise program", category: "lifestyle", due_date_suggestion: "At next physio session" },
        { description: "Switch from Ibuprofen to Paracetamol 1000mg three times daily", category: "medication", due_date_suggestion: "Today" },
        { description: "Book 3-month follow-up with Dr. Nguyen", category: "follow_up", due_date_suggestion: "Within 2 weeks" },
        { description: "Claim Medicare rebate for today's specialist consultation", category: "follow_up", due_date_suggestion: "Today", status: "overdue" },
      ],
      medications: [
        { name: "Paracetamol", dosage: "1000mg (two 500mg tablets)", frequency: "Up to 3 times daily as needed", explanation: "A pain reliever that is safer for you than Ibuprofen given your diabetes and blood pressure medications. It doesn't reduce inflammation like Ibuprofen but is gentler on your kidneys and stomach.", is_pbs: false },
      ],
      referrals: [],
      follow_up_questions: [
        "How will I know if I need surgery in the future?",
        "Can I still do the gym for upper body exercises?",
        "Will the osteoarthritis get worse over time regardless?",
        "Is swimming OK for my knee?",
      ],
      medical_terms: [
        { term: "osteoarthritis", explanation: "A condition where the cartilage (cushioning) in your joints gradually wears down, causing pain, stiffness, and swelling. It's the most common type of arthritis." },
        { term: "joint space", explanation: "The gap between bones in a joint visible on X-ray. When this space narrows, it means cartilage is wearing away." },
        { term: "conservative treatment", explanation: "Non-surgical approach — using physiotherapy, exercise, weight management, and medication instead of surgery." },
      ],
      urgency_flags: [],
    },
  },

  // ── Visit 3 — Endocrinologist (3 weeks ago) ──
  {
    id: "demo-v2-visit-3",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Anika Sharma",
    clinic_name: "Sunshine Hospital Diabetes Clinic",
    visit_type: "specialist",
    visit_date: threeWeeksAgo.toISOString().split("T")[0],
    recording_duration: 900,
    status: "complete",
    bulk_billed: true,
    out_of_pocket: 0,
    created_at: threeWeeksAgo.toISOString(),
    updated_at: threeWeeksAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Good morning Karen, I'm Dr. Sharma. Your GP Dr. Zhao referred you to us for your diabetes management. How are you going?
Patient: Hi Doctor. Yeah, I've been a bit worried about my sugar levels. My GP said they've gone up.
Doctor: Yes, let's talk about that. Your HbA1c has gone from 7.2 to 7.8 percent over the past six months. I've also been looking at the data from your continuous glucose monitor — the Libre sensor you've been wearing.
Patient: Oh yes, I've been wearing that for the last two weeks.
Doctor: Good. So what it's showing me is that your fasting sugars in the morning are actually quite good — they're sitting around 6 to 7. But after dinner, you're spiking up above 12, sometimes even 14.
Patient: Really? I didn't realise it was that high after dinner.
Doctor: That's actually really common. It's usually related to the amount of carbohydrates at the evening meal. What does a typical dinner look like for you?
Patient: Um, usually rice or pasta with some meat and vegetables. My husband cooks most nights.
Doctor: Right. The rice and pasta are likely the main drivers of those spikes. We don't need to cut them out completely, but I'd suggest halving the portion of rice or pasta and replacing it with extra vegetables or salad.
Patient: OK, I can try that.
Doctor: Now, I agree with Dr. Zhao's suggestion to add Empagliflozin. It's an SGLT2 inhibitor — basically it helps your kidneys remove extra sugar. It works well alongside Metformin and it also has benefits for your heart and kidneys. Some patients lose two to three kilos on it as well.
Patient: That would be nice. Are there side effects?
Doctor: The main one is you might get thrush infections because of the extra sugar in your urine. Good hygiene helps prevent that. And drink plenty of water.
Patient: OK.
Doctor: I've checked your kidney function — your eGFR is 78 which is normal, and your urine albumin test is also normal. That's great because it means no early kidney damage from the diabetes.
Patient: Oh good.
Doctor: I also want to refer you to our diabetes educator here at the clinic. She can help you with your monitoring, understanding your readings, and adjusting your meals. And I'd recommend seeing an Accredited Practising Dietitian — you can get five Medicare-rebated sessions per year through a GP Management Plan.
Patient: I didn't know that was covered by Medicare.
Doctor: Yes, ask Dr. Zhao to set up a GP Management Plan and Team Care Arrangement. It gives you access to Medicare rebates for allied health like a dietitian, podiatrist, and exercise physiologist.
Patient: That's really helpful, thank you.
Doctor: You're welcome. Follow up with Dr. Zhao for the Empagliflozin script, and I'll see you again in six months. But if your HbA1c hasn't improved by then, we may need to discuss insulin.
Patient: Oh, I'd really rather not go on insulin.
Doctor: Let's focus on what we can do now. The combination of the new medication and the dietary changes should make a real difference. Don't worry about insulin yet.
Patient: OK. Thank you Dr. Sharma.`,
    summary: {
      quick_summary: "Endocrinologist review for worsening diabetes control. CGM shows post-dinner sugar spikes above 12 mmol/L. Recommends adding Empagliflozin, dietary changes (halve dinner carbs), and referrals to diabetes educator and dietitian. Kidney function normal. May need insulin if no improvement in 6 months.",
      chief_complaint: "Referral from GP for worsening type 2 diabetes — HbA1c risen from 7.2% to 7.8% over 6 months.",
      key_discussion_points: [
        "HbA1c worsened from 7.2% to 7.8% over past 6 months",
        "CGM (Libre) data shows good fasting sugars (6-7) but post-dinner spikes above 12 mmol/L, sometimes 14",
        "Dinner carbohydrate portions (rice, pasta) are the main driver of evening spikes",
        "Supports GP's plan to add Empagliflozin (SGLT2 inhibitor) alongside Metformin",
        "Empagliflozin may assist with 2-3kg weight loss as additional benefit",
        "eGFR 78 — normal kidney function, no early diabetic kidney disease",
        "Urine albumin normal — no protein leak indicating kidney damage",
        "Referral to diabetes educator at Sunshine Hospital (free, Medicare-covered)",
        "Referral to Accredited Practising Dietitian — 5 Medicare sessions/year via GP Management Plan",
        "If HbA1c doesn't improve in 6 months, insulin may need to be considered",
      ],
      assessment: "Type 2 diabetes with suboptimal control, predominantly post-prandial hyperglycaemia driven by evening carbohydrate intake. No evidence of microvascular complications — kidney function and urine albumin normal. SGLT2 inhibitor addition appropriate. Multidisciplinary approach with diabetes education and dietary intervention recommended.",
      plan: [
        "Add Empagliflozin 10mg daily (script via GP Dr. Zhao)",
        "Halve dinner carbohydrate portions — replace with extra vegetables",
        "Referral to Diabetes Educator at Sunshine Hospital",
        "Referral to Accredited Practising Dietitian (5 Medicare sessions via GP Management Plan)",
        "Ask GP to set up GP Management Plan and Team Care Arrangement",
        "Check blood sugar before and after dinner daily",
        "Review with endocrinologist in 6 months",
      ],
      doctors_recommendations: [
        { number: 1, text: "Follow up with Dr. Zhao for Empagliflozin prescription — start 10mg daily in the morning" },
        { number: 2, text: "Halve your dinner carbs — replace with extra vegetables, salad, or legumes" },
        { number: 3, text: "Book an appointment with the Diabetes Educator at Sunshine Hospital (phone reception)" },
        { number: 4, text: "Ask Dr. Zhao to set up a GP Management Plan for Medicare-rebated dietitian visits" },
        { number: 5, text: "Check blood sugar before and 2 hours after dinner each evening for the next 6 weeks" },
      ],
      action_items: [
        { description: "Book appointment with Diabetes Educator at Sunshine Hospital", category: "referral", due_date_suggestion: "This week", status: "overdue" },
        { description: "Book appointment with Accredited Practising Dietitian", category: "referral", due_date_suggestion: "Within 2 weeks" },
        { description: "Halve dinner carbohydrate portions — start tonight", category: "lifestyle", due_date_suggestion: "Today" },
        { description: "Follow up with Dr. Zhao for Empagliflozin script", category: "medication", due_date_suggestion: "This week", status: "complete" },
        { description: "Check blood sugar before and 2 hours after dinner daily", category: "lifestyle", due_date_suggestion: "Ongoing" },
      ],
      medications: [],
      referrals: [
        { to: "Diabetes Educator — Sunshine Hospital Diabetes Clinic", reason: "Education on blood sugar monitoring, meal planning, and diabetes self-management", next_steps: "Phone Sunshine Hospital Diabetes Clinic reception to book. This service is free and covered by Medicare. No GP referral needed for the educator." },
        { to: "Accredited Practising Dietitian", reason: "Personalised dietary advice to reduce post-dinner blood sugar spikes and support weight management", next_steps: "Ask Dr. Zhao to set up a GP Management Plan (GPMP) and Team Care Arrangement (TCA). This gives you access to 5 Medicare-rebated dietitian sessions per year. You'll pay a small gap or it may be bulk-billed." },
      ],
      follow_up_questions: [
        "What foods can I eat instead of rice and pasta at dinner?",
        "How do I prevent thrush infections with Empagliflozin?",
        "What blood sugar reading after dinner should I be aiming for?",
        "What does it mean if I eventually need insulin?",
        "Can I still eat fruit with diabetes?",
      ],
      medical_terms: [
        { term: "SGLT2 inhibitor", explanation: "A class of diabetes medication (like Empagliflozin) that works by blocking sugar re-absorption in the kidneys, causing excess sugar to be removed in your urine." },
        { term: "eGFR", explanation: "Estimated Glomerular Filtration Rate — a blood test that measures how well your kidneys are filtering waste. Normal is above 60. Karen's is 78, which is healthy." },
        { term: "urine albumin", explanation: "A urine test checking for protein leak from the kidneys. Protein in urine can be an early sign of kidney damage from diabetes." },
        { term: "CGM", explanation: "Continuous Glucose Monitor — a small sensor worn on your arm (like the Libre) that checks your blood sugar every few minutes and shows patterns over time." },
        { term: "post-prandial", explanation: "After eating a meal. 'Post-prandial hyperglycaemia' means high blood sugar after meals." },
        { term: "microvascular complications", explanation: "Damage to small blood vessels caused by long-term high blood sugar. Can affect the kidneys, eyes, and nerves." },
      ],
      urgency_flags: [],
    },
  },

  // ── Visit 4 — Eye specialist (5 weeks ago) ──
  {
    id: "demo-v2-visit-4",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Michael Torres",
    clinic_name: "Wyndham Eye Clinic",
    visit_type: "specialist",
    visit_date: fiveWeeksAgo.toISOString().split("T")[0],
    recording_duration: 480,
    status: "complete",
    bulk_billed: false,
    out_of_pocket: 45,
    created_at: fiveWeeksAgo.toISOString(),
    updated_at: fiveWeeksAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi Karen, I'm Dr. Torres. Your GP Dr. Zhao referred you for your annual diabetic eye screening. How's your vision been?
Patient: Hello. Honestly, it's been fine. I just use reading glasses.
Doctor: Good to hear. I'm going to put some drops in your eyes to dilate your pupils so I can get a good look at the back of your eyes — the retina. It'll make things a bit blurry for a couple of hours afterwards, so don't drive home.
Patient: Oh, I got my husband to drop me off.
Doctor: Perfect. So the drops take about twenty minutes to work, then I'll do the examination and take some photos.
[After examination]
Doctor: Great news Karen. I've had a thorough look and there's no sign of diabetic retinopathy. The blood vessels at the back of your eyes look healthy — no leaking, no swelling, no new vessel growth.
Patient: Oh thank goodness. I was worried about that.
Doctor: It's a really important check to do every year with diabetes, but you're all clear. I did notice some very mild age-related changes in the lens — what we call early nuclear sclerosis. It's completely normal for your age and isn't affecting your vision.
Patient: Is that cataracts?
Doctor: It's the very earliest stage of lens change. It doesn't need any treatment and it's not something to worry about. We'll just monitor it over time.
Patient: OK, that's a relief.
Doctor: I'd like to see you again in twelve months for your next screening. Keep your blood sugars as well controlled as possible — that's the best thing you can do for your eye health.
Patient: Will do. Thank you Doctor.
Doctor: You're welcome. The gap today is forty-five dollars after the Medicare rebate.`,
    summary: {
      quick_summary: "Annual diabetic eye screening. No diabetic retinopathy detected — retinal blood vessels healthy. Mild age-related lens changes (early nuclear sclerosis) — normal for age, no treatment needed. Repeat screening in 12 months.",
      chief_complaint: "Annual diabetic eye screening — referred by GP for routine monitoring.",
      key_discussion_points: [
        "Comprehensive dilated fundus examination performed",
        "No diabetic retinopathy — retinal blood vessels healthy, no leaking or swelling",
        "Mild early nuclear sclerosis (age-related lens change) — normal, no treatment required",
        "Not cataracts requiring intervention at this stage",
        "Repeat screening recommended in 12 months",
        "Good blood sugar control is the best protection for eye health",
        "Out-of-pocket gap $45 after Medicare rebate",
      ],
      assessment: "No evidence of diabetic retinopathy on dilated fundus examination. Mild age-related nuclear sclerosis of the lens — physiological and not visually significant. Continue annual screening.",
      plan: [
        "No treatment required at this stage",
        "Continue optimising blood sugar control",
        "Repeat diabetic eye screening in 12 months",
      ],
      doctors_recommendations: [
        { number: 1, text: "Book your next diabetic eye screening in 12 months — set a calendar reminder" },
        { number: 2, text: "Keep blood sugars well controlled — this is the best way to protect your eye health" },
        { number: 3, text: "See an optometrist if you notice any changes in your day-to-day vision" },
      ],
      action_items: [
        { description: "Book next diabetic eye screening in 12 months", category: "follow_up", due_date_suggestion: "11 months" },
        { description: "Set calendar reminder for annual eye screening", category: "follow_up", due_date_suggestion: "Today", status: "complete" },
      ],
      medications: [],
      referrals: [],
      follow_up_questions: [
        "What are the first signs of diabetic retinopathy?",
        "Will the lens changes eventually become cataracts?",
        "Should I be wearing sunglasses more often?",
      ],
      medical_terms: [
        { term: "diabetic retinopathy", explanation: "Damage to the small blood vessels in the retina (the back of the eye) caused by high blood sugar over time. It can lead to vision problems if not detected early, which is why annual screening is important." },
        { term: "fundus examination", explanation: "An examination of the back of the eye (retina, optic nerve, blood vessels) using special equipment after dilating the pupils with eye drops." },
        { term: "nuclear sclerosis", explanation: "A gradual hardening and yellowing of the central part of the eye's lens. It's a normal age-related change and the earliest form of cataract development." },
      ],
      urgency_flags: [
        "See a doctor immediately if you experience sudden floaters, flashes of light, or any sudden loss of vision.",
      ],
    },
  },

  // ── Visit 5 — GP sick visit (6 weeks ago) ──
  {
    id: "demo-v2-visit-5",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Raj Kumar",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: sixWeeksAgo.toISOString().split("T")[0],
    recording_duration: 540,
    status: "complete",
    bulk_billed: true,
    out_of_pocket: 0,
    created_at: sixWeeksAgo.toISOString(),
    updated_at: sixWeeksAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi Karen, I'm Dr. Kumar. Dr. Zhao is away today. I can see you're not feeling well — what's been happening?
Patient: I've had really bad nausea and vomiting since yesterday. And diarrhoea. I can't keep anything down.
Doctor: How many times have you vomited?
Patient: Maybe five or six times since last night. And I've been on the toilet constantly.
Doctor: Any blood in the vomit or stool?
Patient: No, nothing like that.
Doctor: Fever?
Patient: I felt hot last night but I didn't take my temperature.
Doctor: Let me check. You're at 37.8 — mild fever. Now, I can see from your notes that you're on Metformin for diabetes. This is really important — when you have gastro and you're not eating and drinking normally, you need to STOP the Metformin.
Patient: Stop it? Is that safe?
Doctor: Yes, in fact it's safer to stop it temporarily. When you're dehydrated and not eating, Metformin can build up in your body and cause a rare but serious condition called lactic acidosis. Once you're eating and drinking normally for 24 hours, you can restart it.
Patient: OK. What about my other tablets?
Doctor: Keep taking the Perindopril and Pantoprazole. Skip the Empagliflozin too while you're unwell — same reason, dehydration risk. The Vitamin D and Atorvastatin are fine if you can keep them down.
Patient: Right.
Doctor: I want you to get some Hydralyte from the chemist — the icy poles or sachets. Sip small amounts regularly rather than big drinks. Check your blood sugar every four to six hours because it can go high or low when you're sick.
Patient: What numbers should I worry about?
Doctor: If it goes above 15 or below 4, ring us straight away. Also if you can't keep fluids down for more than twelve hours, or if you get confused or have trouble breathing, go straight to Emergency.
Patient: OK.
Doctor: This looks like viral gastroenteritis — there's a lot of it going around. It should settle in two to three days. If you're not improving after 48 hours, call the clinic.
Patient: Thank you Doctor.`,
    summary: {
      quick_summary: "Acute gastroenteritis — nausea, vomiting, diarrhoea for 24 hours. Viral gastro diagnosed. STOP Metformin and Empagliflozin until eating normally for 24 hours — risk of lactic acidosis with dehydration. Diabetic sick day management discussed. Hydralyte for rehydration.",
      chief_complaint: "Acute nausea, vomiting, and diarrhoea for 24 hours — unable to keep food or fluids down.",
      key_discussion_points: [
        "Nausea, vomiting (5-6 episodes), and diarrhoea since yesterday",
        "Mild fever 37.8°C — consistent with viral infection",
        "No blood in vomit or stool — no red flags",
        "STOP Metformin immediately — risk of lactic acidosis when dehydrated and not eating",
        "STOP Empagliflozin — dehydration risk",
        "Continue Perindopril and Pantoprazole",
        "Diabetic sick day management — check blood sugar every 4-6 hours",
        "Hydralyte for rehydration — sip small amounts regularly",
        "Emergency criteria: unable to keep fluids 12+ hours, blood sugar above 15, confusion",
      ],
      assessment: "Acute viral gastroenteritis in a patient with type 2 diabetes requiring medication adjustment and sick day management. No signs of bacterial infection or complications. Dehydration risk requires temporary cessation of Metformin and Empagliflozin.",
      plan: [
        "STOP Metformin immediately until eating and drinking normally for 24 hours",
        "STOP Empagliflozin until recovered",
        "Continue Perindopril and Pantoprazole",
        "Hydralyte for rehydration — small frequent sips",
        "Check blood sugar every 4-6 hours",
        "Call clinic if not improving in 48 hours",
        "Emergency Department if unable to keep fluids 12+ hours, BSL >15, or confusion",
      ],
      doctors_recommendations: [
        { number: 1, text: "STOP Metformin and Empagliflozin immediately — do NOT take until eating normally for 24 hours" },
        { number: 2, text: "Buy Hydralyte from the chemist — icy poles or sachets. Sip small amounts regularly, not big drinks." },
        { number: 3, text: "Check your blood sugar every 4-6 hours — call if above 15 or below 4" },
        { number: 4, text: "Resume Metformin and Empagliflozin once you've been eating and drinking normally for a full 24 hours" },
        { number: 5, text: "Go to Emergency if you can't keep fluids down for 12+ hours, or if you feel confused or short of breath" },
      ],
      action_items: [
        { description: "STOP Metformin immediately", category: "medication", due_date_suggestion: "Now", status: "complete" },
        { description: "Buy Hydralyte from chemist", category: "medication", due_date_suggestion: "Today", status: "complete" },
        { description: "Check blood sugar every 4-6 hours while unwell", category: "lifestyle", due_date_suggestion: "Today", status: "complete" },
        { description: "Resume Metformin when eating normally for 24 hours", category: "medication", due_date_suggestion: "When recovered", status: "complete" },
        { description: "Call clinic if not improving after 48 hours", category: "follow_up", due_date_suggestion: "2 days", status: "complete" },
      ],
      medications: [],
      referrals: [],
      follow_up_questions: [
        "Why is Metformin dangerous when you're dehydrated?",
        "How do I know if I'm dehydrated enough to go to Emergency?",
        "Should I eat anything while I have gastro?",
      ],
      medical_terms: [
        { term: "gastroenteritis", explanation: "An infection of the stomach and intestines, usually caused by a virus. It causes nausea, vomiting, diarrhoea, and sometimes fever. Often called 'gastro' or 'stomach bug'." },
        { term: "lactic acidosis", explanation: "A rare but serious condition where lactic acid builds up in the blood. Metformin can increase the risk when you're dehydrated or not eating, because your kidneys can't clear it properly." },
        { term: "sick day management", explanation: "A plan for managing diabetes when you're unwell. When you're sick, blood sugars can swing unpredictably, and some medications need to be temporarily stopped to avoid complications." },
      ],
      urgency_flags: [
        "STOP Metformin and Empagliflozin immediately — do not take while unable to eat and drink normally.",
        "Go to Emergency Department if: unable to keep fluids down for 12+ hours, blood sugar above 15 mmol/L, confusion, or difficulty breathing.",
      ],
    },
  },

  // ── Visit 6 — Telehealth follow-up (6 weeks ago + 3 days) ──
  {
    id: "demo-v2-visit-6",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "telehealth",
    visit_date: sixWeeksPlusThree.toISOString().split("T")[0],
    recording_duration: 300,
    status: "complete",
    bulk_billed: true,
    out_of_pocket: 0,
    created_at: sixWeeksPlusThree.toISOString(),
    updated_at: sixWeeksPlusThree.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi Karen, it's Helen. How are you feeling after the gastro?
Patient: So much better, thanks Helen. I started eating properly again yesterday — had some toast and soup, and this morning I managed cereal and a cup of tea.
Doctor: That's great. So you've been eating and drinking normally for about 24 hours now?
Patient: Yes, since yesterday lunchtime.
Doctor: Perfect. You can restart your Metformin today then — 1000mg with lunch and dinner as usual. And the Empagliflozin in the morning tomorrow.
Patient: OK, I'll do that.
Doctor: How were your blood sugars while you were sick?
Patient: They went up a bit — around 12 to 13. But yesterday they were back down to about 8 after meals.
Doctor: That's normal — blood sugars often rise when you're fighting an infection. They're settling back down which is exactly what we want. Keep monitoring for a few more days.
Patient: Will do. Thanks for calling Helen.
Doctor: No worries. Ring us if anything comes up. Otherwise I'll see you at your next scheduled appointment.`,
    summary: {
      quick_summary: "Telehealth follow-up after gastroenteritis. Fully recovered, eating normally for 24 hours. Resume Metformin today and Empagliflozin tomorrow. Blood sugars settling back to normal.",
      chief_complaint: "Telehealth follow-up after viral gastroenteritis — confirming recovery and medication restart.",
      key_discussion_points: [
        "Patient fully recovered from gastro — eating and drinking normally for 24 hours",
        "Blood sugars rose to 12-13 during illness but settling back to ~8 after meals",
        "Resume Metformin 1000mg today with lunch and dinner",
        "Resume Empagliflozin 10mg tomorrow morning",
        "Continue blood sugar monitoring for a few more days",
      ],
      assessment: "Post-gastroenteritis recovery complete. Safe to resume withheld diabetes medications. Blood sugar levels returning to baseline.",
      plan: [
        "Resume Metformin 1000mg twice daily with meals — starting today",
        "Resume Empagliflozin 10mg — starting tomorrow morning",
        "Continue blood sugar monitoring for a few more days",
        "Follow up at next scheduled appointment",
      ],
      doctors_recommendations: [
        { number: 1, text: "Restart Metformin today — 1000mg with lunch and 1000mg with dinner" },
        { number: 2, text: "Restart Empagliflozin tomorrow morning — 10mg with breakfast" },
        { number: 3, text: "Keep monitoring blood sugar for a few more days to make sure levels stabilise" },
      ],
      action_items: [
        { description: "Resume Metformin 1000mg with meals today", category: "medication", due_date_suggestion: "Today", status: "complete" },
      ],
      medications: [],
      referrals: [],
      follow_up_questions: [],
      medical_terms: [],
      urgency_flags: [],
    },
  },

  // ── Visit 7 — Physio session (5 days ago) ──
  {
    id: "demo-v2-visit-7",
    user_id: "demo-karen-id",
    doctor_name: "Emma Bradshaw",
    clinic_name: "Western Physiotherapy — Werribee",
    visit_type: "allied_health",
    visit_date: fiveDaysAgo.toISOString().split("T")[0],
    recording_duration: 360,
    status: "complete",
    bulk_billed: false,
    out_of_pocket: 35,
    created_at: fiveDaysAgo.toISOString(),
    updated_at: fiveDaysAgo.toISOString(),
    recording_url: null,
    transcript: `Physio: Hi Karen, session number eight today. How's the knee been this week?
Patient: Really good actually. I did the stairs at work twice yesterday without even thinking about it.
Physio: That's a fantastic sign. Let me have a look at your range of motion. Bend it for me... good, and straighten... great. Your range has improved a lot since we started.
Patient: I can feel the difference.
Physio: Let's test your quad strength. Push against my hand... excellent, much stronger than session one. Your quadriceps are really firing now.
Patient: The exercises have been making a difference.
Physio: They really have. Your pain was a six out of ten when we started, and you're telling me three now — is that right?
Patient: Yes, some days even a two.
Physio: I think we're at the point where we can start transitioning to a home exercise program. I'm going to write one up for you today. I'd suggest four more sessions to make sure you're confident with the exercises, then you can manage independently.
Patient: That sounds good. What do I need at home?
Physio: I'll give you a green resistance band — you can buy one from the front desk for twelve dollars, or any sports shop. And keep up your daily walks.
Patient: OK. My orthopaedic surgeon was happy with how things are going too.
Physio: That's great to hear. The Medicare rebate covers most of this session through your GP Management Plan — your out-of-pocket today is thirty-five dollars.
Patient: Brilliant, thanks Emma.`,
    summary: {
      quick_summary: "Physiotherapy session #8 for right knee osteoarthritis. Pain reduced from 6/10 to 3/10 since starting. Quadriceps strength significantly improved. Starting home exercise program. 4 more sessions then independent management.",
      chief_complaint: "Ongoing physiotherapy for right knee osteoarthritis — session 8 of planned program.",
      key_discussion_points: [
        "Pain reduced from 6/10 at start of treatment to 3/10 (sometimes 2/10)",
        "Range of motion significantly improved",
        "Quadriceps strength much stronger — muscles 'firing' well",
        "Transitioning to home exercise program — written program to be provided",
        "4 more formal sessions recommended before independent management",
        "Green resistance band needed ($12 from clinic or sports shop)",
        "Daily walks to continue as part of ongoing management",
        "Medicare rebate via GP Management Plan — $35 out-of-pocket",
      ],
      assessment: "Excellent progress with physiotherapy for right knee osteoarthritis. Pain and function significantly improved. Patient ready to begin transitioning to independent home exercise program.",
      plan: [
        "Continue physiotherapy — 4 more sessions",
        "Written home exercise program to be provided",
        "Purchase green resistance band for home exercises",
        "Continue daily walking",
        "Transition to independent management after 4 more sessions",
      ],
      doctors_recommendations: [
        { number: 1, text: "Do the home exercise program daily — consistency is key to maintaining your progress" },
        { number: 2, text: "Buy a green resistance band ($12) for the strengthening exercises" },
        { number: 3, text: "Continue 30 minutes of daily walking — build up gradually if needed" },
        { number: 4, text: "Complete 4 more physio sessions before transitioning to fully independent management" },
      ],
      action_items: [
        { description: "Do home exercises daily as written by physio", category: "lifestyle", due_date_suggestion: "Daily" },
        { description: "Buy green resistance band ($12 from clinic or sports shop)", category: "lifestyle", due_date_suggestion: "This week" },
        { description: "Continue 30-minute daily walks", category: "lifestyle", due_date_suggestion: "Daily" },
      ],
      medications: [],
      referrals: [],
      follow_up_questions: [
        "What exercises can I do if the knee flares up?",
        "Should I use ice or heat after exercising?",
      ],
      medical_terms: [
        { term: "quadriceps", explanation: "The large muscle group at the front of your thigh. Strong quads are essential for knee stability and support — they act as shock absorbers for the knee joint." },
        { term: "GP Management Plan", explanation: "A plan created by your GP for managing chronic conditions. It allows access to Medicare-rebated allied health services such as physiotherapy, dietetics, and podiatry (usually 5 sessions per year)." },
      ],
      urgency_flags: [],
    },
  },

  // ── Visit 8 — GP medication review (8 weeks ago) ──
  {
    id: "demo-v2-visit-8",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: eightWeeksAgo.toISOString().split("T")[0],
    recording_duration: 600,
    status: "complete",
    bulk_billed: true,
    out_of_pocket: 0,
    created_at: eightWeeksAgo.toISOString(),
    updated_at: eightWeeksAgo.toISOString(),
    recording_url: null,
    transcript: `Doctor: Hi Karen, come in. Today we're doing your routine BP check and medication review. How have you been?
Patient: Pretty good thanks Helen. No major dramas.
Doctor: Good. Let me check your blood pressure... 132 over 82. That's well controlled.
Patient: Oh good. It was high last time wasn't it?
Doctor: It was 140 over 88 last time, so this is much better. The Perindopril is doing its job.
Patient: Good to know.
Doctor: Now, I've got your blood results back. Your cholesterol — the LDL is sitting at 3.4. For someone with diabetes, we really want that below 2.0.
Patient: That high?
Doctor: It's come down from where it was, but not enough. I'm going to increase your Atorvastatin from 20mg to 40mg. We'll recheck in six weeks.
Patient: OK.
Doctor: Your HbA1c is 7.8 — it was 7.2 six months ago. It's creeping up. I think we need a specialist opinion on your diabetes management.
Patient: An endocrinologist?
Doctor: Yes. I'm going to refer you to Dr. Anika Sharma at Sunshine Hospital. She's excellent with diabetes management. It's bulk-billed there.
Patient: OK, if you think that's best.
Doctor: I do. In the meantime, keep going with the Metformin as is. We'll wait for Dr. Sharma's recommendations before making any medication changes to the diabetes.
Patient: Right.
Doctor: Everything else looks good. Keep up the walking, and I'll see you after you've seen Dr. Sharma.`,
    summary: {
      quick_summary: "Routine BP and medication review. Blood pressure 132/82 — well controlled on Perindopril. LDL cholesterol 3.4 — above diabetic target of <2.0. Atorvastatin increase planned. HbA1c 7.8 — referral to endocrinologist Dr. Sharma for diabetes management.",
      chief_complaint: "Routine blood pressure check and medication review — reviewing recent blood test results.",
      key_discussion_points: [
        "Blood pressure 132/82 — improved from 140/88 last visit, well controlled on Perindopril",
        "LDL cholesterol 3.4 mmol/L — above diabetic target of <2.0",
        "Atorvastatin increase from 20mg to 40mg planned",
        "HbA1c risen from 7.2% to 7.8% — needs specialist review",
        "Referral to endocrinologist Dr. Anika Sharma at Sunshine Hospital",
        "Sunshine Hospital endocrinology is bulk-billed",
        "Continue Metformin — await specialist recommendations before changes",
      ],
      assessment: "Blood pressure well controlled on current ACE inhibitor therapy. LDL cholesterol above target — statin dose increase warranted. HbA1c trending upward — referral to endocrinology appropriate for specialist diabetes management review.",
      plan: [
        "Increase Atorvastatin from 20mg to 40mg nightly",
        "Continue Perindopril 5mg — BP well controlled",
        "Referral to Dr. Anika Sharma, Endocrinologist, Sunshine Hospital",
        "Continue Metformin — await endocrinologist recommendations",
        "Recheck lipids in 6 weeks",
      ],
      doctors_recommendations: [
        { number: 1, text: "Start taking Atorvastatin 40mg at night (increased from 20mg) — picking up new script from pharmacy" },
        { number: 2, text: "Book appointment with Dr. Anika Sharma at Sunshine Hospital Diabetes Clinic (referral letter provided)" },
        { number: 3, text: "Continue daily walking — aim for 30 minutes per day" },
      ],
      action_items: [
        { description: "Book endocrinologist appointment with Dr. Sharma at Sunshine Hospital", category: "follow_up", due_date_suggestion: "Within 1 week", status: "complete" },
        { description: "Pick up updated Atorvastatin 40mg script from pharmacy", category: "medication", due_date_suggestion: "Today", status: "complete" },
      ],
      medications: [
        { name: "Atorvastatin", dosage: "40mg (increased from 20mg)", frequency: "Once daily at night", explanation: "Cholesterol-lowering statin. Dose increased because your LDL cholesterol is above the target for diabetic patients.", is_pbs: true },
      ],
      referrals: [
        { to: "Dr. Anika Sharma, Endocrinologist — Sunshine Hospital Diabetes Clinic", reason: "Rising HbA1c from 7.2% to 7.8% — needs specialist review of diabetes management and possible medication adjustment", next_steps: "Phone Sunshine Hospital Diabetes Clinic to book with Dr. Sharma. Referral letter provided. This service is bulk-billed. Bring your blood sugar diary and CGM data if available." },
      ],
      follow_up_questions: [
        "What will the endocrinologist do differently to my GP?",
        "Why is my LDL target lower because I have diabetes?",
        "Should I be worried about my HbA1c going up?",
      ],
      medical_terms: [
        { term: "LDL", explanation: "Low-Density Lipoprotein — the 'bad' cholesterol that can build up in arteries. For diabetic patients, the target is below 2.0 mmol/L because diabetes already increases heart disease risk." },
        { term: "Perindopril", explanation: "An ACE inhibitor medication for blood pressure. Also protects the kidneys — important for diabetic patients." },
        { term: "endocrinologist", explanation: "A specialist doctor who manages hormone-related conditions including diabetes. They have extra expertise in complex diabetes management and medication adjustments." },
      ],
      urgency_flags: [],
    },
  },
];

// ── Action Items (15 total — mix of statuses) ──
export const DEMO_ACTION_ITEMS_V2 = [
  // Visit 1 (GP — 2 days ago)
  { id: "demo-v2-action-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Pick up new Empagliflozin and updated Atorvastatin scripts from pharmacy", due_date: twoDaysAgo.toISOString().split("T")[0], status: "complete", category: "medication", completed_at: twoDaysAgo.toISOString(), created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Book fasting blood test for 6 weeks' time (HbA1c, lipids, kidney, liver)", due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "test", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-3", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Book follow-up with Dr. Zhao in 6 weeks for diabetes cycle of care", due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-4", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Check blood sugar before and after dinner daily for 2 weeks", due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-5", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Flu vaccination — done today at the clinic", due_date: twoDaysAgo.toISOString().split("T")[0], status: "complete", category: "vaccination", completed_at: twoDaysAgo.toISOString(), created_at: twoDaysAgo.toISOString() },

  // Visit 2 (Ortho — 10 days ago)
  { id: "demo-v2-action-6", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Book 3-month follow-up with Dr. Nguyen", due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: tenDaysAgo.toISOString() },
  { id: "demo-v2-action-7", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Claim Medicare rebate for specialist consultation ($95 gap)", due_date: tenDaysAgo.toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: tenDaysAgo.toISOString() },

  // Visit 3 (Endo — 3 weeks ago)
  { id: "demo-v2-action-8", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Book appointment with Diabetes Educator at Sunshine Hospital", due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-9", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Book appointment with Accredited Practising Dietitian", due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-10", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Halve dinner carbohydrate portions", due_date: threeWeeksAgo.toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: threeWeeksAgo.toISOString() },

  // Visit 7 (Physio — 5 days ago)
  { id: "demo-v2-action-11", user_id: "demo-karen-id", visit_id: "demo-v2-visit-7", description: "Do home exercises daily as written by physio", due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: fiveDaysAgo.toISOString() },
  { id: "demo-v2-action-12", user_id: "demo-karen-id", visit_id: "demo-v2-visit-7", description: "Buy green resistance band ($12 from clinic or sports shop)", due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: fiveDaysAgo.toISOString() },
  { id: "demo-v2-action-13", user_id: "demo-karen-id", visit_id: "demo-v2-visit-7", description: "Continue 30-minute daily walks", due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: fiveDaysAgo.toISOString() },

  // Visit 8 (GP med review — 8 weeks ago)
  { id: "demo-v2-action-14", user_id: "demo-karen-id", visit_id: "demo-v2-visit-8", description: "Book endocrinologist appointment with Dr. Sharma", due_date: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "complete", category: "follow_up", completed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), created_at: eightWeeksAgo.toISOString() },
  { id: "demo-v2-action-15", user_id: "demo-karen-id", visit_id: "demo-v2-visit-8", description: "Pick up updated Atorvastatin 40mg script from pharmacy", due_date: eightWeeksAgo.toISOString().split("T")[0], status: "complete", category: "medication", completed_at: eightWeeksAgo.toISOString(), created_at: eightWeeksAgo.toISOString() },
];

// ── Medications (7 active) ──
export const DEMO_MEDICATIONS_V2 = [
  { id: "demo-v2-med-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", name: "Empagliflozin (Jardiance)", dosage: "10mg", frequency: "Once daily in the morning", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: twoDaysAgo.toISOString().split("T")[0], is_pbs: true, plain_explanation: "A newer diabetes medication (SGLT2 inhibitor) that helps your kidneys remove excess sugar through your urine. Also benefits your heart and kidneys. Drink plenty of water — you may wee more often at first.", status: "active", created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-med-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", name: "Atorvastatin", dosage: "40mg", frequency: "Once daily at night", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: twoDaysAgo.toISOString().split("T")[0], is_pbs: true, plain_explanation: "A cholesterol-lowering statin. Dose increased from 20mg because your LDL cholesterol crept up. Take at night for best effect. Report any unusual muscle aches.", status: "active", created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-med-3", user_id: "demo-karen-id", visit_id: null, name: "Metformin", dosage: "1000mg", frequency: "Twice daily with meals", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: "2019-03-15", is_pbs: true, plain_explanation: "The first-line diabetes medication. It reduces the amount of sugar your liver releases and helps your body respond better to insulin. Take with food to reduce stomach upset. STOP if you have gastro or can't eat/drink normally.", status: "active", created_at: new Date(Date.now() - 365 * 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-4", user_id: "demo-karen-id", visit_id: null, name: "Perindopril", dosage: "5mg", frequency: "Once daily in the morning", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: "2018-07-20", is_pbs: true, plain_explanation: "A blood pressure medication (ACE inhibitor). It relaxes blood vessels to lower blood pressure and also helps protect your kidneys — important for diabetic patients.", status: "active", created_at: new Date(Date.now() - 365 * 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-5", user_id: "demo-karen-id", visit_id: null, name: "Vitamin D", dosage: "1000IU", frequency: "Once daily", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: "2024-06-10", is_pbs: false, plain_explanation: "A vitamin supplement to treat your deficiency (level 42, target >50). Important for bone health and immune function. Keep next to your toothbrush as a reminder.", status: "active", created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-6", user_id: "demo-karen-id", visit_id: null, name: "Pantoprazole", dosage: "40mg", frequency: "Once daily before breakfast", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: "2022-08-05", is_pbs: true, plain_explanation: "A proton pump inhibitor for your reflux (GORD). It reduces stomach acid production. Take on an empty stomach 30 minutes before breakfast.", status: "active", created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-7", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", name: "Paracetamol", dosage: "1000mg (two 500mg tablets)", frequency: "Up to 3 times daily as needed", prescribing_doctor: "Dr. James Nguyen", date_prescribed: tenDaysAgo.toISOString().split("T")[0], is_pbs: false, plain_explanation: "A pain reliever for your knee. Safer than Ibuprofen given your diabetes and blood pressure medications. Take with or without food.", status: "active", created_at: tenDaysAgo.toISOString() },
];

// ── Lab Results ──
export const DEMO_LAB_RESULTS = [
  // Diabetes panel
  { id: "demo-lab-1", name: "HbA1c", value: 7.8, unit: "%", status: "high", normal_range: "< 7.0%", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 7.2 }, { date: "12 months ago", value: 7.0 }, { date: "18 months ago", value: 7.1 }, { date: "24 months ago", value: 6.8 }], trend: "up", explanation: "Your average blood sugar over the past 2–3 months. It has risen from 7.2% to 7.8%, which is above the target of <7.0%. The new Empagliflozin and dietary changes should help bring this down." },
  { id: "demo-lab-6", name: "Fasting Glucose", value: 8.2, unit: "mmol/L", status: "high", normal_range: "4.0–6.0 mmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 7.5 }, { date: "12 months ago", value: 7.1 }], trend: "up", explanation: "Your fasting blood sugar is above the normal range. This aligns with the rising HbA1c. The new medication and dietary changes should help lower this." },

  // Lipid panel
  { id: "demo-lab-2", name: "Total Cholesterol", value: 5.8, unit: "mmol/L", status: "high", normal_range: "< 5.5 mmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 5.5 }, { date: "12 months ago", value: 5.9 }, { date: "18 months ago", value: 6.1 }], trend: "improving", explanation: "Your total cholesterol is slightly above the desirable level. It has been improving with statin medication — the increased Atorvastatin dose should help further." },
  { id: "demo-lab-3", name: "LDL Cholesterol", value: 3.4, unit: "mmol/L", status: "high", normal_range: "< 2.0 mmol/L (diabetic target)", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 3.1 }, { date: "12 months ago", value: 3.6 }, { date: "18 months ago", value: 3.8 }], trend: "improving", explanation: "Your 'bad' cholesterol. For diabetic patients, the target is stricter (<2.0) because of increased heart disease risk. It's slowly improving with the statin." },
  { id: "demo-lab-9", name: "HDL Cholesterol", value: 1.4, unit: "mmol/L", status: "normal", normal_range: "> 1.0 mmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 1.3 }, { date: "12 months ago", value: 1.2 }], trend: "improving", explanation: "Your 'good' cholesterol — higher is better. Regular walking has nudged this up, which lowers your heart disease risk." },
  { id: "demo-lab-10", name: "Triglycerides", value: 2.1, unit: "mmol/L", status: "high", normal_range: "< 1.7 mmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 1.9 }, { date: "12 months ago", value: 2.3 }], trend: "improving", explanation: "A type of fat in your blood. Above target — usually responds well to reducing sugary drinks, alcohol and refined carbs." },

  // Kidney function
  { id: "demo-lab-4", name: "eGFR", value: 78, unit: "mL/min", status: "normal", normal_range: "> 60 mL/min", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 80 }, { date: "12 months ago", value: 82 }, { date: "18 months ago", value: 79 }], trend: "stable", explanation: "Your kidney function is healthy and stable. This is great news — it means no kidney damage from diabetes. The Perindopril helps protect your kidneys." },
  { id: "demo-lab-7", name: "Creatinine", value: 72, unit: "µmol/L", status: "normal", normal_range: "45–90 µmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 70 }, { date: "12 months ago", value: 68 }], trend: "stable", explanation: "A waste product filtered by your kidneys. Your level is well within the normal range, confirming healthy kidney function." },
  { id: "demo-lab-11", name: "Urine ACR", value: 2.1, unit: "mg/mmol", status: "normal", normal_range: "< 3.5 mg/mmol (women)", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 1.8 }, { date: "12 months ago", value: 1.5 }], trend: "stable", explanation: "Albumin-to-Creatinine Ratio — checks for early kidney damage from diabetes. Yours is normal, which is reassuring." },

  // Liver function
  { id: "demo-lab-8", name: "ALT (Liver)", value: 28, unit: "U/L", status: "normal", normal_range: "< 40 U/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 26 }, { date: "12 months ago", value: 30 }], trend: "stable", explanation: "A liver enzyme — checked because statins and Metformin can occasionally affect the liver. Your level is normal." },
  { id: "demo-lab-12", name: "AST (Liver)", value: 24, unit: "U/L", status: "normal", normal_range: "< 35 U/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 22 }], trend: "stable", explanation: "Another liver enzyme — normal. Together with ALT, this confirms your liver is handling your medications well." },

  // Thyroid
  { id: "demo-lab-13", name: "TSH (Thyroid)", value: 2.8, unit: "mIU/L", status: "normal", normal_range: "0.4–4.0 mIU/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "12 months ago", value: 2.5 }, { date: "24 months ago", value: 2.3 }], trend: "stable", explanation: "Thyroid Stimulating Hormone — your thyroid is working normally. Routinely checked in women over 50." },

  // Vitamins & minerals
  { id: "demo-lab-5", name: "Vitamin D", value: 42, unit: "nmol/L", status: "low", normal_range: "50–150 nmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 38 }, { date: "12 months ago", value: 35 }, { date: "18 months ago", value: 28 }], trend: "improving", explanation: "Your Vitamin D is still below the target of 50 but it has been steadily improving with supplementation. Keep taking your daily 1000IU — it's especially important during winter." },
  { id: "demo-lab-14", name: "Vitamin B12", value: 310, unit: "pmol/L", status: "normal", normal_range: "200–900 pmol/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "12 months ago", value: 280 }], trend: "stable", explanation: "Important to monitor because long-term Metformin can lower B12 levels. Yours is normal — no supplement needed yet." },
  { id: "demo-lab-15", name: "Ferritin (Iron)", value: 85, unit: "µg/L", status: "normal", normal_range: "30–200 µg/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "12 months ago", value: 78 }], trend: "stable", explanation: "Your body's iron stores. Your level is comfortably in the normal range." },

  // Full blood count
  { id: "demo-lab-16", name: "Haemoglobin", value: 132, unit: "g/L", status: "normal", normal_range: "115–160 g/L (women)", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "6 months ago", value: 130 }, { date: "12 months ago", value: 134 }], trend: "stable", explanation: "The oxygen-carrying part of your red blood cells. Normal — no anaemia." },
  { id: "demo-lab-17", name: "White Cell Count", value: 6.4, unit: "×10⁹/L", status: "normal", normal_range: "4.0–11.0 ×10⁹/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [{ date: "12 months ago", value: 6.1 }], trend: "stable", explanation: "Your immune system cells. A normal level means no signs of infection or inflammation." },
  { id: "demo-lab-18", name: "Platelets", value: 245, unit: "×10⁹/L", status: "normal", normal_range: "150–400 ×10⁹/L", tested_date: nineDaysAgo.toISOString().split("T")[0], history: [], trend: "stable", explanation: "Cells that help your blood clot. Your level is normal." },
];

// ── Chat Messages (6 for Visit 1) ──
export const DEMO_CHAT_MESSAGES_V2 = [
  { id: "demo-v2-chat-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "user", content: "Why did Dr. Zhao add a new diabetes medication? Isn't the Metformin enough?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-chat-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "assistant", content: "Great question, Karen. Dr. Zhao added Empagliflozin (Jardiance) because your HbA1c has risen from 7.2% to 7.8%, which means the Metformin alone isn't controlling your blood sugar as well as it used to.\n\nMetformin works by reducing the sugar your liver produces and helping your body use insulin better. Empagliflozin works completely differently — it helps your kidneys flush excess sugar out through your urine.\n\nUsing two medications that work in different ways gives better overall blood sugar control. Dr. Sharma (your endocrinologist) also supported this choice because Empagliflozin has additional benefits:\n\n• It protects your heart — reducing the risk of heart failure\n• It protects your kidneys — slowing any diabetes-related damage\n• Some patients lose 2-3kg, which also helps blood sugar and knee pain\n\nThe holiday period likely caused the rise, and Dr. Zhao expects the combination of the new medication plus getting back to regular exercise should bring your HbA1c back down.\n\n*This is general information based on your visit — always check with Dr. Zhao if you're concerned.*", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
  { id: "demo-v2-chat-3", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "user", content: "Yes, will I get side effects?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
  { id: "demo-v2-chat-4", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "assistant", content: "Most people tolerate Empagliflozin well. Here's what to look out for:\n\n**Common (and expected):**\n• More frequent urination — this is the medication working, flushing sugar out through your kidneys. It usually settles after 1-2 weeks.\n• Drink plenty of water — aim for at least 2 litres daily. This is really important.\n\n**Less common but watch for:**\n• Urinary tract infection (UTI) — burning when you wee, needing to go urgently. See your GP if this happens.\n• Thrush infections — the extra sugar in your urine can sometimes cause this. Good hygiene helps prevent it.\n• Mild dizziness — especially in the first few days. Stay hydrated.\n\n**Positive side effects:**\n• Weight loss of 2-3kg for some patients — a nice bonus\n• Lower blood pressure — helpful given yours is borderline\n\nDr. Zhao asked you to check your blood sugar before and after dinner for the next 2 weeks. This will help track how the new medication is working.\n\n*If you feel unwell, dizzy, or notice signs of a UTI, contact the clinic. Don't stop the medication without speaking to your doctor first.*", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 150000).toISOString() },
  { id: "demo-v2-chat-5", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "user", content: "How much will the new medications cost with PBS?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
  { id: "demo-v2-chat-6", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "assistant", content: "Both Empagliflozin (Jardiance) and Atorvastatin are listed on the PBS, which means you'll pay a subsidised price.\n\n**Current PBS co-payment (general patient):**\n• Maximum $31.60 per script (as of 2025)\n• So two scripts would be approximately $63.20 total\n\n**PBS Safety Net:**\n• Once you and your family reach $1,563.50 in PBS prescriptions per calendar year, scripts drop to $0 for the rest of the year\n• Given your 7 regular medications, you may reach this threshold — ask your pharmacist to check\n\n**Tips to save:**\n• Ask your pharmacist if you qualify for a concession card rate ($7.70 per script)\n• Some pharmacies offer $1 discount for returning medication packaging\n• Your pharmacist can check if a generic brand is available, which may be slightly cheaper\n\n*These figures are based on current PBS pricing. Your pharmacist can give you the exact cost for your situation.*", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 330000).toISOString() },
];
