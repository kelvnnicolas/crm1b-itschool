"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getLeadStages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_stages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeads() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      contact:contacts(*),
      stage:lead_stages(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function moveLead(leadId: string, stageId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage_id: stageId })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { success: true };
}

export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const stageId = formData.get("stage_id") as string;
  const contactId = formData.get("contact_id") as string;

  if (!title || !stageId) {
    return { error: "Título e etapa são obrigatórios" };
  }

  const { error } = await supabase.from("leads").insert({
    title,
    value,
    stage_id: stageId,
    contact_id: contactId || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { success: true };
}

export async function updateLead(leadId: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const stageId = formData.get("stage_id") as string;
  const contactId = formData.get("contact_id") as string;

  if (!title || !stageId) {
    return { error: "Título e etapa são obrigatórios" };
  }

  const { error } = await supabase
    .from("leads")
    .update({
      title,
      value,
      stage_id: stageId,
      contact_id: contactId || null,
    })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { success: true };
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { success: true };
}