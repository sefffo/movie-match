import dotenv from "dotenv";
dotenv.config();

const required = ["COGNODB_URI", "COGNODB_USER", "COGNODB_PASSWORD"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  cognodb: {
    uri: process.env.COGNODB_URI,
    user: process.env.COGNODB_USER,
    password: process.env.COGNODB_PASSWORD,
  },
  port: parseInt(process.env.PORT ?? "3000", 10),
};
