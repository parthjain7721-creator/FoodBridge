const API_BASE = 'http://localhost:4000/api/v1';

/**
 * Login an existing user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, refresh_token: string, user: object}>}
 */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}

/**
 * Register a new user with role-specific details
 * @param {object} payload - { email, password, full_name, role, ...roleFields }
 * @returns {Promise<{user: object}>}
 */
export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}
