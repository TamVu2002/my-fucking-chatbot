'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Settings, History, Bot, BarChart3 } from 'lucide-react';
import ModeSwitch from './ModeSwitch';
import ThemeSwitch from './ThemeSwitch';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function Navbar() {
  const pathname = usePathname();
  const { currentMode } = useAppSettings();
  const navItems = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/models', label: 'Models', icon: Bot },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/chat" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Chatbot Playground</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/analytics' 
                ? pathname.startsWith('/analytics')
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Mode indicator */}
            {currentMode === 'nsfw' && (
              <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                NSFW Mode
              </div>
            )}
            
            <ModeSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="flex justify-around py-2">          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/analytics' 
              ? pathname.startsWith('/analytics')
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
