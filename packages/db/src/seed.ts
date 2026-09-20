import { db } from "./index";
import * as argon2 from "argon2";

async function seed() {
  const rootEmail = process.env.ROOT_EMAIL;
  if (!rootEmail) {
    throw new Error("ROOT_EMAIL environment variable is not set");
  }
  const rootPassword = process.env.ROOT_PASSWORD;
  if (!rootPassword) {
    throw new Error("ROOT_PASSWORD environment variable is not set");
  }
  const hashedRootPassword = await argon2.hash(rootPassword);

  await db.orm.public.User.upsert({
    create: {
      email: rootEmail,
      password: hashedRootPassword,
      role: "ADMIN",
    },
    update: { email: rootEmail, role: "ADMIN" },
    conflictOn: {
      email: rootEmail,
    },
  });
}

seed()
  .then(() => console.log("🌱🌱🌱 Seeding completed successfully."))
  .catch(console.error)
  .finally(() => db.runtime().close());
