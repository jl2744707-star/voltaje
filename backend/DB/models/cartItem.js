import { DataTypes } from "sequelize";
import sequelize from "../instance.js";
import cart from "./cart.js";
import product from "./product.js";

const cartItem = sequelize.define(
  "cartItem",
  {
    id_cart_item: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_cart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: cart,
        key: "id_cart",
      },
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: product,
        key: "id_product",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Por defecto agrega 1 artículo
    },
  },
  {
    tableName: "cart_item",
    timestamps: true,
  },
);

export default cartItem;
