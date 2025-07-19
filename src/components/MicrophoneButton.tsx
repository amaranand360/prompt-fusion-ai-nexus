import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onTranscript,
  onStart,
  onStop,
  onError,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useSpeechRecognition();

  // Handle transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle start/stop callbacks
  useEffect(() => {
    if (isListening && onStart) {
      onStart();
    } else if (!isListening && onStop) {
      onStop();
    }
  }, [isListening, onStart, onStop]);

  const handleMicClick = () => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn(getSizeClasses(), 'opacity-50 cursor-not-allowed', className)}
        title="Speech recognition not supported"
      >
        <MicOff className={getIconSize()} />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleMicClick}
      className={cn(
        getSizeClasses(),
        isListening && 'bg-red-500 hover:bg-red-600 animate-pulse',
        error && 'bg-red-500/20 border-red-500',
        className
      )}
      title={isListening ? 'Stop recording' : 'Start voice recording'}
    >
      {isListening ? (
        <div className="relative">
          <Mic className={cn(getIconSize(), 'text-white')} />
          {/* Pulsing animation for active recording */}
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        </div>
      ) : error ? (
        <MicOff className={cn(getIconSize(), 'text-red-500')} />
      ) : (
        <Mic className={getIconSize()} />
      )}
    </Button>
  );
};

// Voice Recording Indicator Component
export const VoiceRecordingIndicator: React.FC<{
  isRecording: boolean;
  transcript: string;
  className?: string;
}> = ({ isRecording, transcript, className }) => {
  if (!isRecording && !transcript) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg',
      className
    )}>
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
            Recording...
          </span>
        </div>
      )}
      {transcript && (
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
};
