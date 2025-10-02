import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FloatingVoiceButton } from "@/components/layout/floating-voice-button";
import { 
  Send, 
  Paperclip, 
  Volume2, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  X,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  materialIds?: string[];
}

interface ChatInterfaceProps {
  conversationId?: string;
  onMindMapGenerate?: (topic: string, materialIds: string[]) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatInterface({ 
  conversationId, 
  onMindMapGenerate, 
  className, 
  collapsed = false,
  onToggleCollapse 
}: ChatInterfaceProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load conversation messages
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { 'X-User-Id': 'demo-user' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (content: string, materialIds: string[] = []) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      materialIds
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId || 'default'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          content: content.trim(),
          materialIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: data.assistantMessage.id,
        role: 'assistant',
        content: data.assistantMessage.content,
        timestamp: new Date(data.assistantMessage.timestamp),
        audioUrl: data.assistantMessage.audioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if response mentions mind map generation
      if (content.toLowerCase().includes('mind map') || 
          content.toLowerCase().includes('visual') || 
          content.toLowerCase().includes('diagram')) {
        // Extract topic from user message for mind map generation
        const topic = content.replace(/create|generate|show|mind map|visual|diagram/gi, '').trim();
        if (topic && onMindMapGenerate) {
          onMindMapGenerate(topic, materialIds);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInputText(prev => prev + (prev ? ' ' : '') + text);
  };

  const playAudio = async (content: string, messageId: string) => {
    if (isPlayingAudio === messageId) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(null);
      return;
    }

    try {
      setIsPlayingAudio(messageId);
      
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({ text: content })
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlayingAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlayingAudio(null);
      toast({
        title: "Audio failed",
        description: "Failed to play audio response",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (collapsed) {
    return (
      <Card className={cn("fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 mb-4 w-96", className)}>
        <div 
          className="p-4 bg-muted/30 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggleCollapse}
          data-testid="chat-collapsed-header"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">AI Assistant</p>
              <p className="text-xs text-muted-foreground">Click to expand chat</p>
            </div>
          </div>
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col bg-card border-t border-border", className)} data-testid="chat-interface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always ready to help you learn</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapse}
              data-testid="button-minimize-chat"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 max-h-96">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {t('chat.placeholder')}
              </p>
              <p className="text-xs mt-2">
                Try asking: "Explain photosynthesis" or "Create a mind map about physics"
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={cn("flex space-x-3", message.role === 'user' && "flex-row-reverse space-x-reverse")}>
              <Avatar className="flex-shrink-0">
                <AvatarFallback className={cn(
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                )}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn("flex-1 space-y-2", message.role === 'user' && "text-right")}>
                <div className={cn(
                  "rounded-xl px-4 py-3 max-w-sm inline-block",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                
                <div className={cn("flex items-center space-x-2 text-xs text-muted-foreground", message.role === 'user' && "justify-end")}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => playAudio(message.content, message.id)}
                      disabled={isPlayingAudio !== null && isPlayingAudio !== message.id}
                      data-testid={`button-play-audio-${message.id}`}
                    >
                      {isPlayingAudio === message.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">{t('chat.aiThinking')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input Area */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              placeholder={t('chat.placeholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
              data-testid="input-chat-message"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0"
              data-testid="button-attach-file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          
          <FloatingVoiceButton
            onTranscription={handleVoiceTranscription}
            className="relative bottom-0 right-0 w-12 h-12"
          />
          
          <Button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="h-12 px-4"
            data-testid="button-send-message"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">Shift + Enter</kbd> for new line
        </p>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </Card>
  );
}
