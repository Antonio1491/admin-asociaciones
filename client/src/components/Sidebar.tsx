import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Building, 
  BarChart3, 
  Users, 
  Tags, 
  Crown, 
  FileText,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    requireAdmin: false,
  },
  {
    name: "Directorio de Empresas",
    href: "/companies",
    icon: Building,
    requireAdmin: false,
  },
  {
    name: "Gestión de Usuarios",
    href: "/users",
    icon: Users,
    requireAdmin: true,
  },
  {
    name: "Categorías",
    href: "/categories",
    icon: Tags,
    requireAdmin: true,
  },
  {
    name: "Tipos de Membresía",
    href: "/memberships",
    icon: Crown,
    requireAdmin: true,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: FileText,
    requireAdmin: true,
  },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.requireAdmin || isAdmin
  );

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">AdminPlat</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-surface shadow-lg border-r border-gray-200 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex w-64 bg-surface shadow-lg border-r border-gray-200 fixed h-full overflow-y-auto flex-col ${className}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
