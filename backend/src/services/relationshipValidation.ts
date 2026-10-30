import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';

export async function validateRelationshipInput(args: {
  familyTreeId: string;
  fromPersonId: string;
  toPersonId: string;
  type: 'PARENT_CHILD' | 'SPOUSE';
}): Promise<void> {
  const { familyTreeId, fromPersonId, toPersonId, type } = args;

  if (!familyTreeId || !fromPersonId || !toPersonId) {
    throw new Error('Invalid relationship payload.');
  }

  if (fromPersonId === toPersonId) {
    throw new Error('A person cannot relate to themselves.');
  }

  const [fromPerson, toPerson] = await Promise.all([
    Person.findById(fromPersonId),
    Person.findById(toPersonId),
  ]);

  if (!fromPerson || !toPerson) {
    throw new Error('One or more persons were not found.');
  }

  if (String(fromPerson.familyTreeId) !== familyTreeId || String(toPerson.familyTreeId) !== familyTreeId) {
    throw new Error('Cross-family relationships are not allowed.');
  }

  const duplicate = await Relationship.findOne({
    familyTreeId,
    type,
    fromPersonId,
    toPersonId,
  });

  if (duplicate) {
    throw new Error('This relationship already exists.');
  }

  if (type === 'SPOUSE') {
    const existingSpouse = await Relationship.findOne({
      familyTreeId,
      type: 'SPOUSE',
      $or: [
        { fromPersonId, toPersonId },
        { fromPersonId: toPersonId, toPersonId: fromPersonId },
      ],
    });

    if (existingSpouse) {
      throw new Error('This spouse relationship already exists.');
    }

    return;
  }

  const existingParentLink = await Relationship.findOne({
    familyTreeId,
    type: 'PARENT_CHILD',
    $or: [
      { fromPersonId, toPersonId },
      { fromPersonId: toPersonId, toPersonId: fromPersonId },
    ],
  });

  if (existingParentLink) {
    throw new Error('This parent-child relationship already exists.');
  }

  if (await wouldCreateCircularAncestry(familyTreeId, fromPersonId, toPersonId)) {
    throw new Error('Circular ancestry is not allowed.');
  }
}

async function wouldCreateCircularAncestry(familyTreeId: string, parentId: string, childId: string): Promise<boolean> {
  const queue: string[] = [childId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const parents = await Relationship.find({
      familyTreeId,
      type: 'PARENT_CHILD',
      toPersonId: current,
    }).select('fromPersonId');

    for (const parent of parents) {
      const parentIdValue = String(parent.fromPersonId);
      if (parentIdValue === parentId) {
        return true;
      }
      queue.push(parentIdValue);
    }
  }

  return false;
}
