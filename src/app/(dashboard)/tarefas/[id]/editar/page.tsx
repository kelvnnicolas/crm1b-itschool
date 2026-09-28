import { getTask, updateTask } from "@/actions/tasks";
import { getProfilesForSelect } from "@/actions/profiles-select";
import { getContactsForSelect } from "@/actions/contacts-select";
import { getLeads } from "@/actions/leads";
import { TaskForm } from "@/components/tasks/task-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const [task, profiles, contacts, leads] = await Promise.all([
    getTask(id),
    getProfilesForSelect(),
    getContactsForSelect(),
    getLeads(),
  ]);

  if (!task) {
    notFound();
  }

  const contactsForSelect = contacts.map((c) => ({ id: c.id, name: c.name }));
  const leadsForSelect = leads.map((l) => ({ id: l.id, title: l.title }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Tarefa</h1>
        <p className="text-muted-foreground">Atualize as informações da tarefa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            initialData={{
              title: task.title,
              description: task.description || "",
              due_date: task.due_date || "",
              status: task.status,
              assigned_to: task.assigned_to || "",
              entity_type: task.entity_type || "",
              entity_id: task.entity_id || "",
            }}
            action={(formData) => updateTask(id, formData)}
            profiles={profiles}
            contacts={contactsForSelect}
            leads={leadsForSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}