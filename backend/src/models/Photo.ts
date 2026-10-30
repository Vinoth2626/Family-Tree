import { Schema, model, type Document, type Types } from 'mongoose';

export interface IPhoto extends Document {
  _id: Types.ObjectId;
  familyTreeId: Types.ObjectId;
  personId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    familyTreeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    eventId: { type: Schema.Types.ObjectId, ref: 'LifeEvent', default: null },
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Photo = model<IPhoto>('Photo', photoSchema);
