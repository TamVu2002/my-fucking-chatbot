'use client';
import { Navbar, CommandPalette } from '@/components/common';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export default function AppPagesLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { theme } = useAppSettings();
  const { isOpen, setIsOpen } = useCommandPalette();
  
  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}
