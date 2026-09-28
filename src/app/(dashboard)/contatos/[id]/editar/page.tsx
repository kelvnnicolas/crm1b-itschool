import { getContact, updateContact } from "@/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Contato</h1>
        <p className="text-muted-foreground">Atualize as informações do contato</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            initialData={{
              name: contact.name,
              email: contact.email || "",
              phone: contact.phone || "",
              company: contact.company || "",
            }}
            action={(formData) => updateContact(id, formData)}
          />
        </CardContent>
      </Card>
    </div>
  );
}