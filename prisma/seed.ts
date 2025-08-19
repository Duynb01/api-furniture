import { PrismaClient } from '@prisma/client'
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
  // Seed Role
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'USER' },
    ],
    skipDuplicates: true,
  })

  // Seed Category
  await prisma.category.createMany({
    data: [
      { name: 'SOFA - GHẾ THƯ GIÃN', slug: 'sofa-ghe-thu-gian' },
      { name: 'BÀN', slug: 'ban' },
      { name: 'GHẾ', slug: 'ghe' },
      { name: 'GIƯỜNG - NỆM', slug: 'giuong-name' },
      { name: 'TỦ - KỆ', slug: 'tu-ke' },
      { name: 'TRANG TRÍ', slug: 'trang-tri' },
      { name: 'NHÀ BẾP', slug: 'nha-bep' },
      { name: 'PHÒNG TẮM', slug: 'phong-tam' },
    ],
    skipDuplicates: true,
  })

  // Tìm role ADMIN
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });
  // Seed admin user (chỉ tạo nếu chưa có)
  const adminEmail = "bduy0001@gmail.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin && adminRole) {
    const hashedPassword = await bcrypt.hash("123456789vd", 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
