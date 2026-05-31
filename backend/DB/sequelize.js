import sequelize from "./instance.js"; // Importamos la instancia

import user from "./models/user.js";
import address from "./models/address.js";
import product from "./models/product.js";
import role from "./models/role.js";
import permission from "./models/permission.js";
import cart from "./models/cart.js";
import cartItem from "./models/cartItem.js";
import order from "./models/order.js";
import orderItem from "./models/orderItem.js";

// --- MANDAMOS LAS RELACIONES ACÁ JUNTAS ---
user.hasMany(address, { foreignKey: "id_user", onDelete: "CASCADE" });
address.belongsTo(user, { foreignKey: "id_user" });

user.hasMany(product, { foreignKey: "id_user" });
product.belongsTo(user, { foreignKey: "id_user" });

role.hasMany(user, { foreignKey: "id_role" });
user.belongsTo(role, { foreignKey: "id_role" });

// Un usuario tiene un carrito, y un carrito pertenece a un usuario
user.hasOne(cart, { foreignKey: "id_user" });
cart.belongsTo(user, { foreignKey: "id_user" });

// Un carrito contiene muchos ítems
cart.hasMany(cartItem, { foreignKey: "id_cart", as: "items" });
cartItem.belongsTo(cart, { foreignKey: "id_cart" });

// Un ítem del carrito pertenece a un producto específico
product.hasMany(cartItem, { foreignKey: "id_product" });
cartItem.belongsTo(product, { foreignKey: "id_product" });

user.hasMany(order, { foreignKey: "id_user" });
order.belongsTo(user, { foreignKey: "id_user" });

order.hasMany(orderItem, { foreignKey: "id_order", as: "items" });
orderItem.belongsTo(order, { foreignKey: "id_order" });

product.hasMany(orderItem, { foreignKey: "id_product" });
orderItem.belongsTo(product, { foreignKey: "id_product" });

role.belongsToMany(permission, {
  through: "role_permissions",
  foreignKey: "id_role",
});
permission.belongsToMany(role, {
  through: "role_permissions",
  foreignKey: "id_permission",
});

export async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL con Sequelize establecida correctamente");

    // Evita fallar si alguna tabla (ej: roles) no existe en la BD.
    // Como tu app depende de sync para recrear, usamos fuerza, pero si
    // MySQL se encuentra en estado inconsistente, esto evita romper el arranque.
    await sequelize.sync({});
    console.log("Tablas sincronizadas");

    // 🚀 --- CARGA DE DATOS INICIALES (SEEDERS) ---
    //console.log("Cargando roles y permisos iniciales...");

    // // 1. Creamos los Roles obligatorios
    // // usar findOrCreate evita que se dupliquen si sacás el force: true más adelante
    //const [clientRole] = await sequelize.models.role.findOrCreate({
    //where: { id_role: 1 },
    //defaults: { name: "client" },
    //});

    //const [sellerRole] = await sequelize.models.role.findOrCreate({
    //where: { id_role: 2 },
    //defaults: { name: "seller" },
    //});

    //const [adminRole] = await sequelize.models.role.findOrCreate({
    //where: { id_role: 3 },
    //defaults: { name: "admin" },
    //});

    // // 2. Creamos los Permisos básicos del sistema
    //const [pCreate] = await sequelize.models.permission.findOrCreate({
      //where: { name: "product:create" },
    //defaults: { description: "Permite subir productos nuevos" },
    //});

    //const [pDelete] = await sequelize.models.permission.findOrCreate({
      //where: { name: "product:delete" },
      //defaults: { description: "Permite borrar productos del sistema" },
    //});

    //const [pUsers] = await sequelize.models.permission.findOrCreate({
      //where: { name: "user:manage" },
      //defaults: { description: "Permite administrar usuarios (solo Admin)" },
    //});

    // // 3. Asignamos los permisos a los roles (Tabla intermedia)
    // // Al "seller" le damos permiso de crear y borrar sus productos
    //await sellerRole.addPermissions([pCreate, pDelete]);

    // // Al "admin" le damos absolutamente todos los permisos
    //await adminRole.addPermissions([pCreate, pDelete, pUsers]);

    // // El "client" no necesita permisos explícitos en esta tabla porque solo compra

    // console.log("¡Roles, permisos y relaciones inicializadas con éxito!");
  } catch (error) {
    console.error("Error al conectar o sincronizar MySQL:", error);
  }
}

export default sequelize;
