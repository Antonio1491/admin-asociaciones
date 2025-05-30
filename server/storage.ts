import { 
  users, 
  companies, 
  categories, 
  membershipTypes, 
  certificates,
  type User, 
  type Company, 
  type Category, 
  type MembershipType, 
  type Certificate,
  type InsertUser,
  type InsertCompany,
  type InsertCategory,
  type InsertMembershipType,
  type InsertCertificate,
  type CompanyWithDetails
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

  // Statistics
  getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }>;
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

    const companyCategories = companyCategoriesIds.length > 0 
      ? await db.select().from(categories).where(sql`${categories.id} = ANY(${JSON.stringify(companyCategoriesIds)})`)
      : [];

    const companyCertificates = companyCertificateIds.length > 0 
      ? await db.select().from(certificates).where(sql`${certificates.id} = ANY(${JSON.stringify(companyCertificateIds)})`)
      : [];

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
  } = {}): Promise<{ companies: CompanyWithDetails[]; total: number }> {
    const { search, categoryId, membershipTypeId, estado, limit = 10, offset = 0 } = options;
    
    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(companies.nombreEmpresa, `%${search}%`),
          like(companies.descripcionEmpresa, `%${search}%`)
        )
      );
    }

    if (categoryId) {
      whereConditions.push(sql`${companies.categoriesIds} @> ${JSON.stringify([categoryId])}`);
    }

    if (membershipTypeId) {
      whereConditions.push(eq(companies.membershipTypeId, membershipTypeId));
    }

    if (estado) {
      whereConditions.push(eq(companies.estado, estado));
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

        const companyCategories = companyCategoriesIds.length > 0 
          ? await db.select().from(categories).where(sql`${categories.id} = ANY(${JSON.stringify(companyCategoriesIds)})`)
          : [];

        const companyCertificates = companyCertificateIds.length > 0 
          ? await db.select().from(certificates).where(sql`${certificates.id} = ANY(${JSON.stringify(companyCertificateIds)})`)
          : [];

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

        const companyCategories = companyCategoriesIds.length > 0 
          ? await db.select().from(categories).where(sql`${categories.id} = ANY(${JSON.stringify(companyCategoriesIds)})`)
          : [];

        const companyCertificates = companyCertificateIds.length > 0 
          ? await db.select().from(certificates).where(sql`${certificates.id} = ANY(${JSON.stringify(companyCertificateIds)})`)
          : [];

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

  // Statistics
  async getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }> {
    const [companiesCount] = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    return {
      totalCompanies: companiesCount?.count || 0,
      activeUsers: usersCount?.count || 0,
      newRegistrations: 0, // This would need additional logic based on date ranges
      totalRevenue: 0, // This would need additional revenue tracking
    };
  }
}

export const storage = new DatabaseStorage();