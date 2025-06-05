'use client';
import { useAppSettings, Mode } from '@/contexts/AppSettingsContext';
import { AlertTriangle, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ModeSwitch() {
  const { currentMode, setCurrentMode } = useAppSettings();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<Mode>('safe');

  const handleModeChange = (mode: Mode) => {
    if (mode === 'nsfw' || mode === 'jailbreak') {
      // Show warning for unsafe modes
      setPendingMode(mode);
      setShowWarning(true);
    } else {
      // Safe mode - no warning needed
      setCurrentMode('safe');
    }
  };

  const confirmModeChange = () => {
    setCurrentMode(pendingMode);
    setShowWarning(false);
  };

  const cancelModeChange = () => {
    setShowWarning(false);
  };

  const getModeColor = (mode: Mode) => {
    switch(mode) {
      case 'safe': return 'bg-green-500';
      case 'nsfw': return 'bg-red-500';
      case 'jailbreak': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeIcon = (mode: Mode) => {
    switch(mode) {
      case 'safe': return <Shield className="h-4 w-4" />;
      case 'nsfw': return <AlertTriangle className="h-4 w-4" />;
      case 'jailbreak': return <Zap className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex bg-muted rounded-lg p-1">
        {(['safe', 'nsfw', 'jailbreak'] as Mode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1
              ${currentMode === mode 
                ? `${getModeColor(mode)} text-white shadow-md` 
                : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }
            `}
          >
            {getModeIcon(mode)}
            <span className="capitalize">{mode}</span>
          </button>
        ))}
      </div>
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md mx-4 border">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">
                {pendingMode === 'nsfw' ? 'NSFW Mode Warning' : 'Jailbreak Mode Warning'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {pendingMode === 'nsfw' 
                ? 'You are about to enable NSFW mode. This allows the AI to generate adult content. Please ensure you are of legal age and understand the risks. Use responsibly.'
                : 'You are about to enable Jailbreak mode. This mode uses advanced techniques to bypass AI safety filters. This is for educational and research purposes only. Use with extreme caution and responsibility.'
              }
            </p>
            <div className="flex space-x-2">
              <button
                onClick={confirmModeChange}
                className={`px-4 py-2 text-white rounded hover:opacity-90 transition-colors ${
                  pendingMode === 'nsfw' ? 'bg-red-500' : 'bg-purple-500'
                }`}
              >
                I Understand
              </button>
              <button
                onClick={cancelModeChange}
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
