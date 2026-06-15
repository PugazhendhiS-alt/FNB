import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify server-side API credentials are available
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Missing Supabase server-side credentials. Admin user creation will fail.');
}

const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

/**
 * API endpoint for secure admin user creation (server-side only)
 * 
 * POST /api/admin/create-user
 * 
 * Request body:
 * {
 *   email: string
 *   password: string
 *   name: string
 *   role: 'superadmin' | 'admin'
 *   assignedCafeteriaIds?: string[]
 *   assignedCafeteriaId?: string
 *   isActive?: boolean
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { user: { id, email }, profile: { ... } }
 *   error?: string
 * }
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Supabase admin client is configured
  if (!supabaseAdmin) {
    return res.status(500).json({
      error: 'Server is not configured for admin operations. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  try {
    const {
      email,
      password,
      name,
      role = 'admin',
      assignedCafeteriaIds = [],
      assignedCafeteriaId = null,
      isActive = true,
    } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, name',
      });
    }

    // Validate role
    if (!['superadmin', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be "superadmin" or "admin".',
      });
    }

    // Create auth user using service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        name,
        assignedCafeteriaIds,
        assignedCafeteriaId,
        isActive,
      },
    });

    if (authError || !authData.user?.id) {
      return res.status(400).json({
        error: authError?.message || 'Failed to create auth user',
      });
    }

    // Create profile row in admin_profiles table
    const profileRow = {
      id: authData.user.id,
      email,
      name,
      role,
      assigned_cafeteria_ids: assignedCafeteriaIds,
      assigned_cafeteria_id: assignedCafeteriaId,
      is_active: isActive,
      created_at: new Date().toISOString(),
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .upsert(profileRow, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => null);
      return res.status(400).json({
        error: profileError.message || 'Failed to create admin profile',
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    return res.status(500).json({
      error: error?.message || 'An unexpected error occurred',
    });
  }
}
