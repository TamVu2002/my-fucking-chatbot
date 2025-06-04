'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Download, Share2, Copy } from 'lucide-react';
import { Button } from './button';

interface QuickActionsProps {
  onRegenerate: () => void;
  onExport: () => void;
  onShare: () => void;
  onCopy: () => void;
  disabled?: boolean;
}

const QuickActions = ({ 
  onRegenerate, 
  onExport, 
  onShare, 
  onCopy, 
  disabled = false 
}: QuickActionsProps) => {
  const actions = [
    {
      icon: RotateCcw,
      label: 'Regenerate',
      onClick: onRegenerate,
      color: 'text-blue-500',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-950'
    },
    {
      icon: Download,
      label: 'Export',
      onClick: onExport,
      color: 'text-green-500',
      hoverColor: 'hover:bg-green-50 dark:hover:bg-green-950'
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: onShare,
      color: 'text-purple-500',
      hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-950'
    },
    {
      icon: Copy,
      label: 'Copy All',
      onClick: onCopy,
      color: 'text-orange-500',
      hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-950'
    }
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 sm:gap-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-x-auto"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            disabled={disabled}
            className={`
              flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 
              ${action.color} ${action.hoverColor}
              transition-all duration-200 min-h-[44px] touch-manipulation
              text-xs sm:text-sm whitespace-nowrap
            `}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: action.icon === RotateCcw ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <action.icon className="w-4 h-4 flex-shrink-0" />
            </motion.div>
            <span className="hidden sm:inline text-xs font-medium">{action.label}</span>
            <span className="sm:hidden text-xs font-medium">{action.label.charAt(0)}</span>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickActions;