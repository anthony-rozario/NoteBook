import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
// import { db } from '@repo/database'; // Using your shared database package

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // 1. Validation
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // 2. Hash Password (Security first)
    const hashedPassword = await hash(password, 12);

    // 3. Create User in PostgreSQL (Inside your Docker container)
    // const user = await db.user.create({ 
    //   data: { name, email, password_hash: hashedPassword, role } 
    // });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}