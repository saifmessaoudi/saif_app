// src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User, { IUser } from '@/app/models/user';
import jwt from 'jsonwebtoken';

// GET
export async function GET(req: Request) {
  console.log('GET /api/user');
  try {
    await dbConnect();

    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log('Decoded token:', decoded);

    const userId = decoded.userId;
    const user: IUser | null = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}


//Update
export async function PUT(req: Request) {
  console.log('PUT /api/user');
  try {
    await dbConnect();

    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.userId;

    // Extract updated user info from the request body
    const body = await req.json();
    const { nom, prenom, adresse,dateDeNaissance, numeroDeTelephone } = body;

    // Find and update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nom, prenom, adresse,dateDeNaissance, numeroDeTelephone },
      { new: true, runValidators: true } // Return the updated document and validate changes
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
