import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ok, fail, rateLimit } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 15)) return fail("Too many attempts. Try later.", 429);

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422);

  try {
    await connectDB();
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) return fail("Invalid email or password.", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return fail("Invalid email or password.", 401);

    const token = signToken({ sub: String(user._id), email: user.email, name: user.name, role: user.role });
    await setSessionCookie(token);
    return ok({ id: String(user._id), name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return fail("Login failed. Is the database configured?", 500);
  }
}
