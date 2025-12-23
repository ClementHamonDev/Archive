import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth-schema";
import * as domainSchema from "./schema/schema";

export const schema = {
  ...authSchema,
  ...domainSchema,
};

export const db = drizzle(process.env.DATABASE_URL!, { schema });
