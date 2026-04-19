import GpLayout from "@/components/gp/GpLayout";
import { GP_DEMO_DOCTOR } from "@/data/gpDemoData";
import { Settings as SettingsIcon } from "lucide-react";

const GpSettingsPage = () => {
  return (
    <GpLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <SettingsIcon className="h-6 w-6 text-primary" /> GP Settings
          </h1>
          <p className="text-sm text-muted-foreground">Demo profile — read only.</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Practitioner</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium text-card-foreground">{GP_DEMO_DOCTOR.title} {GP_DEMO_DOCTOR.first_name} {GP_DEMO_DOCTOR.last_name}</dd></div>
            <div><dt className="text-muted-foreground">AHPRA</dt><dd className="font-medium text-card-foreground">{GP_DEMO_DOCTOR.ahpra}</dd></div>
            <div><dt className="text-muted-foreground">Practice</dt><dd className="font-medium text-card-foreground">{GP_DEMO_DOCTOR.practice}</dd></div>
            <div><dt className="text-muted-foreground">State</dt><dd className="font-medium text-card-foreground">{GP_DEMO_DOCTOR.state}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Email</dt><dd className="font-medium text-card-foreground">{GP_DEMO_DOCTOR.email}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-card-foreground">
          <p className="font-semibold">This is a demo of the GP Portal</p>
          <p className="mt-1 text-muted-foreground">
            In production, GPs sign in with verified AHPRA credentials and only see patients who have explicitly shared their records.
            All data here is fictional and for demonstration only — no real patient information is shown.
          </p>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpSettingsPage;
