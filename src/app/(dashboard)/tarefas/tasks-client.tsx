"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus, MoreVertical, CheckCircle2, Clock, XCircle, Calendar, User, Building2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { updateTaskStatus, deleteTask } from "@/actions/tasks";

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  completed: { label: "Concluída", variant: "default" as const, icon: CheckCircle2 },
  cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
};

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to_profile: { full_name: string | null } | null;
  contact: { name: string } | null;
  lead: { title: string } | null;
  entity_type: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
}

interface TasksClientProps {
  initialTasks: Task[];
  initialProfiles: Profile[];
  currentStatus: string;
  currentPage: number;
}

export function TasksClient({ initialTasks, initialProfiles, currentStatus, currentPage }: TasksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: unknown) => {
    const v = (value as string | null) || "all";
    const params = new URLSearchParams(searchParams.toString());
    if (v === "all") {
      params.delete("status");
    } else {
      params.set("status", v);
    }
    params.delete("page");
    router.push(`/tarefas?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas e atividades</p>
        </div>
        <Link href="/tarefas/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <form className="flex-1 max-w-md">
          <Input
            type="search"
            name="search"
            placeholder="Pesquisar tarefas..."
            className="h-9"
          />
        </form>
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableCaption>Lista de tarefas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Relacionado a</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
              </TableCell>
            </TableRow>
          ) : (
            initialTasks.map((task) => {
              const config = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
              const Icon = config.icon;
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === "pending";

              return (
                <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <span className={isOverdue ? "text-destructive font-medium" : ""}>
                        <Calendar className="inline mr-1 h-3 w-3" />
                        {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        {isOverdue && " (atrasada)"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.assigned_to_profile ? (
                      <>
                        <User className="inline mr-1 h-3 w-3" />
                        {task.assigned_to_profile.full_name}
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.entity_type === "contact" && task.contact ? (
                      <>
                        <Building2 className="inline mr-1 h-3 w-3" />
                        {task.contact.name}
                      </>
                    ) : task.entity_type === "lead" && task.lead ? (
                      <>
                        <Target className="inline mr-1 h-3 w-3" />
                        {task.lead.title}
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        {task.status !== "completed" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              const result = await updateTaskStatus(task.id, "completed");
                              if (result.error) alert(result.error);
                              else window.location.reload();
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar como Concluída
                          </DropdownMenuItem>
                        )}
                        {task.status !== "pending" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              const result = await updateTaskStatus(task.id, "pending");
                              if (result.error) alert(result.error);
                              else window.location.reload();
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Reabrir
                          </DropdownMenuItem>
                        )}
                        {task.status !== "cancelled" && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              const result = await updateTaskStatus(task.id, "cancelled");
                              if (result.error) alert(result.error);
                              else window.location.reload();
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/tarefas/${task.id}/editar`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={async () => {
                            if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                              const result = await deleteTask(task.id);
                              if (result.error) alert(result.error);
                              else window.location.reload();
                            }
                          }}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}