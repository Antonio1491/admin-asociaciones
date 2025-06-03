import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCompanySchema, type CompanyWithDetails, type Category, type Certificate } from "@shared/schema";
import { Building, Phone, Mail, Globe, MapPin, Users, Camera, Video, FileText, Plus, Trash2, Upload } from "lucide-react";
import { mexicoData } from "@/lib/locationData";
import MapLocationPicker from "./MapLocationPicker";

// Esquema del formulario sin campos de membresía
const companySchema = insertCompanySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  membershipTypeId: true,
  membershipPeriodicidad: true,
  formaPago: true,
  fechaInicioMembresia: true,
  fechaFinMembresia: true,
  notasMembresia: true,
}).extend({
  categoriesIds: z.array(z.number()).min(1, "Debe seleccionar al menos una categoría"),
  certificateIds: z.array(z.number()).optional(),
  redesSociales: z.array(z.object({
    plataforma: z.string(),
    url: z.string()
  })).optional(),
  representantesVentas: z.array(z.string()).optional(),
  galeriaProductosUrls: z.array(z.string()).optional(),
  videosUrls: z.array(z.string()).optional(),
  ubicacionGeografica: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }).nullable().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const renderCategoryIcon = (category: Category) => {
  if (category.icono) {
    if (category.icono.startsWith('<svg')) {
      return <div dangerouslySetInnerHTML={{ __html: category.icono }} className="w-4 h-4" />;
    } else {
      return <span className="text-lg">{category.icono}</span>;
    }
  }
  return <Building className="w-4 h-4" />;
};

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWithDetails | null;
}

export default function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados locales
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [selectedCiudades, setSelectedCiudades] = useState<string[]>([]);
  const [redesSociales, setRedesSociales] = useState<{ plataforma: string; url: string }[]>([]);
  const [representantes, setRepresentantes] = useState<string[]>([]);
  const [galeriaImagenes, setGaleriaImagenes] = useState<string[]>([]);
  const [videosUrls, setVideosUrls] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [direccionesPorCiudad, setDireccionesPorCiudad] = useState<Record<string, string>>({});
  const [ubicacionesPorCiudad, setUbicacionesPorCiudad] = useState<Record<string, { lat: number; lng: number; address: string }>>({});

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      telefono1: "",
      telefono2: "",
      email1: "",
      email2: "",
      logotipoUrl: "",
      sitioWeb: "",
      videosUrls: [],
      paisesPresencia: [],
      estadosPresencia: [],
      ciudadesPresencia: [],
      direccionFisica: "",
      descripcionEmpresa: "",
      catalogoDigitalUrl: "",
      categoriesIds: [],
      certificateIds: [],
      galeriaProductosUrls: [],
      estado: "activo" as const,
      ubicacionGeografica: null,
    },
  });

  // Video management functions
  const addVideo = () => {
    if (videosUrls.length < 3) {
      setVideosUrls([...videosUrls, ""]);
    }
  };

  const updateVideo = (index: number, value: string) => {
    const newVideos = [...videosUrls];
    newVideos[index] = value;
    setVideosUrls(newVideos);
    form.setValue("videosUrls", newVideos);
  };

  const removeVideo = (index: number) => {
    const newVideos = videosUrls.filter((_, i) => i !== index);
    setVideosUrls(newVideos);
    form.setValue("videosUrls", newVideos);
  };



  // Cargar categorías
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Cargar certificados
  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  // Cargar datos de la empresa en el formulario
  useEffect(() => {
    if (company && open) {
      // Resetear estados
      setSelectedEstados((company.estadosPresencia as string[]) || []);
      setSelectedCiudades((company.ciudadesPresencia as string[]) || []);
      
      // Convertir redes sociales a array para el formulario
      let redesSocialesArray = [];
      if (company.redesSociales) {
        if (typeof company.redesSociales === 'string') {
          try {
            const parsed = JSON.parse(company.redesSociales);
            if (Array.isArray(parsed)) {
              redesSocialesArray = parsed;
            } else if (typeof parsed === 'object') {
              redesSocialesArray = Object.entries(parsed).map(([plataforma, url]) => ({ plataforma, url }));
            }
          } catch (error) {
            console.error("Error parsing redesSociales:", error);
            redesSocialesArray = [];
          }
        } else if (Array.isArray(company.redesSociales)) {
          redesSocialesArray = company.redesSociales;
        }
      }
      setRedesSociales(redesSocialesArray);

      // Convertir representantes a array
      let representantesArray = [];
      if (company.representantesVentas) {
        if (typeof company.representantesVentas === 'string') {
          try {
            const parsed = JSON.parse(company.representantesVentas);
            representantesArray = Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            representantesArray = [company.representantesVentas];
          }
        } else if (Array.isArray(company.representantesVentas)) {
          representantesArray = company.representantesVentas;
        }
      }
      setRepresentantes(representantesArray);

      // Convertir galería a array
      let galeriaArray = [];
      if (company.galeriaProductosUrls) {
        if (typeof company.galeriaProductosUrls === 'string') {
          try {
            const parsed = JSON.parse(company.galeriaProductosUrls);
            galeriaArray = Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            galeriaArray = [company.galeriaProductosUrls];
          }
        } else if (Array.isArray(company.galeriaProductosUrls)) {
          galeriaArray = company.galeriaProductosUrls;
        }
      }
      setGaleriaImagenes(galeriaArray);

      // Convertir videos a array
      let videosArray = [];
      if (company.videosUrls) {
        if (typeof company.videosUrls === 'string') {
          try {
            const parsed = JSON.parse(company.videosUrls);
            videosArray = Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            videosArray = [company.videosUrls];
          }
        } else if (Array.isArray(company.videosUrls)) {
          videosArray = company.videosUrls;
        }
      }
      setVideosUrls(videosArray);

      // Establecer valores del formulario
      form.reset({
        nombreEmpresa: company.nombreEmpresa,
        telefono1: company.telefono1 || "",
        telefono2: company.telefono2 || "",
        email1: company.email1,
        email2: company.email2 || "",
        sitioWeb: company.sitioWeb || "",
        videosUrls: (company.videosUrls as string[]) || [],
        paisesPresencia: (company.paisesPresencia as string[]) || [],
        estadosPresencia: (company.estadosPresencia as string[]) || [],
        ciudadesPresencia: (company.ciudadesPresencia as string[]) || [],
        direccionFisica: company.direccionFisica || "",
        descripcionEmpresa: company.descripcionEmpresa || "",
        catalogoDigitalUrl: company.catalogoDigitalUrl || "",
        categoriesIds: (company.categoriesIds as number[]) || [],
        certificateIds: (company.certificateIds as number[]) || [],
        galeriaProductosUrls: (company.galeriaProductosUrls as string[]) || [],
        estado: (company.estado as "activo" | "inactivo") || "activo",
      });
    }
  }, [company, open, form]);

  // Efecto separado para cargar la ubicación existente cuando las ciudades están disponibles
  useEffect(() => {
    if (company && selectedCiudades.length > 0 && company.ubicacionGeografica) {
      const primeraUbicacion = selectedCiudades[0];
      setUbicacionesPorCiudad({
        [primeraUbicacion]: company.ubicacionGeografica as { lat: number; lng: number; address: string }
      });
    }
  }, [company, selectedCiudades]);

  // Mutación para actualizar empresa
  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      try {
        if (!company) throw new Error("No company selected");
        
        const updateData = {
          ...data,
          redesSociales,
          representantesVentas: representantes.filter(r => r.trim() !== ""),
          galeriaProductosUrls: galeriaImagenes.filter(img => img.trim() !== ""),
          videosUrls: videosUrls.filter(v => v.trim() !== ""),
        };

        console.log("Datos a enviar:", updateData);

        const response = await apiRequest("PUT", `/api/companies/${company.id}`, updateData);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al actualizar la empresa");
        }

        return response.json();
      } catch (error) {
        console.error("Error en mutationFn:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({
        title: "Empresa actualizada",
        description: "Los datos se han guardado correctamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error al actualizar empresa:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la empresa.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      console.log("Datos del formulario:", data);
      updateMutation.mutate(data);
    } catch (error) {
      console.error("Error en onSubmit:", error);
    }
  };

  // Funciones para manejar archivos
  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos JPG, PNG y WebP.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiRequest("POST", "/api/upload/image", formData);
    
    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }
    
    const data = await response.json();
    return data.url;
  };

  const uploadDocumentToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await apiRequest("POST", "/api/upload/document", formData);
    
    if (!response.ok) {
      throw new Error("Error al subir el documento");
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleLogoChange = async (file: File) => {
    if (validateImage(file)) {
      try {
        const url = await uploadImageToServer(file);
        form.setValue("logotipoUrl", url);
        toast({
          title: "Logo subido",
          description: "El logo se ha subido correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo subir el logo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGaleriaChange = async (files: FileList) => {
    const validFiles = Array.from(files).filter(validateImage);
    if (validFiles.length === 0) return;

    try {
      const uploadPromises = validFiles.map(uploadImageToServer);
      const urls = await Promise.all(uploadPromises);
      const newGaleria = [...galeriaImagenes, ...urls];
      setGaleriaImagenes(newGaleria);
      form.setValue("galeriaProductosUrls", newGaleria);
      toast({
        title: "Imágenes subidas",
        description: `Se subieron ${urls.length} imágenes correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron subir algunas imágenes.",
        variant: "destructive",
      });
    }
  };

  // Funciones para manejar redes sociales
  const addRedSocial = () => {
    setRedesSociales([...redesSociales, { plataforma: "", url: "" }]);
  };

  const updateRedSocial = (index: number, field: 'plataforma' | 'url', value: string) => {
    const newRedes = [...redesSociales];
    newRedes[index][field] = value;
    setRedesSociales(newRedes);
  };

  const removeRedSocial = (index: number) => {
    const newRedes = redesSociales.filter((_, i) => i !== index);
    setRedesSociales(newRedes);
  };

  // Funciones para manejar representantes
  const addRepresentante = () => {
    setRepresentantes([...representantes, ""]);
  };

  const removeRepresentante = (index: number) => {
    const newRepresentantes = representantes.filter((_, i) => i !== index);
    setRepresentantes(newRepresentantes);
  };

  const updateRepresentante = (index: number, value: string) => {
    const newRepresentantes = [...representantes];
    newRepresentantes[index] = value;
    setRepresentantes(newRepresentantes);
  };

  // Función para direcciones por ciudad
  const updateDireccionCiudad = (ciudad: string, direccion: string) => {
    setDireccionesPorCiudad(prev => ({
      ...prev,
      [ciudad]: direccion
    }));
  };

  // Función para ubicaciones del mapa
  const updateUbicacionCiudad = (ciudad: string, ubicacion: { lat: number; lng: number; address: string }) => {
    setUbicacionesPorCiudad(prev => ({
      ...prev,
      [ciudad]: ubicacion
    }));
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Editar Empresa - {company.nombreEmpresa}
          </DialogTitle>
          <DialogDescription>
            Modifica la información de la empresa y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombreEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Nombre de la Empresa *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="email" placeholder="email@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input placeholder="+52 777 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sitioWeb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Sitio Web
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Videos Promocionales */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos Promocionales (máximo 3)
              </Label>
              {videosUrls.map((video, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`URL del video ${index + 1}`}
                    value={video}
                    onChange={(e) => updateVideo(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVideo(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {videosUrls.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVideo}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Video
                </Button>
              )}
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Categorías *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={form.watch("categoriesIds")?.includes(category.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = form.getValues("categoriesIds") || [];
                        const newIds = checked
                          ? [...currentIds, category.id]
                          : currentIds.filter((id) => id !== category.id);
                        form.setValue("categoriesIds", newIds);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {renderCategoryIcon(category)}
                      <span className="text-sm">{category.nombreCategoria}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Información de Contacto Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono Secundario
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+52 777 123 4568" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Secundario
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email2@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcionEmpresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción de la Empresa
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu empresa, servicios, productos y ventajas competitivas..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección Física */}
            <FormField
              control={form.control}
              name="direccionFisica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección Física
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Dirección completa de la empresa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ubicación Geográfica */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación en el Mapa
              </Label>
              <MapLocationPicker
                ciudad="Ciudad de México"
                onLocationSelect={(location) => {
                  form.setValue("ubicacionGeografica", location);
                }}
                initialLocation={form.getValues("ubicacionGeografica")}
              />
            </div>

            {/* Galería de Productos */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Galería de Productos (máximo 10)
              </Label>
              
              {/* Mostrar imágenes existentes */}
              {company.galeriaProductosUrls && company.galeriaProductosUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(company.galeriaProductosUrls as string[]).map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Producto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const currentUrls = company.galeriaProductosUrls as string[] || [];
                          const newUrls = currentUrls.filter((_, i) => i !== index);
                          form.setValue("galeriaProductosUrls", newUrls);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nuevas imágenes */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('galeria-input')?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Haz clic para seleccionar imágenes de productos
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG (máx. 5MB c/u)
                </p>
                <input
                  id="galeria-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGaleriaChange}
                />
              </div>
            </div>

            {/* Logotipo */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Logotipo de la Empresa
              </Label>
              
              {logoPreview && (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logotipo actual"
                    className="h-20 w-auto object-contain border rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setLogoPreview("");
                      form.setValue("logotipoUrl", "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('logo-input')?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Haz clic para seleccionar nuevo logotipo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG (máx. 5MB)
                </p>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            {/* Certificados */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Certificados y Acreditaciones
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {certificates.map((certificate) => (
                  <label
                    key={certificate.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={form.watch("certificateIds")?.includes(certificate.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = form.getValues("certificateIds") || [];
                        const newIds = checked
                          ? [...currentIds, certificate.id]
                          : currentIds.filter((id) => id !== certificate.id);
                        form.setValue("certificateIds", newIds);
                      }}
                    />
                    <span className="text-sm">{certificate.nombreCertificado}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estado */}
            <FormField
              control={form.control}
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

            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}