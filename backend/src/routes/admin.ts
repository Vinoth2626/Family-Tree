import { Router } from 'express';
import { z } from 'zod';
import { FamilyTree } from '../models/FamilyTree';
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';
import { LifeEvent } from '../models/LifeEvent';
import { requireAdmin } from '../middleware/auth';
import { validateRelationshipInput } from '../services/relationshipValidation';

const router = Router();

const familySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

const personSchema = z.object({
  familyTreeId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().optional().default(''),
  preferredName: z.string().optional().default(''),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).default('UNKNOWN'),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
  birthPlace: z.string().optional().default(''),
  occupation: z.string().optional().default(''),
  biography: z.string().optional().default(''),
  isLiving: z.boolean().default(true),
});

router.use(requireAdmin);

router.get('/dashboard', async (_req, res) => {
  const [families, members, relationships] = await Promise.all([
    FamilyTree.countDocuments(),
    Person.countDocuments(),
    Relationship.countDocuments(),
  ]);

  const publicFamilies = await FamilyTree.countDocuments({ privacy: 'PUBLIC' });
  const privateFamilies = await FamilyTree.countDocuments({ privacy: 'PRIVATE' });

  res.json({
    success: true,
    data: {
      totalFamilies: families,
      totalMembers: members,
      totalRelationships: relationships,
      publicFamilies: publicFamilies,
      privateFamilies: privateFamilies,
    },
  });
});

router.get('/families', async (_req, res) => {
  const families = await FamilyTree.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: families });
});

router.post('/families', async (req, res) => {
  const parsed = familySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Family name is required.' } });
  }

  const { name, description = '', privacy } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const family = await FamilyTree.create({
    name,
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    description,
    privacy,
  });

  res.status(201).json({ success: true, data: family });
});

router.get('/families/:id', async (req, res) => {
  const family = await FamilyTree.findById(req.params.id).lean();
  if (!family) {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }
  return res.json({ success: true, data: family });
});

router.put('/families/:id', async (req, res) => {
  const family = await FamilyTree.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!family) {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }
  return res.json({ success: true, data: family });
});

router.delete('/families/:id', async (req, res) => {
  const family = await FamilyTree.findById(req.params.id);
  if (!family) {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  await Person.deleteMany({ familyTreeId: family._id });
  await Relationship.deleteMany({ familyTreeId: family._id });
  await LifeEvent.deleteMany({ familyTreeId: family._id });
  await family.deleteOne();

  return res.json({ success: true, data: { deleted: true } });
});

router.get('/families/:id/members', async (req, res) => {
  const people = await Person.find({ familyTreeId: req.params.id }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: people });
});

router.post('/families/:id/members', async (req, res) => {
  const parsed = personSchema.safeParse({ ...req.body, familyTreeId: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Person input is invalid.' } });
  }

  const family = await FamilyTree.findById(req.params.id);
  if (!family) {
    return res.status(404).json({ success: false, error: { code: 'FAMILY_NOT_FOUND', message: 'Family not found.' } });
  }

  const { firstName, lastName, preferredName, gender, dateOfBirth, dateOfDeath, birthPlace, occupation, biography, isLiving } = parsed.data;
  const cleanName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const displayName = preferredName || cleanName || firstName;

  const person = await Person.create({
    familyTreeId: req.params.id,
    firstName,
    lastName,
    preferredName,
    displayName,
    gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
    birthPlace,
    occupation,
    biography,
    isLiving,
  });

  if (!family.rootPersonId) {
    family.rootPersonId = person._id;
    await family.save();
  }

  return res.status(201).json({ success: true, data: person });
});

router.put('/members/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (!person) {
    return res.status(404).json({ success: false, error: { code: 'PERSON_NOT_FOUND', message: 'Person not found.' } });
  }

  const next = {
    ...person.toObject(),
    ...req.body,
    familyTreeId: person.familyTreeId,
  };

  const updated = await Person.findByIdAndUpdate(req.params.id, next, { new: true });
  return res.json({ success: true, data: updated });
});

router.delete('/members/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (!person) {
    return res.status(404).json({ success: false, error: { code: 'PERSON_NOT_FOUND', message: 'Person not found.' } });
  }

  await Relationship.deleteMany({
    $or: [{ fromPersonId: person._id }, { toPersonId: person._id }],
  });
  await LifeEvent.deleteMany({ personId: person._id });
  await person.deleteOne();

  return res.json({ success: true, data: { deleted: true } });
});

router.get('/families/:id/relationships', async (req, res) => {
  const relationships = await Relationship.find({ familyTreeId: req.params.id }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: relationships });
});

router.post('/relationships', async (req, res) => {
  const schema = z.object({
    familyTreeId: z.string(),
    fromPersonId: z.string(),
    toPersonId: z.string(),
    type: z.enum(['PARENT_CHILD', 'SPOUSE']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Relationship input is invalid.' } });
  }

  try {
    await validateRelationshipInput(parsed.data);
    const relationship = await Relationship.create(parsed.data);
    return res.status(201).json({ success: true, data: relationship });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create relationship.';
    return res.status(400).json({ success: false, error: { code: 'RELATIONSHIP_ERROR', message } });
  }
});

router.delete('/relationships/:id', async (req, res) => {
  const relationship = await Relationship.findById(req.params.id);
  if (!relationship) {
    return res.status(404).json({ success: false, error: { code: 'RELATIONSHIP_NOT_FOUND', message: 'Relationship not found.' } });
  }

  await relationship.deleteOne();
  return res.json({ success: true, data: { deleted: true } });
});

router.post('/events', async (req, res) => {
  const schema = z.object({
    familyTreeId: z.string(),
    personId: z.string(),
    type: z.enum(['BIRTH', 'MARRIAGE', 'DIVORCE', 'DEATH', 'ADOPTION', 'OTHER']),
    title: z.string().min(1),
    description: z.string().optional().default(''),
    eventDate: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Event input is invalid.' } });
  }

  const event = await LifeEvent.create({
    ...parsed.data,
    eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
  });

  return res.status(201).json({ success: true, data: event });
});

export default router;
