import { Schema, model, type Document, type Types } from 'mongoose';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export interface IPerson extends Document {
  _id: Types.ObjectId;
  familyTreeId: Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  displayName: string;
  gender: Gender;
  profilePhoto?: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  isLiving: boolean;
  birthPlace?: string;
  deathPlace?: string;
  currentLocation?: string;
  occupation?: string;
  education?: string;
  biography?: string;
  notes?: string;
  visibilitySettings: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const personSchema = new Schema<IPerson>(
  {
    familyTreeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    preferredName: { type: String, default: '' },
    displayName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'], default: 'UNKNOWN' },
    profilePhoto: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    dateOfDeath: { type: Date, default: null },
    isLiving: { type: Boolean, default: true },
    birthPlace: { type: String, default: '' },
    deathPlace: { type: String, default: '' },
    currentLocation: { type: String, default: '' },
    occupation: { type: String, default: '' },
    education: { type: String, default: '' },
    biography: { type: String, default: '' },
    notes: { type: String, default: '' },
    visibilitySettings: {
      type: Map,
      of: Boolean,
      default: {
        showName: true,
        showPhoto: true,
        showBirthYear: true,
        showExactBirthDate: false,
        showDeathYear: true,
        showBiography: true,
        showOccupation: true,
      },
    },
  },
  { timestamps: true }
);

personSchema.index({ familyTreeId: 1, firstName: 1, lastName: 1 });
personSchema.index({ familyTreeId: 1, dateOfBirth: 1 });
personSchema.index({ familyTreeId: 1, dateOfDeath: 1 });

export const Person = model<IPerson>('Person', personSchema);
