import { DataTypes } from "sequelize";
import sequelize from "../instance.js";
import user from "./user.js";

const cart = sequelize.define(
  "cart",
  {
    id_cart: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Un usuario solo puede tener un carrito activo a la vez
      references: {
        model: user,
        key: "id_user",
      },
    },
  },
  {
    tableName: "cart",
    timestamps: true,
  },
);

export default cart;
