/**
 * Creates scheduled_reminders rows from an AI-generated summary.
 *
 * Called by: summarise, paste-visit (after inserting the visit + action_items + medications)
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SmartReminderDeadline {
  type: "deadline";
  due_in_days: number;
  remind_at_days_before: number[];
  label: string;
}

interface SmartReminderRecurring {
  type: "recurring";
  times: string[]; // ["08:00", "22:00"]
  duration_days: number | null;
  label: string;
}

type SmartReminder = SmartReminderDeadline | SmartReminderRecurring;

interface ActionItemWithReminder {
  description: string;
  category?: string;
  smart_reminder?: SmartReminder;
}

interface MedicationWithReminder {
  name: string;
  dosage?: string;
  frequency?: string;
  smart_reminder?: SmartReminder;
}

interface ReminderInsert {
  user_id: string;
  visit_id: string;
  source_type: "action_item" | "medication";
  source_id: string;
  title: string;
  body: string;
  remind_at: string;
  recurrence: Record<string, unknown> | null;
  status: string;
}

/**
 * Create all scheduled_reminders for a visit's action_items and medications.
 *
 * @param supabase - service-role client
 * @param userId - patient profile id
 * @param visitId - the visit these came from
 * @param visitDate - ISO date string of when the visit occurred
 * @param doctorName - for display in reminder body
 * @param actionItemIds - map of action_item description → inserted row id
 * @param medicationIds - map of medication name → inserted row id
 * @param summary - the parsed AI summary object
 */
export async function createReminders(
  supabase: SupabaseClient,
  userId: string,
  visitId: string,
  visitDate: string,
  doctorName: string,
  actionItemIds: Map<string, string>,
  medicationIds: Map<string, string>,
  summary: Record<string, unknown>,
): Promise<{ created: number; errors: string[] }> {
  const reminders: ReminderInsert[] = [];
  const errors: string[] = [];

  const baseDate = new Date(visitDate || new Date().toISOString());

  // --- Action items with deadline reminders ---
  const actionItems = Array.isArray(summary.action_items)
    ? (summary.action_items as ActionItemWithReminder[])
    : [];

  for (const item of actionItems) {
    if (!item.smart_reminder || item.smart_reminder.type !== "deadline") continue;

    const sr = item.smart_reminder as SmartReminderDeadline;
    const sourceId = actionItemIds.get(item.description);
    if (!sourceId) continue;

    const deadlineDate = new Date(baseDate);
    deadlineDate.setDate(deadlineDate.getDate() + (sr.due_in_days || 28));

    const remindDaysBefore = sr.remind_at_days_before || [14, 7, 1];

    for (const daysBefore of remindDaysBefore) {
      const remindDate = new Date(deadlineDate);
      remindDate.setDate(remindDate.getDate() - daysBefore);

      // Set to 9am for deadline reminders
      remindDate.setHours(9, 0, 0, 0);

      // Don't create reminders in the past
      if (remindDate <= new Date()) continue;

      const daysWord = daysBefore === 1 ? "tomorrow" : `in ${daysBefore} days`;
      const weeksWord = daysBefore >= 7 ? ` (${Math.round(daysBefore / 7)} week${daysBefore >= 14 ? "s" : ""})` : "";

      reminders.push({
        user_id: userId,
        visit_id: visitId,
        source_type: "action_item",
        source_id: sourceId,
        title: `📅 ${sr.label || item.description}`,
        body: `Reminder: ${doctorName} recommended this ${daysWord}${weeksWord}. Tap to view or mark complete.`,
        remind_at: remindDate.toISOString(),
        recurrence: null,
        status: "pending",
      });
    }
  }

  // --- Medications with recurring reminders ---
  const medications = Array.isArray(summary.medications)
    ? (summary.medications as MedicationWithReminder[])
    : [];

  for (const med of medications) {
    if (!med.smart_reminder || med.smart_reminder.type !== "recurring") continue;

    const sr = med.smart_reminder as SmartReminderRecurring;
    const sourceId = medicationIds.get(med.name);
    if (!sourceId) continue;

    const times = sr.times || ["08:00"];
    const durationDays = sr.duration_days ?? 30; // default 30 days if null/ongoing
    const maxDays = Math.min(durationDays, 90); // cap at 90 days of pre-generated reminders

    // Generate individual reminder rows for each day + time
    // For long-running meds, we generate the first 14 days and the cron will extend
    const generateDays = Math.min(maxDays, 14);

    for (let day = 0; day < generateDays; day++) {
      for (const time of times) {
        const [hours, minutes] = time.split(":").map(Number);
        const remindDate = new Date(baseDate);
        remindDate.setDate(remindDate.getDate() + day);
        remindDate.setHours(hours || 22, minutes || 0, 0, 0);

        // Don't create reminders in the past
        if (remindDate <= new Date()) continue;

        const timeLabel = remindDate.toLocaleTimeString("en-AU", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        reminders.push({
          user_id: userId,
          visit_id: visitId,
          source_type: "medication",
          source_id: sourceId,
          title: `💊 ${sr.label || `Take ${med.name}`}`,
          body: `${med.dosage ? med.dosage + " — " : ""}${timeLabel} dose${med.frequency ? " (" + med.frequency + ")" : ""}`,
          remind_at: remindDate.toISOString(),
          recurrence: durationDays > generateDays
            ? { type: "daily", times, until: new Date(baseDate.getTime() + durationDays * 86400000).toISOString().slice(0, 10), generated_through_day: generateDays }
            : null,
          status: "pending",
        });
      }
    }
  }

  // Batch insert
  if (reminders.length > 0) {
    const { error } = await supabase.from("scheduled_reminders").insert(reminders);
    if (error) {
      errors.push(`scheduled_reminders insert failed: ${error.message}`);
      console.error("scheduled_reminders insert error:", error.message);
    }
  }

  return { created: reminders.length, errors };
}
