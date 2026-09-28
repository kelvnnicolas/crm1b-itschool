"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProfilesForSelect() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}