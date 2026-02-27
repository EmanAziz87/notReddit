import "dotenv/config";

interface envObj {
  SESSION_SECRET: string;
  NODE_ENV: string;
  PORT: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  AWS_BUCKET_NAME: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
}

const requiredKeys: (keyof envObj)[] = [
  "SESSION_SECRET",
  "NODE_ENV",
  "PORT",
  "FRONTEND_URL",
  "DATABASE_URL",
  "AWS_BUCKET_NAME",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
];

const envObject = {
  SESSION_SECRET: process.env["SESSION_SECRET"],
  NODE_ENV: process.env["NODE_ENV"],
  PORT: process.env["PORT"],
  FRONTEND_URL: process.env["FRONTEND_URL"],
};

//*********no prod currently. will be added later**********

const envConfig: envObj = (
  process.env["NODE_ENV"] === "development"
    ? {
        ...envObject,
        DATABASE_URL: process.env["DATABASE_URL"],
        AWS_BUCKET_NAME: process.env["AWS_BUCKET_NAME"],
        AWS_REGION: process.env["AWS_REGION"],
        AWS_ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY_ID"],
        AWS_SECRET_ACCESS_KEY: process.env["AWS_SECRET_ACCESS_KEY"],
      }
    : {
        ...envObject,
        DATABASE_URL: process.env["TEST_DATABASE_URL"],
        AWS_BUCKET_NAME: process.env["TEST_AWS_BUCKET_NAME"],
        AWS_REGION: process.env["TEST_AWS_REGION"],
        AWS_ACCESS_KEY_ID: process.env["TEST_AWS_ACCESS_KEY_ID"],
        AWS_SECRET_ACCESS_KEY: process.env["TEST_AWS_SECRET_ACCESS_KEY"],
      }
) as envObj;

requiredKeys.forEach((key) => {
  if (!envConfig[key])
    throw new Error(
      "Missing the required environment variable: ${key}. More keys may be missing.",
    );
});

export default envConfig;
