import { NextRequest, NextResponse } from 'next/server';
import  dbConnect  from '../../lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    // Connexion à MongoDB
    await dbConnect();
    
    // Vérification de connexion réussie
    return NextResponse.json({ message: 'Connected to MongoDB successfully!' });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ message: 'Failed to connect to MongoDB', error: (error as Error).message }, { status: 500 });
  }
}
