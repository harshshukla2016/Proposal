
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Image, Html } from '@react-three/drei';
import { MemoryCrystal as MemoryCrystalType, GamePhase } from '../types';
import { useStore } from '../hooks/useStore';
import { gsap } from 'gsap';

interface MemoryCrystalProps {
  crystal: MemoryCrystalType;
  position: [number, number, number];
  onCollect: (crystal: MemoryCrystalType) => void;
}

const MemoryCrystal: React.FC<MemoryCrystalProps> = ({ crystal, position, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const imageRef = useRef<any>(null);
  const captionRef = useRef<any>(null);
  const { camera } = useThree();
  const { collectedCrystalIds, gamePhase } = useStore();

  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Animation for pulsing
  useFrame(({ clock }) => {
    if (meshRef.current && gamePhase === GamePhase.PLAYING) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.5; // Gentle bobbing
    }
  });

  useEffect(() => {
    // Only reveal if it's collected
    if (collectedCrystalIds.has(crystal.id) && !revealed) {
      setRevealed(true);
      if (meshRef.current) {
        gsap.to(meshRef.current.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.in" }); // Shrink/fade out
      }
    }
  }, [collectedCrystalIds, crystal.id, revealed]);

  const handleClick = () => {
    if (gamePhase === GamePhase.PLAYING && !collectedCrystalIds.has(crystal.id)) {
      onCollect(crystal);
    }
  };

  if (revealed) return null; // Don't render if revealed

  return (
    <group position={position}>
      {/* 3D Crystal Mesh */}
      <mesh
        ref={meshRef}
        scale={hovered ? 1.2 : 1}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <icosahedronGeometry args={[1.5, 1]} /> {/* Crystal shape */}
        <MeshDistortMaterial
          distort={hovered ? 0.8 : 0.5} // More distortion on hover
          speed={3}
          roughness={0}
          color={hovered ? "#FFB6C1" : "#A78BFA"} // Pinkish on hover, purple otherwise
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Floating Image and Caption (only appears on hover) */}
      {hovered && (
        <>
          <group ref={imageRef} position={[0, 2, 2]} scale={1.5} rotation-y={Math.PI / 8}>
            {crystal.image_url && (
              <Image key={crystal.image_url} url={crystal.image_url} transparent position={[0, 0, 0]} scale={[2, 1.5]} toneMapped={false} />
            )}
            <Html transform position={[0, -0.9, 0]} rotation-x={-Math.PI / 6}>
              <div className="text-white text-lg bg-black bg-opacity-70 p-2 rounded-md whitespace-nowrap">
                {crystal.caption_text}
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
};

export default MemoryCrystal;
