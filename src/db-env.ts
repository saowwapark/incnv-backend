import * as dotenv from 'dotenv';
const env = dotenv.config();
if (env.error) {
  throw env.error;
}

// configuration for production
export const host = process.env.HOST || 'hostproduction';
export const port = process.env.PORT;
export const dbEnv = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
