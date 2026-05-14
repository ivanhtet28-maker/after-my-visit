/**
 * RemindersCard — shows upcoming reminders on the patient dashboard.
 *
 * Displays the next 5 reminders grouped as "Today", "Tomorrow", "This Week".
 * Each reminder can be completed or dismissed inline.
 */

import { Bell, Check, Clock, Pill, CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReminders, Reminder } from "@/hooks/useReminders";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

export function RemindersCard() {
  const { upcoming, loading, dismissReminder, completeReminder } = useReminders();

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (upcoming.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Upcoming Reminders</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No upcoming reminders. They'll appear here when your GP creates a visit summary.
        </p>
      </div>
    );
  }

  // Group reminders
  const today = upcoming.filter((r) => isToday(parseISO(r.remind_at)));
  const tomorrow = upcoming.filter((r) => isTomorrow(parseISO(r.remind_at)));
  const thisWeek = upcoming.filter(
    (r) => !isToday(parseISO(r.remind_at)) && !isTomorrow(parseISO(r.remind_at)) && isThisWeek(parseISO(r.remind_at))
  );
  const later = upcoming.filter(
    (r) => !isToday(parseISO(r.remind_at)) && !isTomorrow(parseISO(r.remind_at)) && !isThisWeek(parseISO(r.remind_at))
  );

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold">Upcoming Reminders</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
          {upcoming.length}
        </span>
      </div>

      <div className="space-y-4">
        {today.length > 0 && (
          <ReminderGroup label="Today" reminders={today} onComplete={completeReminder} onDismiss={dismissReminder} />
        )}
        {tomorrow.length > 0 && (
          <ReminderGroup label="Tomorrow" reminders={tomorrow} onComplete={completeReminder} onDismiss={dismissReminder} />
        )}
        {thisWeek.length > 0 && (
          <ReminderGroup label="This Week" reminders={thisWeek} onComplete={completeReminder} onDismiss={dismissReminder} />
        )}
        {later.length > 0 && (
          <ReminderGroup label="Later" reminders={later.slice(0, 3)} onComplete={completeReminder} onDismiss={dismissReminder} />
        )}
      </div>
    </div>
  );
}

function ReminderGroup({
  label,
  reminders,
  onComplete,
  onDismiss,
}: {
  label: string;
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-2">
        {reminders.map((r) => (
          <ReminderRow key={r.id} reminder={r} onComplete={onComplete} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function ReminderRow({
  reminder,
  onComplete,
  onDismiss,
}: {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isMed = reminder.source_type === "medication";
  const Icon = isMed ? Pill : CalendarDays;
  const time = format(parseISO(reminder.remind_at), "h:mm a");

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
      <div className={`flex-shrink-0 p-2 rounded-lg ${isMed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
        <Icon className={`h-4 w-4 ${isMed ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{reminder.title.replace(/[📅💊]/g, "").trim()}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{time}</span>
          {reminder.body && (
            <span className="text-xs text-muted-foreground truncate">· {reminder.body}</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          onClick={() => onComplete(reminder.id)}
          title="Mark complete"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDismiss(reminder.id)}
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
