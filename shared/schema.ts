import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("user"), // "admin" or "user"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nombreCategoria: text("nombre_categoria").notNull(),
  descripcion: text("descripcion"),
  icono: text("icono").default("Tag"), // Lucide icon name
  iconoUrl: text("icono_url"), // Custom icon URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const membershipTypes = pgTable("membership_types", {
  id: serial("id").primaryKey(),
  nombrePlan: text("nombre_plan").notNull(),
  descripcionPlan: text("descripcion_plan"),
  costo: decimal("costo", { precision: 10, scale: 2 }),
  periodicidad: text("periodicidad"), // "monthly", "yearly", etc.
  beneficios: jsonb("beneficios"), // Array of benefits
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  nombreEmpresa: text("nombre_empresa").notNull(),
  logotipoUrl: text("logotipo_url"),
  telefono1: text("telefono1"),
  telefono2: text("telefono2"),
  email1: text("email1").notNull(),
  email2: text("email2"),
  paisesPresencia: jsonb("paises_presencia"), // Array of strings
  estadosPresencia: jsonb("estados_presencia"), // Array of strings
  ciudadesPresencia: jsonb("ciudades_presencia"), // Array of strings
  direccionFisica: text("direccion_fisica"),
  ubicacionGeografica: jsonb("ubicacion_geografica"), // {lat: number, lng: number}
  representantesVentas: jsonb("representantes_ventas"), // Array of user IDs
  descripcionEmpresa: text("descripcion_empresa"),
  galeriaProductosUrls: jsonb("galeria_productos_urls"), // Array of image URLs
  categoriesIds: jsonb("categories_ids"), // Array of category IDs
  redesSociales: jsonb("redes_sociales"), // Object with social media URLs
  catalogoDigitalUrl: text("catalogo_digital_url"),
  videoUrl1: text("video_url1"),
  videoUrl2: text("video_url2"),
  videoUrl3: text("video_url3"),
  membershipTypeId: integer("membership_type_id").references(() => membershipTypes.id),
  sitioWeb: text("sitio_web"),
  userId: integer("user_id").references(() => users.id), // Owner of the company
  estado: text("estado").notNull().default("activo"), // "activo", "inactivo", "pendiente"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipTypeSchema = createInsertSchema(membershipTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MembershipType = typeof membershipTypes.$inferSelect;
export type InsertMembershipType = z.infer<typeof insertMembershipTypeSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// Extended types for API responses
export type CompanyWithDetails = Company & {
  categories?: Category[];
  membershipType?: MembershipType;
  user?: User;
};
