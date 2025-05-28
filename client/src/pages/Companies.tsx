import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import CompanyTable from "@/components/CompanyTable";
import AddCompanyModal from "@/components/AddCompanyModal";
import EditCompanyModal from "@/components/EditCompanyModal";
import { CompanyWithDetails, Category, MembershipType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Companies() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMembership, setSelectedMembership] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

  // Fetch companies with filters
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies", { 
      search: searchTerm, 
      categoryId: selectedCategory,
      membershipTypeId: selectedMembership,
      estado: selectedStatus,
      page: currentPage 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      });
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (selectedMembership) params.append("membershipTypeId", selectedMembership);
      if (selectedStatus) params.append("estado", selectedStatus);
      
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

  // Fetch membership types for filter
  const { data: membershipTypes = [] } = useQuery<MembershipType[]>({
    queryKey: ["/api/membership-types"],
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
    console.log("Viewing company:", company);
    toast({
      title: "Ver empresa",
      description: `Mostrando detalles de ${company.nombreEmpresa}`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMembership("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const companies = companiesData?.companies || [];
  const totalPages = companiesData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Directorio de Empresas</h1>
          <p className="text-gray-600 mt-1">Gestiona y visualiza todas las empresas registradas</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nueva Empresa</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros de búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
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

            <Select value={selectedMembership} onValueChange={setSelectedMembership}>
              <SelectTrigger>
                <SelectValue placeholder="Membresía" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las membresías</SelectItem>
                {membershipTypes.map((membership) => (
                  <SelectItem key={membership.id} value={membership.id.toString()}>
                    {membership.nombrePlan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Empresas registradas ({companiesData?.total || 0})
            </CardTitle>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {companiesLoading ? (
            <div className="flex items-center justify-center py-12">
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
                    Mostrando {Math.min((currentPage - 1) * 10 + 1, companiesData?.total || 0)} a{" "}
                    {Math.min(currentPage * 10, companiesData?.total || 0)} de {companiesData?.total || 0} empresas
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
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      if (totalPages <= 5) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    
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
