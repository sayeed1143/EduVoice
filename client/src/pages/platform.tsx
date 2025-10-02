import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialsSidebar } from "@/components/materials/materials-sidebar";
import { InteractiveCanvas } from "@/components/canvas/interactive-canvas";
import { ChatInterface } from "@/components/chat/chat-interface";
import { QuizGenerator } from "@/components/quiz/quiz-generator";
import { FloatingVoiceButton } from "@/components/layout/floating-voice-button";
import { 
  MessageSquare, 
  FileText, 
  Brain, 
  Target, 
  Maximize2, 
  Minimize2,
  Palette,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Platform() {
  const { t } = useTranslation();
  
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'canvas' | 'chat' | 'quiz'>('canvas');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [currentMindMapData, setCurrentMindMapData] = useState<any>(null);

  const handleMaterialSelection = (materialIds: string[]) => {
    setSelectedMaterialIds(materialIds);
  };

  const handleMindMapGenerate = async (topic: string, materialIds: string[]) => {
    try {
      const response = await fetch('/api/mindmaps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          materialIds,
          topic: topic
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentMindMapData(data.mindMap);
        setActiveTab('canvas');
      }
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    // If we're on chat tab, pass to chat interface
    if (activeTab === 'chat') {
      // The chat interface will handle this through its own voice button
      return;
    }
    
    // Otherwise, could trigger AI actions based on voice commands
    if (text.toLowerCase().includes('create mind map') || text.toLowerCase().includes('generate mind map')) {
      const topic = text.replace(/create|generate|mind map/gi, '').trim();
      if (topic && selectedMaterialIds.length > 0) {
        handleMindMapGenerate(topic, selectedMaterialIds);
      }
    }
  };

  return (
    <div className="h-screen flex bg-background pt-16" data-testid="platform-page">
      {/* Materials Sidebar */}
      <MaterialsSidebar
        onMaterialSelect={handleMaterialSelection}
        selectedMaterialIds={selectedMaterialIds}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EduVoice AI Platform
              </h1>
              <p className="text-sm text-muted-foreground">
                Voice-first visual learning experience
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="canvas" className="flex items-center space-x-2" data-testid="tab-canvas">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Canvas</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center space-x-2" data-testid="tab-chat">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex items-center space-x-2" data-testid="tab-quiz">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Quiz</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" data-testid="button-help">
                  <HelpCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Material Selection Info */}
          {selectedMaterialIds.length > 0 && (
            <div className="border-t border-border bg-primary/5 px-6 py-3">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">
                  {selectedMaterialIds.length} material{selectedMaterialIds.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Ready for AI processing
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="flex-1 relative overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            {/* Canvas Tab */}
            <TabsContent value="canvas" className="h-full m-0">
              <div className="h-full">
                {selectedMaterialIds.length > 0 ? (
                  <InteractiveCanvas
                    mindMapData={currentMindMapData}
                    onNodeUpdate={(nodes, connections) => {
                      // Save canvas state
                      console.log('Canvas updated:', { nodes, connections });
                    }}
                    className="h-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/10">
                    <Card className="p-8 max-w-md text-center">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Materials Selected</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Select materials from the sidebar to start creating mind maps and visual representations
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try uploading a PDF, image, or adding a YouTube video to get started
                      </p>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="h-full m-0">
              <div className="h-full">
                <ChatInterface
                  conversationId="default"
                  onMindMapGenerate={handleMindMapGenerate}
                  className="h-full"
                  collapsed={false}
                />
              </div>
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz" className="h-full m-0">
              <div className="h-full overflow-auto">
                <div className="p-6">
                  <QuizGenerator
                    selectedMaterialIds={selectedMaterialIds}
                    onQuizGenerated={(quiz) => {
                      console.log('Quiz generated:', quiz);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Collapsible Chat Panel (when not on chat tab) */}
        {activeTab !== 'chat' && (
          <ChatInterface
            conversationId="default"
            onMindMapGenerate={handleMindMapGenerate}
            className={cn(
              "absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300",
              isChatCollapsed ? "transform translate-y-full" : ""
            )}
            collapsed={isChatCollapsed}
            onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
          />
        )}
      </div>

      {/* Floating Voice Button */}
      <FloatingVoiceButton 
        onTranscription={handleVoiceTranscription}
        className={cn(
          "fixed bottom-8 right-8 z-50",
          !isChatCollapsed && activeTab !== 'chat' && "bottom-32"
        )}
      />

      {/* Status Bar */}
      <div className="fixed bottom-0 left-80 right-0 h-8 bg-muted/80 backdrop-blur-sm border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground z-20">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          {selectedMaterialIds.length > 0 && (
            <>
              <span>•</span>
              <span>{selectedMaterialIds.length} materials loaded</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>AI: Online</span>
          <span>•</span>
          <span>Voice: Ready</span>
        </div>
      </div>
    </div>
  );
}
