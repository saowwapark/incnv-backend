import * as dotenv from 'dotenv';
const env = dotenv.config();
if (env.error) {
  throw env.error;
}
console.log(env.parsed);

// configuration for production
export const host = process.env.HOST || 'hostproduction';
export const port = process.env.PORT;
export const db = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
