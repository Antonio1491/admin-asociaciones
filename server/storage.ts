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

    // Sample Companies Data
    const sampleCompanies = [
      {
        nombreEmpresa: "TechnoSoft México",
        email1: "contacto@technosoft.mx",
        telefono1: "+52 55 1234 5678",
        sitioWeb: "https://www.technosoft.mx",
        paisesPresencia: ["México", "Colombia", "Brasil"],
        estadosPresencia: ["Ciudad de México", "Nuevo León", "Jalisco"],
        ciudadesPresencia: ["Ciudad de México, Ciudad de México", "Monterrey, Nuevo León", "Guadalajara, Jalisco"],
        descripcionEmpresa: "Empresa líder en desarrollo de software empresarial con más de 15 años de experiencia en soluciones tecnológicas.",
        categoryId: 1,
        membershipTypeId: 3,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/technosoft" },
          { plataforma: "LinkedIn", url: "https://linkedin.com/company/technosoft" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Salud Integral SA",
        email1: "info@saludintegral.com.mx",
        telefono1: "+52 33 2345 6789",
        sitioWeb: "https://www.saludintegral.com.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Jalisco", "Michoacán"],
        ciudadesPresencia: ["Guadalajara, Jalisco", "Morelia, Michoacán"],
        descripcionEmpresa: "Clínica especializada en medicina preventiva y tratamientos integrales de salud con tecnología de vanguardia.",
        categoryId: 2,
        membershipTypeId: 2,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/saludintegral" },
          { plataforma: "Instagram", url: "https://instagram.com/saludintegral" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Instituto Educativo Innovación",
        email1: "admisiones@innovaedu.mx",
        telefono1: "+52 81 3456 7890",
        sitioWeb: "https://www.innovaedu.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Nuevo León"],
        ciudadesPresencia: ["Monterrey, Nuevo León"],
        descripcionEmpresa: "Instituto educativo enfocado en tecnologías emergentes y metodologías innovadoras de enseñanza.",
        categoryId: 3,
        membershipTypeId: 2,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/innovaedu" },
          { plataforma: "YouTube", url: "https://youtube.com/innovaedu" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Comercio Digital Plus",
        email1: "ventas@comerciodigital.mx",
        telefono1: "+52 55 4567 8901",
        sitioWeb: "https://www.comerciodigital.mx",
        videoUrl1: "https://youtube.com/watch?v=example",
        paisesPresencia: ["México", "Guatemala"],
        estadosPresencia: ["Ciudad de México", "Estado de México"],
        ciudadesPresencia: ["Ciudad de México, Ciudad de México", "Toluca, Estado de México"],
        descripcionEmpresa: "Plataforma de comercio electrónico B2B para pequeñas y medianas empresas con presencia internacional.",
        categoryId: 4,
        membershipTypeId: 1,
        redesSociales: [
          { plataforma: "LinkedIn", url: "https://linkedin.com/company/comerciodigital" },
          { plataforma: "Twitter", url: "https://twitter.com/comerciodigital" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "FinTech Soluciones",
        email1: "contacto@fintechsol.mx",
        telefono1: "+52 55 5678 9012",
        sitioWeb: "https://www.fintechsol.mx",
        paisesPresencia: ["México", "Colombia"],
        estadosPresencia: ["Ciudad de México"],
        ciudadesPresencia: ["Ciudad de México, Ciudad de México"],
        descripcionEmpresa: "Soluciones financieras tecnológicas para empresas y particulares con servicios de pago digital.",
        categoryId: 1,
        membershipTypeId: 3,
        redesSociales: [
          { plataforma: "LinkedIn", url: "https://linkedin.com/company/fintechsol" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Manufactura Avanzada",
        email1: "produccion@manufavanzada.mx",
        telefono1: "+52 442 678 9013",
        sitioWeb: "https://www.manufavanzada.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Querétaro", "Guanajuato"],
        ciudadesPresencia: ["Querétaro, Querétaro", "León, Guanajuato"],
        descripcionEmpresa: "Empresa manufacturera especializada en componentes automotrices de alta precisión y calidad internacional.",
        categoryId: 4,
        membershipTypeId: 2,
        redesSociales: [
          { plataforma: "LinkedIn", url: "https://linkedin.com/company/manufavanzada" },
          { plataforma: "Facebook", url: "https://facebook.com/manufavanzada" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "EcoTech Verde",
        email1: "info@ecotechverde.mx",
        telefono1: "+52 998 789 0123",
        sitioWeb: "https://www.ecotechverde.mx",
        videoUrl1: "https://youtube.com/watch?v=eco-example",
        paisesPresencia: ["México", "Costa Rica"],
        estadosPresencia: ["Quintana Roo", "Yucatán"],
        ciudadesPresencia: ["Cancún, Quintana Roo", "Mérida, Yucatán"],
        descripcionEmpresa: "Tecnologías sostenibles para el cuidado del medio ambiente y energías renovables con impacto social.",
        categoryId: 1,
        membershipTypeId: 2,
        redesSociales: [
          { plataforma: "Instagram", url: "https://instagram.com/ecotechverde" },
          { plataforma: "Facebook", url: "https://facebook.com/ecotechverde" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Clínica Dental Moderna",
        email1: "citas@dentalmoderna.mx",
        telefono1: "+52 662 890 1234",
        sitioWeb: "https://www.dentalmoderna.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Sonora"],
        ciudadesPresencia: ["Hermosillo, Sonora"],
        descripcionEmpresa: "Clínica dental con tecnología de vanguardia y tratamientos especializados en odontología estética.",
        categoryId: 2,
        membershipTypeId: 1,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/dentalmoderna" },
          { plataforma: "Instagram", url: "https://instagram.com/dentalmoderna" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Academia de Idiomas Global",
        email1: "inscripciones@idiomasglobal.mx",
        telefono1: "+52 222 901 2345",
        sitioWeb: "https://www.idiomasglobal.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Puebla"],
        ciudadesPresencia: ["Puebla, Puebla"],
        descripcionEmpresa: "Academia especializada en enseñanza de idiomas con metodología internacional y certificaciones oficiales.",
        categoryId: 3,
        membershipTypeId: 1,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/idiomasglobal" },
          { plataforma: "YouTube", url: "https://youtube.com/idiomasglobal" }
        ],
        estado: "activo"
      },
      {
        nombreEmpresa: "Marketplace Nacional",
        email1: "soporte@marketplacenacional.mx",
        telefono1: "+52 777 012 3456",
        sitioWeb: "https://www.marketplacenacional.mx",
        videoUrl1: "https://youtube.com/watch?v=marketplace-demo",
        paisesPresencia: ["México"],
        estadosPresencia: ["Morelos", "Guerrero"],
        ciudadesPresencia: ["Cuernavaca, Morelos", "Acapulco, Guerrero"],
        descripcionEmpresa: "Plataforma nacional de comercio electrónico conectando compradores y vendedores en todo México.",
        categoryId: 4,
        membershipTypeId: 2,
        redesSociales: [
          { plataforma: "Facebook", url: "https://facebook.com/marketplacenacional" },
          { plataforma: "Twitter", url: "https://twitter.com/marketplacenacional" }
        ],
        estado: "activo"
      }
    ];

    // Create sample companies
    sampleCompanies.forEach(companyData => {
      const company: Company = {
        id: this.currentCompanyId++,
        nombreEmpresa: companyData.nombreEmpresa,
        logotipoUrl: null,
        telefono1: companyData.telefono1,
        telefono2: null,
        email1: companyData.email1,
        email2: null,
        paisesPresencia: companyData.paisesPresencia,
        estadosPresencia: companyData.estadosPresencia,
        ciudadesPresencia: companyData.ciudadesPresencia,
        direccionFisica: null,
        ubicacionGeografica: null,
        representantesVentas: [],
        descripcionEmpresa: companyData.descripcionEmpresa,
        galeriaProductosUrls: [],
        categoryId: companyData.categoryId,
        redesSociales: companyData.redesSociales,
        catalogoDigitalUrl: null,
        videoUrl1: companyData.videoUrl1 || null,
        videoUrl2: null,
        videoUrl3: null,
        membershipTypeId: companyData.membershipTypeId,
        sitioWeb: companyData.sitioWeb,
        userId: 1,
        estado: companyData.estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.companies.set(company.id, company);
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
