import { Schema, model, type Document, type Types } from 'mongoose';

export interface ILifeEvent extends Document {
  _id: Types.ObjectId;
  familyTreeId: Types.ObjectId;
  personId: Types.ObjectId;
  type: 'BIRTH' | 'MARRIAGE' | 'DIVORCE' | 'DEATH' | 'ADOPTION' | 'OTHER';
  title: string;
  description?: string;
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lifeEventSchema = new Schema<ILifeEvent>(
  {
    familyTreeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    type: { type: String, enum: ['BIRTH', 'MARRIAGE', 'DIVORCE', 'DEATH', 'ADOPTION', 'OTHER'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    eventDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const LifeEvent = model<ILifeEvent>('LifeEvent', lifeEventSchema);
