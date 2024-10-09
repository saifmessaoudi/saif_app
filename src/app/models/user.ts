// src/app/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse: string;
  dateDeNaissance: Date; 
  numeroDeTelephone: string;
}

const UserSchema: Schema = new Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateDeNaissance: { type: Date, required: true }, 
  adresse: { type: String, required: true },
  numeroDeTelephone: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
