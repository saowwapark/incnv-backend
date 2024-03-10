import * as dotenv from 'dotenv';

if (process.env.NODE_ENV) {
  dotenv.config({
    path: `${__dirname}/../.env.${process.env.NODE_ENV}`
  })
} else {
  dotenv.config()
}

// configuration for production
export const host = process.env.HOST;
export const port = process.env.PORT;
export const dbEnv = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
