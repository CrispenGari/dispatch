
  // types for your environmental variables
  declare namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL : string;
			JWT_SECRETE : string;
			NODEMAILER_USER : string;
			NODEMAILER_PASSWORD : string;
			IP_ADDRESS : string;

    }
  }
  