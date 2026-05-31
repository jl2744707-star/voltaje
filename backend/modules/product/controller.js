import ProductModel from "../../DB/models/product.js";
import { uploadImageToCloudinary } from "../../utils/cloudinary.js";

export default function productController() {
  // 1. Crear Producto
  async function add(data, file, userId) {
    let finalImageUrl = null;

    if (file) {
      // Subida limpia a Cloudinary desde el buffer en memoria
      const cloudinaryResult = await uploadImageToCloudinary(file.buffer);
      finalImageUrl = cloudinaryResult.secure_url;
    }

    return await ProductModel.create({
      id_user: userId,
      name: data.name,
      description: data.description || null,
      brand: data.brand,
      category: data.category,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      imageUrl: finalImageUrl,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  // 2. Obtener todos los productos activos (Público)
  async function all() {
    // Solo muestra activos en tienda
    // (si alguien pausó, no debe verse públicamente)
    return await ProductModel.findAll({
      where: { status: "active" },
    });
  }

  // 3. Obtener un solo producto (PÚBLICO: solo activos)
  async function one(id_product) {
    const product = await ProductModel.findByPk(id_product);
    if (!product || !["active", "paused"].includes(product.status)) {
      const error = new Error("Producto no encontrado o no disponible");
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  // 3b. Obtener un solo producto por id (ADMIN/SELLER: active + paused)
  async function oneForPanel(id_product) {
    const product = await ProductModel.findByPk(id_product);
    if (!product || !["active", "paused"].includes(product.status)) {
      const error = new Error("Producto no encontrado o no disponible");
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  // 4. Actualizar Producto
  async function update(id_product, data, file, currentUser) {
    const product = await ProductModel.findByPk(id_product);

    if (!product) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (currentUser.id_role !== 3 && product.id_user !== currentUser.id_user) {
      const error = new Error("No tenés permisos para editar este producto.");
      error.statusCode = 403;
      throw error;
    }

    const fieldsToUpdate = {
      name: data.name || product.name,
      description:
        data.description !== undefined ? data.description : product.description,
      brand: data.brand || product.brand,
      category: data.category || product.category,
      price: data.price ? parseFloat(data.price) : product.price,
      stock: data.stock ? parseInt(data.stock, 10) : product.stock,

      // Nuevo: estado principal del producto
      status: data.status !== undefined ? data.status : product.status,

      // Legacy: mantenemos isActive para compatibilidad con código viejo
      isActive: data.isActive !== undefined ? data.isActive : product.isActive,
    };

    if (file) {
      const cloudinaryResult = await uploadImageToCloudinary(file.buffer);
      fieldsToUpdate.imageUrl = cloudinaryResult.secure_url; // 📸 Tu columna
    }

    await product.update(fieldsToUpdate);
    return product;
  }

  // 5. Eliminar Producto (Borrado lógico usando tu columna isActive)
  async function del(id_product, currentUser) {
    const product = await ProductModel.findByPk(id_product);

    if (!product) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (currentUser.id_role !== 3 && product.id_user !== currentUser.id_user) {
      const error = new Error("No tenés permisos para eliminar este producto.");
      error.statusCode = 403;
      throw error;
    }

    // Baja definitiva
    await product.update({
      isActive: false, // legacy
      status: "deleted", // nuevo
    });
    return { mensaje: "Producto dado de baja con éxito" };
  }

  // 6b. Productos por usuario (ADMIN/SELLER) - active + paused
  async function byUser(currentUser) {
    const isAdmin = currentUser.id_role === 3;

    const where = {
      status: ["active", "paused"],
      ...(isAdmin ? {} : { id_user: currentUser.id_user }),
    };

    return await ProductModel.findAll({
      where,
      include: [
        {
          association: ProductModel.associations.user,
          attributes: ["id_user", "user", "name", "surname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // 6c. Productos para panel del ADMIN (active + paused)
  async function adminAll() {
    return await ProductModel.findAll({
      where: { status: ["active", "paused"] },
      include: [
        {
          association: ProductModel.associations.user,
          attributes: ["id_user", "user", "name", "surname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  return { add, all, one, oneForPanel, update, del, byUser, adminAll };
}
