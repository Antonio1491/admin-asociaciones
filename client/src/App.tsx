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
import Memberships from "@/pages/Memberships";
import Users from "@/pages/Users";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import CompanyDetails from "@/pages/CompanyDetails";
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

function Router() {
  return (
    <Switch>
      {/* Rutas públicas del frontend */}
      <Route path="/directorio" component={Home} />
      <Route path="/empresa/:id" component={CompanyDetails} />
      
      {/* Rutas de administración */}
      <Route path="/login" component={Login} />
      <Route path="/admin">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/companies">
        <ProtectedRoute>
          <AppLayout>
            <Companies />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute>
          <AppLayout>
            <Categories />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/memberships">
        <ProtectedRoute>
          <AppLayout>
            <Memberships />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Users />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Ruta por defecto redirige al directorio público */}
      <Route path="/">
        <Home />
      </Route>
      <Route component={NotFound} />
    </Switch>
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
