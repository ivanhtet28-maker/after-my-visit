import { useDemoMode } from "@/hooks/useDemoMode";
import { DEMO_CLINIC } from "@/data/demoClinic";
import GpLayout from "@/components/GpLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";

const QrCodePlaceholder = () => (
  <svg
    viewBox="0 0 200 200"
    className="h-full w-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer border */}
    <rect
      x="10"
      y="10"
      width="180"
      height="180"
      rx="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-border"
    />
    {/* Top-left finder */}
    <rect x="20" y="20" width="50" height="50" rx="4" fill="currentColor" className="text-foreground" />
    <rect x="28" y="28" width="34" height="34" rx="2" fill="currentColor" className="text-card" />
    <rect x="34" y="34" width="22" height="22" rx="1" fill="currentColor" className="text-foreground" />
    {/* Top-right finder */}
    <rect x="130" y="20" width="50" height="50" rx="4" fill="currentColor" className="text-foreground" />
    <rect x="138" y="28" width="34" height="34" rx="2" fill="currentColor" className="text-card" />
    <rect x="144" y="34" width="22" height="22" rx="1" fill="currentColor" className="text-foreground" />
    {/* Bottom-left finder */}
    <rect x="20" y="130" width="50" height="50" rx="4" fill="currentColor" className="text-foreground" />
    <rect x="28" y="138" width="34" height="34" rx="2" fill="currentColor" className="text-card" />
    <rect x="34" y="144" width="22" height="22" rx="1" fill="currentColor" className="text-foreground" />
    {/* Data dots */}
    {[
      [85, 25], [95, 25], [105, 25], [115, 25],
      [85, 35], [105, 35],
      [85, 45], [95, 45], [115, 45],
      [25, 85], [35, 85], [45, 85], [55, 85],
      [85, 85], [95, 85], [105, 85], [115, 85], [135, 85], [155, 85],
      [25, 95], [45, 95], [85, 95], [115, 95], [145, 95],
      [25, 105], [35, 105], [55, 105], [95, 105], [105, 105], [135, 105], [155, 105],
      [25, 115], [45, 115], [55, 115], [85, 115], [115, 115], [145, 115],
      [85, 135], [95, 135], [115, 135], [135, 135], [155, 135],
      [105, 145], [135, 145], [145, 145],
      [85, 155], [95, 155], [105, 155], [115, 155], [135, 155], [155, 155],
      [85, 165], [115, 165], [145, 165],
    ].map(([x, y], i) => (
      <rect
        key={i}
        x={x}
        y={y}
        width="8"
        height="8"
        rx="1"
        fill="currentColor"
        className="text-foreground"
      />
    ))}
  </svg>
);

const GpQrCodePage = () => {
  const { isDemoMode } = useDemoMode();

  const clinicName = isDemoMode ? DEMO_CLINIC.name : "Your Clinic";
  const clinicSlug = isDemoMode
    ? "werribee-plaza-medical-centre"
    : "your-clinic";
  const joinUrl = `aftervisit.app/join/${clinicSlug}`;

  const handleDownload = () => {
    if (isDemoMode) {
      toast.success("Downloaded");
    }
  };

  const handlePrint = () => {
    if (isDemoMode) {
      toast.success("Printing...");
    }
  };

  return (
    <GpLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Clinic QR Code</h1>
          <p className="text-muted-foreground">
            Scan to join {clinicName} on AfterVisit
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="rounded-2xl border bg-card p-8 shadow-card">
            <div className="h-64 w-64">
              <QrCodePlaceholder />
            </div>
            <p className="mt-4 text-center text-sm font-mono text-muted-foreground">
              {joinUrl}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleDownload}
            className="gap-2 min-h-[44px]"
          >
            <Download className="h-4 w-4" /> Download QR Code
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2 min-h-[44px]"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-3">
          <h2 className="text-lg font-semibold text-card-foreground">
            How to use
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>
              Display this QR code in your waiting room. Patients scan to sign up
              with your clinic pre-selected.
            </li>
            <li>
              Include it on printed materials such as appointment reminders or
              new patient information packs.
            </li>
            <li>
              Patients who scan will be guided through account creation and
              consent before their first recording.
            </li>
          </ul>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpQrCodePage;
