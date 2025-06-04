'use client';
import { useState, useRef } from 'react';
import { Button } from './button';
import { Paperclip, X, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  onRemove: () => void;
  uploadedFile: { name: string; content: string } | null;
  disabled?: boolean;
}

export function FileUpload({ onFileContent, onRemove, uploadedFile, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => 
      file.type.startsWith('text/') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv')
    );
    
    if (textFile) {
      handleFileSelect(textFile);
    } else {
      alert('Please upload a text file (.txt, .md, .json, .csv)');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (uploadedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 p-2 bg-muted rounded-lg"
      >
        <FileText className="h-4 w-4" />
        <span className="text-sm truncate flex-1">{uploadedFile.name}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv,text/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        size="icon"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={disabled}
        className={`transition-colors ${
          isDragging ? 'bg-primary/10 border-primary' : ''
        }`}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
}
