import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Sparkles,
  Mail,
  Calendar,
  Search,
  Video,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { OpenAIAnalysisResult } from '@/services/openaiService';
import { ActionPreview, ActionPreviewData } from '@/components/ActionPreview';

interface AIAssistantSummaryProps {
  analysis: OpenAIAnalysisResult;
  onExecute: (action: string) => void;
  onRefine?: () => void;
  isLoading?: boolean;
  className?: string;
  // Preview functionality
  previewData?: ActionPreviewData | null;
  showPreview?: boolean;
  onPreviewProceed?: (updatedPreviewData: ActionPreviewData) => Promise<void>;
  onPreviewProceedDirect?: (previewData: ActionPreviewData) => Promise<void>;
  onPreviewCancel?: () => void;
  isGeneratingPreview?: boolean;
}

export const AIAssistantSummary: React.FC<AIAssistantSummaryProps> = ({
  analysis,
  onExecute,
  onRefine,
  isLoading = false,
  className = '',
  previewData,
  showPreview = false,
  onPreviewProceed,
  onPreviewProceedDirect,
  onPreviewCancel,
  isGeneratingPreview = false
}) => {
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'email':
        return Mail;
      case 'calendar':
        return Calendar;
      case 'search':
        return Search;
      case 'meeting':
        return Video;
      case 'document':
        return FileText;
      default:
        return Zap;
    }
  };

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'email':
        return 'from-blue-500 to-cyan-500';
      case 'calendar':
        return 'from-green-500 to-emerald-500';
      case 'search':
        return 'from-purple-500 to-violet-500';
      case 'meeting':
        return 'from-orange-500 to-red-500';
      case 'document':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  if (!analysis.isValid) {
    return (
      <Card className={`p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Invalid Query</h3>
            <p className="text-sm text-red-600 dark:text-red-400">Unable to understand your request</p>
          </div>
        </div>
        
        <p className="text-red-700 dark:text-red-300 mb-4">
          {analysis.summary}
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefine}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const TaskIcon = getTaskIcon(analysis.taskType);

  return (
    <Card className={`p-6 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${getTaskColor(analysis.taskType)} rounded-xl flex items-center justify-center shadow-lg`}>
          <TaskIcon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              AI Assistant Analysis
            </h3>
            <Badge className={`text-xs ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}% confident
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {analysis.taskType} Task Detected
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h4 className="font-medium text-foreground">Summary</h4>
        </div>
        <p className="text-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg border">
          {analysis.summary}
        </p>
      </div>

      {/* Suggested Actions */}
      {analysis.suggestedActions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <h4 className="font-medium text-foreground">Suggested Actions</h4>
          </div>
          <div className="grid gap-2">
            {analysis.suggestedActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onExecute(analysis.originalQuery)}
                className="justify-start h-auto p-3 text-left hover:bg-purple-50 dark:hover:bg-purple-950/30 border-purple-200 dark:border-purple-800 group"
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="flex-1">{action}</span>
                  <ArrowRight className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Execution Steps */}
      {analysis.executionSteps.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-foreground">Execution Steps</h4>
          </div>
          <div className="space-y-2">
            {analysis.executionSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {index + 1}
                  </span>
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-purple-200 dark:border-purple-800">
        <Button
          onClick={() => onExecute(analysis.originalQuery)}
          disabled={isLoading || isGeneratingPreview}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
        >
          <Play className="h-4 w-4 mr-2" />
          {isGeneratingPreview ? 'Generating Preview...' : isLoading ? 'Executing...' : 'Execute Task'}
        </Button>

        {onRefine && (
          <Button
            variant="outline"
            onClick={onRefine}
            disabled={isLoading}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Refine Query
          </Button>
        )}
      </div>

      {/* Execution Info */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">Will execute:</span> "{analysis.originalQuery}"
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          This will run your original query through ZenBox AI's task execution system.
        </p>
      </div>

      {/* Action Preview */}
      {showPreview && previewData && onPreviewProceed && onPreviewProceedDirect && onPreviewCancel && (
        <div className="mt-6">
          <ActionPreview
            previewData={previewData}
            onProceed={(updatedData) => onPreviewProceed(updatedData)}
            onProceedDirect={(data) => onPreviewProceedDirect(data)}
            onCancel={onPreviewCancel}
            isGenerating={isGeneratingPreview}
          />
        </div>
      )}
    </Card>
  );
};
