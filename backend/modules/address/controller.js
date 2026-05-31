import AddressModel from "../../DB/models/address.js";

export default function addressController() {
  // 1. Crear Dirección
  async function add(data, userId) {
    // Si viene como predeterminada, quitamos el "default" a sus otras direcciones primero
    if (data.isDefault) {
      await AddressModel.update(
        { isDefault: false },
        { where: { id_user: userId } },
      );
    }

    return await AddressModel.create({
      id_user: userId,
      street: data.street,
      number: data.number,
      floor: data.floor || null,
      apartment: data.apartment || null,
      postalCode: data.postalCode,
      city: data.city,
      province: data.province,
      description: data.description || null,
      isDefault: data.isDefault || false,
    });
  }

  // 2. Listar direcciones del usuario logueado
  async function myAddresses(userId) {
    return await AddressModel.findAll({
      where: { id_user: userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ], // Primero la predeterminada, luego las más nuevas
    });
  }

  // 3. Actualizar Dirección
  async function update(id_address, data, currentUser) {
    const address = await AddressModel.findByPk(id_address);

    if (!address) {
      const error = new Error("Dirección no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // 🔐 SEGURIDAD: Solo el dueño de la dirección (o un Admin rol 3) puede editarla
    if (currentUser.id_role !== 3 && address.id_user !== currentUser.id_user) {
      const error = new Error(
        "No tenés permisos para modificar esta dirección.",
      );
      error.statusCode = 403;
      throw error;
    }

    // Si setea esta como predeterminada, apagamos las demás
    if (data.isDefault === true) {
      await AddressModel.update(
        { isDefault: false },
        { where: { id_user: address.id_user } },
      );
    }

    await address.update(data);
    return address;
  }

  // 4. Eliminar Dirección
  async function del(id_address, currentUser) {
    const address = await AddressModel.findByPk(id_address);

    if (!address) {
      const error = new Error("Dirección no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // 🔐 SEGURIDAD: Solo el dueño o Admin elimina
    if (currentUser.id_role !== 3 && address.id_user !== currentUser.id_user) {
      const error = new Error(
        "No tenés permisos para eliminar esta dirección.",
      );
      error.statusCode = 403;
      throw error;
    }

    await address.destroy();
    return { mensaje: "Dirección eliminada con éxito" };
  }

  return { add, myAddresses, update, del };
}
