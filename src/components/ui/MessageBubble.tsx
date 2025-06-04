'use client';

import { motion } from 'framer-motion';
import { Copy, User, Bot } from 'lucide-react';
import { Button } from './button';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for proper math rendering
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: 'language-',
    highlight(code, lang) {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      }
      return code;
    }
  }),
  {
    breaks: true,
    gfm: true
  }
);

// Function to render LaTeX math expressions with enhanced styling
function renderMath(content: string): string {
  // Configure KaTeX options for better rendering
  const katexOptions = {
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    macros: {
      "\\f": "#1f(#2)",
      "\\vec": "\\mathbf{#1}",
      "\\mat": "\\mathbf{#1}",
      "\\norm": "\\left\\|#1\\right\\|",
      "\\set": "\\left\\{#1\\right\\}",
      "\\abs": "\\left|#1\\right|",
      "\\R": "\\mathbb{R}",
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\Q": "\\mathbb{Q}",
      "\\C": "\\mathbb{C}"
    },
    trust: true,
    strict: false
  };

  // Handle block math ($$...$$) with enhanced display options
  content = content.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { 
        ...katexOptions, 
        displayMode: true,
        fleqn: false // Center equations
      });
    } catch {
      return match; // Return original if rendering fails
    }
  });
  
  // Handle inline math ($...$) with optimized inline settings
  content = content.replace(/\$([^$\n]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        ...katexOptions,
        displayMode: false
      });
    } catch {
      return match; // Return original if rendering fails
    }
  });
  
  return content;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  isLoading?: boolean;
}

const MessageBubble = ({ message, onCopy, isLoading }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [timeString, setTimeString] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [renderedContent, setRenderedContent] = useState<string>('');
  useEffect(() => {
    setMounted(true);
    setTimeString(message.timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, [message.timestamp]);  // Process markdown content with proper code highlighting
  useEffect(() => {
    if (message.role === 'assistant' && message.content) {
      try {        // Process code blocks to add line numbers
        const processedContent = message.content.replace(
          /```(\w+)?\n([\s\S]+?)```/g, 
          function(match: string, language: string, code: string) {
            const lang = language || 'plaintext';
            const lines = code.trim().split('\n');
            const lineNumbers = lines.map((line: string) => 
              `<span class="hljs-line">${line}</span>`
            ).join('\n');
            return `<pre class="language-${lang}"><code class="language-${lang} hljs-line-numbers">${lineNumbers}</code></pre>`;
          }
        );
        
        // Render markdown first
        const result = marked(processedContent);
        if (typeof result === 'string') {
          // Then process math expressions
          const mathRendered = renderMath(result);
          setRenderedContent(mathRendered);
        } else {
          result.then(html => {
            const mathRendered = renderMath(html);
            setRenderedContent(mathRendered);
          });
        }
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setRenderedContent(message.content);
      }
    }
  }, [message.content, message.role]);
  // Animation variants
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const copyButtonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.1 }
  };

  if (isSystem) {
    return (
      <motion.div
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex justify-center my-4"
      >
        <div className="chat-message chat-message-system">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex items-end gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Avatar for assistant messages */}
      {!isUser && (
        <motion.div 
          className="chat-avatar chat-avatar-assistant"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
        >
          <Bot size={16} />
        </motion.div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <motion.div
          className={`chat-message group relative ${
            isUser ? 'chat-message-user' : 'chat-message-assistant'
          }`}
          whileHover={{ 
            boxShadow: isUser 
              ? "0 8px 25px rgba(59, 130, 246, 0.3)" 
              : "0 8px 25px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.2 }}
        >          {/* Message content */}          <div className="relative">
            {message.role === 'assistant' && message.content ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-headings:mb-3 prose-headings:mt-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:rounded prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800 prose-pre:p-2 prose-pre:rounded-md prose-pre:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            ) : (
              <p style={{ 
                whiteSpace: "pre-wrap", 
                margin: 0, 
                lineHeight: "1.5", 
                wordBreak: "keep-all", 
                overflowWrap: "break-word"
              }}>
                {message.content}
              </p>
            )}

            {/* Typing indicator for empty assistant messages */}
            {message.role === 'assistant' && !message.content && isLoading && (
              <motion.div 
                className="flex items-center space-x-1 py-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-current rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-current rounded-full typing-dot" />
                </div>
                <span className="text-xs opacity-70 ml-2">AI is thinking...</span>
              </motion.div>
            )}

            {/* Copy button */}
            {message.content && (
              <motion.div
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                variants={copyButtonVariants}
                initial="initial"
                whileHover="hover"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onCopy(message.content)}
                  className="h-6 w-6 bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-background"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>        {/* Timestamp */}
        <motion.div 
          className={`message-time px-1 ${isUser ? 'text-right' : 'text-left'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {mounted ? timeString : '--:--'}
        </motion.div>
      </div>

      {/* Avatar for user messages */}
      {isUser && (
        <motion.div 
          className="chat-avatar chat-avatar-user"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
        >
          <User size={16} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
