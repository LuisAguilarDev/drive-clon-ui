import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here.
   */
  client: {
    NEXT_PUBLIC_firebase_apiKey: z.string().min(1, "Firebase API key is required"),
    NEXT_PUBLIC_firebase_authDomain: z.string().min(1, "Firebase Auth Domain is required"),
    NEXT_PUBLIC_firebase_projectId: z.string().min(1, "Firebase Project ID is required"),
    NEXT_PUBLIC_firebase_storageBucket: z.string().min(1, "Firebase Storage Bucket is required"),
    NEXT_PUBLIC_firebase_messagingSenderId: z.string().min(1, "Firebase Messaging Sender ID is required"),
    NEXT_PUBLIC_firebase_appId: z.string().min(1, "Firebase App ID is required"),
    NEXT_PUBLIC_firebase_measurementId:z.string().min(1, "Firebase Measurement ID is required"),
    NEXT_PUBLIC_firebase_databaseURL:z.string().min(1, "Firebase database URL is required"),
  },

  /**
   * Runtime environment variables.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_firebase_apiKey: process.env.NEXT_PUBLIC_firebase_apiKey,
    NEXT_PUBLIC_firebase_authDomain: process.env.NEXT_PUBLIC_firebase_authDomain,
    NEXT_PUBLIC_firebase_projectId: process.env.NEXT_PUBLIC_firebase_projectId,
    NEXT_PUBLIC_firebase_storageBucket: process.env.NEXT_PUBLIC_firebase_storageBucket,
    NEXT_PUBLIC_firebase_messagingSenderId: process.env.NEXT_PUBLIC_firebase_messagingSenderId,
    NEXT_PUBLIC_firebase_appId: process.env.NEXT_PUBLIC_firebase_appId,
    NEXT_PUBLIC_firebase_measurementId:process.env.NEXT_PUBLIC_firebase_measurementId,
    NEXT_PUBLIC_firebase_databaseURL:process.env.NEXT_PUBLIC_firebase_databaseURL,
  },

  /**
   * Skip validation for Docker builds if necessary.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined.
   */
  emptyStringAsUndefined: true,
});
