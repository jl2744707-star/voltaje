import { DataTypes } from "sequelize";
import sequelize from "../instance.js";

const user = sequelize.define(
  "user",
  {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    user: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    securityQuestionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    securityAnswer: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "1", // roles posibles: 1, 2, 3
    },
  },
  {
    tableName: "user",
    timestamps: true, // crea createdAt y updatedAt automáticamente
  },
);

export default user;
