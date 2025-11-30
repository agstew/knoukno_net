import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo user and sample questions...');

  const demoEmail = 'demo@localhost';
  const demoPassword = 'password123';
  const hashed = await bcrypt.hash(demoPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { name: 'Demo User', password: hashed, role: 'ADMIN' },
    create: { email: demoEmail, name: 'Demo User', password: hashed, role: 'ADMIN' },
  });

  console.log('Upserted user:', user.email);

  const questions = [
    'Explain the difference between == and === in JavaScript.',
    'Describe the event loop in Node.js.',
    'What is a closure and when would you use one?',
    'How do Promises differ from callbacks?',
    'Explain REST vs GraphQL.'
  ];

  for (const text of questions) {
    const exists = await prisma.question.findFirst({ where: { text } });
    if (!exists) {
      const q = await prisma.question.create({ data: { text } });
      console.log('Created question:', q.id);
    } else {
      console.log('Question already exists:', exists.id);
    }
  }

  console.log('Seeding complete. Demo credentials: email=', demoEmail, ' password=', demoPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
