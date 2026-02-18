// api/auth/signup/route.ts

import { NextResponse } from 'next/server';
// import { db } from '@repo/database'; // Using your shared database package

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as {
      email?: string;
      password?: string;
    };

    // 1. Validation
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // 2. Create User in PostgreSQL (Inside your Docker container)
    // const user = await db.user.create({ 
    //   data: { name, email, password_hash: hashedPassword, role } 
    // });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
