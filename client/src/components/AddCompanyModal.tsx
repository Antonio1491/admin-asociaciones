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
import { Upload, X, Building, Phone, Mail, Plus, FileText, Trash2, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from "lucide-react";

const companySchema = insertCompanySchema.extend({
  email1: z.string().email("Email inválido"),
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  videoUrl1: z.string().url("URL inválida").optional().or(z.literal("")),
  paisesPresencia: z.array(z.string()).optional(),
  estadosPresencia: z.array(z.string()).optional(),
  ciudadesPresencia: z.array(z.string()).optional(),
  redesSociales: z.array(z.object({
    plataforma: z.string(),
    url: z.string().url("URL inválida"),
  })).optional(),
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
  const [catalogoFile, setCatalogoFile] = useState<File | null>(null);
  const [redesSociales, setRedesSociales] = useState<Array<{plataforma: string, url: string}>>([]);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  // Plataformas de redes sociales disponibles
  const socialPlatforms = [
    { name: "Facebook", icon: Facebook },
    { name: "Instagram", icon: Instagram },
    { name: "LinkedIn", icon: Linkedin },
    { name: "Twitter", icon: Twitter },
    { name: "YouTube", icon: Youtube },
    { name: "Sitio Web", icon: Globe },
  ];

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      email1: "",
      telefono1: "",
      sitioWeb: "",
      videoUrl1: "",
      descripcionEmpresa: "",
      direccionFisica: "",
      paisesPresencia: [],
      estadosPresencia: [],
      ciudadesPresencia: [],
      redesSociales: [],
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

  // Manejo del catálogo PDF con drag and drop
  const handleCatalogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB
      setCatalogoFile(file);
    } else {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF de máximo 10MB",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleCatalogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        setCatalogoFile(file);
      } else {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF de máximo 10MB",
          variant: "destructive",
        });
      }
    }
  };

  const removeCatalogo = () => {
    setCatalogoFile(null);
  };

  // Funciones para redes sociales dinámicas
  const addRedSocial = () => {
    setRedesSociales([...redesSociales, { plataforma: "", url: "" }]);
  };

  const removeRedSocial = (index: number) => {
    const newRedes = redesSociales.filter((_, i) => i !== index);
    setRedesSociales(newRedes);
    form.setValue("redesSociales", newRedes);
  };

  const updateRedSocial = (index: number, field: 'plataforma' | 'url', value: string) => {
    const newRedes = [...redesSociales];
    newRedes[index][field] = value;
    setRedesSociales(newRedes);
    form.setValue("redesSociales", newRedes);
  };

  // Funciones para galería de fotografías
  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Validar tamaño del archivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe pesar más de 5MB",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Validar resolución mínima
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width < 800 || img.height < 800) {
          toast({
            title: "Error",
            description: "Las imágenes deben tener una resolución mínima de 800x800px",
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Error",
          description: "Error al cargar la imagen",
          variant: "destructive",
        });
        resolve(false);
      };

      img.src = url;
    });
  };

  const processImageToSquare = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleGaleriaDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (galeriaFiles.length + files.length > 10) {
      toast({
        title: "Error",
        description: "Solo se permiten máximo 10 imágenes en la galería",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const isValid = await validateImage(file);
      if (isValid) {
        validFiles.push(file);
        const preview = await processImageToSquare(file);
        newPreviews.push(preview);
      }
    }

    setGaleriaFiles([...galeriaFiles, ...validFiles]);
    setGaleriaPreviews([...galeriaPreviews, ...newPreviews]);
  }, [galeriaFiles, galeriaPreviews, toast]);

  const handleGaleriaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (galeriaFiles.length + files.length > 10) {
      toast({
        title: "Error",
        description: "Solo se permiten máximo 10 imágenes en la galería",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const isValid = await validateImage(file);
      if (isValid) {
        validFiles.push(file);
        const preview = await processImageToSquare(file);
        newPreviews.push(preview);
      }
    }

    setGaleriaFiles([...galeriaFiles, ...validFiles]);
    setGaleriaPreviews([...galeriaPreviews, ...newPreviews]);
  };

  const removeGaleriaImage = (index: number) => {
    const newFiles = galeriaFiles.filter((_, i) => i !== index);
    const newPreviews = galeriaPreviews.filter((_, i) => i !== index);
    setGaleriaFiles(newFiles);
    setGaleriaPreviews(newPreviews);
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

                {/* Video URL */}
                <FormField
                  control={form.control}
                  name="videoUrl1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video de la Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
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

                {/* Redes Sociales Dinámicas */}
                <div className="md:col-span-2 space-y-4">
                  <FormLabel>Redes Sociales</FormLabel>
                  {redesSociales.map((red, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Select 
                        value={red.plataforma} 
                        onValueChange={(value) => updateRedSocial(index, 'plataforma', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map((platform) => {
                            const Icon = platform.icon;
                            return (
                              <SelectItem key={platform.name} value={platform.name}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="https://..."
                        value={red.url}
                        onChange={(e) => updateRedSocial(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRedSocial(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRedSocial}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Red Social
                  </Button>
                </div>

                {/* Catálogo de Productos PDF */}
                <div className="md:col-span-2">
                  <FormLabel>Catálogo de Productos (PDF)</FormLabel>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors mt-2"
                    onDrop={handleCatalogoDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {catalogoFile ? (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-red-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{catalogoFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(catalogoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeCatalogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Arrastra y suelta tu catálogo PDF aquí, o{" "}
                            <label className="text-primary cursor-pointer hover:underline">
                              selecciona un archivo
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleCatalogoSelect}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Solo archivos PDF (máx. 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Galería de Fotografías */}
                <div className="md:col-span-2">
                  <FormLabel>Galería de Fotografías (máx. 10 imágenes)</FormLabel>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors mt-2"
                    onDrop={handleGaleriaDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {galeriaFiles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {galeriaPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Galería ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeGaleriaImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {galeriaFiles.length < 10 && (
                            <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                              <Plus className="h-8 w-8 text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleGaleriaSelect}
                              />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {galeriaFiles.length}/10 imágenes • Arrastra más imágenes o haz clic en + para agregar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Arrastra y suelta tus imágenes aquí, o{" "}
                            <label className="text-primary cursor-pointer hover:underline">
                              selecciona archivos
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleGaleriaSelect}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Máximo 10 imágenes • Cada imagen: máx. 5MB, min. 800x800px, formato 1:1
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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