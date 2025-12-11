import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Revision from "./pages/Revision";
import ExamPrep from "./pages/ExamPrep";
import Planos from "./pages/Planos";
import Checkout from "./pages/Checkout";
import AdminPanel from "./pages/AdminPanel";
import ParaEscolas from "./pages/ParaEscolas";
import SobreNos from "./pages/SobreNos";
import Contactos from "./pages/Contactos";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/planos" component={Planos} />
      <Route path="/escolas" component={ParaEscolas} />
      <Route path="/sobre" component={SobreNos} />
      <Route path="/contactos" component={Contactos} />
      
      {/* Public Only Routes (redirect if authenticated) */}
      <Route path="/login">
        <PublicOnlyRoute redirectTo="/chat">
          <Login />
        </PublicOnlyRoute>
      </Route>
      <Route path="/register">
        <PublicOnlyRoute redirectTo="/chat">
          <Register />
        </PublicOnlyRoute>
      </Route>
      <Route path="/verify-email" component={VerifyEmail} />
      
      {/* Protected Routes (require authentication) */}
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/chat">
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/revision">
        <ProtectedRoute>
          <Revision />
        </ProtectedRoute>
      </Route>
      <Route path="/exam-prep">
        <ProtectedRoute>
          <ExamPrep />
        </ProtectedRoute>
      </Route>
      
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

