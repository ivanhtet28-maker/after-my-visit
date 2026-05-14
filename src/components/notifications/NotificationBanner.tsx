/**
 * NotificationBanner — prompts the patient to enable push notifications.
 *
 * Shows a dismissible banner at the top of the dashboard when:
 * - Push is supported
 * - Permission hasn't been granted yet
 * - User hasn't dismissed it this session
 *
 * Also provides a settings toggle in the notification preferences page.
 */

import { useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export function NotificationBanner() {
  const { supported, permission, subscribed, loading, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already subscribed, denied, or dismissed
  if (!supported || subscribed || permission === "denied" || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      toast.success("Notifications enabled! You'll get medication and appointment reminders.");
    } else if (Notification.permission === "denied") {
      toast.error("Notifications blocked. You can enable them in your browser settings.");
    }
  };

  return (
    <div className="relative bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6 flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
          Enable smart reminders
        </p>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
          Get timely medication reminders and appointment notifications based on your GP's recommendations.
        </p>
        <Button
          onClick={handleEnable}
          disabled={loading}
          size="sm"
          className="mt-3 bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? "Setting up…" : "Enable notifications"}
        </Button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * NotificationToggle — compact toggle for settings pages.
 */
export function NotificationToggle() {
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!supported) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <BellOff className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Push notifications</p>
          <p className="text-xs text-muted-foreground">Not supported on this device/browser.</p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <BellOff className="h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm font-medium">Push notifications blocked</p>
          <p className="text-xs text-muted-foreground">
            Enable in your browser settings: Settings → Site Settings → Notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Bell className={`h-5 w-5 ${subscribed ? "text-indigo-600" : "text-muted-foreground"}`} />
        <div>
          <p className="text-sm font-medium">Push notifications</p>
          <p className="text-xs text-muted-foreground">
            {subscribed
              ? "Medication & appointment reminders are active."
              : "Get timely health reminders on this device."}
          </p>
        </div>
      </div>
      <Button
        variant={subscribed ? "outline" : "default"}
        size="sm"
        disabled={loading}
        onClick={subscribed ? unsubscribe : subscribe}
      >
        {loading ? "…" : subscribed ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
