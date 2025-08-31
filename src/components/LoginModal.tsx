// src/components/LoginModal.tsx
'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// UPDATED: Added onSwitchToForgot to the props
interface LoginModalProps {
  onSwitchToCreate: () => void;
  onSwitchToForgot: () => void;
  onClose: () => void;
}

export default function LoginModal({ onSwitchToCreate, onSwitchToForgot, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      onClose();
      router.push('/profile');
      router.refresh();
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm">
                {/* UPDATED: Changed from a link to a button */}
                <button type="button" onClick={onSwitchToForgot} className="font-medium text-orange-700 hover:underline">
                  Forgot your password?
                </button>
            </div>
        </div>
        <button type="submit" className="w-full bg-orange-700 text-white py-3 rounded-md hover:bg-orange-800 transition-colors">
          Log In
        </button>
      </form>
      <div className="text-center mt-4">
        <p className="text-sm">
          Don&apos;t have an account?{' '}
          <button onClick={onSwitchToCreate} className="font-semibold text-orange-700 hover:underline">
            Create one
          </button>
        </p>
      </div>
      <p className="mt-6 text-xs text-gray-500 text-center">
        By logging into my account, I agree to Axion Leather’s{' '}
        <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms & Conditions</a> and{' '}
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>.
      </p>
    </div>
  );
}