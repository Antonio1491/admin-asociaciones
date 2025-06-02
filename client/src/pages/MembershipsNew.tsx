import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Crown, Check, X } from "lucide-react";
import { MembershipType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Swal from 'sweetalert2';

const membershipSchema = z.object({
  nombrePlan: z.string().min(1, "El nombre del plan es requerido"),
  descripcionPlan: z.string().optional(),
  opcionesPrecios: z.array(z.object({
    periodicidad: z.string().min(1, "La periodicidad es requerida"),
    costo: z.number().min(0, "El costo debe ser mayor a 0")
  })).min(1, "Debe agregar al menos una opción de precio"),
  beneficios: z.string().optional(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

export default function MembershipsNew() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<MembershipType | null>(null);
  const { toast } = useToast();

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      nombrePlan: "",
      descripcionPlan: "",
      opcionesPrecios: [{ periodicidad: "", costo: 0 }],
      beneficios: "",
    },
  });

  const editForm = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      nombrePlan: "",
      descripcionPlan: "",
      opcionesPrecios: [{ periodicidad: "", costo: 0 }],
      beneficios: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "opcionesPrecios"
  });

  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
    control: editForm.control,
    name: "opcionesPrecios"
  });

  // Fetch membership types
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["/api/membership-types"],
  });

  // Create membership mutation
  const createMembershipMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      const processedData = {
        ...data,
        beneficios: data.beneficios ? data.beneficios.split('\n').filter(b => b.trim()) : [],
      };
      const response = await apiRequest("POST", "/api/membership-types", processedData);
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
      const processedData = {
        ...data,
        beneficios: data.beneficios ? data.beneficios.split('\n').filter(b => b.trim()) : [],
      };
      const response = await apiRequest("PUT", `/api/membership-types/${selectedMembership.id}`, processedData);
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
    
    const opcionesPrecios = Array.isArray(membership.opcionesPrecios) && membership.opcionesPrecios.length > 0
      ? membership.opcionesPrecios.map((op: any) => ({
          periodicidad: op.periodicidad || "",
          costo: parseFloat(op.costo) || 0
        }))
      : [{ periodicidad: "", costo: 0 }];
    
    editForm.reset({
      nombrePlan: membership.nombrePlan,
      descripcionPlan: membership.descripcionPlan || "",
      opcionesPrecios,
      beneficios: beneficiosText,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (membership: MembershipType) => {
    setSelectedMembership(membership);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (membershipId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar membresía?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
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

  const formatPrice = (opcionesPrecios: any) => {
    if (!Array.isArray(opcionesPrecios) || opcionesPrecios.length === 0) {
      return "Sin precios";
    }
    
    if (opcionesPrecios.length === 1) {
      const option = opcionesPrecios[0];
      return `$${option.costo} / ${getPeriodicityLabel(option.periodicidad)}`;
    }
    
    return `${opcionesPrecios.length} opciones`;
  };

  const getPeriodicityLabel = (periodicidad: string) => {
    const labels: { [key: string]: string } = {
      monthly: "mes",
      yearly: "año", 
      quarterly: "trimestre",
      biannual: "semestre",
    };
    return labels[periodicidad] || periodicidad;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tipos de Membresía</h1>
          <p className="text-gray-600 mt-1">Gestiona los planes de membresía disponibles</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Membresía
        </Button>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tipo de Membresía</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="descripcionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Plan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve del plan de membresía..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opciones de Precios */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Opciones de Precios *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ periodicidad: "", costo: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end space-x-2 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`opcionesPrecios.${index}.periodicidad`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Periodicidad</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Mensual</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="biannual">Semestral</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`opcionesPrecios.${index}.costo`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Costo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mb-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="beneficios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los beneficios del plan de membresía (cada línea será un beneficio)..."
                        className="min-h-[150px]"
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Membresía</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
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
                name="descripcionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Plan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve del plan de membresía..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opciones de Precios - Edit */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Opciones de Precios *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editAppend({ periodicidad: "", costo: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                  </Button>
                </div>
                
                {editFields.map((field, index) => (
                  <div key={field.id} className="flex items-end space-x-2 p-4 border rounded-lg">
                    <FormField
                      control={editForm.control}
                      name={`opcionesPrecios.${index}.periodicidad`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Periodicidad</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Mensual</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="biannual">Semestral</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name={`opcionesPrecios.${index}.costo`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Costo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {editFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editRemove(index)}
                        className="mb-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={editForm.control}
                name="beneficios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los beneficios del plan de membresía (cada línea será un beneficio)..."
                        className="min-h-[150px]"
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

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">Cargando tipos de membresía...</div>
          </div>
        ) : memberships.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay tipos de membresía registrados</p>
            <p className="text-gray-400 text-sm">Crea el primer tipo de membresía para comenzar</p>
          </div>
        ) : (
          memberships.map((membership: any) => (
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
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(membership.opcionesPrecios)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {membership.descripcionPlan && (
                  <p className="text-gray-600 mb-4">{membership.descripcionPlan}</p>
                )}
                
                {Array.isArray(membership.opcionesPrecios) && membership.opcionesPrecios.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Opciones disponibles:</h4>
                    <div className="space-y-1">
                      {membership.opcionesPrecios.map((option: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>{getPeriodicityLabel(option.periodicidad)}</span>
                          <span className="font-medium">${option.costo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Array.isArray(membership.beneficios) && membership.beneficios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Beneficios incluidos:</h4>
                    <ul className="space-y-1">
                      {membership.beneficios.map((benefit: string, index: number) => (
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
    </div>
  );
}