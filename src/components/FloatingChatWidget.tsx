// src/components/FloatingChatWidget.tsx
'use client';

import { useEffect } from 'react';

export default function FloatingChatWidget() {
  useEffect(() => {
    // This script will load the Tawk.to widget
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68b439058e5e8d7ad6a00b8e/1j3vvtfk1'; // Replace with your Property ID
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(s1);
    };
  }, []);

  return null; // The component doesn't render any visible HTML itself
}