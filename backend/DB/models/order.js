import { DataTypes } from "sequelize";
import sequelize from "../instance.js";
import user from "./user.js";

const order = sequelize.define(
  "order",
  {
    id_order: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: user,
        key: "id_user",
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false, // Guardamos la dirección completa estructurada en texto plano por si el usuario después la borra de su perfil
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "Pendiente", // Estados posibles: Pendiente, Pagado, Enviado, Entregado, Cancelado
    },
  },
  {
    tableName: "order",
    timestamps: true,
  },
);

export default order;
