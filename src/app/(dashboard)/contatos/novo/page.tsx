import { createContact } from "@/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Contato</h1>
        <p className="text-muted-foreground">Cadastre um novo contato</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm action={createContact} />
        </CardContent>
      </Card>
    </div>
  );
}