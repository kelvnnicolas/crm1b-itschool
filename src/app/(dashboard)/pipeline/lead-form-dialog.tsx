"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { createLead } from "@/actions/leads";

interface LeadFormDialogProps {
  stages: { id: string; name: string }[];
  contacts: { id: string; name: string; email: string | null }[];
}

export function LeadFormDialog({ stages, contacts }: LeadFormDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createLead(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" name="title" placeholder="Ex: Venda de curso Python" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valor (R$)</Label>
        <Input
          id="value"
          name="value"
          type="number"
          step="0.01"
          placeholder="0,00"
          defaultValue="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stage_id">Etapa *</Label>
        <Select name="stage_id" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a etapa" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_id">Contato (opcional)</Label>
        <Select name="contact_id">
          <SelectTrigger>
            <SelectValue placeholder="Selecione um contato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name} {contact.email && `(${contact.email})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Lead"}
        </Button>
      </DialogFooter>
    </form>
  );
}