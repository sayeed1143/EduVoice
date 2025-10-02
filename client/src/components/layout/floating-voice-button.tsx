import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingVoiceButtonProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FloatingVoiceButton({ onTranscription, onError, className }: FloatingVoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now... Click again to stop.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      toast({
        title: "Recording failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    }
  }, [toast, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-Id': 'demo-user' // In real app, this would come from auth
        }
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      
      if (result.text) {
        onTranscription?.(result.text);
        toast({
          title: "Transcription complete",
          description: `"${result.text.substring(0, 50)}${result.text.length > 50 ? '...' : ''}"`,
        });
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      toast({
        title: "Transcription failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 className="w-6 h-6 animate-spin" />;
    if (isRecording) return <MicOff className="w-6 h-6" />;
    return <Mic className="w-6 h-6" />;
  };

  const getTooltipText = () => {
    if (isProcessing) return "Processing...";
    if (isRecording) return "Stop recording";
    return "Start voice recording";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleClick}
          disabled={isProcessing}
          className={cn(
            "fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-2xl",
            "bg-gradient-to-r from-primary to-accent text-primary-foreground",
            "hover:scale-110 transition-all duration-300",
            isRecording && "animate-pulse bg-destructive hover:bg-destructive",
            className
          )}
          data-testid="floating-voice-button"
        >
          {getButtonIcon()}
          
          {/* Pulse Animation Ring */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-ping" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
}
