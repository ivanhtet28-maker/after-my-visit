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

const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

export const DEMO_VISITS_V2 = [
  {
    id: "demo-v2-visit-1",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Helen Zhao",
    clinic_name: "Werribee Plaza Medical Centre",
    visit_type: "gp",
    visit_date: twoDaysAgo.toISOString().split("T")[0],
    recording_duration: 720,
    status: "complete",
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
      quick_summary:
        "Diabetes review — HbA1c risen to 7.8% (was 7.2%). New medication Empagliflozin added to Metformin. Cholesterol medication Atorvastatin increased from 20mg to 40mg. Blood pressure stable. Vitamin D still low. Flu vaccination given. Knee improving with physio.",
      chief_complaint:
        "Diabetes management review and blood test results discussion",
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
      assessment:
        "Type 2 diabetes control has worsened slightly, likely related to holiday dietary indiscretions and reduced physical activity due to knee pain. Addition of Empagliflozin is appropriate given cardiovascular and renal benefits. Cholesterol requires further optimisation with increased statin dose. Blood pressure is borderline acceptable. Overall condition stable with good engagement in care.",
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
        { description: "Book fasting blood test for 6 weeks' time (HbA1c, lipids, kidney, liver)", category: "test", due_date_suggestion: "Within 1 week" },
        { description: "Book follow-up with Dr. Zhao in 6 weeks", category: "follow_up", due_date_suggestion: "Within 1 week" },
        { description: "Check blood sugar before and after dinner daily for 2 weeks", category: "lifestyle", due_date_suggestion: "Today" },
        { description: "Continue physio for knee — 2 sessions per week for 4 more weeks", category: "lifestyle", due_date_suggestion: "Ongoing" },
        { description: "Buy a 2-litre water bottle to track daily water intake", category: "lifestyle", due_date_suggestion: "This week" },
        { description: "Flu vaccination — done today at the clinic", category: "vaccination", due_date_suggestion: "Today", status: "complete" },
      ],
      medications: [
        {
          name: "Empagliflozin (Jardiance)",
          dosage: "10mg",
          frequency: "Once daily in the morning",
          explanation: "A newer diabetes medication that works by helping your kidneys remove excess sugar through your urine. It also has benefits for your heart and kidneys. You may notice you need to wee more often, especially at first — this is normal and means the medication is working. Drink plenty of water.",
          is_pbs: true,
        },
        {
          name: "Atorvastatin",
          dosage: "40mg (increased from 20mg)",
          frequency: "Once daily at night",
          explanation: "A cholesterol-lowering medication that reduces the 'bad' LDL cholesterol in your blood. Taking it at night works best because your body makes more cholesterol while you sleep. The dose has been increased because your cholesterol levels crept up.",
          is_pbs: true,
        },
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
  {
    id: "demo-v2-visit-2",
    user_id: "demo-karen-id",
    doctor_name: "Dr. James Nguyen",
    clinic_name: "Western Orthopaedics — Werribee",
    visit_type: "specialist",
    visit_date: tenDaysAgo.toISOString().split("T")[0],
    recording_duration: 600,
    status: "complete",
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
      quick_summary:
        "Ortho follow-up for right knee osteoarthritis. Good progress with physiotherapy — pain dropped from 7/10 to 3-4/10. X-ray shows no worsening. Continue physio 4 more weeks then home exercise program. Switch from Ibuprofen to Paracetamol. Review in 3 months.",
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
      assessment:
        "Right knee osteoarthritis responding well to conservative physiotherapy management. X-ray imaging stable with maintained joint space. No indication for surgical intervention. Medication adjustment required due to comorbidities.",
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
        {
          name: "Paracetamol",
          dosage: "1000mg (two 500mg tablets)",
          frequency: "Up to 3 times daily as needed",
          explanation: "A pain reliever that is safer for you than Ibuprofen given your diabetes and blood pressure medications. It doesn't reduce inflammation like Ibuprofen but is gentler on your kidneys and stomach.",
          is_pbs: false,
        },
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
  {
    id: "demo-v2-visit-3",
    user_id: "demo-karen-id",
    doctor_name: "Dr. Anika Sharma",
    clinic_name: "Sunshine Hospital Diabetes Clinic",
    visit_type: "specialist",
    visit_date: threeWeeksAgo.toISOString().split("T")[0],
    recording_duration: 900,
    status: "complete",
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
      quick_summary:
        "Endocrinologist review for worsening diabetes control. CGM shows post-dinner sugar spikes above 12 mmol/L. Recommends adding Empagliflozin, dietary changes (halve dinner carbs), and referrals to diabetes educator and dietitian. Kidney function normal. May need insulin if no improvement in 6 months.",
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
      assessment:
        "Type 2 diabetes with suboptimal control, predominantly post-prandial hyperglycaemia driven by evening carbohydrate intake. No evidence of microvascular complications — kidney function and urine albumin normal. SGLT2 inhibitor addition appropriate. Multidisciplinary approach with diabetes education and dietary intervention recommended.",
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
        {
          to: "Diabetes Educator — Sunshine Hospital Diabetes Clinic",
          reason: "Education on blood sugar monitoring, meal planning, and diabetes self-management",
          next_steps: "Phone Sunshine Hospital Diabetes Clinic reception to book. This service is free and covered by Medicare. No GP referral needed for the educator.",
        },
        {
          to: "Accredited Practising Dietitian",
          reason: "Personalised dietary advice to reduce post-dinner blood sugar spikes and support weight management",
          next_steps: "Ask Dr. Zhao to set up a GP Management Plan (GPMP) and Team Care Arrangement (TCA). This gives you access to 5 Medicare-rebated dietitian sessions per year. You'll pay a small gap or it may be bulk-billed.",
        },
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
];

export const DEMO_ACTION_ITEMS_V2 = [
  // Visit 1 actions
  { id: "demo-v2-action-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Pick up new Empagliflozin and updated Atorvastatin scripts from pharmacy", due_date: twoDaysAgo.toISOString().split("T")[0], status: "complete", category: "medication", completed_at: twoDaysAgo.toISOString(), created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Book fasting blood test for 6 weeks' time (HbA1c, lipids, kidney, liver)", due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "test", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-3", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Book follow-up with Dr. Zhao in 6 weeks", due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-4", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Check blood sugar before and after dinner daily for 2 weeks", due_date: twoDaysAgo.toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-5", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Continue physio for knee — 2 sessions per week for 4 more weeks", due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-6", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Buy a 2-litre water bottle to track daily water intake", due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-action-7", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", description: "Flu vaccination — done today at the clinic", due_date: twoDaysAgo.toISOString().split("T")[0], status: "complete", category: "vaccination", completed_at: twoDaysAgo.toISOString(), created_at: twoDaysAgo.toISOString() },
  // Visit 2 actions
  { id: "demo-v2-action-8", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Continue physio — 2 sessions per week for 4 more weeks", due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: tenDaysAgo.toISOString() },
  { id: "demo-v2-action-9", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Ask physio for a written home exercise program", due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: tenDaysAgo.toISOString() },
  { id: "demo-v2-action-10", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Switch from Ibuprofen to Paracetamol 1000mg three times daily", due_date: tenDaysAgo.toISOString().split("T")[0], status: "complete", category: "medication", completed_at: tenDaysAgo.toISOString(), created_at: tenDaysAgo.toISOString() },
  { id: "demo-v2-action-11", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Book 3-month follow-up with Dr. Nguyen", due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: tenDaysAgo.toISOString() },
  { id: "demo-v2-action-12", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", description: "Claim Medicare rebate for specialist consultation", due_date: tenDaysAgo.toISOString().split("T")[0], status: "pending", category: "follow_up", completed_at: null, created_at: tenDaysAgo.toISOString() },
  // Visit 3 actions
  { id: "demo-v2-action-13", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Book appointment with Diabetes Educator at Sunshine Hospital", due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-14", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Book appointment with Accredited Practising Dietitian", due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "pending", category: "referral", completed_at: null, created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-15", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Halve dinner carbohydrate portions — start tonight", due_date: threeWeeksAgo.toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-16", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Follow up with Dr. Zhao for Empagliflozin script", due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "complete", category: "medication", completed_at: twoDaysAgo.toISOString(), created_at: threeWeeksAgo.toISOString() },
  { id: "demo-v2-action-17", user_id: "demo-karen-id", visit_id: "demo-v2-visit-3", description: "Check blood sugar before and 2 hours after dinner daily", due_date: threeWeeksAgo.toISOString().split("T")[0], status: "pending", category: "lifestyle", completed_at: null, created_at: threeWeeksAgo.toISOString() },
];

export const DEMO_MEDICATIONS_V2 = [
  { id: "demo-v2-med-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", name: "Empagliflozin (Jardiance)", dosage: "10mg", frequency: "Once daily in the morning", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: twoDaysAgo.toISOString().split("T")[0], is_pbs: true, plain_explanation: "A newer diabetes medication that helps your kidneys remove excess sugar through your urine. Also benefits your heart and kidneys. Drink plenty of water.", status: "active", created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-med-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", name: "Atorvastatin", dosage: "40mg", frequency: "Once daily at night", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: twoDaysAgo.toISOString().split("T")[0], is_pbs: true, plain_explanation: "A cholesterol-lowering medication (statin). Dose increased from 20mg because your LDL cholesterol crept up. Take at night for best effect.", status: "active", created_at: twoDaysAgo.toISOString() },
  { id: "demo-v2-med-3", user_id: "demo-karen-id", visit_id: null, name: "Metformin", dosage: "1000mg", frequency: "Twice daily with meals", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: true, plain_explanation: "The first-line diabetes medication. It reduces the amount of sugar your liver releases and helps your body respond better to insulin.", status: "active", created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-4", user_id: "demo-karen-id", visit_id: null, name: "Perindopril", dosage: "5mg", frequency: "Once daily in the morning", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: true, plain_explanation: "A blood pressure medication (ACE inhibitor). It relaxes blood vessels and also helps protect your kidneys — important for diabetic patients.", status: "active", created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-5", user_id: "demo-karen-id", visit_id: null, name: "Vitamin D", dosage: "1000IU", frequency: "Once daily", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: false, plain_explanation: "A vitamin supplement to treat your deficiency. Important for bone health and immune function. Keep next to your toothbrush as a reminder.", status: "active", created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-6", user_id: "demo-karen-id", visit_id: null, name: "Pantoprazole", dosage: "40mg", frequency: "Once daily before breakfast", prescribing_doctor: "Dr. Helen Zhao", date_prescribed: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], is_pbs: true, plain_explanation: "A proton pump inhibitor for your reflux (GORD). It reduces stomach acid production. Take on an empty stomach 30 minutes before breakfast.", status: "active", created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-med-7", user_id: "demo-karen-id", visit_id: "demo-v2-visit-2", name: "Paracetamol", dosage: "1000mg", frequency: "Up to 3 times daily as needed", prescribing_doctor: "Dr. James Nguyen", date_prescribed: tenDaysAgo.toISOString().split("T")[0], is_pbs: false, plain_explanation: "A pain reliever for your knee. Safer than Ibuprofen given your diabetes and blood pressure medications. Take with or without food.", status: "active", created_at: tenDaysAgo.toISOString() },
];

export const DEMO_CHAT_MESSAGES_V2 = [
  { id: "demo-v2-chat-1", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "user", content: "What does HbA1c actually measure?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-v2-chat-2", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "assistant", content: "HbA1c measures the percentage of your red blood cells that have sugar (glucose) attached to them. Because red blood cells live for about 2-3 months, the test gives an average picture of your blood sugar levels over that period — think of it like a 'report card' for your diabetes control.\n\nYour result went from 7.2% to 7.8%, which means your average blood sugar has been higher over the past few months, likely due to the holiday period.\n\nFor context:\n• Normal (non-diabetic): below 6%\n• Target for most diabetics: below 7%\n• Your current level: 7.8% — a bit above target\n\nThe new Empagliflozin plus the dietary changes should help bring this down. You'll retest in 6 weeks.", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
  { id: "demo-v2-chat-3", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "user", content: "Will the Jardiance make me need to wee all the time?", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
  { id: "demo-v2-chat-4", user_id: "demo-karen-id", visit_id: "demo-v2-visit-1", role: "assistant", content: "You might notice you need to urinate a bit more often, especially in the first couple of weeks. This is actually the medication working — Empagliflozin (Jardiance) causes your kidneys to flush out excess sugar through your urine.\n\nMost people find it settles down after the first two weeks. A few tips:\n\n• Drink plenty of water throughout the day (aim for 2 litres)\n• Try to take the tablet in the morning so it doesn't disrupt your sleep\n• Keep good hygiene to prevent thrush infections (the extra sugar in urine can sometimes cause this)\n\nIf you find the increased urination is really bothering you or doesn't settle after a couple of weeks, mention it to Dr. Zhao at your next visit.\n\nRemember, this is general information based on your visit — always check with Dr. Zhao if you're concerned.", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 150000).toISOString() },
];
