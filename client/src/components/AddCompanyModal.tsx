import { useState, useCallback, useEffect } from "react";
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
import { insertCompanySchema, Category, MembershipType, Certificate } from "@shared/schema";
import { paisesAmericaLatina, estadosMexico, ciudadesPorEstado } from "@/lib/locationData";
import { 
  Upload, X, Building, Phone, Mail, Plus, FileText, Trash2, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe, MapPin,
  Tags, Building2, Car, Truck, Hammer, Factory, Cpu, Wrench, ShoppingBag,
  Briefcase, Heart, GraduationCap, Home, Coffee, Camera, Music,
  Gamepad2, Book, Palette, Plane, Ship, Train, Zap
} from "lucide-react";
import MapLocationPicker from "./MapLocationPicker";
import RichTextEditor from "./RichTextEditor";

const companySchema = insertCompanySchema.extend({
  email1: z.string().email("Email inválido"),
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  videosUrls: z.array(z.string()).optional(),
  paisesPresencia: z.array(z.string()).optional(),
  estadosPresencia: z.array(z.string()).optional(),
  ciudadesPresencia: z.array(z.string()).optional(),
  categoriesIds: z.array(z.number()).min(1, "Selecciona al menos una categoría"),
  certificateIds: z.array(z.number()).optional(),
  redesSociales: z.array(z.object({
    plataforma: z.string(),
    url: z.string().url("URL inválida"),
  })).optional(),
  // Campos de membresía
  membershipTypeId: z.number().optional().nullable(),
  membershipPeriodicidad: z.enum(["mensual", "anual"]).optional(),
  formaPago: z.enum(["efectivo", "transferencia", "otro"]).optional(),
  fechaInicioMembresia: z.string().optional(),
  fechaFinMembresia: z.string().optional(),
  notasMembresia: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

// Map of icon names to components
const iconMap = {
  Tags, Building2, Car, Truck, Hammer, Factory, Cpu, Wrench, ShoppingBag,
  Briefcase, Heart, GraduationCap, Home, Coffee, Camera, Music,
  Gamepad2, Book, Palette, MapPin, Plane, Ship, Train, Zap
};

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [selectedCiudades, setSelectedCiudades] = useState<string[]>([]);
  const [catalogoFile, setCatalogoFile] = useState<File | null>(null);
  const [redesSociales, setRedesSociales] = useState<Array<{plataforma: string, url: string}>>([]);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const [emailsAdicionales, setEmailsAdicionales] = useState<string[]>([]);
  const [telefonosAdicionales, setTelefonosAdicionales] = useState<string[]>([]);
  const [representantes, setRepresentantes] = useState<string[]>([]);
  const [direccionesPorCiudad, setDireccionesPorCiudad] = useState<{[ciudad: string]: string}>({});
  const [ubicacionesPorCiudad, setUbicacionesPorCiudad] = useState<{[ciudad: string]: { lat: number; lng: number; address: string }}>({});
  const [videosUrls, setVideosUrls] = useState<string[]>([]);
  const { toast } = useToast();

  // Function to render the correct icon for categories
  const renderCategoryIcon = (category: Category) => {
    // If custom icon URL exists, use it
    if (category.iconoUrl) {
      return (
        <img
          src={category.iconoUrl}
          alt={category.nombreCategoria}
          className="w-5 h-5 object-cover rounded"
        />
      );
    }

    // Otherwise use Lucide icon
    const iconName = category.icono || "Tags";
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Tags;
    return <IconComponent className="w-5 h-5 text-primary" />;
  };

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
      categoriesIds: [],
      certificateIds: [],
      redesSociales: [],
      membershipTypeId: undefined,
      membershipPeriodicidad: undefined,
      formaPago: undefined,
      fechaInicioMembresia: new Date().toISOString().split('T')[0], // Fecha actual
      fechaFinMembresia: "",
      notasMembresia: "",
    },
  });

  // Reset form and set current date when modal opens
  useEffect(() => {
    if (open) {
      const currentDate = new Date().toISOString().split('T')[0];
      form.reset({
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
        categoriesIds: [],
        certificateIds: [],
        redesSociales: [],
        membershipTypeId: undefined,
        membershipPeriodicidad: undefined,
        formaPago: undefined,
        fechaInicioMembresia: currentDate,
        fechaFinMembresia: "",
        notasMembresia: "",
      });
      
      // Reset all state variables
      setLogoFile(null);
      setLogoPreview("");
      setSelectedEstados([]);
      setSelectedCiudades([]);
      setCatalogoFile(null);
      setRedesSociales([]);
      setGaleriaFiles([]);
      setGaleriaPreviews([]);
      setEmailsAdicionales([]);
      setTelefonosAdicionales([]);
      setRepresentantes([]);
      setDireccionesPorCiudad({});
      setUbicacionesPorCiudad({});
      setVideosUrls([]);
    }
  }, [open, form]);

  // Function to calculate end date automatically
  const calculateEndDate = (startDate: string, periodicidad: string) => {
    if (!startDate || !periodicidad) return "";
    
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (periodicidad === "mensual") {
      end.setMonth(end.getMonth() + 1);
    } else if (periodicidad === "anual") {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Watch for changes in membership fields to auto-calculate dates
  const watchedFechaInicio = form.watch("fechaInicioMembresia");
  const watchedPeriodicidad = form.watch("membershipPeriodicidad");

  useEffect(() => {
    console.log("Watch effect triggered:", { watchedFechaInicio, watchedPeriodicidad });
    if (watchedFechaInicio && watchedPeriodicidad) {
      const endDate = calculateEndDate(watchedFechaInicio, watchedPeriodicidad);
      console.log("Calculated end date:", endDate);
      form.setValue("fechaFinMembresia", endDate);
    }
  }, [watchedFechaInicio, watchedPeriodicidad, form]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: membershipTypes = [] } = useQuery<MembershipType[]>({
    queryKey: ["/api/membership-types"],
  });

  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const result = await apiRequest("POST", "/api/companies", data);
      return result;
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
      setVideosUrls([]);
      setEmailsAdicionales([]);
      setTelefonosAdicionales([]);
      setRepresentantes([]);
      setGaleriaFiles([]);
      setGaleriaPreviews([]);
      setDireccionesPorCiudad({});
      setUbicacionesPorCiudad({});
    },
    onError: (error) => {
      console.error("Error en onError:", error);
      toast({
        title: "Error",
        description: `No se pudo registrar la empresa: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // Filtrar y validar videos
      const videosValidos = videosUrls
        .filter(video => video && video.trim() !== "")
        .filter(video => {
          try {
            new URL(video);
            return true;
          } catch {
            return false;
          }
        });

      const companyData = {
        ...data,
        // Convertir membershipTypeId a null si es undefined o string vacío
        membershipTypeId: data.membershipTypeId && data.membershipTypeId !== "" ? Number(data.membershipTypeId) : null,
        videosUrls: videosValidos
      };
      
      createCompanyMutation.mutate(companyData);
    } catch (error) {
      console.error("Error al procesar datos de la empresa:", error);
    }
  };

  // Manejo del logo con drag and drop
  const handleLogoDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (!validateImage(file)) return;
      
      try {
        const imageUrl = await uploadImageToServer(file);
        setLogoFile(file);
        setLogoPreview(imageUrl);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al subir el logo al servidor",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateImage(file)) return;
      
      try {
        const imageUrl = await uploadImageToServer(file);
        setLogoFile(file);
        setLogoPreview(imageUrl);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al subir el logo al servidor",
          variant: "destructive",
        });
      }
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
    const newSocial = redesSociales.length === 0 
      ? { plataforma: "Sitio Web", url: "" }
      : { plataforma: "", url: "" };
    setRedesSociales([...redesSociales, newSocial]);
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
  const validateImage = (file: File): boolean => {
    // Validar tamaño del archivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe pesar más de 5MB",
        variant: "destructive",
      });
      return false;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir la imagen al servidor');
    }
    
    const result = await response.json();
    return result.imageUrl;
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch('/api/upload-images', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir las imágenes al servidor');
    }
    
    const result = await response.json();
    return result.images.map((img: any) => img.imageUrl);
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

    const validFiles = files.filter(validateImage);
    if (validFiles.length === 0) return;

    try {
      const imageUrls = await uploadMultipleImages(validFiles);
      
      setGaleriaFiles([...galeriaFiles, ...validFiles]);
      setGaleriaPreviews([...galeriaPreviews, ...imageUrls]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir las imágenes al servidor",
        variant: "destructive",
      });
    }
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

    const validFiles = files.filter(validateImage);
    if (validFiles.length === 0) return;

    try {
      const imageUrls = await uploadMultipleImages(validFiles);
      
      setGaleriaFiles([...galeriaFiles, ...validFiles]);
      setGaleriaPreviews([...galeriaPreviews, ...imageUrls]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir las imágenes al servidor",
        variant: "destructive",
      });
    }

    // Limpiar el input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeGaleriaImage = (index: number) => {
    const newFiles = galeriaFiles.filter((_, i) => i !== index);
    const newPreviews = galeriaPreviews.filter((_, i) => i !== index);
    setGaleriaFiles(newFiles);
    setGaleriaPreviews(newPreviews);
  };

  // Funciones para emails adicionales
  const addEmail = () => {
    if (emailsAdicionales.length < 2) { // máximo 3 emails total (1 principal + 2 adicionales)
      setEmailsAdicionales([...emailsAdicionales, ""]);
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = emailsAdicionales.filter((_, i) => i !== index);
    setEmailsAdicionales(newEmails);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emailsAdicionales];
    newEmails[index] = value;
    setEmailsAdicionales(newEmails);
  };

  // Funciones para teléfonos adicionales
  const addTelefono = () => {
    if (telefonosAdicionales.length < 2) { // máximo 3 teléfonos total (1 principal + 2 adicionales)
      setTelefonosAdicionales([...telefonosAdicionales, ""]);
    }
  };

  const removeTelefono = (index: number) => {
    const newTelefonos = telefonosAdicionales.filter((_, i) => i !== index);
    setTelefonosAdicionales(newTelefonos);
  };

  const updateTelefono = (index: number, value: string) => {
    const newTelefonos = [...telefonosAdicionales];
    newTelefonos[index] = value;
    setTelefonosAdicionales(newTelefonos);
  };

  // Funciones para representantes
  const addRepresentante = () => {
    if (representantes.length < 3) {
      setRepresentantes([...representantes, ""]);
    }
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

  // Funciones para manejar videos
  const addVideo = () => {
    if (videosUrls.length < 5) {
      setVideosUrls([...videosUrls, ""]);
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = videosUrls.filter((_, i) => i !== index);
    setVideosUrls(newVideos);
  };

  const updateVideo = (index: number, value: string) => {
    const newVideos = [...videosUrls];
    newVideos[index] = value;
    setVideosUrls(newVideos);
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



                {/* Videos dinámicos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Videos de la Empresa</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVideo}
                      disabled={videosUrls.length >= 5}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Video ({videosUrls.length}/5)
                    </Button>
                  </div>
                  
                  {videosUrls.map((video, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={video}
                        onChange={(e) => updateVideo(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVideo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {videosUrls.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay videos agregados. Haz clic en "Agregar Video" para añadir enlaces de YouTube, Vimeo, etc.
                    </p>
                  )}
                </div>

                {/* Categorías */}
                <FormField
                  control={form.control}
                  name="categoriesIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorías *</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={field.value?.includes(category.id) || false}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, category.id]);
                                } else {
                                  field.onChange(currentValues.filter(id => id !== category.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                            >
                              {renderCategoryIcon(category)}
                              {category.nombreCategoria}
                            </label>
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Certificados Disponibles</FormLabel>
                      {certificates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                          {certificates.map((certificate) => (
                            <div key={certificate.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <Checkbox
                                id={`certificate-${certificate.id}`}
                                checked={field.value?.includes(certificate.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, certificate.id]);
                                  } else {
                                    field.onChange(currentValues.filter(id => id !== certificate.id));
                                  }
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`certificate-${certificate.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer block"
                                >
                                  {certificate.nombreCertificado}
                                </label>
                                {certificate.entidadEmisora && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Emisor: {certificate.entidadEmisora}
                                  </p>
                                )}
                              </div>
                              {certificate.imagenUrl && (
                                <img 
                                  src={certificate.imagenUrl} 
                                  alt={certificate.nombreCertificado}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm">No hay certificados disponibles</p>
                          <p className="text-xs">Crea certificados primero en la sección correspondiente</p>
                        </div>
                      )}
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
                                  let newValues;
                                  if (checked) {
                                    newValues = [...currentValues, ciudad];
                                    setSelectedCiudades(prev => [...prev, ciudad]);
                                  } else {
                                    newValues = currentValues.filter(c => c !== ciudad);
                                    setSelectedCiudades(prev => prev.filter(c => c !== ciudad));
                                    // Remover dirección de esta ciudad
                                    setDireccionesPorCiudad(prev => {
                                      const newDirecciones = { ...prev };
                                      delete newDirecciones[ciudad];
                                      return newDirecciones;
                                    });
                                  }
                                  field.onChange(newValues);
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
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Descripción de la Empresa
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Describe detalladamente los productos o servicios que ofrece la empresa, su historia, misión, valores y cualquier información relevante para los clientes..."
                          height={250}
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
                    <FormItem className="md:col-span-2">
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

                {/* Emails adicionales */}
                <div className="md:col-span-2 space-y-3">
                  <FormLabel>Emails Adicionales</FormLabel>
                  {emailsAdicionales.map((email, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Input
                        placeholder={`email${index + 2}@empresa.com`}
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        type="email"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmail(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {emailsAdicionales.length < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addEmail}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Email Adicional
                    </Button>
                  )}
                </div>

                {/* Teléfono principal */}
                <FormField
                  control={form.control}
                  name="telefono1"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono Principal
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+52 55 1234 5678" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfonos adicionales */}
                <div className="md:col-span-2 space-y-3">
                  <FormLabel>Teléfonos Adicionales</FormLabel>
                  {telefonosAdicionales.map((telefono, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Input
                        placeholder={`+52 55 1234 567${index + 8}`}
                        value={telefono}
                        onChange={(e) => updateTelefono(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTelefono(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {telefonosAdicionales.length < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTelefono}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Teléfono Adicional
                    </Button>
                  )}
                </div>



                {/* Representantes */}
                <div className="md:col-span-2 space-y-3">
                  <FormLabel>Representantes de Ventas (URLs)</FormLabel>
                  {representantes.map((representante, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Input
                        placeholder="https://perfil-representante.com/usuario"
                        value={representante}
                        onChange={(e) => updateRepresentante(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRepresentante(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {representantes.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRepresentante}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Representante
                    </Button>
                  )}
                </div>

                {/* Direcciones por ciudad */}
                {selectedCiudades.length > 0 && (
                  <div className="md:col-span-2 space-y-6">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicaciones por Ciudad
                    </FormLabel>
                    {selectedCiudades.map((ciudad) => (
                      <div key={ciudad} className="space-y-4 border rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Ubicación en {ciudad}
                        </h4>
                        
                        {/* Componente de mapa */}
                        <MapLocationPicker
                          ciudad={ciudad}
                          onLocationSelect={(location) => updateUbicacionCiudad(ciudad, location)}
                          initialLocation={ubicacionesPorCiudad[ciudad] || null}
                        />
                        
                        {/* Campo de dirección adicional */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Dirección adicional (opcional)
                          </label>
                          <Textarea
                            placeholder={`Información adicional de la dirección en ${ciudad}...`}
                            value={direccionesPorCiudad[ciudad] || ""}
                            onChange={(e) => updateDireccionCiudad(ciudad, e.target.value)}
                            className="min-h-[60px]"
                          />
                          <p className="text-xs text-gray-500">
                            Ej: Edificio, piso, suite, referencias adicionales
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Información de Membresía */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-primary">Información de Membresía</h3>
                <p className="text-sm text-gray-600">Configuración de la membresía y método de pago</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de Membresía */}
                <FormField
                  control={form.control}
                  name="membershipTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Membresía</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value ? parseInt(value) : undefined);
                        // Reset periodicidad when membership type changes
                        form.setValue("membershipPeriodicidad", undefined);
                        form.setValue("fechaFinMembresia", "");
                      }} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de membresía" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.nombrePlan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Periodicidad de Membresía */}
                <FormField
                  control={form.control}
                  name="membershipPeriodicidad"
                  render={({ field }) => {
                    const selectedMembershipId = form.watch("membershipTypeId");
                    const selectedMembership = membershipTypes.find(m => m.id === selectedMembershipId);
                    const opcionesPrecios = selectedMembership 
                      ? (Array.isArray(selectedMembership.opcionesPrecios) 
                          ? selectedMembership.opcionesPrecios 
                          : JSON.parse(selectedMembership.opcionesPrecios || '[]'))
                      : [];

                    return (
                      <FormItem>
                        <FormLabel>Periodicidad</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedMembershipId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona periodicidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {opcionesPrecios.map((opcion: any, index: number) => (
                              <SelectItem key={index} value={opcion.periodicidad}>
                                {opcion.periodicidad.charAt(0).toUpperCase() + opcion.periodicidad.slice(1)} - ${opcion.costo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Forma de Pago */}
                <FormField
                  control={form.control}
                  name="formaPago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pago</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona forma de pago" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Inicio */}
                <FormField
                  control={form.control}
                  name="fechaInicioMembresia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Finalización */}
                <FormField
                  control={form.control}
                  name="fechaFinMembresia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Finalización</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notas de Membresía */}
                <FormField
                  control={form.control}
                  name="notasMembresia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notas de Membresía</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas adicionales sobre la membresía, condiciones especiales, etc."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
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