import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/verify-email");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      // Save token and user data
      localStorage.setItem("genius_token", data.token);
      localStorage.setItem("genius_user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      }));
      
      // Clean up pending email
      localStorage.removeItem("genius_pending_email");
      
      setVerified(true);
      toast.success(data.message);
      
      // Redirect to onboarding after 2 seconds
      setTimeout(() => {
        setLocation("/onboarding");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsVerifying(false);
    },
  });

  const resendEmailMutation = trpc.auth.resendVerificationEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    // Try to get email from different sources
    const userData = localStorage.getItem("genius_user");
    const pendingEmail = localStorage.getItem("genius_pending_email");
    
    if (pendingEmail) {
      setUserEmail(pendingEmail);
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
      } catch (e) {
        // If parsing fails, user will need to enter email manually
      }
    }

    // Check if there's a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !isVerifying && !verified) {
      setIsVerifying(true);
      verifyMutation.mutate({ token });
    }
  }, [isVerifying, verified]);

  const handleResendEmail = () => {
    if (!userEmail) {
      // If we don't have the email, ask user to provide it or go back to register
      toast.error("Email não encontrado. Por favor, volta ao registo.");
      setLocation("/register");
      return;
    }
    
    resendEmailMutation.mutate({ email: userEmail });
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Email Verificado!
          </h1>
          <p className="text-gray-600 mb-4">
            A tua conta foi ativada com sucesso. Serás redirecionado para completar o teu perfil.
          </p>
          <div className="animate-pulse">
            <Button disabled className="w-full">
              Redirecionando...
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            A verificar email...
          </h1>
          <p className="text-gray-600">
            Por favor, aguarda enquanto verificamos a tua conta.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-16 mx-auto mb-4 cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifica o teu Email
          </h1>
          <p className="text-gray-600">
            Enviámos um link de verificação para o teu email. Clica no link para ativar a tua conta.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Não recebeste o email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verifica a pasta de spam/lixo</li>
                  <li>Confirma que inseriste o email correto</li>
                  <li>Aguarda alguns minutos (pode demorar)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            disabled={resendEmailMutation.isPending}
          >
            {resendEmailMutation.isPending ? "A reenviar..." : "Reenviar Email"}
          </Button>

          <Button
            onClick={() => setLocation("/login")}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Precisas de ajuda?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={() => setLocation("/contactos")}
            >
              Contacta-nos
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}