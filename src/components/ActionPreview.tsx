import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMultiFieldTyping } from '@/hooks/useTypingAnimation';
import { TypingCursor } from '@/components/TypingCursor';
import {
  Mail,
  Calendar,
  Video,
  Clock,
  Users,
  MapPin,
  Send,
  X,
  Edit3,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

export interface ActionPreviewData {
  type: 'email' | 'calendar' | 'meeting' | 'other';
  action: string;
  data: {
    // Email fields
    recipients?: string[];
    subject?: string;
    body?: string;
    
    // Calendar/Meeting fields
    title?: string;
    date?: string;
    time?: string;
    duration?: number;
    attendees?: string[];
    location?: string;
    description?: string;
    includeMeet?: boolean;
  };
}

interface ActionPreviewProps {
  previewData: ActionPreviewData;
  onProceed: (updatedData: ActionPreviewData) => void;
  onProceedDirect: (data: ActionPreviewData) => void;
  onCancel: () => void;
  className?: string;
  showContent?: boolean;
}

export const ActionPreview: React.FC<ActionPreviewProps> = ({
  previewData,
  onProceed,
  onProceedDirect,
  onCancel,
  className = '',
  showContent = true
}) => {
  // Add comprehensive null checking and debugging
  console.log('🎬 ActionPreview received data:', previewData);

  if (!previewData) {
    console.error('❌ ActionPreview: previewData is null/undefined');
    return (
      <Card className={`p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: Preview data is null</p>
        </div>
      </Card>
    );
  }

  if (!previewData.data) {
    console.error('❌ ActionPreview: previewData.data is null/undefined', previewData);
    return (
      <Card className={`p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: Preview data.data is not available</p>
          <p className="text-xs text-red-500 mt-2">Type: {previewData.type}, Action: {previewData.action}</p>
        </div>
      </Card>
    );
  }

  console.log('✅ ActionPreview: Data is valid, initializing component');

  const [formData, setFormData] = useState(previewData.data);
  const [isEditing, setIsEditing] = useState(false);

  // Prepare fields for typing animation
  const typingFields = React.useMemo(() => {
    const fields: Record<string, string> = {};

    if (previewData.type === 'email') {
      if (previewData.data.recipients?.length) {
        fields.recipients = previewData.data.recipients.join(', ');
      }
      if (previewData.data.subject) {
        fields.subject = previewData.data.subject;
      }
      if (previewData.data.body) {
        fields.body = previewData.data.body;
      }
    } else if (previewData.type === 'calendar' || previewData.type === 'meeting') {
      if (previewData.data.title) {
        fields.title = previewData.data.title;
      }
      if (previewData.data.attendees?.length) {
        fields.attendees = previewData.data.attendees.join(', ');
      }
      if (previewData.data.description) {
        fields.description = previewData.data.description;
      }
    }

    return fields;
  }, [previewData]);

  // Use typing animation hook
  const { animatedFields, currentField, isComplete } = useMultiFieldTyping({
    fields: typingFields,
    speed: 20,
    fieldDelay: 300,
    enabled: showContent && !isEditing
  });

  useEffect(() => {
    setFormData(previewData.data);
  }, [previewData]);

  const handleInputChange = (field: string, value: string | string[] | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (previewData.type === 'email') {
      return !!(formData.recipients?.length && formData.recipients[0] && formData.subject);
    }
    if (previewData.type === 'calendar' || previewData.type === 'meeting') {
      return !!(formData.title && formData.date && formData.time);
    }
    return true;
  };

  const handleProceed = () => {
    if (!validateForm()) {
      // Could add toast notification here
      return;
    }

    onProceed({
      ...previewData,
      data: formData
    });
  };

  const getActionIcon = () => {
    switch (previewData.type) {
      case 'email':
        return <Mail className="h-5 w-5 text-red-500" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'meeting':
        return <Video className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
    }
  };

  const getActionColor = () => {
    switch (previewData.type) {
      case 'email':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'calendar':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'meeting':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
    }
  };

  const renderEmailPreview = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipients" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Recipients
          {currentField === 'recipients' && <TypingCursor show={true} />}
        </Label>
        <Input
          id="recipients"
          value={isEditing ? (formData.recipients?.join(', ') || '') : (animatedFields.recipients || '')}
          onChange={(e) => handleInputChange('recipients', e.target.value.split(',').map(r => r.trim()))}
          placeholder="Enter email addresses separated by commas"
          disabled={!isEditing}
          className={currentField === 'recipients' ? 'border-blue-300 bg-blue-50/50' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Subject
          {currentField === 'subject' && <TypingCursor show={true} />}
        </Label>
        <Input
          id="subject"
          value={isEditing ? (formData.subject || '') : (animatedFields.subject || '')}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="Email subject"
          disabled={!isEditing}
          className={currentField === 'subject' ? 'border-blue-300 bg-blue-50/50' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Message
          {currentField === 'body' && <TypingCursor show={true} />}
        </Label>
        <Textarea
          id="body"
          value={isEditing ? (formData.body || '') : (animatedFields.body || '')}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Email content"
          rows={6}
          disabled={!isEditing}
          className={`resize-none ${currentField === 'body' ? 'border-blue-300 bg-blue-50/50' : ''}`}
        />
      </div>
    </div>
  );

  const renderCalendarPreview = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Event Title
          {currentField === 'title' && <TypingCursor show={true} />}
        </Label>
        <Input
          id="title"
          value={isEditing ? (formData.title || '') : (animatedFields.title || '')}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Meeting title"
          disabled={!isEditing}
          className={currentField === 'title' ? 'border-blue-300 bg-blue-50/50' : ''}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time || ''}
            onChange={(e) => handleInputChange('time', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duration (minutes)
          </Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration || 60}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            disabled={!isEditing}
            min="15"
            max="480"
            step="15"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder={previewData.type === 'meeting' ? 'Google Meet (auto-generated)' : 'Meeting location'}
            disabled={!isEditing}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="attendees" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Attendees
          {currentField === 'attendees' && <TypingCursor show={true} />}
        </Label>
        <Input
          id="attendees"
          value={isEditing ? (formData.attendees?.join(', ') || '') : (animatedFields.attendees || '')}
          onChange={(e) => handleInputChange('attendees', e.target.value.split(',').map(a => a.trim()))}
          placeholder="Enter email addresses separated by commas"
          disabled={!isEditing}
          className={currentField === 'attendees' ? 'border-blue-300 bg-blue-50/50' : ''}
        />
      </div>
      
      {previewData.type === 'meeting' && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeMeet"
            checked={formData.includeMeet || false}
            onChange={(e) => handleInputChange('includeMeet', e.target.checked)}
            disabled={!isEditing}
            className="rounded border-gray-300"
          />
          <Label htmlFor="includeMeet">Include Google Meet link</Label>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Description
          {currentField === 'description' && <TypingCursor show={true} />}
        </Label>
        <Textarea
          id="description"
          value={isEditing ? (formData.description || '') : (animatedFields.description || '')}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Meeting description"
          rows={4}
          disabled={!isEditing}
          className={`resize-none ${currentField === 'description' ? 'border-blue-300 bg-blue-50/50' : ''}`}
        />
      </div>
    </div>
  );

  return (
    <Card className={`p-6 border-2 ${getActionColor()} ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getActionIcon()}
            <div>
              <h3 className="text-lg font-semibold text-foreground">Action Preview</h3>
              <p className="text-sm text-muted-foreground">{previewData.action}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {previewData.type}
            </Badge>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-[hsl(var(--brand-primary))] text-white" : ""}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Details'}
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className={`rounded-lg p-4 transition-all duration-300 ${
          isEditing
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
            : 'bg-background/50 border border-border'
        }`}>
          {isEditing && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Edit mode active - Modify the details below
              </span>
            </div>
          )}

          {previewData.type === 'email' && renderEmailPreview()}
          {(previewData.type === 'calendar' || previewData.type === 'meeting') && renderCalendarPreview()}

          {previewData.type === 'other' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Ready to Execute</h4>
              <p className="text-muted-foreground">{previewData.action}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-6 border-t bg-secondary/20 -mx-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            {validateForm() ? 'Ready to execute with real APIs' : 'Please fill required fields'}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onProceedDirect(previewData)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                disabled={!validateForm()}
              >
                <Zap className="h-4 w-4" />
                Proceed Directly
              </Button>

              <Button
                onClick={handleProceed}
                className="flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] hover:opacity-90 shadow-lg"
                size="lg"
                disabled={!validateForm()}
              >
                <Edit3 className="h-4 w-4" />
                Proceed with Editing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
