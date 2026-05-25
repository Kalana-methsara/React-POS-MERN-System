import { UserRole } from "./enums/userRole";
import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userRole: UserRole[]; 
    approved: boolean;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userRole: { 
        type: [String], 
        enum: Object.values(UserRole), 
        default: [UserRole.USER] 
    },
    approved: { type: Boolean, default: false }
});

export const UserModel = model<IUser>('user', userSchema);