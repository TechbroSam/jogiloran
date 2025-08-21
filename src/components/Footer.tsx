// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 mt-16">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex justify-center text-2xl font-bold text-gray-900 sm:justify-start">
            Axion<span className="text-orange-700">Leather</span>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500 lg:mt-0 lg:text-right">
            Copyright &copy; 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}