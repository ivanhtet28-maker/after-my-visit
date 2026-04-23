import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Lightbulb, ClipboardCheck, ArrowRight, Shield, MapPin, Check, ChevronDown, Star, Quote } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroImage from "@/assets/hero-illustration.jpg";

const testimonials = [
  { name: "Sarah", suburb: "Point Cook", text: "Clarity Health changed how I manage my health. I finally understand what my specialist is telling me.", rating: 5 },
  { name: "James", suburb: "Bondi", text: "As a carer for my elderly mum, this is a lifesaver. I can track her appointments and medications in one place.", rating: 5 },
  { name: "Priya", suburb: "Parramatta", text: "I used to forget half of what my GP said. Now I have everything in plain English with follow-up actions.", rating: 5 },
];

const faqs = [
  { q: "Is it legal to record my doctor?", a: "In most Australian states, you can record a private conversation you're part of with consent. We recommend always informing your doctor and obtaining their verbal consent before recording. Clarity Health includes a consent confirmation step." },
  { q: "Is my data safe?", a: "Absolutely. Your data is encrypted at rest and in transit, stored on Australian servers, and only accessible by you. We comply with the Australian Privacy Act and follow healthcare data best practices." },
  { q: "Does my doctor need to agree?", a: "Yes, we strongly recommend obtaining your doctor's verbal consent before recording. Most doctors are supportive when they understand it helps patients remember their advice." },
  { q: "Can I use it for telehealth?", a: "Yes! Clarity Health works with telehealth consultations. Simply start recording during your video or phone appointment (with consent) and get the same structured summary." },
  { q: "What if English isn't my first language?", a: "Clarity Health's plain-English explanations are designed to be simple and clear. We're working on multilingual support — if you'd like to see your language, let us know!" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">Clarity Health</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/gp")} className="hidden sm:inline-flex text-muted-foreground hover:text-primary">For GPs</Button>
            <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="bg-gradient-hero-subtle">
          <div className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-28 lg:py-32">
            <div className="flex flex-col justify-center">
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Never Leave a Doctor's Visit{" "}
                <span className="text-gradient-primary">Confused Again</span>
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                Record your appointment. Get a plain-English summary. Ask follow-up questions anytime. Built for Australian patients.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/signup")} className="gap-2">
                  Get Early Access — Free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  See How It Works
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src={heroImage} alt="AfterVisit health companion illustration" className="w-full max-w-lg rounded-2xl shadow-card-hover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Everything You Need After Your Visit</h2>
          <p className="mb-12 text-center text-muted-foreground">Three simple steps to take control of your health</p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Mic, title: "Record Your Visit", desc: "With your doctor's consent, record your consultation. Clarity Health transcribes and structures everything discussed." },
              { icon: Lightbulb, title: "Understand Everything", desc: "Complex medical terms explained in plain English. Your diagnosis, medications, and next steps — all crystal clear." },
              { icon: ClipboardCheck, title: "Never Miss a Follow-Up", desc: "Track your action items, medication reminders, upcoming referrals, and prepare questions for your next visit." },
            ].map((f) => (
              <div key={f.title} className="group rounded-xl border bg-card p-8 shadow-card transition-all hover:shadow-card-hover">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-hero-subtle py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Record your appointment", desc: "With your doctor's consent, tap record and let Clarity Health capture everything." },
              { step: "2", title: "AI creates a structured summary", desc: "Within minutes, get a clear breakdown of what was discussed, diagnosed, and prescribed." },
              { step: "3", title: "Track actions & ask questions", desc: "Stay on top of follow-ups, medications, and ask questions about your visit anytime." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Trusted by Australian Patients</h2>
          <p className="mb-12 text-center text-muted-foreground">Real feedback from our early access community</p>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border bg-card p-6 shadow-card">
                <Quote className="mb-3 h-6 w-6 text-primary/30" />
                <p className="mb-4 text-sm text-muted-foreground italic">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.suburb}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gradient-hero-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Shield, text: "Built by healthcare professionals for Australian patients" },
              { icon: MapPin, text: "Your data stays in Australia. Always." },
              { icon: ClipboardCheck, text: "Works with any GP, specialist, or allied health visit" },
            ].map((t) => (
              <div key={t.text} className="flex items-start gap-4 rounded-xl border bg-card p-6 shadow-card">
                <t.icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <p className="font-medium text-card-foreground">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">🇦🇺 <span className="font-medium">Data stored in Australia</span></span>
            <span>•</span>
            <span>Medicare-aware</span>
            <span>•</span>
            <span>PBS-integrated</span>
            <span>•</span>
            <span>TGA-compliant</span>
          </div>
        </div>
      </section>

      {/* As Seen On placeholder */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">As featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["TechCrunch", "Health IT", "StartupDaily", "Medical Republic"].map((name) => (
              <span key={name} className="text-lg font-bold text-muted-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-hero-subtle py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Simple, Transparent Pricing</h2>
          <p className="mb-12 text-center text-muted-foreground">Start free, upgrade when you need more</p>
          <div className="grid items-start gap-8 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", period: "forever", features: ["2 visits/month", "Basic summaries", "Action item tracking"], cta: "Get Started Free" },
              { name: "Plus", price: "$9.99", period: "/month", features: ["Unlimited visits", "AI Q&A", "Medication explainer", "Referral tracker", "PDF exports", "Priority support"], cta: "Start Plus", popular: true },
              { name: "Family", price: "$19.99", period: "/month", features: ["Up to 5 family members", "Shared care coordination", "Elderly parent support", "Everything in Plus"], cta: "Start Family" },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-xl border bg-card p-8 shadow-card transition-all ${p.popular ? "ring-2 ring-primary md:-mt-4 md:pb-10 md:pt-10 shadow-card-hover" : ""}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                    ⭐ Most Popular
                  </span>
                )}
                <h3 className="mb-1 text-xl font-bold text-card-foreground">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground"> {p.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={p.popular ? "default" : "outline"} size={p.popular ? "lg" : "default"} onClick={() => navigate("/signup")}>
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="mb-10 text-center text-muted-foreground">Everything you need to know about Clarity Health</p>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border bg-card px-6 shadow-card">
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
            <span className="text-lg font-bold text-primary">Clarity Health</span>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["About", "Privacy Policy", "Terms", "Contact", "Blog"].map((l) => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <p className="text-xs text-muted-foreground">
              Clarity Health is not a medical device. It does not provide medical advice or diagnoses. Always consult your healthcare professional.
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

export default LandingPage;
