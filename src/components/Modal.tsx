// src/components/Modal.tsx
'use client';

import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Main overlay with backdrop blur
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-start pt-20 md:pt-32 px-4"
    >
      {/* Modal content container */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg"
      >
        {/* We will let child components render their own close buttons if needed */}
        {children}
      </div>
    </div>
  );
}