"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTasks(filters?: { status?: string; assignedTo?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(`
      *,
      assigned_to_profile:profiles!assigned_to(full_name),
      contact:contacts(name),
      lead:leads(title)
    `)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTask(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_to_profile:profiles!assigned_to(full_name),
      contact:contacts(name),
      lead:leads(title)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const entityType = formData.get("entity_type") as string;
  const entityId = formData.get("entity_id") as string;

  if (!title) {
    return { error: "Título é obrigatório" };
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description: description || null,
    due_date: dueDate || null,
    assigned_to: assignedTo || null,
    entity_type: entityType || null,
    entity_id: entityId || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/tarefas");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const status = formData.get("status") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const entityType = formData.get("entity_type") as string;
  const entityId = formData.get("entity_id") as string;

  if (!title) {
    return { error: "Título é obrigatório" };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      status: status || "pending",
      assigned_to: assignedTo || null,
      entity_type: entityType || null,
      entity_id: entityId || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tarefas");
  return { success: true };
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tarefas");
  return { success: true };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tarefas");
  return { success: true };
}