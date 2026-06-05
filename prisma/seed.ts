import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminPw = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@skillbid.com" },
    update: {},
    create: { email: "admin@skillbid.com", name: "Admin", password: adminPw, role: "ADMIN", verified: true },
  });

  const clientPw = await bcrypt.hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com", name: "Sarah Johnson", password: clientPw, role: "CLIENT",
      location: "New York, NY", bio: "Homeowner looking for reliable workers.", verified: true,
    },
  });

  const workerPw = await bcrypt.hash("worker123", 12);
  const worker1 = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      email: "mike@example.com", name: "Mike Rodriguez", password: workerPw, role: "WORKER",
      location: "New York, NY", bio: "10 years of home repair experience. Licensed plumber and handyman.",
      rating: 4.8, reviewCount: 47, jobsCompleted: 52, verified: true,
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { email: "anna@example.com" },
    update: {},
    create: {
      email: "anna@example.com", name: "Anna Chen", password: workerPw, role: "WORKER",
      location: "Brooklyn, NY", bio: "Professional cleaner and organizer. 5-star rated!",
      rating: 4.9, reviewCount: 83, jobsCompleted: 91, verified: true,
    },
  });

  const task1 = await prisma.task.create({
    data: {
      title: "Fix leaking kitchen faucet",
      description: "My kitchen faucet has been dripping for weeks. Need someone to fix it ASAP. I have the replacement cartridge already.",
      category: "PLUMBING", location: "Manhattan, NY", budget: 120,
      status: "OPEN", photos: "[]", clientId: client.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Deep clean 2-bedroom apartment",
      description: "Moving out of my apartment and need a thorough deep clean before the final inspection. 2BR, 1BA, approximately 900 sq ft.",
      category: "CLEANING", location: "Brooklyn, NY", budget: 200,
      status: "OPEN", photos: "[]", clientId: client.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Assemble IKEA furniture - 4 pieces",
      description: "Need help assembling 4 pieces of IKEA furniture: 1 wardrobe, 1 desk, 2 bookshelves.",
      category: "FURNITURE_ASSEMBLY", location: "Queens, NY", budget: 150,
      status: "OPEN", photos: "[]", clientId: client.id,
    },
  });

  await prisma.bid.createMany({
    data: [
      { taskId: task1.id, workerId: worker1.id, amount: 95, message: "I can fix this today! Licensed plumber with all tools ready.", estimatedDuration: "1-2 hours" },
      { taskId: task1.id, workerId: worker2.id, amount: 110, message: "Available this weekend. Will inspect and fix properly.", estimatedDuration: "2 hours" },
      { taskId: task2.id, workerId: worker2.id, amount: 180, message: "Professional deep clean guaranteed. I use eco-friendly products.", estimatedDuration: "4-5 hours" },
      { taskId: task3.id, workerId: worker1.id, amount: 130, message: "Assembled 100+ IKEA pieces. Fast and precise.", estimatedDuration: "3-4 hours" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("  Admin:    admin@skillbid.com / admin123");
  console.log("  Client:   client@example.com / client123");
  console.log("  Worker 1: mike@example.com   / worker123");
  console.log("  Worker 2: anna@example.com   / worker123");
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => process.exit(0)));
