
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei'; // Removed useGLTF as it's not being used for a model
import * as THREE from 'three';
import { useStore } from '../hooks/useStore';
import { GamePhase } from '../types';

interface AstraGlowProps {
  position?: [number, number, number];
  scale?: number;
  pulse: number; // Audio pulse for subtle animation
}

const AstraGlow: React.FC<AstraGlowProps> = ({ position = [0, 0, 0], scale = 1, pulse }) => {
  // Using a placeholder sphere for now, as GLTF model file cannot be directly embedded.
  // In a real app, you would load your Astra-Glow.gltf like this:
  // const { scene } = useGLTF('/models/astra-glow.gltf');
  const meshRef = useRef<THREE.Mesh>(null);
  const { currentNarrative, gamePhase } = useStore();

  useFrame(({ clock, camera }) => {
    if (meshRef.current && gamePhase === GamePhase.PLAYING) {
      // Simple bobbing and rotation
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.2 + pulse * 0.5;
      meshRef.current.position.x = position[0] + Math.cos(clock.elapsedTime * 1.5) * 0.2 + pulse * 0.3;
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;

      // Make Astra-Glow always face the camera
      meshRef.current.lookAt(camera.position);
    }
  });

  if (gamePhase !== GamePhase.PLAYING) return null;

  return (
    <group position={position} scale={scale}>
      <mesh ref={meshRef}>
        {/* Placeholder: replace with GLTF model when available */}
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial emissive="#FFDDC2" emissiveIntensity={2 + pulse * 2} color="#FFB6C1" toneMapped={false} />
        <pointLight intensity={2 + pulse * 2} distance={5} color="#FFDDC2" /> {/* Light emanating from the wisp */}

        {/* Floating text bubble for narration */}
        {currentNarrative && (
          <Html position={[0, 1.2, 0]} transform>
            <div className="bg-black bg-opacity-70 p-2 rounded-md text-yellow-300 text-sm md:text-base whitespace-nowrap max-w-xs text-center shadow-lg pointer-events-none">
              {currentNarrative}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

// Preload GLTF (if you were using a model)
// useGLTF.preload('/models/astra-glow.gltf');

export default AstraGlow;