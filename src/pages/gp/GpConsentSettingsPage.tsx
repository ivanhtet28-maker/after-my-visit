import { useState } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DEMO_CLINIC } from "@/data/demoClinic";
import GpLayout from "@/components/GpLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save } from "lucide-react";

const GpConsentSettingsPage = () => {
  const { isDemoMode } = useDemoMode();

  const initialConsentText = isDemoMode
    ? DEMO_CLINIC.consent_form_text
    : "";
  const initialRequireAck = isDemoMode
    ? DEMO_CLINIC.require_gp_acknowledgement
    : true;

  const [consentText, setConsentText] = useState(initialConsentText);
  const [requireAcknowledgement, setRequireAcknowledgement] =
    useState(initialRequireAck);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    if (isDemoMode) {
      toast.success("Settings saved");
    }
  };

  return (
    <GpLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Consent Settings
          </h1>
          <p className="text-muted-foreground">
            Customise the consent wording patients see before recording a
            consultation.
          </p>
        </div>

        {/* Consent wording */}
        <div className="space-y-3">
          <Label htmlFor="consent-text">Consent form wording</Label>
          <Textarea
            id="consent-text"
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            rows={5}
            placeholder="Enter your clinic's consent wording..."
            className="min-h-[120px]"
          />
        </div>

        {/* GP acknowledgement toggle */}
        <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card">
          <div className="space-y-1">
            <p className="text-sm font-medium text-card-foreground">
              Require explicit GP acknowledgement per recording
            </p>
            <p className="text-xs text-muted-foreground">
              When enabled, the patient must confirm their GP has been informed
              before each recording.
            </p>
          </div>
          <Switch
            checked={requireAcknowledgement}
            onCheckedChange={setRequireAcknowledgement}
          />
        </div>

        {/* Live preview */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Live Preview
          </h2>
          <p className="text-sm text-muted-foreground">
            This is how patients will see the consent form in the AfterVisit app.
          </p>
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <p className="text-sm font-medium text-card-foreground">
              Before we begin recording, please confirm:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox id="preview-consent" disabled checked={false} className="mt-0.5" />
                <label
                  htmlFor="preview-consent"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {consentText || "No consent wording configured."}
                </label>
              </div>
              {requireAcknowledgement && (
                <div className="flex items-start gap-3">
                  <Checkbox id="preview-ack" disabled checked={false} className="mt-0.5" />
                  <label
                    htmlFor="preview-ack"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    My doctor has acknowledged and agrees to this consultation
                    being recorded.
                  </label>
                </div>
              )}
            </div>
            <Button disabled className="w-full min-h-[44px] opacity-50">
              Start Recording
            </Button>
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 min-h-[44px]"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </GpLayout>
  );
};

export default GpConsentSettingsPage;
