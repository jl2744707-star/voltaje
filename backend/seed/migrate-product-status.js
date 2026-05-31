import sequelize from "../DB/sequelize.js";
import ProductModel from "../DB/models/product.js";

async function main() {
  await sequelize.connect?.();

  const pausedCount = await ProductModel.update(
    { status: "paused" },
    { where: { isActive: false } },
  );
  const activeCount = await ProductModel.update(
    { status: "active" },
    { where: { isActive: true } },
  );

  console.log({ activeCount, pausedCount });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
