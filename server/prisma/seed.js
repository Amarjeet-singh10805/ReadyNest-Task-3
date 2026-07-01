import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  const usersData = [
    { username: "alice", email: "alice@example.com", bio: "Travel & coffee ☕" },
    { username: "bob", email: "bob@example.com", bio: "Photographer 📷" },
    { username: "carol", email: "carol@example.com", bio: "Foodie 🍜" },
  ];

  const users = [];
  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      users.push(existing);
      continue;
    }
    const user = await prisma.user.create({
      data: { ...u, password, profilePicture: "" },
    });
    users.push(user);
  }

  const [alice, bob, carol] = users;

  const existingFollow = await prisma.follow.findFirst({
    where: { followerId: alice.id, followingId: bob.id },
  });
  if (!existingFollow) {
    await prisma.follow.create({ data: { followerId: alice.id, followingId: bob.id } });
    await prisma.follow.create({ data: { followerId: alice.id, followingId: carol.id } });
    await prisma.follow.create({ data: { followerId: bob.id, followingId: alice.id } });
  }

  const existingPost = await prisma.post.findFirst({ where: { userId: bob.id } });
  if (!existingPost) {
    await prisma.post.create({
      data: {
        userId: bob.id,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        caption: "Golden hour 🌅",
      },
    });
    await prisma.post.create({
      data: {
        userId: carol.id,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        caption: "Sunday brunch 🥞",
      },
    });
  }

  console.log("Seed complete. Test login: alice@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
