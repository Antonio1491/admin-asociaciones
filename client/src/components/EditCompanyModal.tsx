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
  if (category.iconoUrl) {
    return <img src={category.iconoUrl} alt={category.nombreCategoria} className="w-5 h-5" />;
  }
  return <Building className="w-5 h-5" />;
};

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWithDetails | null;
}

export default function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [representantes, setRepresentantes] = useState<string[]>([]);
  const [redesSociales, setRedesSociales] = useState<{ plataforma: string; url: string }[]>([]);
  const [galeriaImagenes, setGaleriaImagenes] = useState<string[]>([]);
  const [videosUrls, setVideosUrls] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [direccionesPorCiudad, setDireccionesPorCiudad] = useState<{ [key: string]: string }>({});
  const [ubicacionesPorCiudad, setUbicacionesPorCiudad] = useState<{ [key: string]: { lat: number; lng: number; address: string } }>({});

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      telefono1: "",
      telefono2: "",
      email1: "",
      email2: "",
      sitioWeb: "",
      descripcionEmpresa: "",
      direccionFisica: "",
      logotipoUrl: "",
      catalogoDigitalUrl: "",
      paisesPresencia: [],
      estadosPresencia: [],
      ciudadesPresencia: [],
      categoriesIds: [],
      certificateIds: [],
      redesSociales: [],
      representantesVentas: [],
      galeriaProductosUrls: [],
      videosUrls: [],
      ubicacionGeografica: null,
      estado: "activo",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await apiRequest("PUT", `/api/companies/${company?.id}`, data);
      if (!response.ok) {
        throw new Error("Error al actualizar empresa");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Empresa actualizada",
        description: "La empresa se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la empresa",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    const finalData = {
      ...data,
      redesSociales: redesSociales.filter(red => red.plataforma && red.url),
      representantesVentas: representantes.filter(rep => rep.trim() !== ""),
      galeriaProductosUrls: galeriaImagenes,
      videosUrls: videosUrls.filter(url => url.trim() !== ""),
      ubicacionGeografica: data.ubicacionGeografica || null,
    };

    mutation.mutate(finalData);
  };

  // Agregar/remover videos
  const addVideo = () => {
    if (videosUrls.length < 3) {
      const newVideos = [...videosUrls, ""];
      setVideosUrls(newVideos);
      form.setValue("videosUrls", newVideos);
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

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (company && open) {
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

      // Convertir redes sociales a array
      let redesArray = [];
      if (company.redesSociales) {
        if (typeof company.redesSociales === 'string') {
          try {
            const parsed = JSON.parse(company.redesSociales);
            redesArray = Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            redesArray = [];
          }
        } else if (Array.isArray(company.redesSociales)) {
          redesArray = company.redesSociales;
        }
      }
      setRedesSociales(redesArray);

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
        descripcionEmpresa: company.descripcionEmpresa || "",
        direccionFisica: company.direccionFisica || "",
        logotipoUrl: company.logotipoUrl || "",
        catalogoDigitalUrl: company.catalogoDigitalUrl || "",
        paisesPresencia: Array.isArray(company.paisesPresencia) ? company.paisesPresencia : 
          (typeof company.paisesPresencia === 'string' ? JSON.parse(company.paisesPresencia || '[]') : []),
        estadosPresencia: Array.isArray(company.estadosPresencia) ? company.estadosPresencia : 
          (typeof company.estadosPresencia === 'string' ? JSON.parse(company.estadosPresencia || '[]') : []),
        ciudadesPresencia: Array.isArray(company.ciudadesPresencia) ? company.ciudadesPresencia : 
          (typeof company.ciudadesPresencia === 'string' ? JSON.parse(company.ciudadesPresencia || '[]') : []),
        categoriesIds: company.categories?.map(c => c.id) || [],
        certificateIds: company.certificates?.map(c => c.id) || [],
        redesSociales: redesArray,
        representantesVentas: representantesArray,
        galeriaProductosUrls: galeriaArray,
        videosUrls: videosArray,
        ubicacionGeografica: company.ubicacionGeografica || null,
        estado: company.estado || "activo",
      });

      setLogoPreview(company.logotipoUrl || "");
    }
  }, [company, open, form]);

  // Funciones de validación y subida
  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos JPG, PNG y GIF.",
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
          description: "Error al subir el logo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGaleriaChange = async (files: FileList) => {
    const filesArray = Array.from(files);
    const validFiles = filesArray.filter(validateImage);
    
    if (validFiles.length === 0) return;

    try {
      const uploadPromises = validFiles.map(uploadImageToServer);
      const urls = await Promise.all(uploadPromises);
      const newGaleria = [...galeriaImagenes, ...urls];
      setGaleriaImagenes(newGaleria);
      form.setValue("galeriaProductosUrls", newGaleria);
      
      toast({
        title: "Imágenes subidas",
        description: `Se han subido ${validFiles.length} imagen(es) correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir las imágenes.",
        variant: "destructive",
      });
    }
  };

  // Funciones para representantes
  const addRepresentante = () => {
    setRepresentantes([...representantes, ""]);
  };

  const updateRepresentante = (index: number, value: string) => {
    const newRepresentantes = [...representantes];
    newRepresentantes[index] = value;
    setRepresentantes(newRepresentantes);
  };

  const removeRepresentante = (index: number) => {
    const newRepresentantes = representantes.filter((_, i) => i !== index);
    setRepresentantes(newRepresentantes);
  };

  // Funciones para redes sociales
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

  // Funciones para galería
  const removeImagenGaleria = (index: number) => {
    const newGaleria = galeriaImagenes.filter((_, i) => i !== index);
    setGaleriaImagenes(newGaleria);
    form.setValue("galeriaProductosUrls", newGaleria);
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
                name="sitioWeb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Sitio Web
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input placeholder="+52 555 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input placeholder="+52 555 123 4567" {...field} />
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
                      <Input type="email" placeholder="contacto@empresa.com" {...field} />
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
                      <Input type="email" placeholder="ventas@empresa.com" {...field} />
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
                      placeholder="Calle, número, colonia, ciudad, estado, CP"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ubicación en Mapa */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación en el Mapa
              </Label>
              {form.watch("ciudadesPresencia")?.map((ciudad: string, index: number) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{ciudad}</h4>
                  <MapLocationPicker
                    ciudad={ciudad}
                    onLocationSelect={(location) => {
                      if (index === 0) {
                        form.setValue("ubicacionGeografica", location);
                      }
                      updateUbicacionCiudad(ciudad, location);
                    }}
                    initialLocation={
                      index === 0 ? form.watch("ubicacionGeografica") : ubicacionesPorCiudad[ciudad]
                    }
                  />
                </div>
              ))}
            </div>

            {/* Presencia Geográfica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paisesPresencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Países de Presencia</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="Canadá">Canadá</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((pais: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer"
                          onClick={() => {
                            const newValues = field.value?.filter((_, i) => i !== index);
                            field.onChange(newValues);
                          }}
                        >
                          {pais} ×
                        </span>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estadosPresencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estados de Presencia</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mexicoData.map((estado) => (
                          <SelectItem key={estado.nombre} value={estado.nombre}>
                            {estado.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((estado: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm cursor-pointer"
                          onClick={() => {
                            const newValues = field.value?.filter((_, i) => i !== index);
                            field.onChange(newValues);
                          }}
                        >
                          {estado} ×
                        </span>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ciudadesPresencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudades de Presencia</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ciudad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mexicoData.flatMap(estado => 
                          estado.ciudades.map(ciudad => (
                            <SelectItem key={`${estado.nombre}-${ciudad}`} value={ciudad}>
                              {ciudad}, {estado.nombre}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((ciudad: string, index: number) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm cursor-pointer"
                          onClick={() => {
                            const newValues = field.value?.filter((_, i) => i !== index);
                            field.onChange(newValues);
                          }}
                        >
                          {ciudad} ×
                        </span>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Galería de Productos */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Galería de Productos
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galeriaImagenes.map((imagen, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imagen}
                      alt={`Producto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImagenGaleria(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Subir imágenes</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleGaleriaChange(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Logo de la Empresa
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Cambiar Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoChange(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Videos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos de la Empresa (máximo 3)
                </Label>
                {videosUrls.length < 3 && (
                  <Button type="button" size="sm" onClick={addVideo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Video
                  </Button>
                )}
              </div>
              {videosUrls.map((videoUrl, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="URL del video (YouTube, Vimeo, etc.)"
                    value={videoUrl}
                    onChange={(e) => updateVideo(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeVideo(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Representantes de Ventas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Representantes de Ventas
                </Label>
                <Button type="button" size="sm" onClick={addRepresentante}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Representante
                </Button>
              </div>
              {representantes.map((rep, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nombre del representante"
                    value={rep}
                    onChange={(e) => updateRepresentante(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeRepresentante(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Redes Sociales
                </Label>
                <Button type="button" size="sm" onClick={addRedSocial}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Red Social
                </Button>
              </div>
              {redesSociales.map((red, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Select
                    value={red.plataforma}
                    onValueChange={(value) => updateRedSocial(index, 'plataforma', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="URL de la red social"
                    value={red.url}
                    onChange={(e) => updateRedSocial(index, 'url', e.target.value)}
                    className="col-span-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeRedSocial(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Categorías */}
            <FormField
              control={form.control}
              name="categoriesIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorías *</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, category.id]);
                            } else {
                              field.onChange(currentValue.filter((id: number) => id !== category.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                        >
                          {renderCategoryIcon(category)}
                          {category.nombreCategoria}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certificados */}
            <FormField
              control={form.control}
              name="certificateIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificados</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`certificate-${certificate.id}`}
                          checked={field.value?.includes(certificate.id)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, certificate.id]);
                            } else {
                              field.onChange(currentValue.filter((id: number) => id !== certificate.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`certificate-${certificate.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {certificate.nombreCertificado}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Catálogo Digital */}
            <FormField
              control={form.control}
              name="catalogoDigitalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catálogo Digital (URL)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/catalogo.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de la Empresa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}