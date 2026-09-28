import { getDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, CheckSquare, TrendingUp } from "lucide-react";

const statCards = [
  {
    title: "Contatos",
    icon: Users,
    href: "/contatos",
  },
  {
    title: "Leads",
    icon: Target,
    href: "/pipeline",
  },
  {
    title: "Tarefas",
    icon: CheckSquare,
    href: "/tarefas",
  },
  {
    title: "Pendentes",
    icon: TrendingUp,
    href: "/tarefas",
  },
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statsData = [
    { value: stats.contacts, ...statCards[0] },
    { value: stats.leads, ...statCards[1] },
    { value: stats.tasks, ...statCards[2] },
    { value: stats.pendingTasks, ...statCards[3] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu CRM</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Total cadastrado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lista dos leads mais recentes
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tarefas pendentes para hoje
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}