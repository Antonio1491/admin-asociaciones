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
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/companies">
        <ProtectedRoute>
          <AppLayout>
            <Companies />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/categories">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Categories />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/memberships">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Memberships />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Users />
          </AppLayout>
        </ProtectedRoute>
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
