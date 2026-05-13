import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  FileText,
  Mic,
  Shield,
  Smartphone,
  Star,
  Users,
  ChevronDown,
  Stethoscope,
  QrCode,
  Bot,
  HeartPulse,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const stats = [
  { value: "60%", label: "of what a GP says is forgotten before the patient reaches the car park" },
  { value: "47%", label: "of patients don't follow through on their treatment plan" },
  { value: "12 min", label: "average GP consult — too short to repeat everything twice" },
];

const gpBenefits = [
  {
    icon: Clock,
    title: "Fewer Follow-Up Calls",
    desc: "Patients have a written summary of everything discussed. Reception stops fielding \"what did the doctor say?\" calls.",
  },
  {
    icon: Users,
    title: "Higher Patient Retention",
    desc: "Patients who feel informed stay loyal. Clarity Health makes your clinic the one they trust — and recommend.",
  },
  {
    icon: Shield,
    title: "AHPRA Compliant",
    desc: "GP approval before anything reaches the patient. Dual consent at point of care. Full audit trail. Built for Australian regulation.",
  },
  {
    icon: Bot,
    title: "Works With Heidi",
    desc: "Already using Heidi or another transcription tool? Paste the transcript and Clarity Health creates the patient-facing summary. No double-handling.",
  },
  {
    icon: Smartphone,
    title: "Zero Setup for Patients",
    desc: "Patient scans your QR code, creates an account, and receives summaries automatically. No app download, no training.",
  },
  {
    icon: HeartPulse,
    title: "Continuity of Care",
    desc: "Referrals to allied health include context. The physio sees what the GP discussed — no more \"start from scratch\".",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Record or paste",
    desc: "During the consult, record directly in Clarity Health — or paste your existing Heidi transcript afterwards.",
  },
  {
    step: "2",
    title: "AI summarises",
    desc: "Plain-English summary with action items, medications, referrals, and medical terms explained. Ready in seconds.",
  },
  {
    step: "3",
    title: "You approve",
    desc: "Review the summary. Edit anything. Nothing reaches the patient until you click Approve.",
  },
  {
    step: "4",
    title: "Patient receives",
    desc: "Patient gets an email notification with their summary. They can ask follow-up questions through embedded AI chat.",
  },
];

const gpFaqs = [
  {
    q: "Does this add time to my consult?",
    a: "No. If you already use a transcription tool like Heidi, paste the transcript and click approve — 30 seconds. If you record directly, it's one tap to start and one tap to stop. The AI does the rest.",
  },
  {
    q: "What about patient consent and the Surveillance Devices Act?",
    a: "Clarity Health enforces dual consent at the point of care. Two checkboxes: (1) the patient consents to recording, and (2) the patient agrees to receive a summary. This satisfies SA and WA all-party-consent requirements. The Record button is disabled until both are checked.",
  },
  {
    q: "Can I edit the summary before the patient sees it?",
    a: "Absolutely. You review the AI-generated summary and can edit any section before approving. Nothing is visible to the patient until you click Approve.",
  },
  {
    q: "Do patients see the raw transcript?",
    a: "By default, no. Patients see only the structured, plain-English summary. Transcript access is a per-practitioner toggle that patients control in their privacy settings.",
  },
  {
    q: "How do patients join?",
    a: "You generate a personal QR code from your dashboard. Print it for your waiting room, include it in appointment reminders, or add it to your email signature. Patients scan it to create an account linked to you.",
  },
  {
    q: "What does it cost my clinic?",
    a: "Nothing. Clarity Health is free for clinics and GPs. Patients pay directly if they want premium features. Your clinic gets better outcomes and stronger patient loyalty at zero cost.",
  },
  {
    q: "Is data stored in Australia?",
    a: "Yes. All data — recordings, transcripts, summaries — is stored on Australian servers. We comply with the Privacy Act 1988 and follow healthcare data best practices. Audio is deleted after transcription.",
  },
];

const ForClinicsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span
            className="cursor-pointer text-xl font-bold text-primary"
            onClick={() => navigate("/")}
          >
            Clarity Health
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hidden sm:inline-flex text-muted-foreground hover:text-primary"
            >
              For Patients
            </Button>
            <Button variant="ghost" onClick={() => navigate("/gp/login")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/gp/signup")}>
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="bg-gradient-hero-subtle">
          <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-card">
                <Stethoscope className="h-4 w-4 text-primary" />
                Built for Australian GPs
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Record Once.{" "}
                <span className="text-gradient-primary">
                  Patients Leave Understanding&nbsp;Everything.
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                Clarity Health turns your consult into a plain-English summary
                your patient actually reads. Fewer follow-up calls. Better
                adherence. Stronger patient&nbsp;retention.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/gp/signup")}
                  className="gap-2"
                >
                  Create Free GP Account{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/gp/dashboard?demo=true")}
                >
                  View Live Demo
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free for clinics. No credit card. No PMS integration required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <p className="text-4xl font-extrabold text-primary">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
            How It Works for GPs
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            30 seconds of your time. Hours saved for your clinic.
          </p>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
            {howItWorks.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="bg-gradient-hero-subtle py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
            Why Clinics Choose Clarity Health
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            Zero cost. Zero setup. Immediate patient impact.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gpBenefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl border bg-card p-8 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                  {b.title}
                </h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Patients See */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
              What Your Patient Receives
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
              A structured, plain-English summary of everything discussed
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: FileText,
                  title: "Quick Summary",
                  desc: "1–2 sentence overview of the visit in everyday language",
                },
                {
                  icon: Check,
                  title: "Action Items",
                  desc: "Checklist of follow-ups, tests, and referrals with due dates",
                },
                {
                  title: "Medications",
                  icon: HeartPulse,
                  desc: "Name, dosage, frequency, PBS status, and \"what this does\" in plain English",
                },
                {
                  icon: Star,
                  title: "Doctor's Recommendations",
                  desc: "Numbered list of your clinical advice, formatted for retention",
                },
                {
                  icon: Bot,
                  title: "AI Follow-Up Chat",
                  desc: "Patient can ask questions about the visit — scoped to the summary, with mandatory medical disclaimer",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR Code section */}
      <section className="bg-gradient-hero-subtle py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Onboard Patients in Seconds
              </h2>
              <p className="mb-6 text-muted-foreground">
                Generate your personal practitioner QR code. Print it for your
                waiting room, add it to appointment reminders, or include it in
                your email signature. Patients scan, sign up, and they're linked
                to your care team automatically.
              </p>
              <ul className="space-y-3">
                {[
                  "One QR code per practitioner — reusable forever",
                  "Patients scan → sign up → linked to you instantly",
                  "Print for reception desk, appointment cards, email signatures",
                  "No app download required — works in any browser",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-xl border bg-card p-8 shadow-card-hover">
                <div className="mb-4 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-primary/20" />
                </div>
                <p className="text-center text-sm font-medium text-card-foreground">
                  Your personal QR code
                </p>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Generated from your GP dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-hero p-12 text-center text-primary-foreground shadow-card-hover">
            <h2 className="mb-4 text-3xl font-bold">
              Start in Under 2 Minutes
            </h2>
            <p className="mb-8 opacity-90">
              Create your free GP account. Set up your profile and AHPRA number.
              Record your first consult. That's it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/gp/signup")}
                className="gap-2"
              >
                Create Free GP Account{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gradient-hero-subtle py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
            GP Questions
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Everything clinics ask before signing up
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {gpFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border bg-card px-6 shadow-card"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-card-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-lg font-bold text-primary">
              Clarity Health
            </span>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a
                href="#how-it-works"
                className="transition-colors hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#faq"
                className="transition-colors hover:text-foreground"
              >
                FAQ
              </a>
              <span
                className="cursor-pointer transition-colors hover:text-foreground"
                onClick={() => navigate("/")}
              >
                For Patients
              </span>
              <a
                href="mailto:hello@clarityhealth.com.au"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <p className="text-xs text-muted-foreground">
              Clarity Health is not a medical device. It does not provide medical
              advice or diagnoses. Always follow your clinical judgement.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🇦🇺</span>
              <span>Data stored in Australia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForClinicsPage;
