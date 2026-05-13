import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePractitioner } from "@/hooks/usePractitioner";
import { supabase } from "@/integrations/supabase/client";
import GpLayout from "@/components/GpLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, Loader2, Printer, RefreshCw } from "lucide-react";

const DEMO_TOKEN = "demo-evergreen-token";

const buildInviteUrl = (token: string) =>
  `${window.location.origin}/care/${encodeURIComponent(token)}`;

const GpQrCodePage = () => {
  const { isDemoMode } = useDemoMode();
  const { practitioner, loading: practitionerLoading } = usePractitioner();

  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const inviteUrl = token ? buildInviteUrl(token) : null;

  useEffect(() => {
    if (isDemoMode) {
      setToken(DEMO_TOKEN);
      return;
    }
    if (practitionerLoading) return;
    if (!practitioner) {
      setToken(null);
      return;
    }
    fetchOrCreateInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, practitionerLoading, practitioner?.id]);

  useEffect(() => {
    if (!inviteUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(inviteUrl, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [inviteUrl]);

  const fetchOrCreateInvite = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke(
      "generate-practitioner-invite",
      { body: { is_evergreen: true } },
    );
    setGenerating(false);
    const errorMessage =
      (data as { error?: string } | null)?.error ?? error?.message;
    if (errorMessage || !(data as { token?: string } | null)?.token) {
      toast.error("Couldn't load your invite", {
        description: errorMessage ?? "Try again.",
      });
      return;
    }
    setToken((data as { token: string }).token);
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "clarity-care-invite-qr.png";
    link.click();
  };

  const handlePrint = () => {
    if (!qrDataUrl || !inviteUrl) return;
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <html><head><title>Care Invite QR</title>
      <style>body{font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;}img{max-width:80%;}</style>
      </head><body>
      <h2>Scan to join my care team</h2>
      <img src="${qrDataUrl}" alt="QR" />
      <p style="font-family:monospace;font-size:12px;">${inviteUrl}</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <GpLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Care invite QR</h1>
          <p className="text-muted-foreground">
            Patients scan to join your care team. Once added, they receive every
            consult summary you approve for them.
          </p>
        </div>

        {!isDemoMode && !practitionerLoading && !practitioner && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Complete practitioner onboarding before generating an invite.
          </div>
        )}

        <div className="flex justify-center">
          <div className="rounded-2xl border bg-card p-8 shadow-card">
            <div className="flex h-64 w-64 items-center justify-center">
              {generating || practitionerLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Care invite QR code"
                  className="h-full w-full"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No invite available yet.
                </p>
              )}
            </div>
            {inviteUrl && (
              <p className="mt-4 break-all text-center text-sm font-mono text-muted-foreground">
                {inviteUrl}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={handleCopyLink}
            disabled={!inviteUrl}
            className="gap-2 min-h-[44px]"
          >
            <Copy className="h-4 w-4" /> Copy link
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            variant="outline"
            className="gap-2 min-h-[44px]"
          >
            <Download className="h-4 w-4" /> Download PNG
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!qrDataUrl}
            variant="outline"
            className="gap-2 min-h-[44px]"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
          {!isDemoMode && (
            <Button
              onClick={fetchOrCreateInvite}
              disabled={generating || !practitioner}
              variant="ghost"
              className="gap-2 min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card space-y-3">
          <h2 className="text-lg font-semibold text-card-foreground">
            How to use this
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>
              Print on a card at reception. Patients scan, sign up, and you can
              start sending them approved consult summaries the same visit.
            </li>
            <li>
              Drop the link into your email signature or follow-up SMS for
              allied-health referrals.
            </li>
            <li>
              The link is evergreen — no expiry, no use limit. Refresh only if
              you've shared it publicly and want to rotate.
            </li>
          </ul>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpQrCodePage;
