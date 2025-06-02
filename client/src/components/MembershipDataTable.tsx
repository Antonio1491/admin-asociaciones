import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, Eye, Crown } from "lucide-react";
import { MembershipType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Swal from 'sweetalert2';

interface MembershipDataTableProps {
  memberships: MembershipType[];
  onEdit: (membership: MembershipType) => void;
  onView: (membership: MembershipType) => void;
}

export default function MembershipDataTable({ memberships, onEdit, onView }: MembershipDataTableProps) {
  const { toast } = useToast();

  // Delete membership mutation
  const deleteMembershipMutation = useMutation({
    mutationFn: async (membershipId: number) => {
      await apiRequest("DELETE", `/api/membership-types/${membershipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership-types"] });
      toast({
        title: "Membresía eliminada",
        description: "El tipo de membresía ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de membresía",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (membershipId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar membresía?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      deleteMembershipMutation.mutate(membershipId);
    }
  };

  const formatPeriodicity = (periodicity: string) => {
    const periodicityMap: { [key: string]: string } = {
      monthly: "Mensual",
      yearly: "Anual",
      quarterly: "Trimestral",
      biannual: "Semestral",
    };
    return periodicityMap[periodicity] || periodicity;
  };

  const getBadgeVariant = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "enterprise":
        return "secondary";
      case "premium":
        return "outline";
      case "básico":
      case "basico":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <CardTitle>Tipos de Membresía</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {memberships.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay tipos de membresía registrados</p>
            <p className="text-gray-400 text-sm">Crea el primer tipo de membresía para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Periodicidad</TableHead>
                  <TableHead>Beneficios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getBadgeVariant(membership.nombrePlan)}>
                          {membership.nombrePlan}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {membership.descripcionPlan || "Sin descripción"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        ${membership.costo || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatPeriodicity(membership.periodicidad || "")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-sm">
                        {Array.isArray(membership.beneficios) && membership.beneficios.length > 0 ? (
                          <div className="text-xs text-gray-600">
                            {membership.beneficios.slice(0, 2).map((benefit, index) => (
                              <div key={index} className="truncate">• {benefit}</div>
                            ))}
                            {membership.beneficios.length > 2 && (
                              <div className="text-gray-400">
                                +{membership.beneficios.length - 2} más
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin beneficios</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(membership)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(membership)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(membership.id)}
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
  );
}