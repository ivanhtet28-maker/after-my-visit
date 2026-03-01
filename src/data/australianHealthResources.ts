export const AU_RESOURCES = {
  pbs: { name: "PBS", url: "https://www.pbs.gov.au", search: "https://www.pbs.gov.au/medicine/search", description: "Check if your medication is subsidised and what you'll pay" },
  medicare: { name: "Medicare", url: "https://www.servicesaustralia.gov.au/medicare", bulk_billing: "https://www.servicesaustralia.gov.au/bulk-billing", gp_plans: "https://www.servicesaustralia.gov.au/chronic-disease-management-individual-allied-health-services", description: "Medicare covers many health services for Australian residents" },
  healthdirect: { name: "healthdirect", url: "https://www.healthdirect.gov.au", medicines: "https://www.healthdirect.gov.au/medicines", services: "https://www.healthdirect.gov.au/australian-health-services", helpline: "1800 022 222", description: "Free 24/7 government health advice — call 1800 022 222" },
  nps: { name: "NPS MedicineWise", url: "https://www.nps.org.au", finder: "https://www.nps.org.au/medicine-finder", description: "Independent medication info, side effects, and interactions" },
  tga: { name: "TGA", url: "https://www.tga.gov.au", cmi: "https://www.tga.gov.au/consumer-medicines-information", description: "Official Consumer Medicine Information sheets" },
  myHealthRecord: { name: "My Health Record", url: "https://www.myhealthrecord.gov.au", description: "View your Medicare claims, prescriptions, and hospital records online" },
  diabetesAustralia: { name: "Diabetes Australia", url: "https://www.diabetesaustralia.com.au", ndss: "https://www.ndss.com.au", helpline: "1800 177 055", description: "Free diabetes support and subsidised supplies through the NDSS" },
  heartFoundation: { name: "Heart Foundation", url: "https://www.heartfoundation.org.au", bp: "https://www.heartfoundation.org.au/bundles/your-heart/know-your-risks/blood-pressure", cholesterol: "https://www.heartfoundation.org.au/bundles/your-heart/know-your-risks/cholesterol", description: "Trusted Australian heart health information" },
  arthritisAustralia: { name: "Arthritis Australia", url: "https://arthritisaustralia.com.au", description: "Arthritis information and support" },
  beyondBlue: { name: "Beyond Blue", url: "https://www.beyondblue.org.au", description: "Anxiety, depression, and mental health support" },
  racgp: { name: "RACGP Guidelines", url: "https://www.racgp.org.au/clinical-resources/clinical-guidelines", description: "Clinical guidelines used by Australian GPs" },
};

export const EMERGENCY_CONTACTS = [
  { number: "000", label: "Emergency (ambulance, fire, police)" },
  { number: "1800 022 222", label: "healthdirect — 24/7 nurse advice (free)" },
  { number: "1300 60 60 24", label: "Nurse-on-Call Victoria — 24/7" },
  { number: "13 11 26", label: "Poisons Information Centre — 24/7" },
  { number: "13 11 14", label: "Lifeline — 24/7 crisis support" },
  { number: "1800 177 055", label: "Diabetes Australia Helpline" },
];

export const CONDITION_LINKS: Record<string, { name: string; url: string }[]> = {
  diabetes: [
    { name: "Diabetes Australia", url: "https://www.diabetesaustralia.com.au" },
    { name: "NDSS — subsidised supplies", url: "https://www.ndss.com.au" },
    { name: "healthdirect — Type 2 Diabetes", url: "https://www.healthdirect.gov.au/type-2-diabetes" },
  ],
  hypertension: [
    { name: "Heart Foundation — Blood Pressure", url: "https://www.heartfoundation.org.au/bundles/your-heart/know-your-risks/blood-pressure" },
    { name: "healthdirect — High Blood Pressure", url: "https://www.healthdirect.gov.au/high-blood-pressure-hypertension" },
  ],
  cholesterol: [
    { name: "Heart Foundation — Cholesterol", url: "https://www.heartfoundation.org.au/bundles/your-heart/know-your-risks/cholesterol" },
    { name: "healthdirect — Cholesterol", url: "https://www.healthdirect.gov.au/cholesterol" },
  ],
  osteoarthritis: [
    { name: "Arthritis Australia", url: "https://arthritisaustralia.com.au" },
    { name: "healthdirect — Osteoarthritis", url: "https://www.healthdirect.gov.au/osteoarthritis" },
  ],
  asthma: [
    { name: "Asthma Australia", url: "https://www.asthmaaustralia.org.au" },
    { name: "healthdirect — Asthma", url: "https://www.healthdirect.gov.au/asthma" },
  ],
  mental_health: [
    { name: "Beyond Blue", url: "https://www.beyondblue.org.au" },
    { name: "Head to Health", url: "https://www.headtohealth.gov.au" },
    { name: "Lifeline — 13 11 14", url: "https://www.lifeline.org.au" },
  ],
  reflux: [
    { name: "healthdirect — GORD", url: "https://www.healthdirect.gov.au/gastro-oesophageal-reflux-disease-gord" },
  ],
  vitamin_d: [
    { name: "healthdirect — Vitamin D Deficiency", url: "https://www.healthdirect.gov.au/vitamin-d-deficiency" },
  ],
};

/** Detect condition keywords in a text blob and return matching resource links */
export function detectConditionResources(text: string): { name: string; url: string }[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = new Map<string, { name: string; url: string }>();

  const keywordMap: Record<string, string[]> = {
    diabetes: ["diabetes", "hba1c", "metformin", "empagliflozin", "jardiance", "blood sugar", "glucose", "diabetic"],
    hypertension: ["hypertension", "blood pressure", "perindopril", "bp"],
    cholesterol: ["cholesterol", "ldl", "atorvastatin", "statin", "lipid"],
    osteoarthritis: ["osteoarthritis", "arthritis", "knee pain", "joint pain", "knee oa"],
    reflux: ["reflux", "gord", "pantoprazole", "heartburn"],
    vitamin_d: ["vitamin d", "vitamin d deficiency"],
    mental_health: ["depression", "anxiety", "mental health"],
    asthma: ["asthma", "inhaler", "ventolin"],
  };

  for (const [condition, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const links = CONDITION_LINKS[condition];
      if (links) {
        for (const link of links) {
          matched.set(link.url, link);
        }
      }
    }
  }

  return Array.from(matched.values());
}
