import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Role-specific profile tables ──────────────────────────────────────────
async function createRoleProfile(userId, role, extras) {
  if (role === 'donor') {
    await supabase.from('donors').insert({
      user_id: userId,
      org_name: extras.org_name || extras.full_name,
      org_type: extras.org_type || 'other',
      address: extras.address || '',
      latitude: 19.076,
      longitude: 72.8777,
    });
  } else if (role === 'ngo') {
    await supabase.from('ngos').insert({
      user_id: userId,
      org_name: extras.org_name || extras.full_name,
      address: extras.address || '',
      latitude: 19.076,
      longitude: 72.8777,
      storage_capacity_kg: 500,
    });
  } else if (role === 'volunteer') {
    await supabase.from('volunteers').insert({
      user_id: userId,
      vehicle_type: extras.vehicle_type || 'bike',
      max_load_kg: extras.max_load_kg || 20,
      is_available: true,
    });
  }
}

/**
 * Register a new user via Supabase Auth + insert into role table.
 * Returns { user } on success, throws on error.
 */
export async function registerUser(payload) {
  const { email, password, full_name, phone, role, ...extras } = payload;

  // 1. Create auth user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone, role },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Registration failed — no user returned.');

  const userId = data.user.id;

  // 2. Insert into `users` table
  const { error: userErr } = await supabase.from('users').insert({
    id: userId,
    email,
    phone: phone || null,
    full_name,
    role,
    is_verified: true,
    is_active: true,
  });

  if (userErr) {
    // May already exist (race condition on Supabase trigger) — non-fatal
    console.warn('[Register] users insert warning:', userErr.message);
  }

  // 3. Insert role-specific profile
  await createRoleProfile(userId, role, { ...extras, full_name });

  return { user: { id: userId, email, full_name, role } };
}

/**
 * Log in an existing user via Supabase Auth.
 * Returns { token, user } on success, throws on error.
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user || !data.session) throw new Error('Login failed — no session returned.');

  // Fetch the full profile from `users` table
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', data.user.id)
    .single();

  if (profileErr || !profile) {
    // Fallback to auth metadata if DB profile not found
    const meta = data.user.user_metadata || {};
    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: meta.full_name || data.user.email,
        role: meta.role || 'donor',
      },
    };
  }

  return {
    token: data.session.access_token,
    user: profile,
  };
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await supabase.auth.signOut();
}
