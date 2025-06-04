'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Clock,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui';

export interface Widget {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  visible: boolean;
  position: number;
}

interface DragDropDashboardProps {
  widgets: Widget[];
  onWidgetsChange: (widgets: Widget[]) => void;
  className?: string;
}

// Sortable Widget Component
function SortableWidget({ widget, onToggleVisibility }: { 
  widget: Widget; 
  onToggleVisibility: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!widget.visible) return null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center space-x-2">
          {widget.icon}
          <h3 className="font-medium text-foreground">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(widget.id)}
            className="h-8 w-8 p-0"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {widget.content}
      </div>
    </motion.div>
  );
}

export default function DragDropDashboard({ 
  widgets, 
  onWidgetsChange, 
  className = '' 
}: DragDropDashboardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [showHidden, setShowHidden] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((item) => item.id === active.id);
      const newIndex = widgets.findIndex((item) => item.id === over?.id);
      
      const newWidgets = arrayMove(widgets, oldIndex, newIndex).map((widget, index) => ({
        ...widget,
        position: index
      }));
      
      onWidgetsChange(newWidgets);
    }
  };

  const toggleWidgetVisibility = (id: string) => {
    const newWidgets = widgets.map(widget =>
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    );
    onWidgetsChange(newWidgets);
  };

  const resetLayout = () => {
    const resetWidgets = widgets.map((widget, index) => ({
      ...widget,
      visible: true,
      position: index
    }));
    onWidgetsChange(resetWidgets);
  };

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.position - b.position);
  const hiddenWidgets = widgets.filter(w => !w.visible);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Manage Widgets</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Layout</span>
          </Button>
        </div>
      </div>

      {/* Hidden Widgets Panel */}
      <AnimatePresence>
        {showHidden && hiddenWidgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/50 rounded-lg p-4 border border-border"
          >
            <h3 className="font-medium text-foreground mb-3 flex items-center">
              <EyeOff className="w-4 h-4 mr-2" />
              Hidden Widgets
            </h3>
            <div className="flex flex-wrap gap-2">
              {hiddenWidgets.map(widget => (
                <Button
                  key={widget.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="flex items-center space-x-2"
                >
                  {widget.icon}
                  <span>{widget.title}</span>
                  <Eye className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence>
              {visibleWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onToggleVisibility={toggleWidgetVisibility}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No widgets visible. Click "Manage Widgets" to show some widgets.</p>
        </motion.div>
      )}
    </div>
  );
}
