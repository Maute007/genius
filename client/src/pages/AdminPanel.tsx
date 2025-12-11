import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { toast } from "sonner";
import { Users, Shield, TrendingUp, ArrowLeft } from "lucide-react";

const SAMPLE_USERS = [
  { id: 1, name: "João Silva", email: "joao@email.com", role: "user", plan: "free" },
  { id: 2, name: "Maria Santos", email: "maria@email.com", role: "user", plan: "student" },
  { id: 3, name: "Pedro Costa", email: "pedro@email.com", role: "admin", plan: "student_plus" },
];

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [users] = useState(SAMPLE_USERS);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      user: { label: "Usuário", className: "bg-gray-100 text-gray-700" },
      admin: { label: "Admin", className: "bg-blue-100 text-blue-700" },
      super_admin: { label: "Super Admin", className: "bg-purple-100 text-purple-700" },
    };
    const roleConfig = config[role] || config.user;
    return <Badge className={roleConfig.className}>{roleConfig.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const config: Record<string, { label: string; className: string }> = {
      free: { label: "Gratuito", className: "bg-gray-100 text-gray-700" },
      student: { label: "Estudante", className: "bg-green-100 text-green-700" },
      student_plus: { label: "Estudante+", className: "bg-blue-100 text-blue-700" },
      family: { label: "Família", className: "bg-purple-100 text-purple-700" },
    };
    const planConfig = config[plan] || config.free;
    return <Badge className={planConfig.className}>{planConfig.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={APP_LOGO} 
              alt="Genius" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <span className="text-xl font-bold">Genius</span>
            <Badge className="bg-purple-100 text-purple-700 ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">Gerir usuários e configurações do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role !== "user").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Plano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
