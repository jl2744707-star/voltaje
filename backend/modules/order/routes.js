import express from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { checkRole, ROLES } from "../../middleware/role.middleware.js";
import { validateSchema } from "../../middleware/validator.middleware.js";
import {
  createOrderSchema,
  updateStatusSchema,
} from "../../schema/order.schema.js";
import orderController from "./controller.js";
import * as answers from "../../errors/answer.js";

const router = express.Router();
const ctrl = orderController();

// 1. Ver mi historial de compras (CLIENTE/CUALQUIERA LOGUEADO)
router.get("/my-orders", verifyJWT, async (req, res, next) => {
  try {
    const orders = await ctrl.getMyOrders(req.user.id_user);
    return answers.success(req, res, orders, 200);
  } catch (err) {
    next(err);
  }
});

// 2. Generar la orden de compra a partir del carrito (CLIENTE)
router.post(
  "/",
  verifyJWT,
  validateSchema(createOrderSchema),
  async (req, res, next) => {
    try {
      const checkout = await ctrl.createOrder(
        req.user.id_user,
        req.body.id_address,
      );
      return answers.success(req, res, checkout, 201);
    } catch (err) {
      next(err);
    }
  },
);

// 3. Ver todas las órdenes de la librería (ADMIN o SELLER)
router.get(
  "/admin/all",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  async (req, res, next) => {
    try {
      const list = await ctrl.getAllOrders();
      return answers.success(req, res, list, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 4. Cambiar el estado de un pedido (ADMIN o SELLER, ej: pasar de "Pendiente" a "Enviado")
router.put(
  "/admin/status/:id",
  verifyJWT,
  checkRole([ROLES.ADMIN, ROLES.SELLER]),
  validateSchema(updateStatusSchema),
  async (req, res, next) => {
    try {
      const updated = await ctrl.updateStatus(
        parseInt(req.params.id, 10),
        req.body.status,
      );
      return answers.success(req, res, updated, 200);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
