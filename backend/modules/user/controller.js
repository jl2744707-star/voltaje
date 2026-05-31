import UserModel from "../../DB/models/user.js";
import bcrypt from "bcrypt"; // Reemplazá por la librería que uses para hashear paswords

export default function userController() {
  // 1. Obtener datos del usuario actual (Mi Perfil)
  async function getProfile(userId) {
    const user = await UserModel.findByPk(userId, {
      attributes: { exclude: ["password", "securityAnswer"] }, // Jamás devolvemos datos sensibles
    });
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  // 2. Actualizar datos del perfil propio
  async function updateProfile(userId, data) {
    const user = await UserModel.findByPk(userId);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // 🔐 CONTROL 1: Si quiere cambiar la contraseña, verificamos primero la actual
    if (data.password) {
      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        const error = new Error(
          "La contraseña actual ingresada es incorrecta.",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // 🔐 CONTROL 2: Si quiere cambiar la respuesta de seguridad, verificamos la actual
    if (data.securityAnswer) {
      if (!data.currentSecurityAnswer) {
        const error = new Error(
          "Si cambia la respuesta de seguridad, debe ingresar la respuesta actual.",
        );
        error.statusCode = 400;
        throw error;
      }

      const normalizedCurrentAnswer = data.currentSecurityAnswer
        .toString()
        .toLowerCase()
        .trim();

      // user.securityAnswer en DB está hasheada (bcrypt)
      const isAnswerMatch = await bcrypt.compare(
        normalizedCurrentAnswer,
        user.securityAnswer,
      );

      if (!isAnswerMatch) {
        const error = new Error(
          "La respuesta de seguridad actual es incorrecta.",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Preparamos los campos a actualizar en la base de datos
    const fieldsToUpdate = {};
    if (data.name) fieldsToUpdate.name = data.name;
    if (data.surname) fieldsToUpdate.surname = data.surname;
    if (data.user) fieldsToUpdate.user = data.user;
    if (data.email) fieldsToUpdate.email = data.email;
    if (data.securityQuestionId)
      fieldsToUpdate.securityQuestionId = data.securityQuestionId;

    // Si pasó el control, hasheamos la NUEVA respuesta de seguridad
    if (data.securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.securityAnswer = await bcrypt.hash(
        data.securityAnswer.toLowerCase().trim(),
        salt,
      );
    }

    // Si pasó el control, hasheamos la NUEVA contraseña
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(data.password, salt);
    }

    // Guardamos todo en la base de datos
    await user.update(fieldsToUpdate);

    // Devolvemos el usuario limpio sin datos sensibles
    const updatedUser = user.toJSON();
    delete updatedUser.password;
    delete updatedUser.securityAnswer;
    return updatedUser;
  }

  // 3. Listar todos los usuarios del sistema (Solo Admin)
  async function getAllUsers() {
    return await UserModel.findAll({
      attributes: { exclude: ["password", "securityAnswer"] },
      order: [["id_user", "ASC"]],
    });
  }

  // 4. Cambiar el rol de un usuario (Solo Admin, ej: hacer Vendedor a un Cliente)
  async function changeRole(id_user, id_role) {
    const user = await UserModel.findByPk(id_user);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    await user.update({ id_role });
    return {
      mensaje: `Rol del usuario '${user.user}' actualizado con éxito a Rol ${id_role}`,
    };
  }

  return { getProfile, updateProfile, getAllUsers, changeRole };
}
