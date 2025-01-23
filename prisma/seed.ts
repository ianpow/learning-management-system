// /prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'admin' } }),
    prisma.role.create({ data: { name: 'manager' } }),
    prisma.role.create({ data: { name: 'user' } })
  ]);

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'HR' } }),
    prisma.department.create({ data: { name: 'IT' } }),
    prisma.department.create({ data: { name: 'Sales' } })
  ]);

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({ data: { name: 'London' } }),
    prisma.location.create({ data: { name: 'New York' } }),
    prisma.location.create({ data: { name: 'Singapore' } })
  ]);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'ianpow@hotmail.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role_id: roles[0].id, // admin role
      department_id: departments[0].id,
      location_id: locations[0].id
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });