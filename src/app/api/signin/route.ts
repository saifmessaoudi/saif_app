// src/app/api/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function POST(req: NextRequest) {
  try {

    await dbConnect();

    
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: '1h', 
    });

    
    return NextResponse.json({
      message: 'Login successful!',
      token,
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}
