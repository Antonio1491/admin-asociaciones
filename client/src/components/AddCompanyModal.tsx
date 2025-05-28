import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCompanySchema, Category, MembershipType } from "@shared/schema";
import { paisesAmericaLatina, estadosMexico, ciudadesPorEstado } from "@/lib/locationData";
import { Upload, X, Building, Phone, Mail } from "lucide-react";

const companySchema = insertCompanySchema.extend({
  email1: z.string().email("Email inválido"),
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  paisesPresencia: z.array(z.string()).optional(),
  estadosPresencia: z.array(z.string()).optional(),
  ciudadesPresencia: z.array(z.string()).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      email1: "",
      telefono1: "",
      sitioWeb: "",
      descripcionEmpresa: "",
      direccionFisica: "",
      paisesPresencia: [],
      estadosPresencia: [],
      ciudadesPresencia: [],
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: membershipTypes = [] } = useQuery<MembershipType[]>({
    queryKey: ["/api/membership-types"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return await apiRequest("/api/companies", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Éxito",
        description: "Empresa registrada correctamente",
      });
      onOpenChange(false);
      form.reset();
      setLogoFile(null);
      setLogoPreview("");
      setSelectedEstados([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar la empresa",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  // Manejo del logo con drag and drop
  const handleLogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  // Obtener ciudades disponibles basadas en estados seleccionados
  const getAvailableCiudades = () => {
    return selectedEstados.flatMap(estado => 
      ciudadesPorEstado[estado]?.map(ciudad => `${ciudad}, ${estado}`) || []
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Registrar Nueva Empresa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Sección: Información de la Empresa */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-primary">Información de la Empresa</h3>
                <p className="text-sm text-gray-600">Datos principales de la empresa</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de la empresa */}
                <FormField
                  control={form.control}
                  name="nombreEmpresa"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nombre de la Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo de la empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logotipo con drag and drop */}
                <FormItem className="md:col-span-2">
                  <FormLabel>Logotipo de la Empresa</FormLabel>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
                    onDrop={handleLogoDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Arrastra y suelta tu logotipo aquí, o{" "}
                            <label className="text-primary cursor-pointer hover:underline">
                              selecciona un archivo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoSelect}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formatos: JPG, PNG, GIF (máx. 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </FormItem>

                {/* Sitio web */}
                <FormField
                  control={form.control}
                  name="sitioWeb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.nombreCategoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Países con presencia */}
                <FormField
                  control={form.control}
                  name="paisesPresencia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Países con Presencia</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                        {paisesAmericaLatina.map((pais) => (
                          <div key={pais} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pais-${pais}`}
                              checked={field.value?.includes(pais) || false}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, pais]);
                                } else {
                                  field.onChange(currentValues.filter(p => p !== pais));
                                }
                              }}
                            />
                            <label htmlFor={`pais-${pais}`} className="text-sm cursor-pointer">
                              {pais}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estados de México */}
                <FormField
                  control={form.control}
                  name="estadosPresencia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Estados de México</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                        {estadosMexico.map((estado) => (
                          <div key={estado} className="flex items-center space-x-2">
                            <Checkbox
                              id={`estado-${estado}`}
                              checked={field.value?.includes(estado) || false}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                let newValues;
                                if (checked) {
                                  newValues = [...currentValues, estado];
                                  setSelectedEstados(prev => [...prev, estado]);
                                } else {
                                  newValues = currentValues.filter(e => e !== estado);
                                  setSelectedEstados(prev => prev.filter(e => e !== estado));
                                  // También remover ciudades de este estado
                                  const ciudadesForm = form.getValues("ciudadesPresencia") || [];
                                  const ciudadesActualizadas = ciudadesForm.filter(
                                    ciudad => !ciudad.includes(`, ${estado}`)
                                  );
                                  form.setValue("ciudadesPresencia", ciudadesActualizadas);
                                }
                                field.onChange(newValues);
                              }}
                            />
                            <label htmlFor={`estado-${estado}`} className="text-sm cursor-pointer">
                              {estado}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ciudades de México (condicionadas a estados) */}
                {selectedEstados.length > 0 && (
                  <FormField
                    control={form.control}
                    name="ciudadesPresencia"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Ciudades de México</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                          {getAvailableCiudades().map((ciudad) => (
                            <div key={ciudad} className="flex items-center space-x-2">
                              <Checkbox
                                id={`ciudad-${ciudad}`}
                                checked={field.value?.includes(ciudad) || false}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, ciudad]);
                                  } else {
                                    field.onChange(currentValues.filter(c => c !== ciudad));
                                  }
                                }}
                              />
                              <label htmlFor={`ciudad-${ciudad}`} className="text-sm cursor-pointer">
                                {ciudad}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Descripción de la empresa */}
                <FormField
                  control={form.control}
                  name="descripcionEmpresa"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descripción de la Empresa</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe brevemente los productos o servicios que ofrece la empresa..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Información de Contacto */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-primary">Información de Contacto</h3>
                <p className="text-sm text-gray-600">Datos de contacto y ubicación</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email principal */}
                <FormField
                  control={form.control}
                  name="email1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Principal *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="contacto@empresa.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono principal */}
                <FormField
                  control={form.control}
                  name="telefono1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono Principal
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+52 55 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dirección física */}
                <FormField
                  control={form.control}
                  name="direccionFisica"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Dirección Física</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Calle, número, colonia, código postal, ciudad, estado..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de membresía */}
                <FormField
                  control={form.control}
                  name="membershipTypeId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tipo de Membresía</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de membresía" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.nombrePlan} - ${type.costo} ({type.periodicidad})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createCompanyMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCompanyMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createCompanyMutation.isPending ? "Registrando..." : "Registrar Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}