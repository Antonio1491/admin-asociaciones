import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { insertUserSchema, insertCompanySchema, insertCategorySchema, insertMembershipTypeSchema, insertCertificateSchema, insertRoleSchema, insertOpinionSchema, insertMembershipPaymentSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Configuración de multer para manejo de archivos
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'images');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Ruta para subir una sola imagen
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo" });
      }
      
      const imageUrl = `/uploads/images/${req.file.filename}`;
      res.json({ 
        success: true, 
        imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({ error: "Error al procesar la imagen" });
    }
  });

  // Ruta para subir múltiples imágenes
  app.post("/api/upload-images", upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No se recibieron archivos" });
      }
      
      const imageUrls = req.files.map(file => ({
        imageUrl: `/uploads/images/${file.filename}`,
        filename: file.filename
      }));
      
      res.json({ 
        success: true, 
        images: imageUrls
      });
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      res.status(500).json({ error: "Error al procesar las imágenes" });
    }
  });

  // Ruta para eliminar imagen
  app.delete("/api/delete-image/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', 'images', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: "Imagen eliminada correctamente" });
      } else {
        res.status(404).json({ error: "Imagen no encontrada" });
      }
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ error: "Error al eliminar la imagen" });
    }
  });

  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Companies API
  app.get("/api/companies", async (req, res) => {
    try {
      const { search, categoryId, membershipTypeId, estado, page = "1", limit = "10" } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      console.log("Fetching companies with params:", { search, categoryId, membershipTypeId, estado, pageNum, limitNum, offset });

      const result = await storage.getAllCompanies({
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        membershipTypeId: membershipTypeId ? parseInt(membershipTypeId as string) : undefined,
        estado: estado as string,
        limit: limitNum,
        offset
      });

      console.log("Companies result:", result);

      res.json({
        companies: result.companies,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies", details: error.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.get("/api/companies/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const companies = await storage.getCompaniesByUser(userId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user companies" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCompany(id);
      if (!deleted) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Membership Types API
  app.get("/api/membership-types", async (req, res) => {
    try {
      const membershipTypes = await storage.getAllMembershipTypes();
      res.json(membershipTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch membership types" });
    }
  });

  // Endpoint para obtener solo membresías públicas (para usuarios no administradores)
  app.get("/api/membership-types/public", async (req, res) => {
    try {
      const membershipTypes = await storage.getAllMembershipTypes();
      // Filtrar solo las membresías públicas
      const publicMemberships = membershipTypes.filter((membership: any) => 
        !membership.visibilidad || membership.visibilidad === "publica"
      );
      res.json(publicMemberships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public membership types" });
    }
  });

  app.get("/api/membership-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const membershipType = await storage.getMembershipType(id);
      if (!membershipType) {
        return res.status(404).json({ error: "Membership type not found" });
      }
      res.json(membershipType);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch membership type" });
    }
  });

  app.post("/api/membership-types", async (req, res) => {
    try {
      const membershipTypeData = insertMembershipTypeSchema.parse(req.body);
      const membershipType = await storage.createMembershipType(membershipTypeData);
      res.status(201).json(membershipType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create membership type" });
    }
  });

  app.put("/api/membership-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const membershipTypeData = insertMembershipTypeSchema.partial().parse(req.body);
      const membershipType = await storage.updateMembershipType(id, membershipTypeData);
      if (!membershipType) {
        return res.status(404).json({ error: "Membership type not found" });
      }
      res.json(membershipType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update membership type" });
    }
  });

  app.delete("/api/membership-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMembershipType(id);
      if (!deleted) {
        return res.status(404).json({ error: "Membership type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete membership type" });
    }
  });

  // Certificates API
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getCertificate(id);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch certificate" });
    }
  });

  app.post("/api/certificates", async (req, res) => {
    try {
      console.log("Datos recibidos para certificado:", req.body);
      const certificateData = insertCertificateSchema.parse(req.body);
      console.log("Datos validados:", certificateData);
      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error al crear certificado:", error);
      if (error instanceof z.ZodError) {
        console.error("Errores de validación:", error.errors);
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      res.status(500).json({ 
        error: "Failed to create certificate",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificateData = insertCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateCertificate(id, certificateData);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update certificate" });
    }
  });

  app.delete("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCertificate(id);
      if (!deleted) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete certificate" });
    }
  });

  // Roles API
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roleData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, roleData);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRole(id);
      if (!deleted) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // Opinions API
  app.get("/api/opinions", async (req, res) => {
    try {
      const { estado, companyId, page = "1", limit = "50" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const options = {
        estado: estado as string,
        companyId: companyId ? parseInt(companyId as string) : undefined,
        limit: limitNum,
        offset,
      };
      
      const result = await storage.getAllOpinions(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opinions" });
    }
  });

  app.get("/api/opinions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opinion = await storage.getOpinion(id);
      if (!opinion) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.json(opinion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opinion" });
    }
  });

  app.post("/api/opinions", async (req, res) => {
    try {
      const opinionData = insertOpinionSchema.parse(req.body);
      const opinion = await storage.createOpinion(opinionData);
      res.status(201).json(opinion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create opinion" });
    }
  });

  app.put("/api/opinions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opinionData = insertOpinionSchema.partial().parse(req.body);
      const opinion = await storage.updateOpinion(id, opinionData);
      if (!opinion) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.json(opinion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update opinion" });
    }
  });

  app.delete("/api/opinions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteOpinion(id);
      if (!deleted) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete opinion" });
    }
  });

  app.post("/api/opinions/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy } = req.body;
      const opinion = await storage.approveOpinion(id, approvedBy);
      if (!opinion) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.json(opinion);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve opinion" });
    }
  });

  app.post("/api/opinions/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy } = req.body;
      const opinion = await storage.rejectOpinion(id, approvedBy);
      if (!opinion) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.json(opinion);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject opinion" });
    }
  });

  // Statistics API
  app.get("/api/statistics", async (req, res) => {
    try {
      const statistics = await storage.getStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Stripe Payment Routes for Memberships
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { membershipTypeId, companyId } = req.body;
      
      if (!membershipTypeId) {
        return res.status(400).json({ error: "Missing membershipTypeId" });
      }

      // Get membership type to get the price
      const membershipType = await storage.getMembershipType(membershipTypeId);
      if (!membershipType) {
        return res.status(404).json({ error: "Membership type not found" });
      }

      // Get company to verify it exists (only if companyId is provided)
      let company = null;
      if (companyId) {
        company = await storage.getCompany(companyId);
        if (!company) {
          return res.status(404).json({ error: "Company not found" });
        }
      }

      // Parse the cost string to extract numeric value
      const costString = membershipType.costo || "0";
      const amount = parseFloat(costString.replace(/[^0-9.]/g, '')) || 0;

      if (amount <= 0) {
        return res.status(400).json({ error: "Invalid membership cost" });
      }

      // Prepare metadata
      const metadata: any = {
        membershipTypeId: membershipTypeId.toString(),
        isNewMembership: companyId ? "false" : "true",
      };
      
      if (companyId && company) {
        metadata.companyId = companyId.toString();
        metadata.userId = (company.userId || 0).toString();
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "mxn",
        metadata,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err) {
        console.error('Webhook signature verification failed.');
        return res.status(400).send('Webhook signature verification failed.');
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Record the payment in database
          const membershipTypeId = parseInt(paymentIntent.metadata.membershipTypeId);
          const isNewMembership = paymentIntent.metadata.isNewMembership === "true";
          
          if (isNewMembership) {
            // Handle new membership payment (without specific company)
            await storage.createMembershipPayment({
              userId: 0, // For new memberships, we don't have a user yet
              companyId: 0, // For new memberships, we don't have a company yet
              membershipTypeId,
              stripePaymentIntentId: paymentIntent.id,
              amount: (paymentIntent.amount / 100).toString(),
              currency: paymentIntent.currency,
              status: 'succeeded',
            });
          } else {
            // Handle company membership update
            const companyId = parseInt(paymentIntent.metadata.companyId);
            const userId = parseInt(paymentIntent.metadata.userId);

            await storage.createMembershipPayment({
              userId,
              companyId,
              membershipTypeId,
              stripePaymentIntentId: paymentIntent.id,
              amount: (paymentIntent.amount / 100).toString(),
              currency: paymentIntent.currency,
              status: 'succeeded',
            });

            // Update company's membership type
            await storage.updateCompany(companyId, {
              membershipTypeId,
            });
          }

          console.log('PaymentIntent was successful!');
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          
          // Update payment status to failed
          const existingPayment = await storage.getMembershipPaymentByStripeId(failedPayment.id);
          if (existingPayment) {
            await storage.updateMembershipPaymentStatus(existingPayment.id, 'failed');
          }
          
          console.log('PaymentIntent failed.');
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  });

  // Get user's payment history
  app.get("/api/users/:userId/payments", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Create or get Stripe customer
  app.post("/api/create-stripe-customer", async (req, res) => {
    try {
      const { userId, email, name } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ error: "Missing userId or email" });
      }

      // Check if user already has a Stripe customer ID
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.stripeCustomerId) {
        // Return existing customer
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        return res.json({ customerId: customer.id });
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: name || user.displayName || email,
      });

      // Update user with Stripe customer ID
      await storage.updateUserStripeCustomerId(userId, customer.id);

      res.json({ customerId: customer.id });
    } catch (error: any) {
      console.error("Error creating Stripe customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // System Settings routes
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/system-settings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user;
      if (!user.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
