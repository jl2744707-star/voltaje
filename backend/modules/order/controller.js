import sequelize from "../../DB/instance.js";
import OrderModel from "../../DB/models/order.js";
import OrderItemModel from "../../DB/models/orderItem.js";
import CartModel from "../../DB/models/cart.js";
import CartItemModel from "../../DB/models/cartItem.js";
import ProductModel from "../../DB/models/product.js";
import AddressModel from "../../DB/models/address.js";

export default function orderController() {
  // 1. CONFIRMAR COMPRA (Crear Orden desde el carrito)
  async function createOrder(userId, id_address) {
    const t = await sequelize.transaction(); // Iniciamos transacción de seguridad

    try {
      // a. Buscar la dirección seleccionada por el usuario
      const address = await AddressModel.findOne({
        where: { id_address, id_user: userId },
      });
      if (!address) {
        const error = new Error(
          "La dirección de envío seleccionada no es válida",
        );
        error.statusCode = 404;
        throw error;
      }
      const fullAddressText =
        `${address.street} ${address.number}, ${address.city}, ${address.province}. CP: ${address.postalCode} ${address.floor || ""} ${address.apartment || ""}`.trim();

      // b. Buscar el carrito actual del usuario con sus ítems y datos de productos
      const cart = await CartModel.findOne({
        where: { id_user: userId },
        include: { model: CartItemModel, as: "items", include: ProductModel },
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        const error = new Error(
          "El carrito está vacío, no se puede generar una orden",
        );
        error.statusCode = 400;
        throw error;
      }

      // c. Calcular totales y verificar stock en tiempo real
      let totalAmount = 0;
      const itemsToCreate = [];

      for (const cartItem of cart.items) {
        const prod = cartItem.product;

        if (!prod || !prod.isActive) {
          throw new Error(
            `El producto "${prod?.name || "Desconocido"}" ya no está disponible.`,
          );
        }

        if (prod.stock < cartItem.quantity) {
          throw new Error(
            `Stock insuficiente para "${prod.name}". Disponibles: ${prod.stock}, solicitados: ${cartItem.quantity}`,
          );
        }

        // Restamos el stock del producto
        await prod.update(
          { stock: prod.stock - cartItem.quantity },
          { transaction: t },
        );

        // Sumamos al total de la orden
        totalAmount += parseFloat(prod.price) * cartItem.quantity;

        // Preparamos el array para insertar en la tabla de detalles
        itemsToCreate.push({
          id_product: prod.id_product,
          quantity: cartItem.quantity,
          priceAtPurchase: prod.price,
        });
      }

      // d. Crear la orden de cabecera
      const newOrder = await OrderModel.create(
        {
          id_user: userId,
          totalPrice: totalAmount,
          shippingAddress: fullAddressText,
          status: "Pendiente",
        },
        { transaction: t },
      );

      // e. Guardar todos los detalles de la orden asociados al id_order creado
      const bulkItems = itemsToCreate.map((item) => ({
        ...item,
        id_order: newOrder.id_order,
      }));
      await OrderItemModel.bulkCreate(bulkItems, { transaction: t });

      // f. Vaciar los ítems del carrito del usuario (ya que se convirtieron en una compra)
      await CartItemModel.destroy(
        { where: { id_cart: cart.id_cart } },
        { transaction: t },
      );

      await t.commit(); // Todo salió de diez, guardamos los cambios en la BD permanente
      return newOrder;
    } catch (error) {
      await t.rollback(); // Si algo falló, deshacemos todo al estado inicial
      if (!error.statusCode) error.statusCode = 400;
      throw error;
    }
  }

  // 2. Ver mis órdenes (Historial para el cliente)
  async function getMyOrders(userId) {
    return await OrderModel.findAll({
      where: { id_user: userId },
      include: {
        model: OrderItemModel,
        as: "items",
        include: { model: ProductModel, attributes: ["name", "imageUrl"] },
      },
      order: [["createdAt", "DESC"]],
    });
  }

  // 3. Ver todas las órdenes del sistema (Solo para el Admin)
  async function getAllOrders() {
    return await OrderModel.findAll({
      include: {
        model: OrderItemModel,
        as: "items",
        include: {
          model: ProductModel,
          attributes: ["name", "brand", "price"],
        },
      },
      order: [["createdAt", "DESC"]],
    });
  }

  // 4. Cambiar estado de una orden (Solo para Admin / Vendedor para despachar)
  async function updateStatus(id_order, status) {
    const ord = await OrderModel.findByPk(id_order);
    if (!ord) {
      const error = new Error("Orden no encontrada");
      error.statusCode = 404;
      throw error;
    }
    await ord.update({ status });
    return ord;
  }

  return { createOrder, getMyOrders, getAllOrders, updateStatus };
}
