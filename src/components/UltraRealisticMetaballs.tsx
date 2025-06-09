import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface MetaballProps {
  position: [number, number, number];
  color: string;
  scale: number;
}

const Metaball: React.FC<MetaballProps> = ({ position, color, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.3) * 0.3;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} scale={scale} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.8}
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
};

const UltraRealisticMetaballs: React.FC = () => {
  const metaballs = [
    { position: [-2, 1, 0] as [number, number, number], color: '#06b6d4', scale: 1.2 },
    { position: [2, -1, -1] as [number, number, number], color: '#8b5cf6', scale: 1.0 },
    { position: [0, 2, 1] as [number, number, number], color: '#ec4899', scale: 0.8 },
    { position: [-1, -2, 0] as [number, number, number], color: '#10b981', scale: 1.1 },
    { position: [1.5, 0, -2] as [number, number, number], color: '#f59e0b', scale: 0.9 },
  ];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        {metaballs.map((ball, index) => (
          <Metaball
            key={index}
            position={ball.position}
            color={ball.color}
            scale={ball.scale}
          />
        ))}
        
        {/* Particle system */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={1000}
              array={new Float32Array(
                Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 20)
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#06b6d4"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      </Canvas>
    </div>
  );
};

export default UltraRealisticMetaballs;