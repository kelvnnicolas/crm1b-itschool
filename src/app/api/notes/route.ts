import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const formData = await request.formData();

  const content = formData.get("content") as string;
  const entityType = formData.get("entity_type") as string;
  const entityId = formData.get("entity_id") as string;

  if (!content || !entityType || !entityId) {
    return NextResponse.json(
      { error: "Conteúdo, tipo de entidade e ID são obrigatórios" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      content,
      entity_type: entityType,
      entity_id: entityId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}