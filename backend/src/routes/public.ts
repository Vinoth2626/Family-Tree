import { Router } from 'express';
import { z } from 'zod';
import { FamilyTree } from '../models/FamilyTree';
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';
import { LifeEvent } from '../models/LifeEvent';
import { calculateRelationship } from '../services/relationshipEngine';

const router = Router();

router.get('/families', async (_req, res) => {
  const families = await FamilyTree.find({ privacy: 'PUBLIC' }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: families });
});

router.get('/families/:slug', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const members = await Person.countDocuments({ familyTreeId: family._id });
  return res.json({ success: true, data: { family, members } });
});

router.get('/families/:slug/tree', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const [people, relationships] = await Promise.all([
    Person.find({ familyTreeId: family._id }).lean(),
    Relationship.find({ familyTreeId: family._id }).lean(),
  ]);

  return res.json({ success: true, data: { family, people, relationships } });
});

router.get('/families/:slug/members', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const people = await Person.find({ familyTreeId: family._id }).sort({ lastName: 1, firstName: 1 }).lean();
  return res.json({ success: true, data: people });
});

router.get('/families/:slug/search', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const querySchema = z.object({
    q: z.string().optional().default(''),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional(),
    living: z.enum(['all', 'living', 'deceased']).optional().default('all'),
    birthFrom: z.coerce.number().int().min(0).max(2100).optional(),
    birthTo: z.coerce.number().int().min(0).max(2100).optional(),
    occupation: z.string().optional(),
    hasPhoto: z.enum(['true', 'false']).optional(),
    sort: z.enum(['name', 'birthDate', 'deathDate', 'recentlyAdded', 'recentlyUpdated']).optional().default('name'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(25),
  });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Search parameters are invalid.' } });
  }

  const { q, gender, living, birthFrom, birthTo, occupation, hasPhoto, sort, page, limit } = parsed.data;
  const searchTerm = q.trim();
  const hasPhotoValue = hasPhoto === 'true' ? true : hasPhoto === 'false' ? false : undefined;
  const filter: Record<string, unknown> = { familyTreeId: family._id };

  if (searchTerm) {
    filter.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { middleName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { preferredName: { $regex: searchTerm, $options: 'i' } },
      { displayName: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (gender) {
    filter.gender = gender;
  }

  if (living === 'living') {
    filter.isLiving = true;
  } else if (living === 'deceased') {
    filter.isLiving = false;
  }

  if (birthFrom !== undefined || birthTo !== undefined) {
    filter.dateOfBirth = {} as Record<string, Date>;
    if (birthFrom !== undefined) {
      (filter.dateOfBirth as Record<string, Date>).$gte = new Date(`${birthFrom}-01-01T00:00:00.000Z`);
    }
    if (birthTo !== undefined) {
      (filter.dateOfBirth as Record<string, Date>).$lte = new Date(`${birthTo}-12-31T23:59:59.999Z`);
    }
  }

  if (occupation) {
    filter.occupation = { $regex: occupation.trim(), $options: 'i' };
  }

  if (hasPhotoValue === true) {
    filter.profilePhoto = { $exists: true, $ne: '' };
  } else if (hasPhotoValue === false) {
    filter.profilePhoto = { $in: [null, ''] };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    name: { lastName: 1, firstName: 1 },
    birthDate: { dateOfBirth: 1 },
    deathDate: { dateOfDeath: 1 },
    recentlyAdded: { createdAt: -1 },
    recentlyUpdated: { updatedAt: -1 },
  };

  const [total, people] = await Promise.all([
    Person.countDocuments(filter),
    Person.find(filter)
      .sort(sortMap[sort] ?? sortMap.name)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return res.json({
    success: true,
    data: people,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.get('/families/:slug/timeline', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const typeSchema = z.enum(['ALL', 'BIRTH', 'MARRIAGE', 'DIVORCE', 'DEATH', 'ADOPTION', 'OTHER']).optional().default('ALL');
  const parsed = typeSchema.safeParse(req.query.type ?? 'ALL');
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Timeline type is invalid.' } });
  }

  const filter: Record<string, unknown> = { familyTreeId: family._id };
  if (parsed.data !== 'ALL') {
    filter.type = parsed.data;
  }

  const events = await LifeEvent.find(filter).sort({ eventDate: 1 }).lean();
  return res.json({ success: true, data: events });
});

router.get('/families/:slug/person/:personId', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const person = await Person.findOne({ _id: req.params.personId, familyTreeId: family._id }).lean();
  if (!person) {
    return res.status(404).json({ success: false, error: { code: 'PERSON_NOT_FOUND', message: 'Person not found.' } });
  }

  const [allPeople, relationships, events] = await Promise.all([
    Person.find({ familyTreeId: family._id }).select('_id firstName lastName preferredName displayName gender isLiving dateOfBirth dateOfDeath').lean(),
    Relationship.find({ familyTreeId: family._id }).lean(),
    LifeEvent.find({ familyTreeId: family._id, personId: person._id }).sort({ eventDate: 1 }).lean(),
  ]);

  const peopleById = new Map<string, any>(allPeople.map((entry) => [String(entry._id), entry]));
  const personId = String(person._id);
  const parentIds = new Set<string>();
  const childIds = new Set<string>();
  const spouseIds = new Set<string>();
  const siblingIds = new Set<string>();

  for (const relationship of relationships) {
    const fromId = String(relationship.fromPersonId);
    const toId = String(relationship.toPersonId);

    if (relationship.type === 'PARENT_CHILD') {
      if (toId === personId) {
        parentIds.add(fromId);
      }
      if (fromId === personId) {
        childIds.add(toId);
      }
    }

    if (relationship.type === 'SPOUSE') {
      if (fromId === personId) {
        spouseIds.add(toId);
      }
      if (toId === personId) {
        spouseIds.add(fromId);
      }
    }
  }

  for (const relationship of relationships) {
    const fromId = String(relationship.fromPersonId);
    const toId = String(relationship.toPersonId);
    if (relationship.type === 'PARENT_CHILD' && parentIds.has(fromId) && toId !== personId) {
      siblingIds.add(toId);
    }
  }

  return res.json({
    success: true,
    data: {
      family,
      person,
      parents: Array.from(parentIds).map((id) => peopleById.get(id)).filter(Boolean),
      spouses: Array.from(spouseIds).map((id) => peopleById.get(id)).filter(Boolean),
      children: Array.from(childIds).map((id) => peopleById.get(id)).filter(Boolean),
      siblings: Array.from(siblingIds).map((id) => peopleById.get(id)).filter(Boolean),
      events,
    },
  });
});

router.get('/families/:slug/statistics', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const [peopleCount, relationshipsCount, eventsCount] = await Promise.all([
    Person.countDocuments({ familyTreeId: family._id }),
    Relationship.countDocuments({ familyTreeId: family._id }),
    LifeEvent.countDocuments({ familyTreeId: family._id }),
  ]);

  return res.json({
    success: true,
    data: {
      totalMembers: peopleCount,
      totalRelationships: relationshipsCount,
      totalEvents: eventsCount,
      privacy: family.privacy,
    },
  });
});

router.get('/families/:slug/relationship', async (req, res) => {
  const family = await FamilyTree.findOne({ slug: req.params.slug }).lean();
  if (!family || family.privacy !== 'PUBLIC') {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const { personAId, personBId } = req.query;
  if (!personAId || !personBId) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'personAId and personBId are required.' } });
  }

  const [personA, personB, relationships] = await Promise.all([
    Person.findById(personAId).lean(),
    Person.findById(personBId).lean(),
    Relationship.find({ familyTreeId: family._id }).lean(),
  ]);

  if (!personA || !personB) {
    return res.status(404).json({ success: false, error: { code: 'PERSON_NOT_FOUND', message: 'Person not found.' } });
  }

  const relationship = calculateRelationship(personA as any, personB as any, relationships as any);

  return res.json({ success: true, data: { relationship } });
});

export default router;
