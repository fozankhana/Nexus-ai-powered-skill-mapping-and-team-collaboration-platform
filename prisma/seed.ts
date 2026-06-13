import { config } from "dotenv";
config(); // load .env before anything else

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function createClient() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://postgres:password@localhost:5432/nexus",
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createClient();

const skills = [
  // Frontend
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "CSS / Tailwind", category: "Frontend" },
  { name: "GraphQL", category: "Frontend" },
  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "Go", category: "Backend" },
  { name: "Rust", category: "Backend" },
  { name: "Java", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "Redis", category: "Backend" },
  { name: "REST API Design", category: "Backend" },
  // DevOps
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "AWS", category: "DevOps" },
  { name: "GCP", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Terraform", category: "DevOps" },
  // Data Science
  { name: "Python (ML)", category: "Data Science" },
  { name: "PyTorch", category: "Data Science" },
  { name: "TensorFlow", category: "Data Science" },
  { name: "SQL Analytics", category: "Data Science" },
  { name: "Data Visualization", category: "Data Science" },
  // Design
  { name: "Figma", category: "Design" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Design Systems", category: "Design" },
  // Mobile
  { name: "React Native", category: "Mobile" },
  { name: "Swift / iOS", category: "Mobile" },
  { name: "Kotlin / Android", category: "Mobile" },
  // Security
  { name: "Application Security", category: "Security" },
  { name: "Penetration Testing", category: "Security" },
  // Management
  { name: "Project Management", category: "Management" },
  { name: "Agile / Scrum", category: "Management" },
  { name: "Technical Writing", category: "Management" },
];

async function main() {
  console.log("Seeding skills...");
  for (const skill of skills) {
    const slug = skill.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    await prisma.skill.upsert({
      where: { slug },
      update: {},
      create: {
        name: skill.name,
        slug,
        category: skill.category,
      },
    });
  }
  console.log(`Seeded ${skills.length} skills.`);

  // Demo admin account
  console.log("Seeding demo user...");
  const hashedPassword = await bcrypt.hash("admin", 10);
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin Demo",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      bio: "Platform demo administrator account.",
      profile: {
        create: {
          title: "Platform Administrator",
          department: "Engineering",
        },
      },
    },
  });
  console.log("Demo user created: admin@gmail.com / admin");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
