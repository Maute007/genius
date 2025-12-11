import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Simple JWT authentication from Authorization header
  try {
    const authHeader = opts.req.headers["authorization"];
    
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      
      // Verify JWT token
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      
      // Get user by userId from token
      const userId = payload.userId as number;
      if (userId) {
        const foundUser = await db.getUserById(userId);
        if (foundUser) {
          user = foundUser;
        }
      }
    }
  } catch (error) {
    // Authentication failed - user remains null
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
