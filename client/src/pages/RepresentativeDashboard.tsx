import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CreditCard, MessageSquare, Plus, Edit, Eye, CheckCircle, XCircle } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function RepresentativeDashboard() {
  // Obtener empresas del usuario actual
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies/my-companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies/my-companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  // Obtener historial de pagos
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments/my-payments"],
    queryFn: async () => {
      const response = await fetch("/api/payments/my-payments");
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    },
  });

  // Obtener comentarios pendientes
  const { data: pendingReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/opinions/pending-for-my-companies"],
    queryFn: async () => {
      const response = await fetch("/api/opinions/pending-for-my-companies");
      if (!response.ok) throw new Error("Failed to fetch pending reviews");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard del Representante</h1>
              <p className="text-gray-600">Gestiona tu empresa, membresías y comentarios</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empresa
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Empresas"
            value={companies.length}
            icon={Building}
            description="Total de empresas registradas"
          />
          <StatCard
            title="Pagos"
            value={payments.length}
            icon={CreditCard}
            description="Historial de transacciones"
          />
          <StatCard
            title="Comentarios Pendientes"
            value={pendingReviews.length}
            icon={MessageSquare}
            description="Requieren aprobación"
          />
          <StatCard
            title="Estado"
            value="Activo"
            icon={CheckCircle}
            description="Cuenta verificada"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="companies">Mis Empresas</TabsTrigger>
            <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="reviews">Comentarios</TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Cargando empresas...</p>
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tienes empresas registradas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Agrega tu primera empresa para comenzar a gestionar tu presencia en el directorio
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primera Empresa
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company: any) => (
                      <Card key={company.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            {company.logotipoUrl && (
                              <img
                                src={company.logotipoUrl}
                                alt={company.nombreEmpresa}
                                className="w-12 h-12 object-contain rounded-lg border"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold">{company.nombreEmpresa}</h3>
                              <Badge variant="outline">
                                {company.membershipType?.nombrePlan || "Sin membresía"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">{company.descripcionEmpresa}</p>
                            <p className="text-sm text-gray-500">{company.direccionFisica}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Cargando pagos...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay pagos registrados
                    </h3>
                    <p className="text-gray-600">
                      Cuando realices pagos de membresías, aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{payment.membershipType?.nombrePlan}</h4>
                            <p className="text-sm text-gray-600">{payment.company?.nombreEmpresa}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${payment.amount}</p>
                            <Badge 
                              variant={payment.status === 'succeeded' ? 'default' : 'destructive'}
                            >
                              {payment.status === 'succeeded' ? 'Exitoso' : 'Fallido'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comentarios Pendientes de Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Cargando comentarios...</p>
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay comentarios pendientes
                    </h3>
                    <p className="text-gray-600">
                      Los nuevos comentarios de usuarios aparecerán aquí para tu aprobación
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((review: any) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{review.company?.nombreEmpresa}</h4>
                            <p className="text-sm text-gray-600">
                              Calificación: {review.calificacion}/5 estrellas
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comentario}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}