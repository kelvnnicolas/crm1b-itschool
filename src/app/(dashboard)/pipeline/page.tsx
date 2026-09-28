import { getLeadStages, getLeads, moveLead } from "@/actions/leads";
import { Plus, GripVertical, DollarSign, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getContactsForSelect } from "@/actions/contacts-select";
import { LeadFormDialog } from "./lead-form-dialog";

export default async function PipelinePage() {
  const [stages, leads, contacts] = await Promise.all([
    getLeadStages(),
    getLeads(),
    getContactsForSelect(),
  ]);

  const leadsByStage = leads.reduce((acc, lead) => {
    if (!acc[lead.stage_id]) acc[lead.stage_id] = [];
    acc[lead.stage_id].push(lead);
    return acc;
  }, {} as Record<string, typeof leads>);

  const stageColors: Record<string, string> = {
    "0": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "1": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    "2": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "3": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    "4": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus leads no formato Kanban</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <LeadFormDialog stages={stages} contacts={contacts} />
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-4"
        role="list"
        aria-label="Pipeline stages"
      >
        {stages.map((stage, index) => {
          const stageLeads = leadsByStage[stage.id] || [];
          const colorClass = stageColors[index % Object.keys(stageColors).length];

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 min-w-80"
              role="listitem"
              aria-label={`Etapa: ${stage.name}, ${stageLeads.length} leads`}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                        {stage.name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        ({stageLeads.length})
                      </span>
                    </CardTitle>
                    <span className="text-sm font-medium text-primary">
                      R$ {stageLeads.reduce((sum: number, l: typeof leads[0]) => sum + (l.value || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-3 min-h-[400px]">
                    {stageLeads.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        Nenhum lead nesta etapa
                      </p>
                    ) : (
                      stageLeads.map((lead: typeof leads[0]) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onMove={(newStageId) => moveLead(lead.id, newStageId)}
                          stages={stages}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onMove,
  stages,
}: {
  lead: {
    id: string;
    title: string;
    value: number | null;
    contact: { name: string; email: string | null; phone: string | null } | null;
    stage_id: string;
  };
  onMove: (stageId: string) => Promise<{ error?: string }>;
  stages: { id: string; name: string }[];
}) {
  const currentStageIndex = stages.findIndex((s) => s.id === lead.stage_id);
  const canMoveForward = currentStageIndex < stages.length - 1;
  const canMoveBackward = currentStageIndex > 0;

  return (
    <div
      className="bg-background border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
      draggable
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm flex-1">{lead.title}</h4>
        <button className="text-muted-foreground hover:text-foreground p-1">
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {lead.value && lead.value > 0 && (
        <div className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <DollarSign className="h-3 w-3" />
          <span>{lead.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      )}

      {lead.contact && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{lead.contact.name}</span>
          </div>
          {lead.contact.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{lead.contact.email}</span>
            </div>
          )}
          {lead.contact.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{lead.contact.phone}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-1">
        {canMoveBackward && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMove(stages[currentStageIndex - 1].id)}
          >
            ← Voltar
          </Button>
        )}
        {canMoveForward && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onMove(stages[currentStageIndex + 1].id)}
          >
            Avançar →
          </Button>
        )}
      </div>
    </div>
  );
}