import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Building, 
  BarChart3, 
  Users, 
  Tags, 
  Crown, 
  FileText,
  Award,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Shield,
  MessageSquare
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
    href: "/dashboard",
    icon: BarChart3,
    requireAdmin: false,
  },
  {
    name: "Directorio de Empresas",
    href: "/empresas",
    icon: Building,
    requireAdmin: false,
    subItems: [
      {
        name: "Empresas",
        href: "/empresas",
        requireAdmin: false,
      },
      {
        name: "Categorías",
        href: "/categorias",
        requireAdmin: false,
      },
      {
        name: "Membresías",
        href: "/membresias",
        requireAdmin: false,
      },
      {
        name: "Certificados",
        href: "/certificados",
        requireAdmin: false,
      },
      {
        name: "Gestión de Opiniones",
        href: "/opiniones",
        requireAdmin: true,
      },
    ],
  },
  {
    name: "Gestión de Usuarios",
    href: "/usuarios",
    icon: Users,
    requireAdmin: true,
  },
  {
    name: "Roles del Sistema",
    href: "/roles",
    icon: Shield,
    requireAdmin: true,
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: FileText,
    requireAdmin: true,
  },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-medium text-gray-800">AdminPlat</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.name);
          const isSubItemActive = hasSubItems && item.subItems.some(subItem => location === subItem.href);
          
          return (
            <div key={item.name}>
              {/* Main Item */}
              {hasSubItems ? (
                <div
                  className={`flex items-center space-x-3 px-3 py-2 rounded-sm transition-colors cursor-pointer ${
                    isActive || isSubItemActive
                      ? "bg-gray-100 text-gray-900 border-r-2 border-gray-800"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                  onClick={() => toggleExpanded(item.name)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <div
                    className={`flex items-center space-x-3 px-3 py-2 rounded-sm transition-colors cursor-pointer ${
                      isActive
                        ? "bg-gray-100 text-gray-900 border-r-2 border-gray-800"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )}
              
              {/* Sub Items */}
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.filter(subItem => !subItem.requireAdmin || isAdmin).map((subItem) => {
                    const isSubActive = location === subItem.href;
                    
                    return (
                      <Link key={subItem.name} href={subItem.href}>
                        <div
                          className={`flex items-center space-x-3 px-3 py-2 rounded-sm transition-colors cursor-pointer ${
                            isSubActive
                              ? "bg-gray-100 text-gray-900 border-r-2 border-gray-800"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>{subItem.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
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
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex w-64 bg-white shadow-sm border-r border-gray-100 fixed h-full overflow-y-auto flex-col ${className}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
