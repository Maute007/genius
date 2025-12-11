import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const pendingEmail = localStorage.getItem("genius_pending_email");
    const userData = localStorage.getItem("genius_user");
    
    if (pendingEmail) {
      setUserEmail(pendingEmail);
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
      } catch {
        // ignore
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !isVerifying && !verified) {
      setIsVerifying(true);
      setTimeout(() => {
        localStorage.removeItem("genius_pending_email");
        setVerified(true);
        toast.success("Email verificado com sucesso!");
        setTimeout(() => setLocation("/chat"), 2000);
      }, 1500);
    }
  }, [isVerifying, verified, setLocation]);

  const handleResendEmail = () => {
    if (!userEmail) {
      toast.error("Email não encontrado. Por favor, volta ao registo.");
      setLocation("/register");
      return;
    }
    toast.success("Email reenviado!");
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-700 mb-2">Email Verificado!</h1>
          <p className="text-gray-600 mb-4">A tua conta foi ativada com sucesso.</p>
          <Button disabled className="w-full">Redirecionando...</Button>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">A verificar email...</h1>
          <p className="text-gray-600">Por favor, aguarda.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-16 mx-auto mb-4 cursor-pointer"
            onClick={() => setLocation("/")}
          />
          <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifica o teu Email</h1>
          <p className="text-gray-600">
            Enviámos um link de verificação para o teu email.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Não recebeste o email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verifica a pasta de spam</li>
                  <li>Aguarda alguns minutos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleResendEmail} variant="outline" className="w-full">
            Reenviar Email
          </Button>
          <Button onClick={() => setLocation("/login")} variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
