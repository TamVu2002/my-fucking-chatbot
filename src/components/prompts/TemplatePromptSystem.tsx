'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Save, 
  Search, 
  Tags, 
  Variable, 
  Play,
  Star,
  StarOff,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { AnimatedDiv, AnimatedButton } from '@/components/ui/animations';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  options?: string[]; // For select type
  required?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: PromptVariable[];
  category: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
  author?: string;
}

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    description: 'Comprehensive code review with suggestions for improvement',
    content: `Please review the following {{language}} code and provide detailed feedback:

Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Focus on:
- Code quality and best practices
- Performance optimizations
- Security considerations
- Readability and maintainability
{{#if specific_areas}}
- {{specific_areas}}
{{/if}}

Provide specific suggestions with examples where possible.`,
    variables: [
      {
        name: 'language',
        description: 'Programming language',
        defaultValue: 'JavaScript',
        type: 'select',
        options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
        required: true
      },
      {
        name: 'code',
        description: 'Code to review',
        defaultValue: '',
        type: 'textarea',
        required: true
      },
      {
        name: 'specific_areas',
        description: 'Specific areas to focus on (optional)',
        defaultValue: '',
        type: 'text'
      }
    ],
    category: 'Development',
    tags: ['code', 'review', 'programming'],
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'content-writer',
    name: 'Content Writing Assistant',
    description: 'Generate engaging content for various purposes',
    content: `Write {{content_type}} about "{{topic}}" with the following requirements:

Target Audience: {{audience}}
Tone: {{tone}}
Word Count: Approximately {{word_count}} words
{{#if keywords}}
Keywords to include: {{keywords}}
{{/if}}
{{#if call_to_action}}
Call to Action: {{call_to_action}}
{{/if}}

Please ensure the content is:
- Engaging and well-structured
- SEO-friendly
- Accurate and informative
- Tailored to the target audience`,
    variables: [
      {
        name: 'content_type',
        description: 'Type of content',
        defaultValue: 'a blog post',
        type: 'select',
        options: ['a blog post', 'an article', 'a social media post', 'a product description', 'an email'],
        required: true
      },
      {
        name: 'topic',
        description: 'Main topic or subject',
        defaultValue: '',
        type: 'text',
        required: true
      },
      {
        name: 'audience',
        description: 'Target audience',
        defaultValue: 'general public',
        type: 'text',
        required: true
      },
      {
        name: 'tone',
        description: 'Writing tone',
        defaultValue: 'professional',
        type: 'select',
        options: ['professional', 'casual', 'friendly', 'formal', 'conversational', 'authoritative'],
        required: true
      },
      {
        name: 'word_count',
        description: 'Approximate word count',
        defaultValue: '500',
        type: 'number',
        required: true
      },
      {
        name: 'keywords',
        description: 'Keywords to include (optional)',
        defaultValue: '',
        type: 'text'
      },
      {
        name: 'call_to_action',
        description: 'Call to action (optional)',
        defaultValue: '',
        type: 'text'
      }
    ],
    category: 'Content',
    tags: ['writing', 'content', 'marketing'],
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

interface TemplatePromptSystemProps {
  onUseTemplate?: (prompt: string) => void;
}

export default function TemplatePromptSystem({ onUseTemplate }: TemplatePromptSystemProps) {
  const { theme } = useAppSettings();
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showVariableEditor, setShowVariableEditor] = useState<string | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const categories = useMemo(() => {
    const cats = [...new Set(templates.map(t => t.category))];
    return ['all', ...cats];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const createTemplate = useCallback(() => {
    const newTemplate: PromptTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      description: '',
      content: '',
      variables: [],
      category: 'Custom',
      tags: [],
      isFavorite: false,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setEditingTemplate(newTemplate);
    setShowEditor(true);
  }, []);

  const saveTemplate = useCallback((template: PromptTemplate) => {
    setTemplates(prev => {
      const existing = prev.find(t => t.id === template.id);
      if (existing) {
        return prev.map(t => t.id === template.id ? { ...template, updatedAt: Date.now() } : t);
      } else {
        return [...prev, template];
      }
    });
    setShowEditor(false);
    setEditingTemplate(null);
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const toggleFavorite = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  }, []);

  const processTemplate = useCallback((template: PromptTemplate, values: Record<string, string>) => {
    let processed = template.content;
    
    // Replace variables
    template.variables.forEach(variable => {
      const value = values[variable.name] || variable.defaultValue;
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      processed = processed.replace(regex, value);
    });

    // Handle conditional blocks (simple implementation)
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    processed = processed.replace(conditionalRegex, (match, varName, content) => {
      const value = values[varName] || '';
      return value.trim() ? content : '';
    });

    return processed;
  }, []);

  const useTemplate = useCallback((template: PromptTemplate) => {
    // Initialize variable values with defaults
    const initialValues = template.variables.reduce((acc, variable) => {
      acc[variable.name] = variable.defaultValue;
      return acc;
    }, {} as Record<string, string>);
    
    setVariableValues(initialValues);
    setShowVariableEditor(template.id);
  }, []);

  const executeTemplate = useCallback((template: PromptTemplate) => {
    const processedPrompt = processTemplate(template, variableValues);
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    
    if (onUseTemplate) {
      onUseTemplate(processedPrompt);
    }
    
    setShowVariableEditor(null);
    setVariableValues({});
  }, [processTemplate, variableValues, onUseTemplate]);

  const exportTemplates = useCallback(() => {
    const data = {
      templates,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templates]);

  const importTemplates = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(prev => [...prev, ...data.templates]);
        }
      } catch (error) {
        console.error('Failed to import templates:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Prompt Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and use reusable prompt templates with variables
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importTemplates}
            className="hidden"
            id="import-templates"
          />
          <label htmlFor="import-templates">
            <AnimatedButton as="span" variant="ghost" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </AnimatedButton>
          </label>

          <AnimatedButton
            onClick={exportTemplates}
            variant="ghost"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </AnimatedButton>

          <AnimatedButton
            onClick={createTemplate}
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </AnimatedButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={(template) => {
              setEditingTemplate(template);
              setShowEditor(true);
            }}
            onDelete={() => deleteTemplate(template.id)}
            onToggleFavorite={() => toggleFavorite(template.id)}
            onUse={() => useTemplate(template)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <AnimatedButton onClick={createTemplate} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </AnimatedButton>
          )}
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={showEditor}
        template={editingTemplate}
        onSave={saveTemplate}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />

      {/* Variable Editor Modal */}
      <VariableEditor
        isOpen={!!showVariableEditor}
        template={templates.find(t => t.id === showVariableEditor) || null}
        values={variableValues}
        onValuesChange={setVariableValues}
        onExecute={(template) => executeTemplate(template)}
        onClose={() => {
          setShowVariableEditor(null);
          setVariableValues({});
        }}
      />
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: PromptTemplate;
  onEdit: (template: PromptTemplate) => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUse: () => void;
}

function TemplateCard({ template, onEdit, onDelete, onToggleFavorite, onUse }: TemplateCardProps) {
  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {template.description}
          </p>
        </div>
        
        <button
          onClick={onToggleFavorite}
          className="ml-2 text-gray-400 hover:text-yellow-500 transition-colors"
        >
          {template.isFavorite ? (
            <Star className="w-4 h-4 fill-current text-yellow-500" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
          {template.category}
        </span>
        {template.variables.length > 0 && (
          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded flex items-center">
            <Variable className="w-3 h-3 mr-1" />
            {template.variables.length} vars
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span>Used {template.usageCount} times</span>
        <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center space-x-2">
        <AnimatedButton
          onClick={onUse}
          variant="default"
          size="sm"
          className="flex-1"
        >
          <Play className="w-3 h-3 mr-1" />
          Use
        </AnimatedButton>
        
        <AnimatedButton
          onClick={() => onEdit(template)}
          variant="ghost"
          size="sm"
        >
          <Edit3 className="w-3 h-3" />
        </AnimatedButton>
        
        <AnimatedButton
          onClick={() => navigator.clipboard.writeText(template.content)}
          variant="ghost"
          size="sm"
        >
          <Copy className="w-3 h-3" />
        </AnimatedButton>
        
        <AnimatedButton
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </AnimatedButton>
      </div>
    </motion.div>
  );
}

// Template Editor Component (Simplified for brevity)
interface TemplateEditorProps {
  isOpen: boolean;
  template: PromptTemplate | null;
  onSave: (template: PromptTemplate) => void;
  onClose: () => void;
}

function TemplateEditor({ isOpen, template, onSave, onClose }: TemplateEditorProps) {
  const [formData, setFormData] = useState<PromptTemplate | null>(template);

  React.useEffect(() => {
    setFormData(template);
  }, [template]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {template?.id.startsWith('template-') ? 'Create Template' : 'Edit Template'}
          </h2>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              placeholder="Use {{variable_name}} for variables and {{#if variable}}content{{/if}} for conditionals"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <AnimatedButton onClick={onClose} variant="ghost">
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={() => onSave(formData)} variant="default">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Variable Editor Component (Simplified for brevity)
interface VariableEditorProps {
  isOpen: boolean;
  template: PromptTemplate | null;
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
  onExecute: (template: PromptTemplate) => void;
  onClose: () => void;
}

function VariableEditor({ isOpen, template, values, onValuesChange, onExecute, onClose }: VariableEditorProps) {
  if (!isOpen || !template) return null;

  const updateValue = (name: string, value: string) => {
    onValuesChange({ ...values, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Configure Template: {template.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Fill in the variables to generate your prompt
          </p>

          <div className="space-y-4 mb-6">
            {template.variables.map((variable) => (
              <div key={variable.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {variable.name}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {variable.description}
                </p>
                
                {variable.type === 'select' ? (
                  <select
                    value={values[variable.name] || variable.defaultValue}
                    onChange={(e) => updateValue(variable.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {variable.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : variable.type === 'textarea' ? (
                  <textarea
                    value={values[variable.name] || variable.defaultValue}
                    onChange={(e) => updateValue(variable.name, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type={variable.type}
                    value={values[variable.name] || variable.defaultValue}
                    onChange={(e) => updateValue(variable.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <AnimatedButton onClick={onClose} variant="ghost">
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={() => onExecute(template)} variant="default">
              <Play className="w-4 h-4 mr-2" />
              Generate Prompt
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
