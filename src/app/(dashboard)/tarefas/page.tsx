import { getTasks, updateTaskStatus, deleteTask } from "@/actions/tasks";
import { getProfilesForSelect } from "@/actions/profiles-select";
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
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TasksClient } from "./tasks-client";

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  completed: { label: "Concluída", variant: "default" as const, icon: CheckCircle2 },
  cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
};

interface TasksPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { status, page = "1" } = await searchParams;
  const pageNum = parseInt(page, 10) || 1;

  const [tasks, profiles] = await Promise.all([
    getTasks({ status: status !== "all" ? status : undefined }),
    getProfilesForSelect(),
  ]);

  return (
    <TasksClient
      initialTasks={tasks}
      initialProfiles={profiles}
      currentStatus={status || "all"}
      currentPage={pageNum}
    />
  );
}