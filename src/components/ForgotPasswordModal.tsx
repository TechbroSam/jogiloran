// src/components/ForgotPasswordModal.tsx
'use client';

export default function ForgotPasswordModal({ onSwitchToLogin }: { onSwitchToLogin: () => void; }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send reset email will be added here
    alert('If an account with this email exists, a password reset link has been sent.');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <button type="submit" className="w-full bg-orange-700 text-white py-3 rounded-md hover:bg-orange-800">
          Send Reset Link
        </button>
      </form>
      <div className="text-center mt-4">
        <button onClick={onSwitchToLogin} className="font-semibold text-orange-700 hover:underline text-sm">
          Back to Log In
        </button>
      </div>
    </div>
  );
}