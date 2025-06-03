import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileImage, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Certificate, InsertCertificate } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const certificateSchema = z.object({
  nombreCertificado: z.string().min(1, "El nombre es requerido"),
  imagenUrl: z.string().min(1, "La imagen es requerida"),
  descripcion: z.string().optional(),
  fechaEmision: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  entidadEmisora: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function Certificates() {
  const [open, setOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      nombreCertificado: "",
      imagenUrl: "",
      descripcion: "",
      fechaEmision: "",
      fechaVencimiento: "",
      entidadEmisora: "",
    },
  });

  const editForm = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      nombreCertificado: "",
      imagenUrl: "",
      descripcion: "",
      fechaEmision: "",
      fechaVencimiento: "",
      entidadEmisora: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CertificateFormData) => {
      console.log("Enviando datos del certificado:", data);
      const response = await apiRequest("POST", "/api/certificates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      toast({ title: "Certificado creado exitosamente" });
      setOpen(false);
      form.reset();
      setSelectedImage(null);
      setImagePreview("");
    },
    onError: (error: any) => {
      console.error("Error al crear certificado:", error);
      const errorMessage = error?.message || "Error al crear certificado";
      toast({ 
        title: "Error al crear certificado", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CertificateFormData) => {
      const response = await apiRequest("PUT", `/api/certificates/${editingCertificate?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      toast({ title: "Certificado actualizado exitosamente" });
      setEditOpen(false);
      editForm.reset();
      setEditingCertificate(null);
    },
    onError: () => {
      toast({ title: "Error al actualizar certificado", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/certificates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      toast({ title: "Certificado eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar certificado", variant: "destructive" });
    },
  });

  const onSubmit = (data: CertificateFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: CertificateFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    editForm.reset({
      nombreCertificado: certificate.nombreCertificado,
      imagenUrl: certificate.imagenUrl,
      descripcion: certificate.descripcion || "",
      fechaEmision: certificate.fechaEmision || "",
      fechaVencimiento: certificate.fechaVencimiento || "",
      entidadEmisora: certificate.entidadEmisora || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este certificado?")) {
      deleteMutation.mutate(id);
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "La imagen no puede superar los 5MB", variant: "destructive" });
        resolve(false);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({ title: "Solo se permiten archivos de imagen", variant: "destructive" });
        resolve(false);
        return;
      }

      resolve(true);
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

  const handleImageChange = async (file: File) => {
    if (await validateImage(file)) {
      setSelectedImage(file);
      const processedImage = await processImageToSquare(file);
      setImagePreview(processedImage);
      form.setValue("imagenUrl", processedImage);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Cargando certificados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#4a4a49]">Certificados</h1>
          <p className="text-gray-600">Gestiona los certificados de la plataforma</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0f2161] hover:bg-[#0f2161]/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Certificado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Certificado</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nombreCertificado">Nombre del Certificado</Label>
                <Input
                  id="nombreCertificado"
                  {...form.register("nombreCertificado")}
                  placeholder="Ej: ISO 9001:2015"
                />
                {form.formState.errors.nombreCertificado && (
                  <p className="text-sm text-red-500">{form.formState.errors.nombreCertificado.message}</p>
                )}
              </div>

              <div>
                <Label>Imagen del Certificado</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img src={imagePreview} alt="Preview" className="max-w-xs mx-auto rounded-lg" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setImagePreview("");
                          setSelectedImage(null);
                          form.setValue("imagenUrl", "");
                        }}
                      >
                        Cambiar imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-gray-600">Arrastra una imagen aquí o</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageChange(file);
                          }}
                          className="mt-2"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Máximo 5MB. Se recortará automáticamente a formato cuadrado.</p>
                    </div>
                  )}
                </div>
                {form.formState.errors.imagenUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.imagenUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  {...form.register("descripcion")}
                  placeholder="Descripción del certificado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaEmision">Fecha de Emisión</Label>
                  <Input
                    id="fechaEmision"
                    type="date"
                    {...form.register("fechaEmision")}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                  <Input
                    id="fechaVencimiento"
                    type="date"
                    {...form.register("fechaVencimiento")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="entidadEmisora">Entidad Emisora</Label>
                <Input
                  id="entidadEmisora"
                  {...form.register("entidadEmisora")}
                  placeholder="Ej: Bureau Veritas"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Certificado"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={certificate.imagenUrl} 
                  alt={certificate.nombreCertificado}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 text-[#4a4a49]">{certificate.nombreCertificado}</CardTitle>
              
              {certificate.descripcion && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{certificate.descripcion}</p>
              )}
              
              <div className="space-y-2 text-sm">
                {certificate.entidadEmisora && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{certificate.entidadEmisora}</span>
                  </div>
                )}
                
                {certificate.fechaEmision && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Emitido: {new Date(certificate.fechaEmision).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {certificate.fechaVencimiento && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Vence: {new Date(certificate.fechaVencimiento).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <Badge variant={certificate.estado === "activo" ? "default" : "secondary"}>
                  {certificate.estado}
                </Badge>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(certificate)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(certificate.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primer certificado</p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Certificado
          </Button>
        </div>
      )}

      {/* Dialog de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Certificado</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            {/* Aquí iría el mismo formulario pero con editForm */}
            <div>
              <Label htmlFor="edit_nombreCertificado">Nombre del Certificado</Label>
              <Input
                id="edit_nombreCertificado"
                {...editForm.register("nombreCertificado")}
                placeholder="Ej: ISO 9001:2015"
              />
            </div>

            <div>
              <Label htmlFor="edit_descripcion">Descripción</Label>
              <Textarea
                id="edit_descripcion"
                {...editForm.register("descripcion")}
                placeholder="Descripción del certificado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_fechaEmision">Fecha de Emisión</Label>
                <Input
                  id="edit_fechaEmision"
                  type="date"
                  {...editForm.register("fechaEmision")}
                />
              </div>
              <div>
                <Label htmlFor="edit_fechaVencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="edit_fechaVencimiento"
                  type="date"
                  {...editForm.register("fechaVencimiento")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_entidadEmisora">Entidad Emisora</Label>
              <Input
                id="edit_entidadEmisora"
                {...editForm.register("entidadEmisora")}
                placeholder="Ej: Bureau Veritas"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Actualizando..." : "Actualizar Certificado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}