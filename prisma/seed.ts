import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean up
  await prisma.passwordTag.deleteMany();
  await prisma.passwordHistory.deleteMany();
  await prisma.sharedPassword.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.password.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
      masterPasswordHash: 'mock-master-hash-alice',
      encryptionSalt: 'mock-salt-alice',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
      masterPasswordHash: 'mock-master-hash-bob',
      encryptionSalt: 'mock-salt-bob',
    },
  });

  // Folders for Alice
  const socialFolder = await prisma.folder.create({
    data: { userId: alice.id, name: 'Social Media' },
  });

  const workFolder = await prisma.folder.create({
    data: { userId: alice.id, name: 'Work' },
  });

  const devFolder = await prisma.folder.create({
    data: { userId: alice.id, name: 'Dev Tools', parentId: workFolder.id },
  });

  // Folders for Bob
  await prisma.folder.create({
    data: { userId: bob.id, name: 'Personal' },
  });

  // Tags for Alice
  const tagImportant = await prisma.tag.create({
    data: { userId: alice.id, name: 'important', color: '#e74c3c' },
  });

  const tagWork = await prisma.tag.create({
    data: { userId: alice.id, name: 'work', color: '#3498db' },
  });

  const tagSocial = await prisma.tag.create({
    data: { userId: alice.id, name: 'social', color: '#2ecc71' },
  });

  // Tags for Bob
  await prisma.tag.create({
    data: { userId: bob.id, name: 'personal', color: '#9b59b6' },
  });

  // Passwords for Alice
  const gmail = await prisma.password.create({
    data: {
      userId: alice.id,
      title: 'Gmail',
      url: 'https://mail.google.com',
      username: 'alice@gmail.com',
      encryptedPassword: 'enc:mock-encrypted-gmail-password',
      encryptedNotes: 'enc:main email account',
      folderId: workFolder.id,
    },
  });

  const twitter = await prisma.password.create({
    data: {
      userId: alice.id,
      title: 'Twitter / X',
      url: 'https://x.com',
      username: 'alice_dev',
      encryptedPassword: 'enc:mock-encrypted-twitter-password',
      folderId: socialFolder.id,
    },
  });

  const github = await prisma.password.create({
    data: {
      userId: alice.id,
      title: 'GitHub',
      url: 'https://github.com',
      username: 'alice-dev',
      encryptedPassword: 'enc:mock-encrypted-github-password',
      encryptedNotes: 'enc:use SSH key for git operations',
      folderId: devFolder.id,
    },
  });

  await prisma.password.create({
    data: {
      userId: alice.id,
      title: 'AWS Console',
      url: 'https://console.aws.amazon.com',
      username: 'alice@company.com',
      encryptedPassword: 'enc:mock-encrypted-aws-password',
      folderId: devFolder.id,
    },
  });

  // Passwords for Bob
  await prisma.password.create({
    data: {
      userId: bob.id,
      title: 'Netflix',
      url: 'https://netflix.com',
      username: 'bob@example.com',
      encryptedPassword: 'enc:mock-encrypted-netflix-password',
    },
  });

  // Password-Tag relations
  await prisma.passwordTag.createMany({
    data: [
      { passwordId: gmail.id, tagId: tagWork.id },
      { passwordId: gmail.id, tagId: tagImportant.id },
      { passwordId: twitter.id, tagId: tagSocial.id },
      { passwordId: github.id, tagId: tagWork.id },
      { passwordId: github.id, tagId: tagImportant.id },
    ],
  });

  // Password history (simulated previous password changes)
  await prisma.passwordHistory.createMany({
    data: [
      {
        passwordId: gmail.id,
        encryptedPassword: 'enc:old-gmail-password-v1',
      },
      {
        passwordId: gmail.id,
        encryptedPassword: 'enc:old-gmail-password-v2',
      },
      {
        passwordId: github.id,
        encryptedPassword: 'enc:old-github-password-v1',
      },
    ],
  });

  // Shared password (Alice shares GitHub with Bob)
  await prisma.sharedPassword.create({
    data: {
      passwordId: github.id,
      sharedByUserId: alice.id,
      sharedWithUserId: bob.id,
      encryptedKey: 'enc:shared-key-for-bob',
    },
  });

  console.log('Seed completed:');
  console.log(`  Users: alice@example.com, bob@example.com (password: password123)`);
  console.log(`  Folders: ${3} (Alice) + ${1} (Bob)`);
  console.log(`  Tags: ${3} (Alice) + ${1} (Bob)`);
  console.log(`  Passwords: ${4} (Alice) + ${1} (Bob)`);
  console.log(`  Password history: 3 entries`);
  console.log(`  Shared passwords: 1`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
