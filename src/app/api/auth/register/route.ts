import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ok, fail, rateLimit } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 10)) return fail("Too many attempts. Try later.", 429);

  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422, { issues: parsed.error.flatten() });

  try {
    await connectDB();
    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return fail("An account with this email already exists.", 409);

    // First user becomes admin.
    const count = await User.estimatedDocumentCount();
    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: count === 0 ? "admin" : "member",
    });

    const token = signToken({ sub: String(user._id), email: user.email, name: user.name, role: user.role });
    await setSessionCookie(token);
    return ok({ id: String(user._id), name: user.name, email: user.email, role: user.role }, 201);
  } catch (err) {
    console.error(err);
    return fail("Could not create account. Is the database configured?", 500);
  }
}
