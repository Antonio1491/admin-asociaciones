import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Image, 
  Globe, 
  DollarSign,
  Save,
  Upload,
  Eye
} from "lucide-react";
import Swal from "sweetalert2";

const systemSettingsSchema = z.object({
  systemName: z.string().min(1, "Nombre del sistema es requerido"),
  systemDescription: z.string().optional(),
  primaryColor: z.string().min(1, "Color primario es requerido"),
  secondaryColor: z.string().min(1, "Color secundario es requerido"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  currency: z.string().min(1, "Moneda es requerida"),
  systemUrl: z.string().optional(),
  contactEmail: z.string().email("Email válido requerido").optional(),
  contactPhone: z.string().optional(),
  socialMedia: z.string().optional(),
});

type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

export default function SystemSettings() {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const form = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      systemName: settings?.systemName || "Mi Organización",
      systemDescription: settings?.systemDescription || "",
      primaryColor: settings?.primaryColor || "#3b82f6",
      secondaryColor: settings?.secondaryColor || "#64748b",
      logoUrl: settings?.logoUrl || "",
      faviconUrl: settings?.faviconUrl || "",
      currency: settings?.currency || "USD",
      systemUrl: settings?.systemUrl || "",
      contactEmail: settings?.contactEmail || "",
      contactPhone: settings?.contactPhone || "",
      socialMedia: settings?.socialMedia || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SystemSettingsFormData) => {
      const response = await apiRequest("PUT", "/api/system-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      Swal.fire({
        title: "¡Éxito!",
        text: "Configuración actualizada correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#10b981",
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: "Error",
        text: error.message || "Error al actualizar la configuración",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ef4444",
      });
    },
  });

  const onSubmit = (data: SystemSettingsFormData) => {
    updateMutation.mutate(data);
  };

  const handleImageUpload = async (file: File, field: 'logoUrl' | 'faviconUrl') => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const size = field === 'faviconUrl' ? 32 : 200;
        canvas.width = size;
        canvas.height = size;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, size, size);
        
        // Convertir a base64
        const dataUrl = canvas.toDataURL('image/png');
        form.setValue(field, dataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "destructive",
      });
    }
  };

  const applyPreview = () => {
    const formData = form.getValues();
    const root = document.documentElement;
    
    if (isPreviewMode) {
      // Aplicar colores de vista previa
      root.style.setProperty('--primary', formData.primaryColor);
      root.style.setProperty('--secondary', formData.secondaryColor);
      
      // Actualizar título del documento
      document.title = formData.systemName;
      
      // Actualizar favicon si existe
      if (formData.faviconUrl) {
        let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }
        favicon.href = formData.faviconUrl;
      }
    } else {
      // Restaurar valores originales
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      document.title = settings?.systemName || "Mi Organización";
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    setTimeout(applyPreview, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Personaliza la apariencia y configuración de tu organización
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isPreviewMode ? "default" : "outline"}
            onClick={togglePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Aplicando Vista Previa" : "Vista Previa"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Información General
                </CardTitle>
                <CardDescription>
                  Configura la información básica de tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="systemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Sistema</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mi Organización" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="systemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descripción de tu organización"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="systemUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Sistema</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://mi-organizacion.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Apariencia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia
                </CardTitle>
                <CardDescription>
                  Personaliza los colores y tema visual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Primario</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            {...field} 
                            type="color" 
                            className="w-16 h-10 p-1 rounded"
                          />
                          <Input 
                            {...field} 
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Secundario</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            {...field} 
                            type="color" 
                            className="w-16 h-10 p-1 rounded"
                          />
                          <Input 
                            {...field} 
                            placeholder="#64748b"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Moneda
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="USD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imágenes
                </CardTitle>
                <CardDescription>
                  Logo y favicon de tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, 'logoUrl');
                              }
                            }}
                          />
                          {field.value && (
                            <img 
                              src={field.value} 
                              alt="Logo preview" 
                              className="w-16 h-16 object-contain border rounded"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faviconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, 'faviconUrl');
                              }
                            }}
                          />
                          {field.value && (
                            <img 
                              src={field.value} 
                              alt="Favicon preview" 
                              className="w-8 h-8 object-contain border rounded"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Datos de contacto de la organización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="contacto@mi-organizacion.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 234 567 8900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redes Sociales (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder='{"facebook": "https://facebook.com/...", "twitter": "https://twitter.com/..."}'
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Información sobre Vista Previa */}
          {isPreviewMode && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-blue-800">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Modo Vista Previa Activo</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Los cambios de colores y título se están aplicando temporalmente. 
                  Guarda los cambios para aplicarlos permanentemente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="min-w-32"
            >
              {updateMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}