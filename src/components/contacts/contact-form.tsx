"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  initialData?: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  action: (formData: FormData) => Promise<{ error?: string }>;
}

export function ContactForm({ initialData, action }: ContactFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
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
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nome completo"
          defaultValue={initialData?.name || ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          defaultValue={initialData?.email || ""}
        />
        <p className="text-sm text-muted-foreground">Email para contato</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          defaultValue={initialData?.phone || ""}
        />
        <p className="text-sm text-muted-foreground">Telefone com DDD</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input
          id="company"
          name="company"
          placeholder="Nome da empresa"
          defaultValue={initialData?.company || ""}
        />
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