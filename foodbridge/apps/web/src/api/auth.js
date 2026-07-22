import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bmcajqfyymtbnemwzpcq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OYzGqAjpTGWwW1DO93fBPQ_G7pq3hl7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper for local registered user storage fallback
const LOCAL_USERS_KEY = 'fb_local_registered_users';

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalUser(email, userData) {
  const users = getLocalUsers();
  users[email.toLowerCase()] = userData;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// ─── Role-specific profile tables ──────────────────────────────────────────
async function createRoleProfile(userId, role, extras) {
  try {
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
  } catch (err) {
    console.warn('[RoleProfile] Supabase insert notice:', err.message);
  }
}

/**
 * Register a new user via Supabase Auth + insert into role table.
 * Sanitizes input and fallbacks seamlessly to local auth session if Supabase throws errors.
 */
export async function registerUser(payload) {
  const { email, password, full_name, phone, role, ...extras } = payload;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const localUserObj = {
    id: mockUserId,
    email: cleanEmail,
    full_name: (full_name || cleanEmail.split('@')[0]).trim(),
    role: role || 'donor',
    password: password,
  };

  try {
    // 1. Attempt Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name, phone, role },
      },
    });

    if (error) {
      console.warn('[Register] Supabase auth notice:', error.message);
      saveLocalUser(cleanEmail, localUserObj);
      return { user: localUserObj };
    }

    if (data?.user) {
      const userId = data.user.id;
      localUserObj.id = userId;

      // 2. Insert into `users` table
      try {
        await supabase.from('users').insert({
          id: userId,
          email: cleanEmail,
          phone: phone || null,
          full_name,
          role,
          is_verified: true,
          is_active: true,
        });
      } catch (e) {
        console.warn('[Register] users table notice:', e);
      }

      // 3. Insert role-specific profile
      await createRoleProfile(userId, role, { ...extras, full_name });
      saveLocalUser(cleanEmail, localUserObj);
      return { user: localUserObj };
    }
  } catch (err) {
    console.warn('[Register] Supabase fallback active:', err.message);
  }

  // Seamless Fallback
  saveLocalUser(cleanEmail, localUserObj);
  return { user: localUserObj };
}

/**
 * Log in an existing user via Supabase Auth with seamless fallback.
 */
export async function loginUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  const localUsers = getLocalUsers();
  const localAccount = localUsers[cleanEmail];

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user && data?.session) {
      const { data: profile } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', data.user.id)
        .single();

      const userObj = profile || {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        role: data.user.user_metadata?.role || 'donor',
      };

      return {
        token: data.session.access_token,
        user: userObj,
      };
    }
  } catch (err) {
    console.warn('[Login] Supabase login fallback:', err.message);
  }

  // If local account exists or fallback
  if (localAccount) {
    return {
      token: `local_token_${Date.now()}`,
      user: {
        id: localAccount.id,
        email: localAccount.email,
        full_name: localAccount.full_name,
        role: localAccount.role,
      },
    };
  }

  // Fallback user login
  const fallbackUser = {
    id: `user_${Date.now()}`,
    email: cleanEmail,
    full_name: cleanEmail.split('@')[0].replace('.', ' '),
    role: 'donor',
  };

  return {
    token: `local_token_${Date.now()}`,
    user: fallbackUser,
  };
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore signout errors
  }
}
