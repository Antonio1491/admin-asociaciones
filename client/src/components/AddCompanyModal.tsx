import { useState } from "react";
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
import { Category, MembershipType } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const companySchema = z.object({
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  email1: z.string().email("Email inválido"),
  email2: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono1: z.string().min(1, "El teléfono principal es requerido"),
  telefono2: z.string().optional(),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  direccionFisica: z.string().optional(),
  descripcionEmpresa: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  membershipTypeId: z.string().min(1, "El tipo de membresía es requerido"),
  paisesPresencia: z.string().optional(),
  estadosPresencia: z.string().optional(),
  ciudadesPresencia: z.string().optional(),
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  twitterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  videoUrl1: z.string().url("URL inválida").optional().or(z.literal("")),
  videoUrl2: z.string().url("URL inválida").optional().or(z.literal("")),
  videoUrl3: z.string().url("URL inválida").optional().or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nombreEmpresa: "",
      email1: "",
      email2: "",
      telefono1: "",
      telefono2: "",
      sitioWeb: "",
      direccionFisica: "",
      descripcionEmpresa: "",
      categoryId: "",
      membershipTypeId: "",
      paisesPresencia: "",
      estadosPresencia: "",
      ciudadesPresencia: "",
      facebookUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      videoUrl1: "",
      videoUrl2: "",
      videoUrl3: "",
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
      const companyData = {
        ...data,
        categoryId: parseInt(data.categoryId),
        membershipTypeId: parseInt(data.membershipTypeId),
        userId: user?.id,
        paisesPresencia: data.paisesPresencia ? [data.paisesPresencia] : [],
        estadosPresencia: data.estadosPresencia ? [data.estadosPresencia] : [],
        ciudadesPresencia: data.ciudadesPresencia ? [data.ciudadesPresencia] : [],
        redesSociales: {
          facebook: data.facebookUrl || null,
          linkedin: data.linkedinUrl || null,
          twitter: data.twitterUrl || null,
          instagram: data.instagramUrl || null,
        },
      };

      const response = await apiRequest("POST", "/api/companies", companyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Empresa creada",
        description: "La empresa ha sido creada exitosamente",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la empresa",
        variant: "destructive",
      });
      console.error("Error creating company:", error);
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Empresa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombreEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre de la empresa" {...field} />
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
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Principal *</FormLabel>
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
                    <FormLabel>Email Secundario</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ventas@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="telefono1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Principal *</FormLabel>
                    <FormControl>
                      <Input placeholder="+52 55 1234 5678" {...field} />
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
                    <FormLabel>Teléfono Secundario</FormLabel>
                    <FormControl>
                      <Input placeholder="+52 55 8765 4321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Geographic Presence */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Presencia Geográfica</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="paisesPresencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="México" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estadosPresencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad de México" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ciudadesPresencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad de México" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Physical Address */}
            <FormField
              control={form.control}
              name="direccionFisica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección Física</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Calle, número, colonia, código postal..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Membership */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
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

              <FormField
                control={form.control}
                name="membershipTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Membresía *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar membresía" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {membershipTypes.map((membershipType) => (
                          <SelectItem key={membershipType.id} value={membershipType.id.toString()}>
                            {membershipType.nombrePlan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company Description */}
            <FormField
              control={form.control}
              name="descripcionEmpresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Empresa</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa los servicios, productos y misión de la empresa..."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Networks */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Redes Sociales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/company/empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Videos */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Videos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="videoUrl1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL 1</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL 2</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL 3</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCompanyMutation.isPending}>
                {createCompanyMutation.isPending ? "Guardando..." : "Guardar Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
