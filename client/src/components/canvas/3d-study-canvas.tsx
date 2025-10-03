import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Line, 
  Sphere, 
  Html, 
  Environment,
  PerspectiveCamera,
  Float,
  Stars
} from '@react-three/drei';
import { useRef, useState, useMemo, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import * as THREE from 'three';

interface Node3D {
  id: string;
  label: string;
  position: [number, number, number];
  type: 'central' | 'branch' | 'leaf';
  color: string;
  size: number;
}

interface Connection3D {
  from: string;
  to: string;
  label?: string;
  strength?: number;
}

interface StudyCanvas3DProps {
  nodes?: Node3D[];
  connections?: Connection3D[];
  onNodeClick?: (nodeId: string) => void;
}

function ConceptNode({ node, onClick, isSelected }: { 
  node: Node3D; 
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const nodeColor = useMemo(() => new THREE.Color(node.color), [node.color]);

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere
          ref={meshRef}
          args={[node.size || 0.5, 32, 32]}
          onClick={onClick}
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <meshPhysicalMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={isSelected ? 1 : hovered ? 0.5 : 0.2}
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.1}
            transparent
            opacity={0.95}
          />
        </Sphere>

        <Text
          position={[0, node.size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {node.label}
        </Text>

        {(hovered || isSelected) && (
          <Html center distanceFactor={10}>
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl max-w-xs">
              <h4 className="font-semibold text-sm">{node.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Type: {node.type} • Click to explore
              </p>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

function ConnectionLine({ from, to, nodes, label }: { 
  from: string; 
  to: string; 
  nodes: Node3D[];
  label?: string;
}) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);

  if (!fromNode || !toNode) return null;

  const points = [
    new THREE.Vector3(...fromNode.position),
    new THREE.Vector3(...toNode.position),
  ];

  return (
    <>
      <Line
        points={points}
        color="#60a5fa"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      {label && (
        <Text
          position={[
            (fromNode.position[0] + toNode.position[0]) / 2,
            (fromNode.position[1] + toNode.position[1]) / 2,
            (fromNode.position[2] + toNode.position[2]) / 2,
          ]}
          fontSize={0.2}
          color="#93c5fd"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </>
  );
}

function Scene({ nodes, connections, selectedNodeId, onNodeClick }: {
  nodes: Node3D[];
  connections: Connection3D[];
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
}) {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          from={conn.from}
          to={conn.to}
          nodes={nodes}
          label={conn.label}
        />
      ))}

      {nodes.map((node) => (
        <ConceptNode
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node.id)}
          isSelected={selectedNodeId === node.id}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        makeDefault
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-white">
        <Sparkles className="w-5 h-5 animate-spin" />
        <span>Loading 3D Study Flow...</span>
      </div>
    </Html>
  );
}

export function StudyCanvas3D({ nodes = [], connections = [], onNodeClick }: StudyCanvas3DProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const defaultNodes: Node3D[] = useMemo(() => [
    {
      id: 'central',
      label: 'AI Learning',
      position: [0, 0, 0],
      type: 'central',
      color: '#8b5cf6',
      size: 1,
    },
    {
      id: 'vision',
      label: 'Computer Vision',
      position: [-4, 2, -2],
      type: 'branch',
      color: '#3b82f6',
      size: 0.7,
    },
    {
      id: 'nlp',
      label: 'Natural Language',
      position: [4, 2, -2],
      type: 'branch',
      color: '#10b981',
      size: 0.7,
    },
    {
      id: 'ml',
      label: 'Machine Learning',
      position: [0, -3, 2],
      type: 'branch',
      color: '#f59e0b',
      size: 0.7,
    },
    {
      id: 'cnn',
      label: 'CNN',
      position: [-6, 2, -4],
      type: 'leaf',
      color: '#60a5fa',
      size: 0.5,
    },
    {
      id: 'transformers',
      label: 'Transformers',
      position: [6, 3, -4],
      type: 'leaf',
      color: '#34d399',
      size: 0.5,
    },
  ], []);

  const defaultConnections: Connection3D[] = useMemo(() => [
    { from: 'central', to: 'vision', label: 'includes' },
    { from: 'central', to: 'nlp', label: 'includes' },
    { from: 'central', to: 'ml', label: 'based on' },
    { from: 'vision', to: 'cnn', label: 'uses' },
    { from: 'nlp', to: 'transformers', label: 'uses' },
  ], []);

  const displayNodes = nodes.length > 0 ? nodes : defaultNodes;
  const displayConnections = connections.length > 0 ? connections : defaultConnections;

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    onNodeClick?.(nodeId);
  };

  const handleExport = () => {
    // TODO: Implement 3D scene export
    console.log('Exporting 3D scene...');
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 15], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            nodes={displayNodes}
            connections={displayConnections}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
          />
        </Suspense>
      </Canvas>

      {selectedNodeId && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 p-4 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              {displayNodes.find(n => n.id === selectedNodeId)?.label}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNodeId(null)}
            >
              Close
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore this concept in detail or generate related content.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1">
              Learn More
            </Button>
            <Button size="sm" className="flex-1">
              Quiz Me
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
