'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Save,
  Eye,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAppSettings } from '@/contexts/AppSettingsContext';

interface CustomTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    success: string;
    warning: string;
  };
  borderRadius: string;
  fontSize: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
}

const defaultThemes: Record<string, CustomTheme> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#0070f3',
      secondary: '#666666',
      accent: '#ff6b35',
      background: '#ffffff',
      foreground: '#000000',
      muted: '#f5f5f5',
      border: '#e5e5e5',
      destructive: '#dc2626',
      success: '#16a34a',
      warning: '#ca8a04'
    },
    borderRadius: '8px',
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#9ca3af',
      accent: '#f59e0b',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      border: '#334155',
      destructive: '#ef4444',
      success: '#22c55e',
      warning: '#eab308'
    },
    borderRadius: '8px',
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      primary: '#00ff9f',
      secondary: '#ff007f',
      accent: '#ffff00',
      background: '#0a0a0a',
      foreground: '#00ff9f',
      muted: '#1a1a2e',
      border: '#16213e',
      destructive: '#ff0055',
      success: '#00ff9f',
      warning: '#ffff00'
    },
    borderRadius: '4px',
    fontSize: {
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '19px'
    }
  },
  nature: {
    name: 'Nature',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#f59e0b',
      background: '#fefefe',
      foreground: '#1f2937',
      muted: '#f0fdf4',
      border: '#dcfce7',
      destructive: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    },
    borderRadius: '12px',
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    }
  }
};

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { currentTheme, setCurrentTheme } = useAppSettings();
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultThemes.light);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved custom themes
    const savedThemes = localStorage.getItem('customThemes');
    if (savedThemes) {
      try {
        const parsed = JSON.parse(savedThemes);
        Object.assign(defaultThemes, parsed);
      } catch (error) {
        console.error('Failed to load custom themes:', error);
      }
    }
  }, []);

  const applyTheme = (theme: CustomTheme) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    root.style.setProperty('--radius', theme.borderRadius);
    Object.entries(theme.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
  };

  const handleThemeSelect = (themeKey: string) => {
    setSelectedTheme(themeKey);
    setCustomTheme(defaultThemes[themeKey]);
    if (previewMode) {
      applyTheme(defaultThemes[themeKey]);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    };
    setCustomTheme(updatedTheme);
    if (previewMode) {
      applyTheme(updatedTheme);
    }
  };

  const saveCustomTheme = () => {
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
    const themeName = `custom_${Date.now()}`;
    customThemes[themeName] = {
      ...customTheme,
      name: `Custom ${Object.keys(customThemes).length + 1}`
    };
    localStorage.setItem('customThemes', JSON.stringify(customThemes));
    
    // Apply the theme
    applyTheme(customTheme);
    setCurrentTheme(selectedTheme as any);
    onClose();
  };

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(customTheme, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setCustomTheme(imported);
        if (previewMode) {
          applyTheme(imported);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
      }
    };
    reader.readAsText(file);
  };

  const resetTheme = () => {
    setCustomTheme(defaultThemes[selectedTheme]);
    if (previewMode) {
      applyTheme(defaultThemes[selectedTheme]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Advanced Theme Customizer</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? 'Disable' : 'Enable'} Preview</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar - Theme Selection */}
            <div className="w-64 border-r border-border p-4 overflow-y-auto">
              <h3 className="font-medium mb-4">Preset Themes</h3>
              <div className="space-y-2">
                {Object.entries(defaultThemes).map(([key, theme]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleThemeSelect(key)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTheme === key 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <span className="font-medium">{theme.name}</span>
                    </div>
                    <div className="flex mt-2 space-x-1">
                      {['primary', 'secondary', 'accent'].map(color => (
                        <div
                          key={color}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.colors[color as keyof typeof theme.colors] }}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Import/Export */}
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTheme}
                  className="w-full flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Theme</span>
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTheme}
                    className="hidden"
                    id="theme-import"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('theme-import')?.click()}
                    className="w-full flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Theme</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content - Color Customization */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Color Palette */}
                <div>
                  <h3 className="font-medium mb-4">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(customTheme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium capitalize">{key}</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-12 h-10 rounded border border-border cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="flex-1 font-mono text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <h3 className="font-medium mb-4">Border Radius</h3>
                  <div className="flex items-center space-x-4">
                    <Input
                      value={customTheme.borderRadius}
                      onChange={(e) => setCustomTheme(prev => ({ 
                        ...prev, 
                        borderRadius: e.target.value 
                      }))}
                      className="w-32"
                      placeholder="8px"
                    />
                    <div 
                      className="w-16 h-16 bg-primary"
                      style={{ borderRadius: customTheme.borderRadius }}
                    />
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <h3 className="font-medium mb-4">Typography</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(customTheme.fontSize).map(([size, value]) => (
                      <div key={size} className="space-y-2">
                        <label className="text-sm font-medium">{size.toUpperCase()}</label>
                        <Input
                          value={value}
                          onChange={(e) => setCustomTheme(prev => ({
                            ...prev,
                            fontSize: { ...prev.fontSize, [size]: e.target.value }
                          }))}
                          className="font-mono text-sm"
                          placeholder="16px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              onClick={resetTheme}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Default</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveCustomTheme} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Apply Theme</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
