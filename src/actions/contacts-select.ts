"use server";

import { createClient } from "@/lib/supabase/server";

export async function getContactsForSelect() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, email, company")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}