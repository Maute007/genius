import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, LogOut, User, MessageSquare, Home, CreditCard, Phone, Info, GraduationCap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthHeaderProps {
  scrolled?: boolean;
}

export default function AuthHeader({ scrolled = false }: AuthHeaderProps) {
  const { isAuthenticated, user, logout, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const publicLinks = [
    { label: "Início", href: "/", icon: Home },
    { label: "Planos", href: "/planos", icon: CreditCard },
    { label: "Escolas", href: "/escolas", icon: GraduationCap },
    { label: "Sobre", href: "/sobre", icon: Info },
    { label: "Contactos", href: "/contactos", icon: Phone },
  ];

  const authLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Planos", href: "/planos", icon: CreditCard },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/")}
          >
            <img 
              src={APP_LOGO} 
              alt="Genius" 
              className="h-10 w-auto transition-transform hover:scale-105"
            />
            <span className="text-xl font-bold hidden sm:block">Genius</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => setLocation(link.href)}
                className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <>
                <Button 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => setLocation("/chat")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Abrir Chat
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || "Estudante"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/dashboard?tab=perfil")}>
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Terminar Sessão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => setLocation("/login")}
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => setLocation("/register")}
                >
                  Começar Grátis
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setLocation(link.href);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-primary py-2 transition-colors"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-2 bg-gray-50 rounded-lg mb-3">
                    <p className="font-medium">{user?.name || "Estudante"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                  </div>
                  <Button 
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={() => {
                      setLocation("/chat");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Abrir Chat
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminar Sessão
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setLocation("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={() => {
                      setLocation("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Começar Grátis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
