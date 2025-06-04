'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Prompt {
  id: string;
  name: string;
  content: string;
  type: 'safe' | 'nsfw' | 'jailbreak';
  createdAt: Date;
}

interface NSFWProfile extends Prompt {
  suggestedModel?: string;
  suggestedTemperature?: number;
  suggestedTopP?: number;
}

export default function SettingsPage() {
  const [safePrompts, setSafePrompts] = useState<Prompt[]>([]);
  const [nsfwProfiles, setNSFWProfiles] = useState<NSFWProfile[]>([]);
  const [jailbreakPrompts, setJailbreakPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState<'safe' | 'nsfw' | 'jailbreak'>('safe');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | NSFWProfile | null>(null);

  // Load prompts from localStorage
  useEffect(() => {
    const savedSafePrompts = localStorage.getItem('safePrompts');
    const savedNSFWProfiles = localStorage.getItem('nsfwProfiles');
    const savedJailbreakPrompts = localStorage.getItem('jailbreakPrompts');

    if (savedSafePrompts) {
      setSafePrompts(JSON.parse(savedSafePrompts));
    }
    if (savedNSFWProfiles) {
      setNSFWProfiles(JSON.parse(savedNSFWProfiles));
    }
    if (savedJailbreakPrompts) {
      setJailbreakPrompts(JSON.parse(savedJailbreakPrompts));
    }
  }, []);
  // Save prompts to localStorage
  const savePrompts = (type: string, prompts: Prompt[] | NSFWProfile[]) => {
    localStorage.setItem(type, JSON.stringify(prompts));
  };

  const openModal = (prompt?: Prompt | NSFWProfile) => {
    setEditingPrompt(prompt || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const deletePrompt = (id: string, type: 'safe' | 'nsfw' | 'jailbreak') => {
    if (type === 'safe') {
      const updated = safePrompts.filter(p => p.id !== id);
      setSafePrompts(updated);
      savePrompts('safePrompts', updated);
    } else if (type === 'nsfw') {
      const updated = nsfwProfiles.filter(p => p.id !== id);
      setNSFWProfiles(updated);
      savePrompts('nsfwProfiles', updated);
    } else {
      const updated = jailbreakPrompts.filter(p => p.id !== id);
      setJailbreakPrompts(updated);
      savePrompts('jailbreakPrompts', updated);
    }
  };

  const getCurrentPrompts = () => {
    switch (activeTab) {
      case 'safe': return safePrompts;
      case 'nsfw': return nsfwProfiles;
      case 'jailbreak': return jailbreakPrompts;
    }
  };

  const tabs = [
    { id: 'safe', label: 'Safe Prompts', icon: '🛡️' },
    { id: 'nsfw', label: 'NSFW Profiles', icon: '🔞' },
    { id: 'jailbreak', label: 'Jailbreak Prompts', icon: '⚠️' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your prompts and system configurations</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'safe' | 'nsfw' | 'jailbreak')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Jailbreak Warning */}
      {activeTab === 'jailbreak' && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Warning: Jailbreak Prompts</h3>
          </div>
          <p className="text-sm text-destructive/80 mt-2">
            Jailbreak prompts are designed to bypass AI safety measures. They may produce harmful, 
            offensive, or inappropriate content. Use at your own risk and responsibility.
          </p>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'nsfw' ? 'Profile' : 'Prompt'}
        </Button>
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {getCurrentPrompts().map((prompt) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 border rounded-lg bg-card"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium truncate">{prompt.name}</h3>
                <div className="flex space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openModal(prompt)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePrompt(prompt.id, prompt.type)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prompt.content}              </p>
              {activeTab === 'nsfw' && (prompt as NSFWProfile).suggestedModel && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Model: {(prompt as NSFWProfile).suggestedModel || 'None'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {getCurrentPrompts().length === 0 && (
        <div className="text-center py-12">          <p className="text-muted-foreground">
            No {activeTab === 'nsfw' ? 'profiles' : 'prompts'} yet. 
            Click the &quot;Add&quot; button to create your first one.
          </p>
        </div>
      )}

      {/* Modal */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingPrompt={editingPrompt}
        type={activeTab}
        onSave={(prompt) => {
          if (activeTab === 'safe') {
            const updated = editingPrompt 
              ? safePrompts.map(p => p.id === prompt.id ? prompt : p)
              : [...safePrompts, prompt];
            setSafePrompts(updated);
            savePrompts('safePrompts', updated);
          } else if (activeTab === 'nsfw') {
            const updated = editingPrompt 
              ? nsfwProfiles.map(p => p.id === prompt.id ? prompt : p)
              : [...nsfwProfiles, prompt];
            setNSFWProfiles(updated);
            savePrompts('nsfwProfiles', updated);
          } else {
            const updated = editingPrompt 
              ? jailbreakPrompts.map(p => p.id === prompt.id ? prompt : p)
              : [...jailbreakPrompts, prompt];
            setJailbreakPrompts(updated);
            savePrompts('jailbreakPrompts', updated);
          }
          closeModal();
        }}
      />
    </div>
  );
}

// Modal Component
interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPrompt: Prompt | NSFWProfile | null;
  type: 'safe' | 'nsfw' | 'jailbreak';
  onSave: (prompt: Prompt | NSFWProfile) => void;
}

function PromptModal({ isOpen, onClose, editingPrompt, type, onSave }: PromptModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [suggestedModel, setSuggestedModel] = useState('');
  const [suggestedTemperature, setSuggestedTemperature] = useState(0.7);
  const [suggestedTopP, setSuggestedTopP] = useState(1);

  useEffect(() => {
    if (editingPrompt) {
      setName(editingPrompt.name);
      setContent(editingPrompt.content);
      if ('suggestedModel' in editingPrompt) {
        setSuggestedModel(editingPrompt.suggestedModel || '');
        setSuggestedTemperature(editingPrompt.suggestedTemperature || 0.7);
        setSuggestedTopP(editingPrompt.suggestedTopP || 1);
      }
    } else {
      setName('');
      setContent('');
      setSuggestedModel('');
      setSuggestedTemperature(0.7);
      setSuggestedTopP(1);
    }
  }, [editingPrompt]);

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;

    const basePrompt = {
      id: editingPrompt?.id || Date.now().toString(),
      name: name.trim(),
      content: content.trim(),
      type,
      createdAt: editingPrompt?.createdAt || new Date(),
    };

    if (type === 'nsfw') {
      const nsfwProfile: NSFWProfile = {
        ...basePrompt,
        suggestedModel: suggestedModel.trim() || undefined,
        suggestedTemperature,
        suggestedTopP,
      };
      onSave(nsfwProfile);
    } else {
      onSave(basePrompt);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingPrompt ? 'Edit' : 'Add'} {type === 'nsfw' ? 'Profile' : 'Prompt'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter prompt name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter prompt content..."
              rows={6}
            />
          </div>

          {type === 'nsfw' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Suggested Model</label>
                <Input
                  value={suggestedModel}
                  onChange={(e) => setSuggestedModel(e.target.value)}
                  placeholder="e.g., anthropic/claude-3-sonnet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperature: {suggestedTemperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={suggestedTemperature}
                    onChange={(e) => setSuggestedTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Top P: {suggestedTopP}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={suggestedTopP}
                    onChange={(e) => setSuggestedTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !content.trim()}>
            Save
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
