import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { FamilyTree } from '../models/FamilyTree';
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';
import { LifeEvent } from '../models/LifeEvent';

export async function seedData(): Promise<void> {
  const userExists = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (!userExists) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await User.create({ email: env.adminEmail.toLowerCase(), passwordHash });
    console.log('Seeded default admin user.');
  }

  const familyCount = await FamilyTree.countDocuments();
  if (familyCount === 0) {
    const smith = await FamilyTree.create({ name: 'Smith Family', slug: 'smith-family', privacy: 'PUBLIC' });
    const johnson = await FamilyTree.create({ name: 'Johnson Family', slug: 'johnson-family', privacy: 'PUBLIC' });

    const robert = await Person.create({ familyTreeId: smith._id, firstName: 'Robert', lastName: 'Smith', displayName: 'Robert Smith', gender: 'MALE', isLiving: false, dateOfBirth: new Date('1950-01-05'), dateOfDeath: new Date('2020-12-15') });
    const mary = await Person.create({ familyTreeId: smith._id, firstName: 'Mary', lastName: 'Smith', displayName: 'Mary Smith', gender: 'FEMALE', isLiving: false, dateOfBirth: new Date('1952-04-10'), dateOfDeath: new Date('2023-09-12') });
    const john = await Person.create({ familyTreeId: smith._id, firstName: 'John', lastName: 'Smith', displayName: 'John Smith', gender: 'MALE', isLiving: true, dateOfBirth: new Date('1978-08-20') });
    const sarah = await Person.create({ familyTreeId: smith._id, firstName: 'Sarah', lastName: 'Smith', displayName: 'Sarah Smith', gender: 'FEMALE', isLiving: true, dateOfBirth: new Date('1980-03-15') });
    const david = await Person.create({ familyTreeId: smith._id, firstName: 'David', lastName: 'Smith', displayName: 'David Smith', gender: 'MALE', isLiving: true, dateOfBirth: new Date('2001-06-14') });
    const emma = await Person.create({ familyTreeId: smith._id, firstName: 'Emma', lastName: 'Smith', displayName: 'Emma Smith', gender: 'FEMALE', isLiving: true, dateOfBirth: new Date('2005-09-30') });

    const jones = await Person.create({ familyTreeId: johnson._id, firstName: 'Evelyn', lastName: 'Johnson', displayName: 'Evelyn Johnson', gender: 'FEMALE', isLiving: true, dateOfBirth: new Date('1981-02-07') });
    const michael = await Person.create({ familyTreeId: johnson._id, firstName: 'Michael', lastName: 'Johnson', displayName: 'Michael Johnson', gender: 'MALE', isLiving: true, dateOfBirth: new Date('1978-12-23') });

    await Relationship.create([
      { familyTreeId: smith._id, fromPersonId: robert._id, toPersonId: john._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: mary._id, toPersonId: john._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: robert._id, toPersonId: sarah._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: mary._id, toPersonId: sarah._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: john._id, toPersonId: david._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: john._id, toPersonId: emma._id, type: 'PARENT_CHILD' },
      { familyTreeId: smith._id, fromPersonId: john._id, toPersonId: sarah._id, type: 'SPOUSE' },
      { familyTreeId: smith._id, fromPersonId: sarah._id, toPersonId: john._id, type: 'SPOUSE' },
      { familyTreeId: johnson._id, fromPersonId: michael._id, toPersonId: jones._id, type: 'SPOUSE' },
      { familyTreeId: johnson._id, fromPersonId: jones._id, toPersonId: michael._id, type: 'SPOUSE' },
    ]);

    await LifeEvent.create([
      { familyTreeId: smith._id, personId: robert._id, type: 'BIRTH', title: 'Robert Smith was born', eventDate: new Date('1950-01-05') },
      { familyTreeId: smith._id, personId: john._id, type: 'BIRTH', title: 'John Smith was born', eventDate: new Date('1978-08-20') },
      { familyTreeId: smith._id, personId: david._id, type: 'BIRTH', title: 'David Smith was born', eventDate: new Date('2001-06-14') },
      { familyTreeId: smith._id, personId: john._id, type: 'MARRIAGE', title: 'John married Sarah', eventDate: new Date('2005-05-10') },
      { familyTreeId: smith._id, personId: robert._id, type: 'DEATH', title: 'Robert Smith passed away', eventDate: new Date('2020-12-15') },
    ]);

    console.log('Seeded sample families.');
  }
}

async function seed(): Promise<void> {
  await connectDb();
  await seedData();
  process.exit(0);
}

if (require.main === module) {
  seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}
