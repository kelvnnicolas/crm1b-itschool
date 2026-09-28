"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: contactsCount },
    { count: leadsCount },
    { count: tasksCount },
    { count: pendingTasksCount },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    contacts: contactsCount ?? 0,
    leads: leadsCount ?? 0,
    tasks: tasksCount ?? 0,
    pendingTasks: pendingTasksCount ?? 0,
  };
}