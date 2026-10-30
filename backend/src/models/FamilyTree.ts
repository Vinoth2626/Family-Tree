import { Schema, model, type Document, type Types } from 'mongoose';

export type FamilyPrivacy = 'PUBLIC' | 'PRIVATE';

export interface IFamilyTree extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  coverPhoto?: string;
  rootPersonId?: Types.ObjectId;
  privacy: FamilyPrivacy;
  visibilitySettings: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const familyTreeSchema = new Schema<IFamilyTree>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    rootPersonId: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    privacy: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
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

export const FamilyTree = model<IFamilyTree>('FamilyTree', familyTreeSchema);
