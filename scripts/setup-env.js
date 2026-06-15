import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(process.cwd(), '.env.example');
const target = resolve(process.cwd(), '.env.local');

if (!existsSync(source)) {
  console.error('Missing .env.example file. Please create one with your Supabase credentials.');
  process.exit(1);
}

if (existsSync(target)) {
  console.log('.env.local already exists. No changes made.');
  process.exit(0);
}

copyFileSync(source, target);
console.log('Created .env.local from .env.example. Please open .env.local and replace placeholder values with your Supabase credentials.');
