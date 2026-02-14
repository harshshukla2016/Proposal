
import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface MemoryFrameProps {
    imageUrl?: string;
    caption: string;
    onClose: () => void;
    position?: [number, number, number];
    rotation?: [number, number, number];
}

const ImageMesh = ({ url }: { url: string }) => {
    const texture = useTexture(url);

    // Ensure the texture is visible properly
    texture.encoding = THREE.sRGBEncoding;

    return (
        <mesh position={[0, 0.5, 0.01]}>
            <planeGeometry args={[3.8, 3.8]} />
            <meshStandardMaterial
                map={texture}
                transparent
                side={THREE.DoubleSide}
                toneMapped={false}
            />
        </mesh>
    );
};

const FallbackMesh = () => (
    <mesh position={[0, 0.5, 0.01]}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshStandardMaterial color="#333" />
        <Text
            position={[0, 0, 0.1]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
        >
            Stardust
        </Text>
    </mesh>
);

export const MemoryFrame: React.FC<MemoryFrameProps> = ({
    imageUrl,
    caption,
    onClose,
    position = [0, 0, -2], // Default slightly in front of camera
    rotation = [0, 0, 0]
}) => {
    console.log("🖼️ MemoryFrame Rendering. ImageURL:", imageUrl);
    const groupRef = useRef<THREE.Group>(null);
    const bgRef = useRef<THREE.Mesh>(null);

    // Animate in
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.scale.set(0, 0, 0);
            gsap.to(groupRef.current.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        }
    }, []);

    // Floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
        }
    });

    const handleClose = (e: any) => {
        e.stopPropagation();
        if (groupRef.current) {
            gsap.to(groupRef.current.scale, {
                x: 0, y: 0, z: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    return (
        <group ref={groupRef} position={position} rotation={rotation} renderOrder={100}>
            {/* Frame Background */}
            <mesh
                ref={bgRef}
                position={[0, 0, -0.1]}
                onClick={handleClose}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[4.2, 5.2]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#4c1d95"
                    emissiveIntensity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Frame Border Glow */}
            <mesh position={[0, 0, -0.11]}>
                <planeGeometry args={[4.4, 5.4]} />
                <meshBasicMaterial color="#ec4899" transparent opacity={0.5} />
            </mesh>

            {/* The Image */}
            <Suspense fallback={
                <mesh position={[0, 0.5, 0.01]}>
                    <planeGeometry args={[3.8, 3.8]} />
                    <meshStandardMaterial color="#2a2a2a" emissive="#555" emissiveIntensity={0.2} />
                    <Text position={[0, 0, 0.1]} fontSize={0.3} color="#ccc">Loading...</Text>
                </mesh>
            }>
                {imageUrl ? (
                    <ImageMesh url={imageUrl} />
                ) : (
                    <FallbackMesh />
                )}
            </Suspense>

            {/* Caption Area */}
            <group position={[0, -2, 0.02]}>
                <Text
                    maxWidth={3.5}
                    fontSize={0.25}
                    color="#fce7f3" // pink-100
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#be185d"
                >
                    {caption}
                </Text>
            </group>

            {/* Close Button Hint */}
            <Text
                position={[0, -2.4, 0.02]}
                fontSize={0.15}
                color="#9ca3af"
                anchorX="center"
                anchorY="middle"
            >
                (Click to Close)
            </Text>
        </group >
    );
};
