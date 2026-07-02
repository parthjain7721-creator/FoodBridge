'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Phone, MapPin, Building, Truck, Loader2, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'donor';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: initialRole,
    org_name: '',
    org_type: 'other',
    address: '',
    vehicle_type: 'bike',
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['donor', 'ngo', 'volunteer'].includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: 19.076, // Mock default coordinates for hackathon
          longitude: 72.8777,
          max_load_kg: formData.role === 'volunteer' ? 20 : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Redirect to sign in page
      router.push('/sign-in');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 text-white overflow-y-auto">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🌉</span>
          <span className="text-xl font-bold tracking-tight">FoodBridge</span>
        </Link>
        <div className="text-sm text-green-200">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg bg-green-950/40 backdrop-blur-xl border border-green-800/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
            <p className="text-green-300">Join FoodBridge and help bridge the gap</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-800/50 flex items-start gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-200">I want to register as a</label>
              <div className="grid grid-cols-3 gap-3">
                {['donor', 'ngo', 'volunteer'].map((roleType) => (
                  <button
                    key={roleType}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: roleType })}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.role === roleType
                        ? 'bg-green-500 text-green-950 shadow-md'
                        : 'bg-green-900/30 text-green-300 border border-green-700/50 hover:bg-green-800/50'
                    }`}
                  >
                    {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-200">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-green-500" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-200">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-green-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-200">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-green-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-200">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-green-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Conditional Fields based on Role */}
            {(formData.role === 'donor' || formData.role === 'ngo') && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-200">Organization Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="org_name"
                      required
                      value={formData.org_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                      placeholder="My Organization"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-200">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                      placeholder="123 Street, City"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.role === 'volunteer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-200">Vehicle Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-4 w-4 text-green-500" />
                  </div>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-green-900/30 border border-green-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm appearance-none text-white"
                  >
                    <option value="bike" className="bg-green-900 text-white">Bike</option>
                    <option value="car" className="bg-green-900 text-white">Car</option>
                    <option value="walk" className="bg-green-900 text-white">Walking</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-400 px-8 py-3.5 text-base font-semibold text-green-950 hover:bg-green-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
