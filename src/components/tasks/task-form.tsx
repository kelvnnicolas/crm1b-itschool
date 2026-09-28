"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFormProps {
  initialData?: {
    title: string;
    description: string;
    due_date: string;
    status: string;
    assigned_to: string;
    entity_type: string;
    entity_id: string;
  };
  action: (formData: FormData) => Promise<{ error?: string }>;
  profiles: { id: string; full_name: string | null }[];
  contacts: { id: string; name: string }[];
  leads: { id: string; title: string }[];
}

export function TaskForm({ initialData, action, profiles, contacts, leads }: TaskFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityType, setEntityType] = useState<string>(initialData?.entity_type || "");
  const [entityId, setEntityId] = useState<string>(initialData?.entity_id || "");
  const [status, setStatus] = useState<string>(initialData?.status || "pending");
  const [assignedTo, setAssignedTo] = useState<string>(initialData?.assigned_to || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("entity_type", entityType);
    formData.set("entity_id", entityId);
    formData.set("status", status);
    formData.set("assigned_to", assignedTo);

    const result = await action(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Título da tarefa"
          defaultValue={initialData?.title || ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detalhes da tarefa"
          defaultValue={initialData?.description || ""}
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={initialData?.due_date?.split("T")[0] || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v: unknown) => setStatus((v as string | null) || "pending")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Responsável</Label>
        <Select value={assignedTo} onValueChange={(v: unknown) => setAssignedTo((v as string | null) || "")}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Relacionado a (opcional)</Label>
        <div className="space-y-2">
          <Select value={entityType} onValueChange={(v: unknown) => {
            setEntityType((v as string | null) || "");
            setEntityId("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de relacionamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              <SelectItem value="contact">Contato</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>

          {entityType === "contact" && (
            <Select value={entityId} onValueChange={(v: unknown) => setEntityId((v as string | null) || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {entityType === "lead" && (
            <Select value={entityId} onValueChange={(v: unknown) => setEntityId((v as string | null) || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}