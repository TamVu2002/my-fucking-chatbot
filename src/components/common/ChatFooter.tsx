import { motion } from 'framer-motion';

interface ChatFooterProps {
  modelName?: string;
  tokenCount?: number;
}

export function ChatFooter({ modelName, tokenCount }: ChatFooterProps) {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t pt-2 pb-2 text-center text-xs text-muted-foreground"
    >
      <div className="flex justify-center items-center space-x-4">
        {modelName && (
          <span>Model: <span className="font-medium">{modelName}</span></span>
        )}
        {tokenCount && (
          <span>~{tokenCount} tokens</span>
        )}
        <span>Powered by OpenRouter</span>
      </div>
    </motion.footer>
  );
}
