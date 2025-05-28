import { 
  users, 
  companies, 
  categories, 
  membershipTypes,
  type User, 
  type Company, 
  type Category, 
  type MembershipType,
  type InsertUser, 
  type InsertCompany, 
  type InsertCategory, 
  type InsertMembershipType,
  type CompanyWithDetails 
} from "@shared/schema";
import { eq, ilike, desc, asc, and, or } from "drizzle-orm";

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

  // Statistics
  getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private categories: Map<number, Category>;
  private membershipTypes: Map<number, MembershipType>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentCategoryId: number;
  private currentMembershipTypeId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.categories = new Map();
    this.membershipTypes = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentCategoryId = 1;
    this.currentMembershipTypeId = 1;

    // Initialize default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories = [
      { nombreCategoria: "Tecnología", descripcion: "Empresas de tecnología e innovación" },
      { nombreCategoria: "Manufactura", descripcion: "Empresas manufactureras e industriales" },
      { nombreCategoria: "Servicios", descripcion: "Empresas de servicios profesionales" },
      { nombreCategoria: "Comercio", descripcion: "Empresas comerciales y retail" }
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.categories.set(category.id, category);
    });

    // Default membership types
    const defaultMembershipTypes = [
      {
        nombrePlan: "Básico",
        descripcionPlan: "Plan básico con funcionalidades esenciales",
        costo: "99.00",
        periodicidad: "monthly",
        beneficios: ["Perfil básico", "Contacto directo", "Listado en directorio"]
      },
      {
        nombrePlan: "Premium",
        descripcionPlan: "Plan premium con funcionalidades avanzadas",
        costo: "199.00",
        periodicidad: "monthly",
        beneficios: ["Todo lo del plan básico", "Galería de productos", "Estadísticas", "Soporte prioritario"]
      },
      {
        nombrePlan: "Enterprise",
        descripcionPlan: "Plan empresarial con todas las funcionalidades",
        costo: "399.00",
        periodicidad: "monthly",
        beneficios: ["Todo lo del plan premium", "API access", "Integración personalizada", "Cuenta dedicada"]
      }
    ];

    defaultMembershipTypes.forEach(mt => {
      const membershipType: MembershipType = {
        id: this.currentMembershipTypeId++,
        ...mt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.membershipTypes.set(membershipType.id, membershipType);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Companies
  async getCompany(id: number): Promise<CompanyWithDetails | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;

    const category = company.categoryId ? this.categories.get(company.categoryId) : undefined;
    const membershipType = company.membershipTypeId ? this.membershipTypes.get(company.membershipTypeId) : undefined;
    const user = company.userId ? this.users.get(company.userId) : undefined;

    return {
      ...company,
      category,
      membershipType,
      user
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
    let companies = Array.from(this.companies.values());

    // Apply filters
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      companies = companies.filter(company => 
        company.nombreEmpresa.toLowerCase().includes(searchLower) ||
        company.email1.toLowerCase().includes(searchLower) ||
        company.descripcionEmpresa?.toLowerCase().includes(searchLower)
      );
    }

    if (options.categoryId) {
      companies = companies.filter(company => company.categoryId === options.categoryId);
    }

    if (options.membershipTypeId) {
      companies = companies.filter(company => company.membershipTypeId === options.membershipTypeId);
    }

    if (options.estado) {
      companies = companies.filter(company => company.estado === options.estado);
    }

    const total = companies.length;

    // Sort by creation date (newest first)
    companies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (options.offset) {
      companies = companies.slice(options.offset);
    }
    if (options.limit) {
      companies = companies.slice(0, options.limit);
    }

    // Add related data
    const companiesWithDetails: CompanyWithDetails[] = companies.map(company => {
      const category = company.categoryId ? this.categories.get(company.categoryId) : undefined;
      const membershipType = company.membershipTypeId ? this.membershipTypes.get(company.membershipTypeId) : undefined;
      const user = company.userId ? this.users.get(company.userId) : undefined;

      return {
        ...company,
        category,
        membershipType,
        user
      };
    });

    return { companies: companiesWithDetails, total };
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const company: Company = {
      id: this.currentCompanyId++,
      ...insertCompany,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(company.id, company);
    return company;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;

    const updatedCompany = { ...company, ...companyData, updatedAt: new Date() };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  async getCompaniesByUser(userId: number): Promise<CompanyWithDetails[]> {
    const companies = Array.from(this.companies.values()).filter(company => company.userId === userId);
    
    return companies.map(company => {
      const category = company.categoryId ? this.categories.get(company.categoryId) : undefined;
      const membershipType = company.membershipTypeId ? this.membershipTypes.get(company.membershipTypeId) : undefined;
      const user = company.userId ? this.users.get(company.userId) : undefined;

      return {
        ...company,
        category,
        membershipType,
        user
      };
    });
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      ...insertCategory,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData, updatedAt: new Date() };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Membership Types
  async getMembershipType(id: number): Promise<MembershipType | undefined> {
    return this.membershipTypes.get(id);
  }

  async getAllMembershipTypes(): Promise<MembershipType[]> {
    return Array.from(this.membershipTypes.values()).sort((a, b) => a.nombrePlan.localeCompare(b.nombrePlan));
  }

  async createMembershipType(insertMembershipType: InsertMembershipType): Promise<MembershipType> {
    const membershipType: MembershipType = {
      id: this.currentMembershipTypeId++,
      ...insertMembershipType,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.membershipTypes.set(membershipType.id, membershipType);
    return membershipType;
  }

  async updateMembershipType(id: number, membershipTypeData: Partial<InsertMembershipType>): Promise<MembershipType | undefined> {
    const membershipType = this.membershipTypes.get(id);
    if (!membershipType) return undefined;

    const updatedMembershipType = { ...membershipType, ...membershipTypeData, updatedAt: new Date() };
    this.membershipTypes.set(id, updatedMembershipType);
    return updatedMembershipType;
  }

  async deleteMembershipType(id: number): Promise<boolean> {
    return this.membershipTypes.delete(id);
  }

  // Statistics
  async getStatistics(): Promise<{
    totalCompanies: number;
    activeUsers: number;
    newRegistrations: number;
    totalRevenue: number;
  }> {
    const totalCompanies = this.companies.size;
    const activeUsers = Array.from(this.users.values()).length;
    
    // New registrations in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newRegistrations = Array.from(this.companies.values()).filter(
      company => company.createdAt > thirtyDaysAgo
    ).length;

    // Calculate revenue from memberships
    let totalRevenue = 0;
    for (const company of this.companies.values()) {
      if (company.membershipTypeId) {
        const membershipType = this.membershipTypes.get(company.membershipTypeId);
        if (membershipType && membershipType.costo) {
          totalRevenue += parseFloat(membershipType.costo);
        }
      }
    }

    return {
      totalCompanies,
      activeUsers,
      newRegistrations,
      totalRevenue
    };
  }
}

export const storage = new MemStorage();
