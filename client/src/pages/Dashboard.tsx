import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Plus, DollarSign, TrendingUp, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import CompanyTable from "@/components/CompanyTable";
import AddCompanyModal from "@/components/AddCompanyModal";
import EditCompanyModal from "@/components/EditCompanyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyWithDetails, Category, MembershipType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface StatisticsData {
  totalCompanies: number;
  activeUsers: number;
  newRegistrations: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Fetch statistics
  const { data: statistics } = useQuery<StatisticsData>({
    queryKey: ["/api/statistics"],
  });

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies", { 
      search: searchTerm, 
      categoryId: selectedCategory, 
      page: currentPage 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "5"
      });
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      
      const response = await fetch(`/api/companies?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      await apiRequest("DELETE", `/api/companies/${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Empresa eliminada",
        description: "La empresa ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la empresa",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (company: CompanyWithDetails) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDelete = (companyId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta empresa?")) {
      deleteCompanyMutation.mutate(companyId);
    }
  };

  const handleView = (company: CompanyWithDetails) => {
    // For now, just log the company details
    console.log("Viewing company:", company);
    toast({
      title: "Ver empresa",
      description: `Mostrando detalles de ${company.nombreEmpresa}`,
    });
  };

  const companies = companiesData?.companies || [];
  const totalPages = companiesData?.totalPages || 1;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general de la plataforma</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nueva Empresa</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Empresas"
          value={statistics?.totalCompanies || 0}
          icon={Building}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Usuarios Activos"
          value={statistics?.activeUsers || 0}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Nuevos Registros"
          value={statistics?.newRegistrations || 0}
          icon={Activity}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${statistics?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Crecimiento de Empresas</CardTitle>
              <Select defaultValue="6months">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Gráfico de crecimiento</p>
                <p className="text-sm">Implementar Chart.js o similar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <Plus className="text-primary text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nueva empresa registrada</p>
                  <p className="text-xs text-gray-500">Empresa de ejemplo</p>
                  <p className="text-xs text-gray-400">Hace 2 horas</p>
                </div>
              </div>
              {/* Add more activity items as needed */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Directory Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Directorio de Empresas</CardTitle>
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nombreCategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {companiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Cargando empresas...</div>
            </div>
          ) : (
            <>
              <CompanyTable
                companies={companies}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddCompanyModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <EditCompanyModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        company={selectedCompany}
      />
    </div>
  );
}
