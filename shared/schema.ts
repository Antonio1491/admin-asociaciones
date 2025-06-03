import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("user"), // "admin" or "user"
  stripeCustomerId: text("stripe_customer_id"),
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
  opcionesPrecios: jsonb("opciones_precios"), // Array of {periodicidad: string, costo: number}
  beneficios: jsonb("beneficios"), // Array of benefits
  visibilidad: text("visibilidad").notNull().default("publica"), // "publica" o "privada"
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
  videosUrls: jsonb("videos_urls"), // Array of video URLs
  membershipTypeId: integer("membership_type_id").references(() => membershipTypes.id),
  sitioWeb: text("sitio_web"),
  certificateIds: jsonb("certificate_ids"), // Array of certificate IDs
  // Campos de información de membresía
  formaPago: text("forma_pago"), // "efectivo", "transferencia", "otro"
  fechaInicioMembresia: text("fecha_inicio_membresia"),
  fechaFinMembresia: text("fecha_fin_membresia"),
  notasMembresia: text("notas_membresia"),
  userId: integer("user_id").references(() => users.id), // Owner of the company
  estado: text("estado").notNull().default("activo"), // "activo", "inactivo", "pendiente"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  nombreCertificado: text("nombre_certificado").notNull(),
  imagenUrl: text("imagen_url").notNull(),
  descripcion: text("descripcion"),
  fechaEmision: text("fecha_emision"),
  fechaVencimiento: text("fecha_vencimiento"),
  entidadEmisora: text("entidad_emisora"),
  estado: text("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion"),
  permisos: jsonb("permisos"), // Array of permissions
  estado: text("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opinions = pgTable("opinions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  userId: integer("user_id").references(() => users.id),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  calificacion: integer("calificacion").notNull(), // 1-5 estrellas
  comentario: text("comentario").notNull(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  estado: text("estado").notNull().default("pendiente"), // pendiente, aprobada, rechazada
  fechaAprobacion: timestamp("fecha_aprobacion"),
  aprobadoPor: integer("aprobado_por").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const membershipPayments = pgTable("membership_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  membershipTypeId: integer("membership_type_id").references(() => membershipTypes.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("mxn"),
  status: text("status").notNull().default("pending"), // pending, succeeded, failed, canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("Directorio Industrial").notNull(),
  siteDescription: text("site_description").default("Plataforma de administración web para organizaciones"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#2563eb").notNull(),
  secondaryColor: text("secondary_color").default("#f97316").notNull(),
  accentColor: text("accent_color").default("#10b981").notNull(),
  currency: text("currency").default("USD").notNull(),
  currencySymbol: text("currency_symbol").default("$").notNull(),
  language: text("language").default("es").notNull(),
  timezone: text("timezone").default("America/Mexico_City").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  socialMedia: jsonb("social_media"), // {facebook, twitter, linkedin, instagram}
  seoSettings: jsonb("seo_settings"), // {metaTitle, metaDescription, keywords}
  emailSettings: jsonb("email_settings"), // {smtpHost, smtpPort, smtpUser, fromEmail}
  paymentSettings: jsonb("payment_settings"), // {enableStripe, stripeCurrency}
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  registrationEnabled: boolean("registration_enabled").default(true).notNull(),
  maxFileSize: integer("max_file_size").default(10485760).notNull(), // 10MB in bytes
  allowedFileTypes: jsonb("allowed_file_types").default(['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']).notNull(),
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
}).extend({
  opcionesPrecios: z.array(z.object({
    periodicidad: z.string(),
    costo: z.number()
  })).optional(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpinionSchema = createInsertSchema(opinions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  fechaCreacion: true,
  fechaAprobacion: true,
  aprobadoPor: true,
});

export const insertMembershipPaymentSchema = createInsertSchema(membershipPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
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

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Opinion = typeof opinions.$inferSelect;
export type InsertOpinion = z.infer<typeof insertOpinionSchema>;

export type MembershipPayment = typeof membershipPayments.$inferSelect;
export type InsertMembershipPayment = z.infer<typeof insertMembershipPaymentSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  opinions: many(opinions),
  approvedOpinions: many(opinions, { relationName: "approvedBy" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  membershipType: one(membershipTypes, {
    fields: [companies.membershipTypeId],
    references: [membershipTypes.id],
  }),
  opinions: many(opinions),
}));

export const membershipTypesRelations = relations(membershipTypes, ({ many }) => ({
  companies: many(companies),
}));

export const opinionsRelations = relations(opinions, ({ one }) => ({
  company: one(companies, {
    fields: [opinions.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [opinions.userId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [opinions.aprobadoPor],
    references: [users.id],
    relationName: "approvedBy",
  }),
}));

// Extended types for API responses
export type CompanyWithDetails = Company & {
  categories?: Category[];
  membershipType?: MembershipType;
  user?: User;
  certificates?: Certificate[];
};
