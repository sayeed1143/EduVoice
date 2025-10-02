import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Group, Rect, Text, Line, Circle } from "react-konva";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Undo, 
  Redo, 
  Move, 
  Plus,
  Link2,
  FileText
} from "lucide-react";
import Konva from "konva";

interface CanvasNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'central' | 'branch' | 'leaf';
  fontSize: number;
}

interface CanvasConnection {
  id: string;
  from: string;
  to: string;
  points: number[];
  color: string;
}

interface InteractiveCanvasProps {
  mindMapData?: any;
  onNodeUpdate?: (nodes: CanvasNode[], connections: CanvasConnection[]) => void;
  className?: string;
}

export function InteractiveCanvas({ mindMapData, onNodeUpdate, className }: InteractiveCanvasProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'move' | 'add' | 'connect'>('select');
  const [history, setHistory] = useState<{ nodes: CanvasNode[], connections: CanvasConnection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const stageRef = useRef<Konva.Stage>(null);
  const { toast } = useToast();

  // Initialize with sample mind map data
  useEffect(() => {
    if (mindMapData?.nodes) {
      setNodes(mindMapData.nodes);
      if (mindMapData.connections) {
        setConnections(mindMapData.connections);
      }
    } else {
      // Default demo mind map
      const defaultNodes: CanvasNode[] = [
        {
          id: 'central',
          label: 'Machine Learning',
          x: 400,
          y: 250,
          width: 200,
          height: 80,
          color: '#8B5CF6',
          type: 'central',
          fontSize: 18
        },
        {
          id: 'supervised',
          label: 'Supervised Learning',
          x: 150,
          y: 120,
          width: 160,
          height: 60,
          color: '#3B82F6',
          type: 'branch',
          fontSize: 14
        },
        {
          id: 'unsupervised',
          label: 'Unsupervised Learning',
          x: 600,
          y: 120,
          width: 160,
          height: 60,
          color: '#10B981',
          type: 'branch',
          fontSize: 14
        },
        {
          id: 'deep',
          label: 'Deep Learning',
          x: 150,
          y: 380,
          width: 160,
          height: 60,
          color: '#F59E0B',
          type: 'branch',
          fontSize: 14
        },
        {
          id: 'reinforcement',
          label: 'Reinforcement Learning',
          x: 600,
          y: 380,
          width: 160,
          height: 60,
          color: '#EF4444',
          type: 'branch',
          fontSize: 14
        }
      ];

      const defaultConnections: CanvasConnection[] = [
        {
          id: 'central-supervised',
          from: 'central',
          to: 'supervised',
          points: [400, 250, 230, 150],
          color: '#6B7280'
        },
        {
          id: 'central-unsupervised',
          from: 'central',
          to: 'unsupervised',
          points: [500, 250, 680, 150],
          color: '#6B7280'
        },
        {
          id: 'central-deep',
          from: 'central',
          to: 'deep',
          points: [400, 330, 230, 380],
          color: '#6B7280'
        },
        {
          id: 'central-reinforcement',
          from: 'central',
          to: 'reinforcement',
          points: [500, 330, 680, 380],
          color: '#6B7280'
        }
      ];

      setNodes(defaultNodes);
      setConnections(defaultConnections);
    }
  }, [mindMapData]);

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, connections, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setConnections(previousState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale * 0.8, 0.3);
    setScale(newScale);
  };

  const handleExport = async () => {
    if (!stageRef.current) return;
    
    try {
      const uri = stageRef.current.toDataURL({ 
        pixelRatio: 2,
        mimeType: 'image/png'
      });
      
      const link = document.createElement('a');
      link.download = 'mindmap.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Mind map exported as PNG image",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export mind map",
        variant: "destructive",
      });
    }
  };

  const handleNodeDragEnd = (nodeId: string, x: number, y: number) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
    
    // Update connections
    setConnections(prevConnections =>
      prevConnections.map(conn => {
        if (conn.from === nodeId || conn.to === nodeId) {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (fromNode && toNode) {
            const fromX = conn.from === nodeId ? x : fromNode.x;
            const fromY = conn.from === nodeId ? y : fromNode.y;
            const toX = conn.to === nodeId ? x : toNode.x;
            const toY = conn.to === nodeId ? y : toNode.y;
            
            return {
              ...conn,
              points: [
                fromX + (conn.from === nodeId ? 100 : fromNode.width / 2),
                fromY + (conn.from === nodeId ? 40 : fromNode.height / 2),
                toX + (conn.to === nodeId ? 100 : toNode.width / 2),
                toY + (conn.to === nodeId ? 40 : toNode.height / 2)
              ]
            };
          }
        }
        return conn;
      })
    );

    saveToHistory();
    onNodeUpdate?.(nodes, connections);
  };

  const addNewNode = () => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      label: 'New Concept',
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: 140,
      height: 60,
      color: '#6366F1',
      type: 'leaf',
      fontSize: 14
    };
    
    setNodes(prev => [...prev, newNode]);
    saveToHistory();
    onNodeUpdate?.([...nodes, newNode], connections);
  };

  return (
    <div className={`relative bg-muted/10 ${className}`}>
      {/* Toolbar */}
      <Card className="absolute top-4 left-4 z-10 p-2 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant={tool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('select')}
            data-testid="tool-select"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'add' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('add')}
            data-testid="tool-add"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'connect' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('connect')}
            data-testid="tool-connect"
          >
            <Link2 className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            data-testid="button-undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            data-testid="button-redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Zoom & Export Controls */}
      <Card className="absolute top-4 right-4 z-10 p-2 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            data-testid="button-zoomout"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            data-testid="button-zoomin"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            data-testid="button-export"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Canvas Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: `${stagePos.x % 20}px ${stagePos.y % 20}px`
          }}
        />
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={800}
        height={600}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={tool === 'move'}
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.1;
          const stage = e.target.getStage();
          if (!stage) return;
          
          const oldScale = stage.scaleX();
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          
          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };

          const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
          setScale(Math.min(Math.max(newScale, 0.3), 3));

          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };
          setStagePos(newPos);
        }}
        onClick={(e) => {
          if (tool === 'add' && e.target === e.target.getStage()) {
            const pos = e.target.getStage()?.getPointerPosition();
            if (pos) {
              const newNode: CanvasNode = {
                id: `node-${Date.now()}`,
                label: 'New Concept',
                x: (pos.x - stagePos.x) / scale,
                y: (pos.y - stagePos.y) / scale,
                width: 140,
                height: 60,
                color: '#6366F1',
                type: 'leaf',
                fontSize: 14
              };
              setNodes(prev => [...prev, newNode]);
              saveToHistory();
              onNodeUpdate?.([...nodes, newNode], connections);
            }
          }
        }}
      >
        <Layer>
          {/* Render Connections */}
          {connections.map(connection => (
            <Line
              key={connection.id}
              points={connection.points}
              stroke={connection.color}
              strokeWidth={2}
              opacity={0.7}
              dash={[5, 5]}
            />
          ))}
          
          {/* Render Nodes */}
          {nodes.map(node => (
            <Group
              key={node.id}
              x={node.x}
              y={node.y}
              draggable={tool === 'select'}
              onDragEnd={(e) => handleNodeDragEnd(node.id, e.target.x(), e.target.y())}
              onClick={() => setSelectedNode(node.id)}
              onTap={() => setSelectedNode(node.id)}
            >
              <Rect
                width={node.width}
                height={node.height}
                fill={node.color}
                cornerRadius={12}
                stroke={selectedNode === node.id ? '#fff' : 'transparent'}
                strokeWidth={3}
                shadowColor="rgba(0,0,0,0.3)"
                shadowBlur={node.type === 'central' ? 15 : 8}
                shadowOffset={{ x: 0, y: 4 }}
                opacity={0.9}
              />
              <Text
                text={node.label}
                width={node.width}
                height={node.height}
                align="center"
                verticalAlign="middle"
                fontSize={node.fontSize}
                fontFamily="Inter, sans-serif"
                fontStyle={node.type === 'central' ? 'bold' : 'normal'}
                fill={node.type === 'central' ? '#ffffff' : '#000000'}
                wrap="word"
                ellipsis={true}
              />
              
              {/* Connection points for visual feedback */}
              {tool === 'connect' && (
                <>
                  <Circle
                    x={node.width / 2}
                    y={0}
                    radius={6}
                    fill="#10B981"
                    opacity={0.8}
                  />
                  <Circle
                    x={node.width}
                    y={node.height / 2}
                    radius={6}
                    fill="#10B981"
                    opacity={0.8}
                  />
                  <Circle
                    x={node.width / 2}
                    y={node.height}
                    radius={6}
                    fill="#10B981"
                    opacity={0.8}
                  />
                  <Circle
                    x={0}
                    y={node.height / 2}
                    radius={6}
                    fill="#10B981"
                    opacity={0.8}
                  />
                </>
              )}
            </Group>
          ))}
        </Layer>
      </Stage>

      {/* Node Info Panel */}
      {selectedNode && (
        <Card className="absolute bottom-4 left-4 z-10 p-4 bg-background/90 backdrop-blur-sm max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Selected Node</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {nodes.find(n => n.id === selectedNode)?.label || 'Unknown'}
            </p>
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedNode(null)}
                data-testid="button-deselect"
              >
                Deselect
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setNodes(prev => prev.filter(n => n.id !== selectedNode));
                  setConnections(prev => prev.filter(c => c.from !== selectedNode && c.to !== selectedNode));
                  setSelectedNode(null);
                  saveToHistory();
                }}
                data-testid="button-delete-node"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="absolute bottom-4 right-4 z-10 p-3 bg-background/90 backdrop-blur-sm">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Select:</strong> Click and drag nodes</p>
          <p><strong>Add:</strong> Click anywhere to add nodes</p>
          <p><strong>Zoom:</strong> Mouse wheel or buttons</p>
          <p><strong>Pan:</strong> Select move tool and drag</p>
        </div>
      </Card>
    </div>
  );
}
