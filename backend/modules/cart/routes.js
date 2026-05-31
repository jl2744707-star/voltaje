import express from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { validateSchema } from "../../middleware/validator.middleware.js";
import { addItemSchema, updateItemSchema } from "../../schema/cart.schema.js";
import cartController from "./controller.js";
import * as answers from "../../errors/answer.js";

const router = express.Router();
const ctrl = cartController();

// 1. Ver mi carrito (GET /api/cart)
router.get("/", verifyJWT, async (req, res, next) => {
  try {
    const userCart = await ctrl.getCart(req.user.id_user);
    return answers.success(req, res, userCart, 200);
  } catch (err) {
    next(err);
  }
});

// 2. Añadir producto al carrito (POST /api/cart)
router.post(
  "/",
  verifyJWT,
  validateSchema(addItemSchema),
  async (req, res, next) => {
    try {
      const itemAdded = await ctrl.addItem(req.user.id_user, req.body);
      return answers.success(req, res, itemAdded, 201);
    } catch (err) {
      next(err);
    }
  },
);

// 3. Cambiar cantidad de un producto (PUT /api/cart/:id_product)
router.put(
  "/:id_product",
  verifyJWT,
  validateSchema(updateItemSchema),
  async (req, res, next) => {
    try {
      const updatedItem = await ctrl.updateItem(
        req.user.id_user,
        parseInt(req.params.id_product, 10),
        req.body.quantity,
      );
      return answers.success(req, res, updatedItem, 200);
    } catch (err) {
      next(err);
    }
  },
);

// 4. Eliminar producto del carrito (DELETE /api/cart/:id_product)
router.delete("/:id_product", verifyJWT, async (req, res, next) => {
  try {
    const result = await ctrl.removeItem(
      req.user.id_user,
      parseInt(req.params.id_product, 10),
    );
    return answers.success(req, res, result.mensaje, 200);
  } catch (err) {
    next(err);
  }
});

export default router;
