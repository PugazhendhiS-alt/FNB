import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local', override: false });

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPERADMIN_EMAIL = 'superadmin@acbfood.com',
  SUPERADMIN_PASSWORD = 'Admin@1234',
  SUPERADMIN_NAME = 'Super Admin',
} = process.env;

const supabaseUrl = SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const findUserByEmail = async (email) => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) {
    throw error;
  }
  return data?.users?.find((user) => user.email === email) ?? null;
};

const ensureProfileRow = async (id, email) => {
  const profileRow = {
    id,
    email,
    name: SUPERADMIN_NAME,
    role: 'superadmin',
    assigned_cafeteria_ids: [],
    assigned_cafeteria_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from('admin_profiles').upsert(profileRow, { onConflict: 'id' });
  if (profileError) {
    throw profileError;
  }
  console.log('Super admin profile row created or updated in admin_profiles.');
};

const createOrEnsureSuperAdmin = async () => {
  const email = SUPERADMIN_EMAIL;
  const password = SUPERADMIN_PASSWORD;

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'superadmin',
        name: SUPERADMIN_NAME,
        isActive: true,
      },
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`Super admin already exists: ${email}`);
        const existingUser = await findUserByEmail(email);
        if (!existingUser?.id) {
          throw new Error('Existing super admin found, but could not resolve user id');
        }
        await ensureProfileRow(existingUser.id, email);
        process.exit(0);
      }
      throw error;
    }

    console.log('Super admin created successfully.');
    console.log(JSON.stringify(data.user, null, 2));

    if (data.user?.id) {
      await ensureProfileRow(data.user.id, email);
    }
  } catch (error) {
    console.error('Failed to create super admin:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

createOrEnsureSuperAdmin();
