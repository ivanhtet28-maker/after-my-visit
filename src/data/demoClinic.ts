export const DEMO_CLINIC = {
  id: "demo-clinic-id",
  name: "Werribee Plaza Medical Centre",
  address: "250 Heaths Road",
  suburb: "Werribee",
  state: "VIC",
  postcode: "3030",
  phone: "(03) 9748 1234",
  logo_url: null,
  consent_form_text:
    "I confirm that my doctor has been informed this consultation will be recorded and transcribed by AfterVisit. I understand the audio will be processed on AfterVisit's secure Australian servers and deleted after transcription is complete.",
  require_gp_acknowledgement: true,
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_CLINIC_GPS = [
  {
    id: "gp-1",
    clinic_id: "demo-clinic-id",
    gp_name: "Dr. Helen Zhao",
    ahpra_number: "MED0001234567",
    email: "helen.zhao@wpmc.com.au",
    is_active: true,
  },
  {
    id: "gp-2",
    clinic_id: "demo-clinic-id",
    gp_name: "Dr. James Patel",
    ahpra_number: "MED0001234568",
    email: "james.patel@wpmc.com.au",
    is_active: true,
  },
  {
    id: "gp-3",
    clinic_id: "demo-clinic-id",
    gp_name: "Dr. Sarah Kim",
    ahpra_number: "MED0001234569",
    email: "sarah.kim@wpmc.com.au",
    is_active: false,
  },
];

export const DEMO_CLINIC_STATS = {
  patients_this_month: 47,
  consults_today: 8,
  total_active_patients: 312,
};

export const DEMO_CLINIC_ACTIVITY = [
  { initial: "K", doctor: "Dr. Helen Zhao", time: "2 hours ago" },
  { initial: "M", doctor: "Dr. James Patel", time: "3 hours ago" },
  { initial: "R", doctor: "Dr. Helen Zhao", time: "5 hours ago" },
  { initial: "J", doctor: "Dr. James Patel", time: "Yesterday" },
  { initial: "A", doctor: "Dr. Helen Zhao", time: "Yesterday" },
];

export interface DemoClinicPatient {
  id: string;
  name: string;
  dob: string;
  medicare_last4: string;
}

export const DEMO_CLINIC_PATIENTS: DemoClinicPatient[] = [
  { id: "p1", name: "Karen Mitchell", dob: "1968-03-12", medicare_last4: "4821" },
  { id: "p2", name: "Michael Tran", dob: "1982-11-04", medicare_last4: "6712" },
  { id: "p3", name: "Rachel O'Brien", dob: "1975-07-22", medicare_last4: "3398" },
  { id: "p4", name: "James Whittaker", dob: "1991-01-30", medicare_last4: "9015" },
  { id: "p5", name: "Aisha Rahman", dob: "1989-09-17", medicare_last4: "2284" },
  { id: "p6", name: "Sophie Nguyen", dob: "1956-05-08", medicare_last4: "1147" },
  { id: "p7", name: "Tom Bianchi", dob: "1994-12-19", medicare_last4: "7762" },
  { id: "p8", name: "Lina Kowalski", dob: "1971-04-26", medicare_last4: "5536" },
  { id: "p9", name: "David Chen", dob: "1985-08-11", medicare_last4: "8073" },
  { id: "p10", name: "Brooke Anderson", dob: "1979-02-14", medicare_last4: "4209" },
  { id: "p11", name: "Nadia Petrov", dob: "1962-10-03", medicare_last4: "6651" },
  { id: "p12", name: "Patrick Doyle", dob: "1996-06-25", medicare_last4: "3174" },
  { id: "p13", name: "Wei Zhang", dob: "1973-11-29", medicare_last4: "8842" },
];
