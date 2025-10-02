import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Youtube, 
  Trash2, 
  Plus,
  Search,
  Folder,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Material {
  id: string;
  filename: string;
  type: 'pdf' | 'image' | 'video' | 'youtube' | 'text';
  content?: string;
  metadata?: any;
  uploadedAt: string;
}

interface MaterialsSidebarProps {
  onMaterialSelect?: (materialIds: string[]) => void;
  selectedMaterialIds?: string[];
  className?: string;
}

export function MaterialsSidebar({ 
  onMaterialSelect, 
  selectedMaterialIds = [], 
  className 
}: MaterialsSidebarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch materials
  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: async () => {
      const response = await fetch('/api/materials', {
        headers: { 'X-User-Id': 'demo-user' }
      });
      if (!response.ok) throw new Error('Failed to fetch materials');
      return response.json();
    }
  });

  const materials: Material[] = materialsData?.materials || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'X-User-Id': 'demo-user' },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Upload successful",
        description: "Material has been uploaded and processed",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  });

  // YouTube mutation
  const youtubeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/materials/youtube', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user' 
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) throw new Error('YouTube processing failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      setYoutubeUrl("");
      setShowYoutubeInput(false);
      toast({
        title: "YouTube video added",
        description: "Video content has been processed and added to your materials",
      });
    },
    onError: (error) => {
      toast({
        title: "YouTube processing failed",
        description: error instanceof Error ? error.message : "Failed to process YouTube video",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': 'demo-user' }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Material deleted",
        description: "Material has been removed from your library",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete material",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      uploadMutation.mutate(file);
    }
    // Reset input
    event.target.value = '';
  }, [uploadMutation, toast]);

  const handleYouTubeSubmit = () => {
    if (!youtubeUrl.trim()) return;
    
    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }
    
    youtubeMutation.mutate(youtubeUrl);
  };

  const toggleMaterialSelection = (materialId: string) => {
    const newSelection = selectedMaterialIds.includes(materialId)
      ? selectedMaterialIds.filter(id => id !== materialId)
      : [...selectedMaterialIds, materialId];
    
    onMaterialSelect?.(newSelection);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredMaterials = materials.filter(material =>
    material.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("w-80 bg-card border-r border-border flex flex-col", className)} data-testid="materials-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-4">{t('materials.title')}</h3>
        
        {/* Upload Button */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground mb-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          data-testid="button-upload-content"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t('materials.upload')}
            </>
          )}
        </Button>

        {/* YouTube Input */}
        {showYoutubeInput && (
          <div className="space-y-2 mb-4">
            <Input
              placeholder="Enter YouTube URL..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleYouTubeSubmit();
                }
              }}
              disabled={youtubeMutation.isPending}
              data-testid="input-youtube-url"
            />
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={handleYouTubeSubmit}
                disabled={!youtubeUrl.trim() || youtubeMutation.isPending}
                data-testid="button-add-youtube"
              >
                {youtubeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowYoutubeInput(false);
                  setYoutubeUrl("");
                }}
                data-testid="button-cancel-youtube"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Add YouTube Button */}
        {!showYoutubeInput && (
          <Button 
            variant="outline" 
            className="w-full mb-4"
            onClick={() => setShowYoutubeInput(true)}
            data-testid="button-show-youtube-input"
          >
            <Youtube className="w-4 h-4 mr-2" />
            Add YouTube Video
          </Button>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-materials"
          />
        </div>
      </div>

      {/* Materials List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No materials found' : t('materials.empty')}
            </p>
            {!searchTerm && (
              <p className="text-xs mt-2">
                Upload PDFs, images, or add YouTube videos to get started
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedMaterialIds.includes(material.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => toggleMaterialSelection(material.id)}
                data-testid={`material-item-${material.id}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(material.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {material.filename}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {material.type.toUpperCase()}
                      {material.metadata?.size && ` • ${formatFileSize(material.metadata.size)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(material.uploadedAt)}
                    </p>
                    
                    {/* Content Preview */}
                    {material.content && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {material.content.substring(0, 100)}
                        {material.content.length > 100 && '...'}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(material.id);
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-material-${material.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {/* Selection Indicator */}
                {selectedMaterialIds.includes(material.id) && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Selection Summary */}
      {selectedMaterialIds.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedMaterialIds.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMaterialSelect?.([])}
              data-testid="button-clear-selection"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
        data-testid="file-input-upload"
      />
    </div>
  );
}
