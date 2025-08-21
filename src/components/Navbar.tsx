// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import SearchModal from './SearchModal';
import LoginModal from './LoginModal';
import CreateAccountModal from './CreateAccountModal';
import ForgotPasswordModal from './ForgotPasswordModal'; // Import the new component
import { useSession } from 'next-auth/react';

// Define the shape of the Category prop we expect
interface Category {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
}

// The Navbar now accepts 'categories' as a prop
export default function Navbar({ categories }: { categories: Category[] }) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const [cartCount, setCartCount] = useState(0);

  // State for controlling the modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // UPDATED: Add 'forgot' to the possible views
  const [authView, setAuthView] = useState<'login' | 'create' | 'forgot'>('login');

  useEffect(() => {
    setCartCount(items.length);
  }, [items]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openAuthModal = () => {
    setAuthView('login'); // Default to login view
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="mb-8 border-b">
        <div className="flex items-center justify-between mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl">
          <Link href="/">
            <h1 className="text-2xl md:text-4xl font-bold">
              Artisan<span className="text-orange-700">Leather</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 2xl:ml-16">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products/${category.slug.current}`}
                className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-orange-700"
              >
                {category.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center">
            <div className="hidden lg:flex divide-x border-r sm:border-l">
              <button onClick={() => setIsSearchOpen(true)} className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 flex justify-center items-center text-gray-500 hover:bg-gray-100 transition duration-100"><Search /></button>
              
              {session ? (
                <Link href="/profile" className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 flex justify-center items-center text-gray-500 hover:bg-gray-100 transition duration-100">
                  <User />
                </Link>
              ) : (
                <button onClick={openAuthModal} className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 flex justify-center items-center text-gray-500 hover:bg-gray-100 transition duration-100">
                  <User />
                </button>
              )}
            </div>
            <div className="flex divide-x border-r">
              <Link href="/cart">
                <button className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 flex justify-center items-center text-gray-500 hover:bg-gray-100 transition duration-100">
                  <div className="relative">
                    <ShoppingBag />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-700 flex items-center justify-center text-white text-xs">{cartCount}</span>
                    )}
                  </div>
                </button>
              </Link>
              <button onClick={toggleMobileMenu} className="h-12 w-12 sm:h-20 sm:w-20 flex lg:hidden justify-center items-center text-gray-500 hover:bg-gray-100 transition duration-100"><Menu /></button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          // Mobile Menu JSX... (remains the same)
          <div className="lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleMobileMenu}></div>
            <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-30 p-6">
               {/* ... */}
            </div>
          </div>
        )}
      </header>

      {/* MODALS */}
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      </Modal>

      <Modal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)}>
        {authView === 'login' && (
          <LoginModal 
            onClose={() => setIsAuthOpen(false)} 
            onSwitchToCreate={() => setAuthView('create')}
            onSwitchToForgot={() => setAuthView('forgot')} // Pass the new function
          />
        )}
        {authView === 'create' && (
          <CreateAccountModal onSwitchToLogin={() => setAuthView('login')} />
        )}
        {/* UPDATED: Render the ForgotPasswordModal */}
        {authView === 'forgot' && (
          <ForgotPasswordModal onSwitchToLogin={() => setAuthView('login')} />
        )}
      </Modal>
    </>
  );
}