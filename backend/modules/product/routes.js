import express from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { checkRole, ROLES } from "../../middleware/role.middleware.js";
import { uploadImage } from "../../utils/cloudinary.js";
import { ROLES as ROLE_ENUM } from "../../middleware/role.middleware.js";
import { validateSchema } from "../../middleware/validator.middleware.js"; // Tu middleware de Zod
import {
  createProductSchema,
  updateProductSchema,
} from "../../schema/product.schema.js"; // Tus nuevos esquemas
import { z } from "zod";
import productController from "./controller.js";
import * as answers from "../../errors/answer.js";

const router = express.Router();
const ctrl = productController();

// 1. Ver todos los productos (PÚBLICO)
router.get("/", async (req, res, next) => {
  try {
    const products = await ctrl.all();
    return answers.success(req, res, products, 200);
  } catch (err) {
    next(err);
  }
});

// 2. Rutas PROTEGIDAS para panel (siempre antes de /:id)
// 2a. Alias para panel (ADMIN/SELLER)
router.get(
  "/panel/:id",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  async (req, res, next) => {
    try {
      const product = await ctrl.oneForPanel(req.params.id);
      if (req.user.id_role !== ROLES.ADMIN) {
        if (product.id_user !== req.user.id_user) {
          return answers.success(req, res, null, 200);
        }
      }
      return answers.success(req, res, product, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 2b. Ver productos por usuario (PROTEGIDA) - ADMIN y SELLER
router.get(
  "/by-user",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  async (req, res, next) => {
    try {
      const products = await ctrl.byUser(req.user);
      return answers.success(req, res, products, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 2c. Ver todos los productos del ADMIN (PROTEGIDA)
router.get(
  "/admin-all",
  verifyJWT,
  checkRole([ROLES.ADMIN]),
  async (req, res, next) => {
    try {
      const products = await ctrl.adminAll();
      return answers.success(req, res, products, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 3. Crear Producto -> Protegida (Multer primero, Zod segundo)
router.post(
  "/",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  uploadImage.single("image"), // 📸 1. Multer procesa los campos y sube la foto
  validateSchema(createProductSchema), // 🛡️ 2. Zod valida y parsea strings a números
  async (req, res, next) => {
    try {
      const newProduct = await ctrl.add(req.body, req.file, req.user.id_user);
      return answers.success(req, res, newProduct, 201);
    } catch (err) {
      next(err);
    }
  },
  // Manejo de errores de Multer (p.ej. archivo mayor al límite)
  (err, req, res, next) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return answers.error(req, res, "La imagen supera el límite de 5MB", 400);
    }
    return next(err);
  },
);

// 4. Actualizar Producto -> Protegida (Multer primero, Zod segundo)
router.put(
  "/:id",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  uploadImage.single("image"),
  validateSchema(updateProductSchema),
  async (req, res, next) => {
    try {
      const updatedProduct = await ctrl.update(
        req.params.id,
        req.body,
        req.file,
        req.user,
      );
      return answers.success(req, res, updatedProduct, 200);
    } catch (err) {
      next(err);
    }
  },
  // Manejo de errores de Multer (p.ej. archivo mayor al límite)
  (err, req, res, next) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return answers.error(req, res, "La imagen supera el límite de 5MB", 400);
    }
    return next(err);
  },
);

// 5. Pausar publicación (temporal) -> Protegida
router.put(
  "/:id/pause",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  validateSchema(
    updateProductSchema.partial().extend({
      // Para pausar/activar, el front envía solo status/isActive según el endpoint.
      // En esta práctica exigimos isActive boolean; si no viene, transformamos a false.
      isActive: z
        .union([z.boolean(), z.string()])
        .optional()
        .transform((val) => {
          if (val === undefined) return false;
          if (typeof val === "boolean") return val;
          return val === "true";
        }),
    }),
  ),
  async (req, res, next) => {
    try {
      // Pausar publicación (temporal): status=paused
      const updated = await ctrl.update(
        req.params.id,
        { isActive: false, status: "paused" },
        null,
        req.user,
      );
      return answers.success(req, res, updated, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 6. Activar publicación -> Protegida
router.put(
  "/:id/activate",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  validateSchema(
    updateProductSchema.partial().extend({
      // En esta ruta no dependemos de req.body.isActive, el controller fija status/isActive.
      // Por eso lo hacemos opcional para que no falle si el body viene vacío.
      isActive: z
        .union([z.boolean(), z.string()])
        .optional()
        .transform((val) => {
          if (val === undefined) return false;
          if (typeof val === "boolean") return val;
          return val === "true";
        }),
    }),
  ),
  async (req, res, next) => {
    try {
      const updated = await ctrl.update(
        req.params.id,
        { isActive: true, status: "active" },
        null,
        req.user,
      );
      return answers.success(req, res, updated, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 7. Eliminar Producto -> Protegida
router.delete(
  "/:id",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  async (req, res, next) => {
    try {
      const result = await ctrl.del(req.params.id, req.user);
      return answers.success(req, res, result.mensaje, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 8. Ver un producto específico (PÚBLICO) -> SIEMPRE al final para no interceptar rutas estáticas
router.get("/:id", async (req, res, next) => {
  try {
    const product = await ctrl.one(req.params.id);
    return answers.success(req, res, product, 200);
  } catch (err) {
    next(err);
  }
});

export default router;
