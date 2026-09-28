"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getContacts(search?: string, page = 1, pageSize = 10) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    contacts: data ?? [],
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getContact(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;

  if (!name) {
    return { error: "Nome é obrigatório" };
  }

  const { error } = await supabase.from("contacts").insert({
    name,
    email: email || null,
    phone: phone || null,
    company: company || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/contatos");
  redirect("/contatos");
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;

  if (!name) {
    return { error: "Nome é obrigatório" };
  }

  const { error } = await supabase
    .from("contacts")
    .update({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/contatos");
  redirect("/contatos");
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/contatos");
  return { success: true };
}