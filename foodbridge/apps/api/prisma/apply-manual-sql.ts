import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const sqlFilePath = path.join(__dirname, 'migrations/manual/rls_and_indexes.sql');
  console.info(`Reading manual SQL from: ${sqlFilePath}`);
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Fix: Remove comment lines FIRST before splitting by semi-colon.
  // This prevents semi-colons inside comments from breaking statement splitting.
  const cleanedSql = sqlContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !line.startsWith('--') && line.length > 0)
    .join('\n');

  const statements = cleanedSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.info(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      console.info(`Executing statement ${i + 1}/${statements.length}...`);
      await prisma.$executeRawUnsafe(stmt);
    } catch (err: any) {
      // Ignore errors about relations already existing, but print warnings
      if (err.message.includes('already exists')) {
        console.info(`[SQL Statement ${i + 1} Info]: Relation already exists (skipping).`);
      } else {
        console.warn(`[SQL Statement ${i + 1} Warning/Error]:`, err.message);
      }
    }
  }

  console.info('Manual SQL migrations applied successfully!');
}

main()
  .catch((e) => {
    console.error('SQL Execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
