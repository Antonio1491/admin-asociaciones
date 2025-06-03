import { 
  users, 
  companies, 
  categories, 
  membershipTypes, 
  certificates,
  roles,
  opinions,
  membershipPayments,
  type User, 
  type Company, 
  type Category, 
  type MembershipType, 
  type Certificate,
  type Role,
  type Opinion,
  type InsertUser,
  type InsertCompany,
  type InsertCategory,
  type InsertMembershipType,
  type InsertCertificate,
  type InsertRole,
  type InsertOpinion,
  type MembershipPayment,
  type InsertMembershipPayment,
  type CompanyWithDetails,
  systemSettings,
  type SystemSettings,
  type InsertSystemSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, like, sql, and, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Companies
  getCompany(id: number): Promise<CompanyWithDetails | undefined>;
  getAllCompanies(options?: {
    search?: string;
    categoryId?: number;
    membershipTypeId?: number;
    estado?: string;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  }): Promise<{ companies: CompanyWithDetails[]; total: number }>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  getCompaniesByUser(userId: number): Promise<CompanyWithDetails[]>;

  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Membership Types
  getMembershipType(id: number): Promise<MembershipType | undefined>;
  getAllMembershipTypes(): Promise<MembershipType[]>;
  createMembershipType(membershipType: InsertMembershipType): Promise<MembershipType>;
  updateMembershipType(id: number, membershipType: Partial<InsertMembershipType>): Promise<MembershipType | undefined>;
  deleteMembershipType(id: number): Promise<boolean>;

  // Certificates
  getCertificate(id: number): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, certificate: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  deleteCertificate(id: number): Promise<boolean>;

  // Roles
  getRole(id: number): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Opinions
  getOpinion(id: number): Promise<Opinion | undefined>;
  getAllOpinions(options?: {
    estado?: string;
    companyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ opinions: Opinion[]; total: number }>;
  createOpinion(opinion: InsertOpinion): Promise<Opinion>;
  updateOpinion(id: number, opinion: Partial<InsertOpinion>): Promise<Opinion | undefined>;
  deleteOpinion(id: number): Promise<boolean>;
  approveOpinion(id: number, approvedBy: number): Promise<Opinion | undefined>;
  rejectOpinion(id: number, approvedBy: number): Promise<Opinion | undefined>;

  // Statistics
  getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }>;

  // Membership Payments
  createMembershipPayment(payment: InsertMembershipPayment): Promise<MembershipPayment>;
  getMembershipPayment(id: number): Promise<MembershipPayment | undefined>;
  getMembershipPaymentByStripeId(stripePaymentIntentId: string): Promise<MembershipPayment | undefined>;
  updateMembershipPaymentStatus(id: number, status: string): Promise<MembershipPayment | undefined>;
  getUserPayments(userId: number): Promise<MembershipPayment[]>;
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Companies
  async getCompany(id: number): Promise<CompanyWithDetails | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    // Get related data
    const [membershipType] = company.membershipTypeId 
      ? await db.select().from(membershipTypes).where(eq(membershipTypes.id, company.membershipTypeId))
      : [undefined];

    const [user] = company.userId 
      ? await db.select().from(users).where(eq(users.id, company.userId))
      : [undefined];

    // Get categories and certificates from JSON arrays
    const companyCategoriesIds = (company.categoriesIds as number[]) || [];
    const companyCertificateIds = (company.certificateIds as number[]) || [];

    // Get categories and certificates - simplified approach
    let companyCategories = [];
    let companyCertificates = [];
    
    if (companyCategoriesIds.length > 0) {
      for (const catId of companyCategoriesIds) {
        const [category] = await db.select().from(categories).where(eq(categories.id, catId));
        if (category) companyCategories.push(category);
      }
    }
    
    if (companyCertificateIds.length > 0) {
      for (const certId of companyCertificateIds) {
        const [certificate] = await db.select().from(certificates).where(eq(certificates.id, certId));
        if (certificate) companyCertificates.push(certificate);
      }
    }

    return {
      ...company,
      membershipType: membershipType || undefined,
      user: user || undefined,
      categories: companyCategories,
      certificates: companyCertificates
    };
  }

  async getAllCompanies(options: {
    search?: string;
    categoryId?: number;
    membershipTypeId?: number;
    estado?: string;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  } = {}): Promise<{ companies: CompanyWithDetails[]; total: number }> {
    const { search, categoryId, membershipTypeId, estado, limit = 10, offset = 0, includeInactive = false } = options;
    
    // Primero actualizar automáticamente las empresas con membresías vencidas
    const today = new Date().toISOString().split('T')[0];
    await db
      .update(companies)
      .set({ estado: 'inactivo' })
      .where(
        and(
          eq(companies.estado, 'activo'),
          sql`${companies.fechaFinMembresia} < ${today}`
        )
      );
    
    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(companies.nombreEmpresa, `%${search}%`),
          like(companies.descripcionEmpresa, `%${search}%`)
        )
      );
    }

    if (membershipTypeId) {
      whereConditions.push(eq(companies.membershipTypeId, membershipTypeId));
    }

    if (estado) {
      whereConditions.push(eq(companies.estado, estado));
    }

    // Por defecto, solo mostrar empresas activas en el frontend público
    // Si no se especifica un estado y no se incluyen inactivas, mostrar solo activas
    if (!estado && !includeInactive) {
      whereConditions.push(eq(companies.estado, 'activo'));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [companiesResult, countResult] = await Promise.all([
      db.select().from(companies).where(whereClause).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(companies).where(whereClause)
    ]);

    // Enrich with related data
    const enrichedCompanies = await Promise.all(
      companiesResult.map(async (company) => {
        const [membershipType] = company.membershipTypeId 
          ? await db.select().from(membershipTypes).where(eq(membershipTypes.id, company.membershipTypeId))
          : [undefined];

        const [user] = company.userId 
          ? await db.select().from(users).where(eq(users.id, company.userId))
          : [undefined];

        const companyCategoriesIds = (company.categoriesIds as number[]) || [];
        const companyCertificateIds = (company.certificateIds as number[]) || [];

        // Get categories and certificates
        let companyCategories = [];
        let companyCertificates = [];
        
        if (companyCategoriesIds.length > 0) {
          for (const catId of companyCategoriesIds) {
            const [category] = await db.select().from(categories).where(eq(categories.id, catId));
            if (category) companyCategories.push(category);
          }
        }
        
        if (companyCertificateIds.length > 0) {
          for (const certId of companyCertificateIds) {
            const [certificate] = await db.select().from(certificates).where(eq(certificates.id, certId));
            if (certificate) companyCertificates.push(certificate);
          }
        }

        return {
          ...company,
          membershipType: membershipType || undefined,
          user: user || undefined,
          categories: companyCategories,
          certificates: companyCertificates
        };
      })
    );

    return {
      companies: enrichedCompanies,
      total: countResult[0]?.count || 0
    };
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies).set(companyData).where(eq(companies.id, id)).returning();
    return company || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCompaniesByUser(userId: number): Promise<CompanyWithDetails[]> {
    const userCompanies = await db.select().from(companies).where(eq(companies.userId, userId));
    
    const enrichedCompanies = await Promise.all(
      userCompanies.map(async (company) => {
        const [membershipType] = company.membershipTypeId 
          ? await db.select().from(membershipTypes).where(eq(membershipTypes.id, company.membershipTypeId))
          : [undefined];

        const companyCategoriesIds = (company.categoriesIds as number[]) || [];
        const companyCertificateIds = (company.certificateIds as number[]) || [];

        // Get categories and certificates - simplified approach
        let companyCategories = [];
        let companyCertificates = [];
        
        if (companyCategoriesIds.length > 0) {
          for (const catId of companyCategoriesIds) {
            const [category] = await db.select().from(categories).where(eq(categories.id, catId));
            if (category) companyCategories.push(category);
          }
        }
        
        if (companyCertificateIds.length > 0) {
          for (const certId of companyCertificateIds) {
            const [certificate] = await db.select().from(certificates).where(eq(certificates.id, certId));
            if (certificate) companyCertificates.push(certificate);
          }
        }

        return {
          ...company,
          membershipType: membershipType || undefined,
          user: undefined, // We already know the user
          categories: companyCategories,
          certificates: companyCertificates
        };
      })
    );

    return enrichedCompanies;
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Membership Types
  async getMembershipType(id: number): Promise<MembershipType | undefined> {
    const [membershipType] = await db.select().from(membershipTypes).where(eq(membershipTypes.id, id));
    return membershipType || undefined;
  }

  async getAllMembershipTypes(): Promise<MembershipType[]> {
    return await db.select().from(membershipTypes);
  }

  async createMembershipType(insertMembershipType: InsertMembershipType): Promise<MembershipType> {
    const [membershipType] = await db.insert(membershipTypes).values(insertMembershipType).returning();
    return membershipType;
  }

  async updateMembershipType(id: number, membershipTypeData: Partial<InsertMembershipType>): Promise<MembershipType | undefined> {
    const [membershipType] = await db.update(membershipTypes).set(membershipTypeData).where(eq(membershipTypes.id, id)).returning();
    return membershipType || undefined;
  }

  async deleteMembershipType(id: number): Promise<boolean> {
    const result = await db.delete(membershipTypes).where(eq(membershipTypes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Certificates
  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db.insert(certificates).values(insertCertificate).returning();
    return certificate;
  }

  async updateCertificate(id: number, certificateData: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const [certificate] = await db.update(certificates).set(certificateData).where(eq(certificates.id, id)).returning();
    return certificate || undefined;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    const result = await db.delete(certificates).where(eq(certificates.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Roles
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role || undefined;
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.nombre);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db
      .insert(roles)
      .values({
        ...insertRole,
        updatedAt: new Date(),
      })
      .returning();
    return role;
  }

  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db
      .update(roles)
      .set({
        ...roleData,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    return role || undefined;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Opinions
  async getOpinion(id: number): Promise<Opinion | undefined> {
    const [opinion] = await db.select().from(opinions).where(eq(opinions.id, id));
    return opinion || undefined;
  }

  async getAllOpinions(options: {
    estado?: string;
    companyId?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ opinions: Opinion[]; total: number }> {
    const { estado, companyId, limit = 50, offset = 0 } = options;
    
    let query = db.select().from(opinions);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(opinions);
    
    const conditions = [];
    if (estado) {
      conditions.push(eq(opinions.estado, estado));
    }
    if (companyId) {
      conditions.push(eq(opinions.companyId, companyId));
    }
    
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    const opinionsResult = await query
      .orderBy(sql`${opinions.fechaCreacion} DESC`)
      .limit(limit)
      .offset(offset);
      
    const [{ count }] = await countQuery;
    
    return {
      opinions: opinionsResult,
      total: count || 0,
    };
  }

  async createOpinion(insertOpinion: InsertOpinion): Promise<Opinion> {
    const [opinion] = await db
      .insert(opinions)
      .values({
        ...insertOpinion,
        fechaCreacion: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return opinion;
  }

  async updateOpinion(id: number, opinionData: Partial<InsertOpinion>): Promise<Opinion | undefined> {
    const [opinion] = await db
      .update(opinions)
      .set({
        ...opinionData,
        updatedAt: new Date(),
      })
      .where(eq(opinions.id, id))
      .returning();
    return opinion || undefined;
  }

  async deleteOpinion(id: number): Promise<boolean> {
    const result = await db.delete(opinions).where(eq(opinions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async approveOpinion(id: number, approvedBy: number): Promise<Opinion | undefined> {
    const [opinion] = await db
      .update(opinions)
      .set({
        estado: "aprobada",
        fechaAprobacion: new Date(),
        aprobadoPor: approvedBy,
        updatedAt: new Date(),
      })
      .where(eq(opinions.id, id))
      .returning();
    return opinion || undefined;
  }

  async rejectOpinion(id: number, approvedBy: number): Promise<Opinion | undefined> {
    const [opinion] = await db
      .update(opinions)
      .set({
        estado: "rechazada",
        fechaAprobacion: new Date(),
        aprobadoPor: approvedBy,
        updatedAt: new Date(),
      })
      .where(eq(opinions.id, id))
      .returning();
    return opinion || undefined;
  }

  // Statistics
  async getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }> {
    const [companiesCount] = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [revenueResult] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(membershipPayments)
      .where(eq(membershipPayments.status, 'succeeded'));
    
    return {
      totalCompanies: companiesCount?.count || 0,
      activeUsers: usersCount?.count || 0,
      newRegistrations: 0, // This would need additional logic based on date ranges
      totalRevenue: revenueResult?.total || 0,
    };
  }

  // Membership Payments methods
  async createMembershipPayment(insertPayment: InsertMembershipPayment): Promise<MembershipPayment> {
    const [payment] = await db
      .insert(membershipPayments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getMembershipPayment(id: number): Promise<MembershipPayment | undefined> {
    const [payment] = await db.select().from(membershipPayments).where(eq(membershipPayments.id, id));
    return payment || undefined;
  }

  async getMembershipPaymentByStripeId(stripePaymentIntentId: string): Promise<MembershipPayment | undefined> {
    const [payment] = await db.select().from(membershipPayments)
      .where(eq(membershipPayments.stripePaymentIntentId, stripePaymentIntentId));
    return payment || undefined;
  }

  async updateMembershipPaymentStatus(id: number, status: string): Promise<MembershipPayment | undefined> {
    const [payment] = await db
      .update(membershipPayments)
      .set({ status, updatedAt: new Date() })
      .where(eq(membershipPayments.id, id))
      .returning();
    return payment || undefined;
  }

  async getUserPayments(userId: number): Promise<MembershipPayment[]> {
    return await db.select().from(membershipPayments)
      .where(eq(membershipPayments.userId, userId))
      .orderBy(sql`created_at DESC`);
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    
    if (!settings) {
      // Crear configuración por defecto si no existe
      const [defaultSettings] = await db
        .insert(systemSettings)
        .values({})
        .returning();
      return defaultSettings;
    }
    
    return settings;
  }

  async updateSystemSettings(settingsData: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const currentSettings = await this.getSystemSettings();
    
    const [updatedSettings] = await db
      .update(systemSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(systemSettings.id, currentSettings.id))
      .returning();
    
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();