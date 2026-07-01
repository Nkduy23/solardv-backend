import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@solardv.vn' },
    update: {},
    create: {
      email: 'admin@solardv.vn',
      password: hash,
      fullName: 'Quản trị viên SolarDV',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed done — admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
