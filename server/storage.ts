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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private categories: Map<number, Category>;
  private membershipTypes: Map<number, MembershipType>;
  private certificates: Map<number, Certificate>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentCategoryId: number;
  private currentMembershipTypeId: number;
  private currentCertificateId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.categories = new Map();
    this.membershipTypes = new Map();
    this.certificates = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentCategoryId = 1;
    this.currentMembershipTypeId = 1;
    this.currentCertificateId = 1;

    // Initialize default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories = [
      { nombreCategoria: "Juegos Infantiles", descripcion: "Fabricantes y distribuidores de equipos de juegos para parques y espacios públicos", icono: "🎪", iconoUrl: null },
      { nombreCategoria: "Mobiliario Urbano", descripcion: "Diseño y fabricación de mobiliario para espacios públicos y urbanos", icono: "🪑", iconoUrl: null },
      { nombreCategoria: "Superficies Deportivas", descripcion: "Instalación y mantenimiento de superficies deportivas y recreativas", icono: "🏀", iconoUrl: null },
      { nombreCategoria: "Iluminación y Energía", descripcion: "Soluciones de iluminación LED y sistemas de energía renovable", icono: "💡", iconoUrl: null },
      { nombreCategoria: "Paisajismo y Riego", descripcion: "Sistemas de riego automatizado y diseño de espacios verdes", icono: "💧", iconoUrl: null }
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
        descripcionPlan: "Perfil básico en el directorio con información esencial de contacto",
        costo: "150.00",
        periodicidad: "monthly",
        beneficios: ["Perfil empresarial básico", "Información de contacto", "Listado en directorio público"]
      },
      {
        nombrePlan: "Premium",
        descripcionPlan: "Perfil destacado con galería de productos y mayor visibilidad",
        costo: "300.00",
        periodicidad: "monthly",
        beneficios: ["Todo lo del plan básico", "Galería de productos", "Logo destacado", "Posición preferencial", "Estadísticas básicas"]
      },
      {
        nombrePlan: "Enterprise",
        descripcionPlan: "Máxima visibilidad con micrositio personalizado y promoción destacada",
        costo: "500.00",
        periodicidad: "monthly",
        beneficios: ["Todo lo del plan premium", "Micrositio personalizado", "Certificados visibles", "Promoción en eventos", "Soporte dedicado", "API access"]
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

    // Sample companies data
    const sampleCompanies = [
      {
        nombreEmpresa: "PlayTech México",
        email1: "contacto@playtech.mx",
        telefono1: "+52 55 1234 5678",
        sitioWeb: "https://www.playtech.mx",
        paisesPresencia: ["México", "Colombia"],
        estadosPresencia: ["Ciudad de México", "Nuevo León"],
        ciudadesPresencia: ["Ciudad de México, Ciudad de México", "Monterrey, Nuevo León"],
        descripcionEmpresa: "Fabricante líder de equipos de juegos infantiles para parques públicos con más de 20 años de experiencia.",
        categoriesIds: [1],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "Facebook", url: "https://facebook.com/playtech" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Mobiliario Urbano Integral",
        email1: "ventas@mobiliariourbano.mx",
        telefono1: "+52 33 2345 6789",
        sitioWeb: "https://www.mobiliariourbano.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Jalisco", "Michoacán"],
        ciudadesPresencia: ["Guadalajara, Jalisco", "Morelia, Michoacán"],
        descripcionEmpresa: "Diseño y fabricación de mobiliario urbano sustentable para espacios públicos.",
        categoriesIds: [2],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "LinkedIn", url: "https://linkedin.com/company/mobiliariourbano" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "SportFloor Solutions",
        email1: "info@sportfloor.mx",
        telefono1: "+52 81 3456 7890",
        sitioWeb: "https://www.sportfloor.mx",
        paisesPresencia: ["México", "Estados Unidos"],
        estadosPresencia: ["Nuevo León", "Tamaulipas"],
        ciudadesPresencia: ["Monterrey, Nuevo León", "Reynosa, Tamaulipas"],
        descripcionEmpresa: "Especialistas en instalación de superficies deportivas sintéticas y canchas multideportivas.",
        categoriesIds: [3],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "Instagram", url: "https://instagram.com/sportfloor" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "LED Urbano",
        email1: "contacto@ledurbano.mx",
        telefono1: "+52 55 4567 8901",
        sitioWeb: "https://www.ledurbano.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Ciudad de México", "Estado de México"],
        ciudadesPresencia: ["Ciudad de México, Ciudad de México", "Toluca, Estado de México"],
        descripcionEmpresa: "Soluciones integrales de iluminación LED para espacios públicos y sistemas de energía solar.",
        categoriesIds: [4],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "YouTube", url: "https://youtube.com/ledurbano" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "AquaTech Riego",
        email1: "ventas@aquatech.mx",
        telefono1: "+52 442 5678 9012",
        sitioWeb: "https://www.aquatech.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Querétaro", "Guanajuato"],
        ciudadesPresencia: ["Querétaro, Querétaro", "León, Guanajuato"],
        descripcionEmpresa: "Sistemas de riego automatizado inteligente y diseño de jardines sustentables.",
        categoriesIds: [5],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "Facebook", url: "https://facebook.com/aquatech" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "KidsPlay Equipment",
        email1: "info@kidsplay.mx",
        telefono1: "+52 998 6789 0123",
        sitioWeb: "https://www.kidsplay.mx",
        paisesPresencia: ["México", "Guatemala"],
        estadosPresencia: ["Quintana Roo", "Yucatán"],
        ciudadesPresencia: ["Cancún, Quintana Roo", "Mérida, Yucatán"],
        descripcionEmpresa: "Fabricación de juegos infantiles inclusivos y equipos de ejercicio al aire libre.",
        categoriesIds: [1],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "Instagram", url: "https://instagram.com/kidsplay" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Bancas y Más",
        email1: "pedidos@bancasymas.mx",
        telefono1: "+52 662 7890 1234",
        sitioWeb: "https://www.bancasymas.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Sonora", "Sinaloa"],
        ciudadesPresencia: ["Hermosillo, Sonora", "Culiacán, Sinaloa"],
        descripcionEmpresa: "Fabricación artesanal de bancas, mesas y mobiliario urbano en madera y metal.",
        categoriesIds: [2],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "Facebook", url: "https://facebook.com/bancasymas" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Courts Pro",
        email1: "instalaciones@courtspro.mx",
        telefono1: "+52 222 8901 2345",
        sitioWeb: "https://www.courtspro.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Puebla", "Tlaxcala"],
        ciudadesPresencia: ["Puebla, Puebla", "Tlaxcala, Tlaxcala"],
        descripcionEmpresa: "Construcción de canchas deportivas profesionales y mantenimiento de superficies.",
        categoriesIds: [3],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "LinkedIn", url: "https://linkedin.com/company/courtspro" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "EcoLight Systems",
        email1: "proyectos@ecolight.mx",
        telefono1: "+52 777 9012 3456",
        sitioWeb: "https://www.ecolight.mx",
        paisesPresencia: ["México", "Costa Rica"],
        estadosPresencia: ["Morelos", "Guerrero"],
        ciudadesPresencia: ["Cuernavaca, Morelos", "Acapulco, Guerrero"],
        descripcionEmpresa: "Iluminación inteligente con sensores de movimiento y paneles solares integrados.",
        categoriesIds: [4],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "Twitter", url: "https://twitter.com/ecolight" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Jardines Automáticos",
        email1: "contacto@jardinesautomaticos.mx",
        telefono1: "+52 228 0123 4567",
        sitioWeb: "https://www.jardinesautomaticos.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Veracruz", "Tabasco"],
        ciudadesPresencia: ["Veracruz, Veracruz", "Villahermosa, Tabasco"],
        descripcionEmpresa: "Automatización de riego para parques y jardines públicos con tecnología IoT.",
        categoriesIds: [5],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "WhatsApp", url: "https://wa.me/522280123456" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Adventure Playground",
        email1: "ventas@adventureplayground.mx",
        telefono1: "+52 844 1234 5678",
        sitioWeb: "https://www.adventureplayground.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Coahuila", "Nuevo León"],
        ciudadesPresencia: ["Saltillo, Coahuila", "Monterrey, Nuevo León"],
        descripcionEmpresa: "Parques temáticos modulares y equipos de aventura para espacios públicos.",
        categoriesIds: [1],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "YouTube", url: "https://youtube.com/adventureplayground" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Urban Design Studio",
        email1: "estudio@urbandesign.mx",
        telefono1: "+52 722 2345 6789",
        sitioWeb: "https://www.urbandesign.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Estado de México", "Hidalgo"],
        ciudadesPresencia: ["Toluca, Estado de México", "Pachuca, Hidalgo"],
        descripcionEmpresa: "Diseño integral de espacios urbanos y fabricación de mobiliario personalizado.",
        categoriesIds: [2],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "Behance", url: "https://behance.net/urbandesign" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "MultiSport Surfaces",
        email1: "info@multisport.mx",
        telefono1: "+52 618 3456 7890",
        sitioWeb: "https://www.multisport.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Durango", "Zacatecas"],
        ciudadesPresencia: ["Durango, Durango", "Zacatecas, Zacatecas"],
        descripcionEmpresa: "Superficies deportivas multifuncionales y mantenimiento preventivo especializado.",
        categoriesIds: [3],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "Facebook", url: "https://facebook.com/multisport" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "SolarPark Lighting",
        email1: "proyectos@solarpark.mx",
        telefono1: "+52 961 4567 8901",
        sitioWeb: "https://www.solarpark.mx",
        paisesPresencia: ["México", "Belice"],
        estadosPresencia: ["Chiapas", "Tabasco"],
        ciudadesPresencia: ["Tuxtla Gutiérrez, Chiapas", "Villahermosa, Tabasco"],
        descripcionEmpresa: "Sistemas de iluminación solar para parques con baterías de larga duración.",
        categoriesIds: [4],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "LinkedIn", url: "https://linkedin.com/company/solarpark" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Green Irrigation Tech",
        email1: "soporte@greenirrigation.mx",
        telefono1: "+52 871 5678 9012",
        sitioWeb: "https://www.greenirrigation.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Coahuila", "Chihuahua"],
        ciudadesPresencia: ["Torreón, Coahuila", "Chihuahua, Chihuahua"],
        descripcionEmpresa: "Tecnología de riego inteligente con sensores de humedad y control remoto.",
        categoriesIds: [5],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "Instagram", url: "https://instagram.com/greenirrigation" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "PlaySafe Equipment",
        email1: "seguridad@playsafe.mx",
        telefono1: "+52 686 6789 0123",
        sitioWeb: "https://www.playsafe.mx",
        paisesPresencia: ["México", "Estados Unidos"],
        estadosPresencia: ["Baja California", "Sonora"],
        ciudadesPresencia: ["Mexicali, Baja California", "Hermosillo, Sonora"],
        descripcionEmpresa: "Equipos de juegos certificados internacionalmente con máximos estándares de seguridad.",
        categoriesIds: [1],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "Facebook", url: "https://facebook.com/playsafe" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Mobiliario Sostenible",
        email1: "ventas@mobiliariosostenible.mx",
        telefono1: "+52 492 7890 1234",
        sitioWeb: "https://www.mobiliariosostenible.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Zacatecas", "Aguascalientes"],
        ciudadesPresencia: ["Zacatecas, Zacatecas", "Aguascalientes, Aguascalientes"],
        descripcionEmpresa: "Mobiliario urbano fabricado con materiales reciclados y procesos sustentables.",
        categoriesIds: [2],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "LinkedIn", url: "https://linkedin.com/company/mobiliariosostenible" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Elite Sports Floors",
        email1: "elite@sportsfloors.mx",
        telefono1: "+52 477 8901 2345",
        sitioWeb: "https://www.sportsfloors.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Guanajuato", "Michoacán"],
        ciudadesPresencia: ["León, Guanajuato", "Morelia, Michoacán"],
        descripcionEmpresa: "Pisos deportivos de alta calidad para competencias profesionales y recreativas.",
        categoriesIds: [3],
        membershipTypeId: 2,
        redesSociales: [{ plataforma: "YouTube", url: "https://youtube.com/elitesportsfloors" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Smart City Lights",
        email1: "smartcity@lights.mx",
        telefono1: "+52 921 9012 3456",
        sitioWeb: "https://www.smartcitylights.mx",
        paisesPresencia: ["México"],
        estadosPresencia: ["Tabasco", "Campeche"],
        ciudadesPresencia: ["Villahermosa, Tabasco", "Campeche, Campeche"],
        descripcionEmpresa: "Iluminación inteligente conectada para ciudades inteligentes con control centralizado.",
        categoriesIds: [4],
        membershipTypeId: 3,
        redesSociales: [{ plataforma: "Twitter", url: "https://twitter.com/smartcitylights" }],
        estado: "activo"
      },
      {
        nombreEmpresa: "Hydro Garden Systems",
        email1: "hydro@gardensystems.mx",
        telefono1: "+52 983 0123 4567",
        sitioWeb: "https://www.hydrogarden.mx",
        paisesPresencia: ["México", "Guatemala"],
        estadosPresencia: ["Quintana Roo", "Yucatán"],
        ciudadesPresencia: ["Chetumal, Quintana Roo", "Mérida, Yucatán"],
        descripcionEmpresa: "Sistemas hidropónicos para jardines urbanos y riego eficiente en parques.",
        categoriesIds: [5],
        membershipTypeId: 1,
        redesSociales: [{ plataforma: "Instagram", url: "https://instagram.com/hydrogarden" }],
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
        categoriesIds: companyData.categoriesIds,
        redesSociales: companyData.redesSociales,
        catalogoDigitalUrl: null,
        videoUrl1: null,
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

    // Sample certificates
    const sampleCertificates = [
      {
        nombreCertificado: "Certificación ISO 9001:2015",
        descripcion: "Sistema de gestión de calidad internacional",
        imagenUrl: "https://via.placeholder.com/400x300/4f46e5/ffffff?text=ISO+9001",
        fechaEmision: "2023-01-15",
        fechaVencimiento: "2026-01-15",
        entidadEmisora: "Bureau Veritas",
        estado: "activo"
      },
      {
        nombreCertificado: "Certificación de Seguridad Infantil",
        descripcion: "Cumplimiento de normas de seguridad para equipos de juegos infantiles",
        imagenUrl: "https://via.placeholder.com/400x300/10b981/ffffff?text=Seguridad+Infantil",
        fechaEmision: "2023-06-01",
        fechaVencimiento: "2025-06-01",
        entidadEmisora: "ANSI/ACCT",
        estado: "activo"
      }
    ];

    sampleCertificates.forEach(certData => {
      const certificate: Certificate = {
        id: this.currentCertificateId++,
        nombreCertificado: certData.nombreCertificado,
        descripcion: certData.descripcion,
        imagenUrl: certData.imagenUrl,
        fechaEmision: certData.fechaEmision,
        fechaVencimiento: certData.fechaVencimiento,
        entidadEmisora: certData.entidadEmisora,
        estado: certData.estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.certificates.set(certificate.id, certificate);
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

  // Certificates methods
  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const certificate: Certificate = {
      ...insertCertificate,
      id: this.currentCertificateId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.certificates.set(certificate.id, certificate);
    return certificate;
  }

  async updateCertificate(id: number, certificateData: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const existingCertificate = this.certificates.get(id);
    if (!existingCertificate) {
      return undefined;
    }

    const updatedCertificate: Certificate = {
      ...existingCertificate,
      ...certificateData,
      updatedAt: new Date(),
    };

    this.certificates.set(id, updatedCertificate);
    return updatedCertificate;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    return this.certificates.delete(id);
  }
}

export const storage = new MemStorage();
