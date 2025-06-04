'use client';
import { Switch } from '@/components/ui/switch';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeSwitch() {
  const { theme, setTheme } = useAppSettings();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}
