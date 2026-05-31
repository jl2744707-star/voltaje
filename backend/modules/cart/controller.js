import CartModel from "../../DB/models/cart.js";
import CartItemModel from "../../DB/models/cartItem.js";
import ProductModel from "../../DB/models/product.js";

export default function cartController() {
  // 🔐 Función interna para asegurar que el usuario tenga un carrito creado
  async function getOrCreateCart(userId) {
    let cart = await CartModel.findOne({ where: { id_user: userId } });
    if (!cart) {
      cart = await CartModel.create({ id_user: userId });
    }
    return cart;
  }

  // 1. Obtener el carrito completo del usuario con los datos de los productos
  async function getCart(userId) {
    const cart = await getOrCreateCart(userId);

    return await CartModel.findByPk(cart.id_cart, {
      include: {
        model: CartItemModel,
        as: "items",
        include: {
          model: ProductModel, // Trae los detalles del producto (nombre, precio, imageUrl)
          attributes: [
            "id_product",
            "name",
            "price",
            "imageUrl",
            "stock",
            "brand",
          ],
        },
      },
    });
  }

  // 2. Agregar ítem al carrito o incrementar su cantidad
  async function addItem(userId, data) {
    const cart = await getOrCreateCart(userId);
    const { id_product, quantity } = data;

    // Verificar si el producto existe y está activo
    const product = await ProductModel.findByPk(id_product);
    if (!product || !product.isActive) {
      const error = new Error("El producto no existe o no está disponible");
      error.statusCode = 404;
      throw error;
    }

    // Verificar si ya tiene ese producto en el carrito
    let item = await CartItemModel.findOne({
      where: { id_cart: cart.id_cart, id_product },
    });

    if (item) {
      // Si ya existía, sumamos la cantidad
      item.quantity += quantity;
      await item.save();
    } else {
      // Si no existía, creamos el registro
      item = await CartItemModel.create({
        id_cart: cart.id_cart,
        id_product,
        quantity,
      });
    }

    return item;
  }

  // 3. Modificar la cantidad exacta de un ítem desde el carrito
  async function updateItem(userId, id_product, quantity) {
    const cart = await CartModel.findOne({ where: { id_user: userId } });
    if (!cart) {
      const error = new Error("Carrito no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const item = await CartItemModel.findOne({
      where: { id_cart: cart.id_cart, id_product },
    });

    if (!item) {
      const error = new Error("El producto no está en el carrito");
      error.statusCode = 404;
      throw error;
    }

    item.quantity = quantity;
    await item.save();
    return item;
  }

  // 4. Quitar un producto por completo del carrito
  async function removeItem(userId, id_product) {
    const cart = await CartModel.findOne({ where: { id_user: userId } });
    if (!cart) {
      const error = new Error("Carrito no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const item = await CartItemModel.findOne({
      where: { id_cart: cart.id_cart, id_product },
    });

    if (!item) {
      const error = new Error("El producto no está en el carrito");
      error.statusCode = 404;
      throw error;
    }

    await item.destroy();
    return { mensaje: "Producto quitado del carrito" };
  }

  return { getCart, addItem, updateItem, removeItem };
}
