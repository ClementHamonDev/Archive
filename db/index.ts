import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/schema";
import * as domainSchema from "./schema/auth-schema";

export const schema = {
  ...authSchema,
  ...domainSchema,
};
export const db = drizzle(process.env.DATABASE_URL!, { schema });
