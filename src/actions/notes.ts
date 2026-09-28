"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotes(filters?: { entityType?: string; entityId?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select(`
      *,
      author:profiles!created_by(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filters?.entityType && filters?.entityId) {
    query = query
      .eq("entity_type", filters.entityType)
      .eq("entity_id", filters.entityId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createNote(formData: FormData) {
  const supabase = await createClient();

  const content = formData.get("content") as string;
  const entityType = formData.get("entity_type") as string;
  const entityId = formData.get("entity_id") as string;

  if (!content || !entityType || !entityId) {
    return { error: "Conteúdo, tipo de entidade e ID são obrigatórios" };
  }

  const { error } = await supabase.from("notes").insert({
    content,
    entity_type: entityType,
    entity_id: entityId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/contatos`);
  revalidatePath(`/pipeline`);
  revalidatePath(`/tarefas`);
  return { success: true };
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient();

  const content = formData.get("content") as string;

  if (!content) {
    return { error: "Conteúdo é obrigatório" };
  }

  const { error } = await supabase
    .from("notes")
    .update({ content })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/contatos`);
  revalidatePath(`/pipeline`);
  revalidatePath(`/tarefas`);
  return { success: true };
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/contatos`);
  revalidatePath(`/pipeline`);
  revalidatePath(`/tarefas`);
  return { success: true };
}