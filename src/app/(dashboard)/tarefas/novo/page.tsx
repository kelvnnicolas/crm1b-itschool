import { createTask } from "@/actions/tasks";
import { getProfilesForSelect } from "@/actions/profiles-select";
import { getContactsForSelect } from "@/actions/contacts-select";
import { getLeads } from "@/actions/leads";
import { TaskForm } from "@/components/tasks/task-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewTaskPage() {
  const [profiles, contacts, leads] = await Promise.all([
    getProfilesForSelect(),
    getContactsForSelect(),
    getLeads(),
  ]);

  const contactsForSelect = contacts.map((c) => ({ id: c.id, name: c.name }));
  const leadsForSelect = leads.map((l) => ({ id: l.id, title: l.title }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Tarefa</h1>
        <p className="text-muted-foreground">Crie uma nova tarefa ou atividade</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            action={createTask}
            profiles={profiles}
            contacts={contactsForSelect}
            leads={leadsForSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}