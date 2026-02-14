
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {  } from '@react-three/drei'; // Removed useGLTF as it's not being used for a model
import { gsap } from 'gsap';

interface RingBoxProps {
  position?: [number, number, number];
  scale?: number;
}

const RingBox: React.FC<RingBoxProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Using a generic box as a placeholder for a GLTF ring box.
  // In a real app, you would load your RingBox.gltf like this:
  // const { scene } = useGLTF('/models/ring_box.gltf');
  // Then use <primitive object={scene} />

  useEffect(() => {
    if (meshRef.current) {
      // Initial state: hidden
      meshRef.current.scale.set(0.01, 0.01, 0.01);
      meshRef.current.position.set(position[0], position[1] - 5, position[2]); // Start below

      // Animation to reveal the ring box
      gsap.to(meshRef.current.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 2,
        ease: 'power3.out',
        delay: 1 // Delay after camera movement
      });
      gsap.to(meshRef.current.position, {
        y: position[1],
        duration: 2,
        ease: 'power3.out',
        delay: 1
      });
      gsap.to(meshRef.current.rotation, {
        y: Math.PI * 2, // Full rotation
        duration: 3,
        ease: 'power2.out',
        delay: 1
      });
    }
  }, [position, scale]);

  return (
    <mesh ref={meshRef} position={position} rotation-x={Math.PI / 6}>
      <boxGeometry args={[1, 0.5, 1]} /> {/* Placeholder for ring box */}
      <meshStandardMaterial color="#8B4513" metalness={0.7} roughness={0.2} /> {/* Brown, metallic */}
      <pointLight intensity={50} distance={10} decay={2} color="#FFDDC2" /> {/* Light on the box */}
      <mesh position={[0, 0.3, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} /> {/* Simple ring */}
        <meshStandardMaterial color="gold" metalness={1} roughness={0.1} />
      </mesh>
    </mesh>
  );
};

// Preload GLTF (if you were using a model)
// useGLTF.preload('/models/ring_box.gltf');

export default RingBox;