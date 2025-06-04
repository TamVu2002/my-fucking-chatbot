'use client';
import { Switch } from '@/components/ui/switch';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ModeSwitch() {
  const { currentMode, setCurrentMode } = useAppSettings();
  const [showWarning, setShowWarning] = useState(false);

  const handleModeChange = (checked: boolean) => {
    if (checked) {
      // Switching to NSFW mode - show warning
      setShowWarning(true);
    } else {
      // Switching to safe mode - no warning needed
      setCurrentMode('safe');
    }
  };

  const confirmNSFW = () => {
    setCurrentMode('nsfw');
    setShowWarning(false);
  };

  const cancelNSFW = () => {
    setShowWarning(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Safe</span>
      <Switch
        checked={currentMode === 'nsfw'}
        onCheckedChange={handleModeChange}
        className={currentMode === 'nsfw' ? 'bg-red-500' : ''}
      />
      <span className="text-sm font-medium">NSFW</span>
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">NSFW Mode Warning</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You are about to enable NSFW mode. This allows the AI to generate adult content. 
              Please ensure you are of legal age and understand the risks. Use responsibly.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={confirmNSFW}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                I Understand
              </button>
              <button
                onClick={cancelNSFW}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
