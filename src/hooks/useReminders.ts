/**
 * useReminders — Fetch and manage the patient's scheduled reminders.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Reminder {
  id: string;
  user_id: string;
  visit_id: string | null;
  source_type: "action_item" | "medication";
  source_id: string | null;
  title: string;
  body: string;
  remind_at: string;
  recurrence: Record<string, unknown> | null;
  status: string;
  sent_at: string | null;
  created_at: string | null;
}

export function useReminders() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReminders = async () => {
      const { data } = await supabase
        .from("scheduled_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gte("remind_at", new Date().toISOString())
        .order("remind_at", { ascending: true })
        .limit(50);

      setUpcoming((data as Reminder[]) ?? []);
      setLoading(false);
    };

    fetchReminders();

    // Subscribe to changes
    const channel = supabase
      .channel("reminders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_reminders",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchReminders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const dismissReminder = async (id: string) => {
    await supabase.from("scheduled_reminders").update({ status: "dismissed" }).eq("id", id);
    setUpcoming((prev) => prev.filter((r) => r.id !== id));
  };

  const completeReminder = async (id: string) => {
    const reminder = upcoming.find((r) => r.id === id);
    await supabase.from("scheduled_reminders").update({ status: "completed" }).eq("id", id);

    // Also complete the source item
    if (reminder?.source_type === "action_item" && reminder.source_id) {
      await supabase.from("action_items").update({
        status: "complete",
        completed_at: new Date().toISOString(),
      }).eq("id", reminder.source_id);
    }

    setUpcoming((prev) => prev.filter((r) => r.id !== id));
  };

  return { upcoming, loading, dismissReminder, completeReminder };
}
