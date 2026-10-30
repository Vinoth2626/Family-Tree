import { Schema, model, type Document, type Types } from 'mongoose';

export type RelationshipType = 'PARENT_CHILD' | 'SPOUSE';

export interface IRelationship extends Document {
  _id: Types.ObjectId;
  familyTreeId: Types.ObjectId;
  fromPersonId: Types.ObjectId;
  toPersonId: Types.ObjectId;
  type: RelationshipType;
  metadata: {
    label?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const relationshipSchema = new Schema<IRelationship>(
  {
    familyTreeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    fromPersonId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    toPersonId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    type: { type: String, enum: ['PARENT_CHILD', 'SPOUSE'], required: true },
    metadata: {
      label: { type: String, default: '' },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

relationshipSchema.index({ familyTreeId: 1, fromPersonId: 1, toPersonId: 1 });
relationshipSchema.index({ familyTreeId: 1, toPersonId: 1 });

export const Relationship = model<IRelationship>('Relationship', relationshipSchema);
