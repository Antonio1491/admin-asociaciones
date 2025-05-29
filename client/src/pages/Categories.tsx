import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, MoreHorizontal, Edit, Trash2, Tags, Table as TableIcon, Grid, Eye,
  Building2, Car, Truck, Hammer, Factory, Cpu, Wrench, ShoppingBag,
  Briefcase, Heart, GraduationCap, Home, Coffee, Camera, Music,
  Gamepad2, Book, Palette, MapPin, Plane, Ship, Train, Zap
} from "lucide-react";
import { Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CategoryDataTable from "@/components/CategoryDataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Available icons for categories
const availableIcons = [
  { name: "Tags", component: Tags, label: "Etiqueta" },
  { name: "Building2", component: Building2, label: "Edificio" },
  { name: "Car", component: Car, label: "Automóvil" },
  { name: "Truck", component: Truck, label: "Camión" },
  { name: "Hammer", component: Hammer, label: "Herramientas" },
  { name: "Factory", component: Factory, label: "Fábrica" },
  { name: "Cpu", component: Cpu, label: "Tecnología" },
  { name: "Wrench", component: Wrench, label: "Mantenimiento" },
  { name: "ShoppingBag", component: ShoppingBag, label: "Comercio" },
  { name: "Briefcase", component: Briefcase, label: "Negocios" },
  { name: "Heart", component: Heart, label: "Salud" },
  { name: "GraduationCap", component: GraduationCap, label: "Educación" },
  { name: "Home", component: Home, label: "Hogar" },
  { name: "Coffee", component: Coffee, label: "Restaurantes" },
  { name: "Camera", component: Camera, label: "Fotografía" },
  { name: "Music", component: Music, label: "Música" },
  { name: "Gamepad2", component: Gamepad2, label: "Entretenimiento" },
  { name: "Book", component: Book, label: "Libros" },
  { name: "Palette", component: Palette, label: "Arte" },
  { name: "MapPin", component: MapPin, label: "Ubicación" },
  { name: "Plane", component: Plane, label: "Viajes" },
  { name: "Ship", component: Ship, label: "Marítimo" },
  { name: "Train", component: Train, label: "Transporte" },
  { name: "Zap", component: Zap, label: "Energía" }
];

const categorySchema = z.object({
  nombreCategoria: z.string().min(1, "El nombre de la categoría es requerido"),
  descripcion: z.string().optional(),
  icono: z.string().default("Tags"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function Categories() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombreCategoria: "",
      descripcion: "",
      icono: "Tags",
    },
  });

  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombreCategoria: "",
      descripcion: "",
      icono: "Tags",
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      });
      form.reset();
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!selectedCategory) throw new Error("No category selected");
      const response = await apiRequest("PUT", `/api/categories/${selectedCategory.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
      editForm.reset();
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const onEditSubmit = (data: CategoryFormData) => {
    updateCategoryMutation.mutate(data);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.reset({
      nombreCategoria: category.nombreCategoria,
      descripcion: category.descripcion || "",
      icono: category.icono || "Tags",
    });
    setIsEditModalOpen(true);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleDelete = (categoryId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestión de Categorías</h1>
          <p className="text-gray-600 mt-1">Administra las categorías de empresas del directorio</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreCategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Categoría *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Tecnología, Manufactura..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción de la categoría..."
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
                  name="icono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icono</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un icono">
                              {field.value && (() => {
                                const selectedIcon = availableIcons.find(icon => icon.name === field.value);
                                if (selectedIcon) {
                                  const IconComponent = selectedIcon.component;
                                  return (
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="w-4 h-4" />
                                      <span>{selectedIcon.label}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availableIcons.map((icon) => {
                              const IconComponent = icon.component;
                              return (
                                <SelectItem key={icon.name} value={icon.name}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    <span>{icon.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createCategoryMutation.isPending}>
                    {createCategoryMutation.isPending ? "Creando..." : "Crear Categoría"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "table" ? (
        <CategoryDataTable 
          categories={categories} 
          onEdit={handleEdit}
          onView={handleView}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Categorías registradas ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando categorías...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay categorías registradas</p>
              <p className="text-gray-400 text-sm">Crea la primera categoría para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.nombreCategoria}
                      </TableCell>
                      <TableCell>
                        {category.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Categoría</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Tags className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">{selectedCategory.nombreCategoria}</h3>
              </div>
              
              {selectedCategory.descripcion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-sm text-gray-700">{selectedCategory.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nombreCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Categoría *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Tecnología, Manufactura..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción de la categoría..."
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
                name="icono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un icono">
                            {field.value && (() => {
                              const selectedIcon = availableIcons.find(icon => icon.name === field.value);
                              if (selectedIcon) {
                                const IconComponent = selectedIcon.component;
                                return (
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    <span>{selectedIcon.label}</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => {
                            const IconComponent = icon.component;
                            return (
                              <SelectItem key={icon.name} value={icon.name}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" />
                                  <span>{icon.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                    setSelectedCategory(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCategoryMutation.isPending}>
                  {updateCategoryMutation.isPending ? "Actualizando..." : "Actualizar Categoría"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
