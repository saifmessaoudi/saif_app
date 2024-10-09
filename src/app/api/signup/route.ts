import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';
import User from '@/app/models/user';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { nom, prenom, email, password, adresse, dateDeNaissance, numeroDeTelephone } = await req.json();

    if (!nom || !prenom || !email || !password || !adresse || !dateDeNaissance || !numeroDeTelephone) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    
    const parsedDateDeNaissance = new Date(dateDeNaissance.split('/').reverse().join('-')); 

    if (isNaN(parsedDateDeNaissance.getTime())) {
      return NextResponse.json({ message: 'Invalid date format. Please use DD/MM/YYYY.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      dateDeNaissance: parsedDateDeNaissance, 
      adresse,
      numeroDeTelephone,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User registered successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}
