import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Crown, Check } from "lucide-react";
import { MembershipType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const membershipSchema = z.object({
  nombrePlan: z.string().min(1, "El nombre del plan es requerido"),
  descripcionPlan: z.string().optional(),
  costo: z.string().min(1, "El costo es requerido"),
  periodicidad: z.string().min(1, "La periodicidad es requerida"),
  beneficios: z.string().optional(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

export default function Memberships() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<MembershipType | null>(null);
  const { toast } = useToast();

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      nombrePlan: "",
      descripcionPlan: "",
      costo: "",
      periodicidad: "",
      beneficios: "",
    },
  });

  const editForm = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      nombrePlan: "",
      descripcionPlan: "",
      costo: "",
      periodicidad: "",
      beneficios: "",
    },
  });

  // Fetch memberships
  const { data: memberships = [], isLoading } = useQuery<MembershipType[]>({
    queryKey: ["/api/membership-types"],
  });

  // Create membership mutation
  const createMembershipMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      const membershipData = {
        ...data,
        beneficios: data.beneficios ? data.beneficios.split('\n').filter(b => b.trim()) : [],
      };
      const response = await apiRequest("POST", "/api/membership-types", membershipData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership-types"] });
      toast({
        title: "Membresía creada",
        description: "El tipo de membresía ha sido creado exitosamente",
      });
      form.reset();
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de membresía",
        variant: "destructive",
      });
    },
  });

  // Update membership mutation
  const updateMembershipMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      if (!selectedMembership) throw new Error("No membership selected");
      const membershipData = {
        ...data,
        beneficios: data.beneficios ? data.beneficios.split('\n').filter(b => b.trim()) : [],
      };
      const response = await apiRequest("PUT", `/api/membership-types/${selectedMembership.id}`, membershipData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership-types"] });
      toast({
        title: "Membresía actualizada",
        description: "El tipo de membresía ha sido actualizado exitosamente",
      });
      editForm.reset();
      setIsEditModalOpen(false);
      setSelectedMembership(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de membresía",
        variant: "destructive",
      });
    },
  });

  // Delete membership mutation
  const deleteMembershipMutation = useMutation({
    mutationFn: async (membershipId: number) => {
      await apiRequest("DELETE", `/api/membership-types/${membershipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership-types"] });
      toast({
        title: "Membresía eliminada",
        description: "El tipo de membresía ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de membresía",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MembershipFormData) => {
    createMembershipMutation.mutate(data);
  };

  const onEditSubmit = (data: MembershipFormData) => {
    updateMembershipMutation.mutate(data);
  };

  const handleEdit = (membership: MembershipType) => {
    setSelectedMembership(membership);
    const beneficiosText = Array.isArray(membership.beneficios) 
      ? membership.beneficios.join('\n') 
      : '';
    
    editForm.reset({
      nombrePlan: membership.nombrePlan,
      descripcionPlan: membership.descripcionPlan || "",
      costo: membership.costo || "",
      periodicidad: membership.periodicidad || "",
      beneficios: beneficiosText,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (membershipId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este tipo de membresía?")) {
      deleteMembershipMutation.mutate(membershipId);
    }
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "enterprise":
        return "bg-orange-100 text-orange-800";
      case "premium":
        return "bg-yellow-100 text-yellow-800";
      case "básico":
      case "basico":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Membresía</h1>
          <p className="text-gray-600 mt-1">Administra los planes de membresía disponibles para las empresas</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Membresía</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Tipo de Membresía</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombrePlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Plan *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Básico, Premium, Enterprise..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 99.00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="periodicidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Periodicidad *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar periodicidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="biannual">Semestral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Plan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción breve del plan de membresía..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beneficios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficios (uno por línea)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Perfil básico&#10;Contacto directo&#10;Listado en directorio"
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMembershipMutation.isPending}>
                    {createMembershipMutation.isPending ? "Creando..." : "Crear Membresía"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Memberships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando tipos de membresía...</div>
          </div>
        ) : memberships.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay tipos de membresía registrados</p>
            <p className="text-gray-400 text-sm">Crea el primer tipo de membresía para comenzar</p>
          </div>
        ) : (
          memberships.map((membership) => (
            <Card key={membership.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{membership.nombrePlan}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(membership)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(membership.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPlanBadgeColor(membership.nombrePlan)}>
                    {membership.nombrePlan}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">
                    ${membership.costo}
                  </span>
                  <span className="text-gray-500">
                    /{membership.periodicidad === 'monthly' ? 'mes' : 
                      membership.periodicidad === 'yearly' ? 'año' :
                      membership.periodicidad === 'quarterly' ? 'trimestre' :
                      membership.periodicidad === 'biannual' ? 'semestre' : membership.periodicidad}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {membership.descripcionPlan && (
                  <p className="text-gray-600 mb-4">{membership.descripcionPlan}</p>
                )}
                
                {Array.isArray(membership.beneficios) && membership.beneficios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Beneficios incluidos:</h4>
                    <ul className="space-y-1">
                      {membership.beneficios.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Membresía</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nombrePlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plan *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Básico, Premium, Enterprise..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="costo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 99.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="periodicidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar periodicidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="biannual">Semestral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="descripcionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Plan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción breve del plan de membresía..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="beneficios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficios (uno por línea)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Perfil básico&#10;Contacto directo&#10;Listado en directorio"
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedMembership(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMembershipMutation.isPending}>
                  {updateMembershipMutation.isPending ? "Actualizando..." : "Actualizar Membresía"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
