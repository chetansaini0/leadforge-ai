import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Cache the connection across hot reloads / serverless invocations so we don't
 * open a new pool on every request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment.");
  }
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
