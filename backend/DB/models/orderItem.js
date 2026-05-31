import { DataTypes } from "sequelize";
import sequelize from "../instance.js";
import order from "./order.js";
import product from "./product.js";

const orderItem = sequelize.define(
  "orderItem",
  {
    id_order_item: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: order,
        key: "id_order",
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
    },
    priceAtPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // El precio unitario congelado del producto en ese momento exacto
    },
  },
  {
    tableName: "order_item",
    timestamps: true,
  },
);

export default orderItem;
