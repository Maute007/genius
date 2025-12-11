import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { PlanBadge } from "@/components/PlanBadge";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  TrendingUp, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Crown,
  Loader2
} from "lucide-react";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Queries
  const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: stats } = trpc.admin.getUserStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Mutations
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Nível de acesso atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePlanMutation = trpc.admin.updateUserPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRoleChange = (userId: number, newRole: "user" | "admin" | "super_admin") => {
    if (confirm(`Tem certeza que deseja alterar o nível de acesso deste usuário?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handlePlanChange = (userId: number, newPlan: "free" | "student" | "student_plus" | "family") => {
    if (confirm(`Tem certeza que deseja alterar o plano deste usuário?`)) {
      updatePlanMutation.mutate({ userId, plan: newPlan });
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      user: { label: "Usuário", className: "bg-gray-100 text-gray-700" },
      admin: { label: "Admin", className: "bg-blue-100 text-blue-700" },
      super_admin: { label: "Super Admin", className: "bg-purple-100 text-purple-700" },
    };
    const roleConfig = config[role as keyof typeof config] || config.user;
    return (
      <Badge className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={APP_LOGO} 
              alt="Genius" 
              className="h-10 w-auto cursor-pointer transition-transform hover:scale-105"
              onClick={() => setLocation("/")}
            />
            <span className="text-xl font-bold">Genius</span>
            <Badge className="bg-purple-100 text-purple-700 ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/chat")}>
              Abrir Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10" />
            Painel de Administração
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie usuários, planos e permissões
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.verified} verificados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Super Admins
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byRole.super_admin}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.byRole.admin} admins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assinaturas Ativas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total - stats.active} inativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planos Premium
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byPlan.student + stats.byPlan.student_plus + stats.byPlan.family}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.byPlan.free} gratuitos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível de Acesso</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: any) => handleRoleChange(user.id, value)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.plan}
                            onValueChange={(value: any) => handlePlanChange(user.id, value)}
                            disabled={updatePlanMutation.isPending}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Gratuito</SelectItem>
                              <SelectItem value="student">Estudante</SelectItem>
                              <SelectItem value="student_plus">Estudante+</SelectItem>
                              <SelectItem value="family">Família</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.lastSignedIn).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-xs">
                            ID: {user.id}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
