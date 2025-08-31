// src/components/CreateAccountModal.tsx
'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CreateAccountModalProps {
  onSwitchToLogin: () => void;
}

export default function CreateAccountModal({ onSwitchToLogin }: CreateAccountModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(data.message);
      // Optionally, switch to login view after a delay
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" type="text" placeholder="First Name" required onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          <input name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*])(?!.*(.)\1\1)(?!.*(?:name|email)).{8,}$"
            title="Minimum 8 characters, one capital letter, one number, one special character."
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <div className="flex items-start">
          <input id="terms" type="checkbox" required className="h-4 w-4 text-orange-600 border-gray-300 rounded" />
          <label htmlFor="terms" className="ml-2 block text-xs text-gray-600">
            By checking the box, you agree to the{' '}
            <a href="/terms" target="_blank" className="underline">Terms & Conditions</a> and{' '}
            <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>.
          </label>
        </div>
        <button type="submit" className="w-full bg-orange-700 text-white py-3 rounded-md hover:bg-orange-800">
          Create Account
        </button>
      </form>
      <div className="text-center mt-4">
        <p className="text-sm">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold text-orange-700 hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}