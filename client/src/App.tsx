import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import Categories from "@/pages/Categories";
import MembershipsNew from "@/pages/MembershipsNew";
import Users from "@/pages/Users";
import Certificates from "@/pages/Certificates";
import Roles from "@/pages/Roles";
import OpinionsAdmin from "@/pages/OpinionsAdmin";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import CompanyDetails from "@/pages/CompanyDetails";
import PublicMemberships from "@/pages/PublicMemberships";
import Directory from "@/pages/Directory";
import MembershipCheckout from "@/pages/MembershipCheckout";
import RepresentativeRegister from "@/pages/RepresentativeRegister";
import RepresentativeLogin from "@/pages/RepresentativeLogin";
import RepresentativeDashboard from "@/pages/RepresentativeDashboard";
import SystemSettings from "@/pages/SystemSettings";
import MainNavigation from "@/components/MainNavigation";
import TestHome from "@/TestHome";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64">
        <div className="p-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <main>
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <div>
      <Route path="/login">
        <Login />
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/empresas">
        <ProtectedRoute>
          <AppLayout>
            <Companies />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/categorias">
        <ProtectedRoute>
          <AppLayout>
            <Categories />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/membresias">
        <ProtectedRoute>
          <AppLayout>
            <MembershipsNew />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/usuarios">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Users />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/certificados">
        <ProtectedRoute>
          <AppLayout>
            <Certificates />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/roles">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Roles />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/opiniones">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <OpinionsAdmin />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/empresa/:id">
        <PublicLayout>
          <CompanyDetails />
        </PublicLayout>
      </Route>
      
      <Route path="/checkout/:companyId/:membershipTypeId">
        <PublicLayout>
          <MembershipCheckout />
        </PublicLayout>
      </Route>
      
      <Route path="/checkout-plan/:membershipTypeId">
        <PublicLayout>
          <MembershipCheckout />
        </PublicLayout>
      </Route>
      
      <Route path="/registro-representante">
        <PublicLayout>
          <RepresentativeRegister />
        </PublicLayout>
      </Route>
      
      <Route path="/login-representante">
        <PublicLayout>
          <RepresentativeLogin />
        </PublicLayout>
      </Route>
      
      <Route path="/dashboard-representante">
        <ProtectedRoute>
          <AppLayout>
            <RepresentativeDashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/directorio">
        <PublicLayout>
          <Directory />
        </PublicLayout>
      </Route>
      
      <Route path="/planes">
        <PublicLayout>
          <PublicMemberships />
        </PublicLayout>
      </Route>
      
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
