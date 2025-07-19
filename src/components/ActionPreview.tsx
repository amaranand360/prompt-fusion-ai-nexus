import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  ArrowRight
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
  onCancel: () => void;
  className?: string;
}

export const ActionPreview: React.FC<ActionPreviewProps> = ({
  previewData,
  onProceed,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState(previewData.data);
  const [isEditing, setIsEditing] = useState(false);

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
        </Label>
        <Input
          id="recipients"
          value={formData.recipients?.join(', ') || ''}
          onChange={(e) => handleInputChange('recipients', e.target.value.split(',').map(r => r.trim()))}
          placeholder="Enter email addresses separated by commas"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Subject
        </Label>
        <Input
          id="subject"
          value={formData.subject || ''}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="Email subject"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Message
        </Label>
        <Textarea
          id="body"
          value={formData.body || ''}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Email content"
          rows={4}
          disabled={!isEditing}
          className="resize-none"
        />
      </div>
    </div>
  );

  const renderCalendarPreview = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Meeting title"
          disabled={!isEditing}
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
        </Label>
        <Input
          id="attendees"
          value={formData.attendees?.join(', ') || ''}
          onChange={(e) => handleInputChange('attendees', e.target.value.split(',').map(a => a.trim()))}
          placeholder="Enter email addresses separated by commas"
          disabled={!isEditing}
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Meeting description"
          rows={3}
          disabled={!isEditing}
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
        <div className="flex items-center justify-between pt-6 border-t bg-secondary/20 -mx-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            {validateForm() ? 'Ready to execute with real APIs' : 'Please fill required fields'}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              onClick={handleProceed}
              className="flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] hover:opacity-90 shadow-lg"
              size="lg"
              disabled={!validateForm()}
            >
              <Send className="h-4 w-4" />
              Proceed to Execute
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
