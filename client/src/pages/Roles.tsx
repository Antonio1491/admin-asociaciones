import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Plus, Shield, Users, Settings, FileText, BarChart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRoleSchema, type Role, type InsertRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type RoleFormData = z.infer<typeof insertRoleSchema>;

// Lista de permisos disponibles
const availablePermissions = [
  { id: "users.read", name: "Ver usuarios", category: "Usuarios", icon: Users },
  { id: "users.write", name: "Gestionar usuarios", category: "Usuarios", icon: Users },
  { id: "companies.read", name: "Ver empresas", category: "Empresas", icon: FileText },
  { id: "companies.write", name: "Gestionar empresas", category: "Empresas", icon: FileText },
  { id: "categories.read", name: "Ver categorías", category: "Categorías", icon: Settings },
  { id: "categories.write", name: "Gestionar categorías", category: "Categorías", icon: Settings },
  { id: "memberships.read", name: "Ver membresías", category: "Membresías", icon: Shield },
  { id: "memberships.write", name: "Gestionar membresías", category: "Membresías", icon: Shield },
  { id: "certificates.read", name: "Ver certificados", category: "Certificados", icon: FileText },
  { id: "certificates.write", name: "Gestionar certificados", category: "Certificados", icon: FileText },
  { id: "opinions.read", name: "Ver opiniones", category: "Opiniones", icon: FileText },
  { id: "opinions.write", name: "Moderar opiniones", category: "Opiniones", icon: FileText },
  { id: "roles.read", name: "Ver roles", category: "Roles", icon: Shield },
  { id: "roles.write", name: "Gestionar roles", category: "Roles", icon: Shield },
  { id: "statistics.read", name: "Ver estadísticas", category: "Estadísticas", icon: BarChart },
];

export default function Roles() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(insertRoleSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      permisos: [],
      estado: "activo",
    },
  });

  const editForm = useForm<RoleFormData>({
    resolver: zodResolver(insertRoleSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      permisos: [],
      estado: "activo",
    },
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: () => apiRequest("/api/roles"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await apiRequest("/api/roles", "POST", data);
      if (!response.ok) {
        throw new Error("Error al crear el rol");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Éxito",
        description: "Rol creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el rol",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      if (!selectedRole) throw new Error("No role selected");
      const response = await apiRequest(`/api/roles/${selectedRole.id}`, "PUT", data);
      if (!response.ok) {
        throw new Error("Error al actualizar el rol");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.reset();
      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/roles/${id}`, "DELETE");
      if (!response.ok) {
        throw new Error("Error al eliminar el rol");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Éxito",
        description: "Rol eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RoleFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: RoleFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    editForm.reset({
      nombre: role.nombre,
      descripcion: role.descripcion || "",
      permisos: (role.permisos as string[]) || [],
      estado: role.estado,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      deleteMutation.mutate(id);
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles del Sistema</h1>
          <p className="text-gray-600">Gestiona los roles y permisos de los usuarios</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
              <DialogDescription>
                Define un nuevo rol con sus permisos correspondientes
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Rol</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Administrador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="inactivo">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Describe las responsabilidades de este rol..."
                          height={150}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permisos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permisos</FormLabel>
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([category, permissions]) => (
                          <div key={category} className="border rounded-lg p-4">
                            <h4 className="font-medium text-sm text-gray-700 mb-3">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {permissions.map((permission) => {
                                const Icon = permission.icon;
                                return (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={permission.id}
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        const currentPermissions = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentPermissions, permission.id]);
                                        } else {
                                          field.onChange(currentPermissions.filter(p => p !== permission.id));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={permission.id}
                                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      <Icon className="h-4 w-4" />
                                      {permission.name}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creando..." : "Crear Rol"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map((role: Role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {role.nombre}
                </CardTitle>
                <Badge variant={role.estado === "activo" ? "default" : "secondary"}>
                  {role.estado}
                </Badge>
              </div>
              {role.descripcion && (
                <CardDescription>{role.descripcion}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Permisos ({(role.permisos as string[])?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {((role.permisos as string[]) || []).slice(0, 3).map((permiso) => {
                      const permission = availablePermissions.find(p => p.id === permiso);
                      return (
                        <Badge key={permiso} variant="outline" className="text-xs">
                          {permission?.name || permiso}
                        </Badge>
                      );
                    })}
                    {((role.permisos as string[]) || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{((role.permisos as string[]) || []).length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica la información y permisos del rol
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Rol</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe las responsabilidades de este rol..."
                        height={150}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="permisos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permisos</FormLabel>
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <h4 className="font-medium text-sm text-gray-700 mb-3">{category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissions.map((permission) => {
                              const Icon = permission.icon;
                              return (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${permission.id}`}
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      const currentPermissions = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentPermissions, permission.id]);
                                      } else {
                                        field.onChange(currentPermissions.filter(p => p !== permission.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`edit-${permission.id}`}
                                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    <Icon className="h-4 w-4" />
                                    {permission.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Actualizando..." : "Actualizar Rol"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}