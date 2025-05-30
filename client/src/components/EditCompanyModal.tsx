import { useEffect, useState } from "react";
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
import { Category, MembershipType, CompanyWithDetails, Certificate } from "@shared/schema";
import { paisesAmericaLatina, estadosMexico, ciudadesPorEstado } from "@/lib/locationData";
import { Building, MapPin, Globe, Phone, Mail, Users, FileText, Video, Image, Plus, Trash2, Facebook, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";
import MapLocationPicker from "./MapLocationPicker";
import RichTextEditor from "./RichTextEditor";

const companySchema = z.object({
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  email1: z.string().email("Email inválido"),
  telefono1: z.string().optional(),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  videoUrl1: z.string().url("URL inválida").optional().or(z.literal("")),
  paisesPresencia: z.array(z.string()).min(1, "Selecciona al menos un país"),
  estadosPresencia: z.array(z.string()).min(1, "Selecciona al menos un estado"),
  ciudadesPresencia: z.array(z.string()).min(1, "Selecciona al menos una ciudad"),
  descripcionEmpresa: z.string().optional(),
  categoriesIds: z.array(z.number()).min(1, "Selecciona al menos una categoría"),
  certificateIds: z.array(z.number()).optional(),
  membershipTypeId: z.number({ required_error: "El tipo de membresía es requerido" }),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWithDetails | null;
}

export default function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [selectedCiudades, setSelectedCiudades] = useState<string[]>([]);
  const [redesSociales, setRedesSociales] = useState<Array<{plataforma: string, url: string}>>([]);
  const [emailsAdicionales, setEmailsAdicionales] = useState<string[]>([]);
  const [telefonosAdicionales, setTelefonosAdicionales] = useState<string[]>([]);
  const [representantes, setRepresentantes] = useState<string[]>([]);
  const [direccionesPorCiudad, setDireccionesPorCiudad] = useState<{[ciudad: string]: string}>({});
  const [ubicacionesPorCiudad, setUbicacionesPorCiudad] = useState<{[ciudad: string]: { lat: number; lng: number; address: string }}>({});
  const { toast } = useToast();

  // Plataformas de redes sociales disponibles
  const socialPlatforms = [
    { name: "Facebook", icon: Facebook },
    { name: "LinkedIn", icon: Linkedin },
    { name: "Twitter", icon: Twitter },
    { name: "Instagram", icon: Instagram },
    { name: "YouTube", icon: Youtube },
  ];

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      email1: "",
      telefono1: "",
      sitioWeb: "",
      videoUrl1: "",
      paisesPresencia: [],
      estadosPresencia: [],
      ciudadesPresencia: [],
      descripcionEmpresa: "",
      categoriesIds: [],
      certificateIds: [],
      membershipTypeId: undefined,
    },
  });

  // Cargar categorías
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Cargar tipos de membresía
  const { data: membershipTypes = [] } = useQuery<MembershipType[]>({
    queryKey: ["/api/membership-types"],
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
      // Convertir objeto redesSociales a array para el formulario
      const redesSocialesArray = company.redesSociales ? 
        Object.entries(company.redesSociales as Record<string, string>).map(([plataforma, url]) => ({ plataforma, url })) : 
        [];
      setRedesSociales(redesSocialesArray);
      setEmailsAdicionales([]);
      setTelefonosAdicionales([]);
      setRepresentantes((company.representantesVentas as string[]) || []);
      setDireccionesPorCiudad({});

      // Cargar datos en el formulario
      form.reset({
        nombreEmpresa: company.nombreEmpresa,
        logotipoUrl: company.logotipoUrl || "",
        telefono1: company.telefono1 || "",
        telefono2: company.telefono2 || "",
        email1: company.email1,
        email2: company.email2 || "",
        sitioWeb: company.sitioWeb || "",
        videoUrl1: company.videoUrl1 || "",
        videoUrl2: company.videoUrl2 || "",
        videoUrl3: company.videoUrl3 || "",
        paisesPresencia: (company.paisesPresencia as string[]) || [],
        estadosPresencia: (company.estadosPresencia as string[]) || [],
        ciudadesPresencia: (company.ciudadesPresencia as string[]) || [],
        direccionFisica: company.direccionFisica || "",
        descripcionEmpresa: company.descripcionEmpresa || "",
        catalogoDigitalUrl: company.catalogoDigitalUrl || "",
        categoriesIds: (company.categoriesIds as number[]) || [],
        membershipTypeId: company.membershipTypeId ?? undefined,
        certificateIds: (company.certificateIds as number[]) || [],
        estado: company.estado || "activo",
      });
    }
  }, [company, open, form]);

  // Mutación para actualizar empresa
  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (!company) throw new Error("No company selected");
      
      const updateData = {
        ...data,
        redesSociales,
        representantesVentas: representantes.filter(r => r.trim() !== ""),
      };

      const response = await apiRequest(`/api/companies/${company.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la empresa");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Éxito",
        description: "Empresa actualizada correctamente",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la empresa",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    updateMutation.mutate(data);
  };

  // Funciones para redes sociales
  const addSocialMedia = () => {
    if (redesSociales.length < 5) {
      const newSocial = redesSociales.length === 0 
        ? { plataforma: "Sitio Web", url: "" }
        : { plataforma: "", url: "" };
      setRedesSociales([...redesSociales, newSocial]);
    }
  };

  const removeSocialMedia = (index: number) => {
    const newSocials = redesSociales.filter((_, i) => i !== index);
    setRedesSociales(newSocials);
  };

  const updateSocialMedia = (index: number, field: string, value: string) => {
    const newSocials = [...redesSociales];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setRedesSociales(newSocials);
  };

  // Funciones para emails adicionales
  const addEmail = () => {
    if (emailsAdicionales.length < 2) {
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
    if (telefonosAdicionales.length < 2) {
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
            Editar Empresa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Sección: Información de la Empresa */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-primary">Información de la Empresa</h3>
                <p className="text-sm text-gray-600">Datos generales de la empresa</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de la empresa */}
                <FormField
                  control={form.control}
                  name="nombreEmpresa"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Nombre de la Empresa *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo de la empresa" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Promocional
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {category.nombreCategoria}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Países de presencia */}
                <FormField
                  control={form.control}
                  name="paisesPresencia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Países de Presencia *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-32 overflow-y-auto border rounded-lg p-4">
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

                {/* Estados de presencia */}
                <FormField
                  control={form.control}
                  name="estadosPresencia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Estados de México *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                        {estadosMexico.map((estado) => (
                          <div key={estado} className="flex items-center space-x-2">
                            <Checkbox
                              id={`estado-${estado}`}
                              checked={field.value?.includes(estado) || false}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  const newValues = [...currentValues, estado];
                                  field.onChange(newValues);
                                  setSelectedEstados(prev => [...prev, estado]);
                                } else {
                                  const newValues = currentValues.filter(e => e !== estado);
                                  field.onChange(newValues);
                                  setSelectedEstados(prev => prev.filter(e => e !== estado));
                                }
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

                {/* Ciudades de presencia */}
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

                {/* Descripción */}
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

                {/* Redes sociales */}
                <div className="md:col-span-2 space-y-4">
                  <FormLabel>Redes Sociales</FormLabel>
                  {redesSociales.map((social, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <Select
                        value={social.plataforma}
                        onValueChange={(value) => updateSocialMedia(index, "plataforma", value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map((platform) => (
                            <SelectItem key={platform.name} value={platform.name}>
                              <div className="flex items-center gap-2">
                                <platform.icon className="h-4 w-4" />
                                {platform.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="URL de la red social"
                        value={social.url}
                        onChange={(e) => updateSocialMedia(index, "url", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialMedia(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {redesSociales.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSocialMedia}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Red Social
                    </Button>
                  )}
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

                {/* Tipo de membresía */}
                <FormField
                  control={form.control}
                  name="membershipTypeId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tipo de Membresía *</FormLabel>
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

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Actualizando..." : "Actualizar Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}