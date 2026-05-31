import { DataTypes } from "sequelize";
import sequelize from "../instance.js";
import user from "./user.js";

const product = sequelize.define(
  "product",
  {
    id_product: {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Ej: "Fibras escolares lavables con punta redonda..."
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: false, // Ej: "Faber-Castell"
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false, // Ej: "Escritura", "Carpetas", "Mochilas"
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Si no aclaran stock al crearlo, asume 0
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true, // la URL que te devuelva Cloudinary
    },
    // Deprecated/legacy flag. We'll keep it for compatibility.
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Nueva columna para diferenciar acciones de producto
    // - active: visible en tienda y panel
    // - paused: oculto en tienda, pero aparece para activar
    // - deleted: borrado definitivo (no aparece en panel)
    status: {
      type: DataTypes.ENUM("active", "paused", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "product",
    timestamps: true,
  },
);

export default product;
