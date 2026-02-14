
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getRandomIconicBuilding } from './IconicBuildings';


// --- PALACE ---
// --- PALACE ---
export const LovePalace = ({ position = [0, 0, 0] as [number, number, number], onClick }: { position?: [number, number, number], onClick?: () => void }) => {
    const palaceRef = useRef<THREE.Group>(null);

    // Gentle floating animation
    useFrame((state) => {
        if (palaceRef.current) {
            palaceRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
        }
    });

    return (
        <group ref={palaceRef} position={position}>

            {/* --- Main Keep Structure --- */}
            {/* Base Foundation */}
            <mesh position={[0, 2, 0]} receiveShadow>
                <cylinderGeometry args={[12, 14, 4, 8]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
            </mesh>

            {/* Central Tower Body */}
            <mesh position={[0, 12, 0]} castShadow>
                <cylinderGeometry args={[6, 7, 20, 16]} />
                <meshStandardMaterial color="#FFF5EE" roughness={0.2} metalness={0.1} /> {/* Seashell */}
            </mesh>

            {/* Central Balcony */}
            <mesh position={[0, 18, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[6.5, 0.4, 16, 32]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Central Roof (Spire) */}
            <mesh position={[0, 28, 0]}>
                <coneGeometry args={[7, 14, 16]} />
                <meshStandardMaterial color="#FFB7C5" metalness={0.3} roughness={0.2} /> {/* Cherry Blossom */}
            </mesh>

            {/* Top Spire Ball */}
            <mesh position={[0, 35, 0]}>
                <sphereGeometry args={[0.8]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.2} metalness={1} roughness={0.1} />
            </mesh>

            {/* --- Satellite Towers --- */}
            {[0, 72, 144, 216, 288].map((deg, i) => {
                const angle = (deg * Math.PI) / 180;
                const r = 12; // Radius from center
                return (
                    <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                        {/* Tower Body */}
                        <mesh position={[0, 8, 0]} castShadow>
                            <cylinderGeometry args={[2.5, 3, 16, 12]} />
                            <meshStandardMaterial color="#FFF0F5" roughness={0.2} /> {/* Lavender Blush */}
                        </mesh>

                        {/* Tower Windows (Glowing) */}
                        {[4, 8, 12].map((y, j) => (
                            <mesh key={j} position={[0, y, 2.4]} rotation={[0, 0, 0]}>
                                <planeGeometry args={[0.8, 1.5]} />
                                <meshStandardMaterial color="#FFFFE0" emissive="#FFFFE0" emissiveIntensity={0.5} />
                            </mesh>
                        ))}

                        {/* Tower Roof */}
                        <mesh position={[0, 19, 0]}>
                            <coneGeometry args={[3.2, 8, 12]} />
                            <meshStandardMaterial color="#FFC0CB" metalness={0.4} roughness={0.2} />
                        </mesh>

                        {/* Gold Tips */}
                        <mesh position={[0, 23, 0]}>
                            <sphereGeometry args={[0.4]} />
                            <meshStandardMaterial color="#FFD700" metalness={1} />
                        </mesh>
                    </group>
                );
            })}

            {/* --- Grand Portal Gate --- */}
            <group position={[0, 0, 13]}>
                {/* Visual Stairs */}
                <mesh position={[0, 0, 4]} rotation={[-0.1, 0, 0]}>
                    <boxGeometry args={[12, 2, 8]} />
                    <meshStandardMaterial color="#E6E6FA" />
                </mesh>

                {/* Gate Frame */}
                {/* Left Pillar */}
                <mesh position={[-5, 5, 2]}>
                    <boxGeometry args={[2, 12, 2]} />
                    <meshStandardMaterial color="#FFF5EE" />
                </mesh>
                {/* Right Pillar */}
                <mesh position={[5, 5, 2]}>
                    <boxGeometry args={[2, 12, 2]} />
                    <meshStandardMaterial color="#FFF5EE" />
                </mesh>
                {/* Arch Top */}
                <mesh position={[0, 12, 2]}>
                    <boxGeometry args={[12, 2, 2]} />
                    <meshStandardMaterial color="#FFF5EE" />
                </mesh>

                {/* The Magic Gate (Clickable Portal) */}
                <group
                    position={[0, 5, 2]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'default'; }}
                >
                    {/* Glowing Portal Surface */}
                    <mesh>
                        <planeGeometry args={[8, 10]} />
                        <meshStandardMaterial
                            color="#ff1493"
                            emissive="#ff1493"
                            emissiveIntensity={2}
                            transparent
                            opacity={0.6}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Floating Label */}
                    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                        <Text
                            position={[0, 2, 0.5]}
                            fontSize={1.2}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.05}
                            outlineColor="#ff1493"
                        >
                            ENTER PALACE
                        </Text>
                        <Text
                            position={[0, 0, 0.5]}
                            fontSize={0.6}
                            color="#ffeef2"
                            anchorX="center"
                            anchorY="middle"
                        >
                            (Click Here)
                        </Text>
                    </Float>
                </group>
            </group>

            {/* Connecting Walls (Pentagon) */}
            <mesh position={[0, 6, 0]} rotation={[0, Math.PI / 10, 0]}>
                <cylinderGeometry args={[11, 12, 8, 5]} />
                <meshStandardMaterial color="#FFE4E1" roughness={0.3} />
            </mesh>
        </group>
    );
};

// --- NATURE & DECOR ---
export const Tree = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
            <dodecahedronGeometry args={[1.2]} />
            <meshStandardMaterial color="#FF69B4" /> {/* Cherry Blossom Pink */}
        </mesh>
        <mesh position={[0, 3.5, 0]}>
            <dodecahedronGeometry args={[0.8]} />
            <meshStandardMaterial color="#FFB6C1" />
        </mesh>
    </group>
);

export const StreetLamp = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 4, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        <mesh position={[0, 3.8, 0]}>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="#FFFFE0" emissive="#FFFFE0" emissiveIntensity={1} />
        </mesh>
        <pointLight position={[0, 4, 0]} color="#FFFFE0" distance={8} intensity={0.8} />
    </group>
);

export const River = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[200, 15]} />
        <meshStandardMaterial color="#00BFFF" opacity={0.6} transparent metalness={0.8} roughness={0.1} />
    </mesh>
);

// --- BUILDINGS ---
const ModernBuilding = ({ position, args, color }) => {
    const [width, height, depth] = args;
    const glassRef = useRef<THREE.Mesh>(null);
    const windowSpacing = 0.5;

    // Internal Lighting (Emissive Windows)
    const windows = useMemo(() => {
        const wins = [];
        // Generate internal lights
        for (let y = 1; y < height - 1; y += windowSpacing * 4) {
            // Randomly place lights inside
            if (Math.random() > 0.3) {
                const x = (Math.random() - 0.5) * (width - 0.5);
                const z = (Math.random() - 0.5) * (depth - 0.5);
                // Randomize color temperature: Warm (2700K) vs Cool (5000K)
                const isWarm = Math.random() > 0.5;
                const lightColor = isWarm ? '#ffaa55' : '#dbeeff';
                wins.push({ pos: [x, y - height / 2, z], color: lightColor });
            }
        }
        return wins;
    }, [width, height, depth]);

    return (
        <group position={position}>
            {/* Glass Curtain Wall */}
            <mesh ref={glassRef}>
                <boxGeometry args={[width, height, depth]} />
                <meshPhysicalMaterial
                    color={color} // Slight tint
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.2} // Glass-like
                    thickness={1.5} // Refraction
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    envMapIntensity={2} // Strong reflections
                />
            </mesh>

            {/* Internal Structure (Floor Plates) */}
            {new Array(Math.floor(height / 2)).fill(0).map((_, i) => (
                <mesh key={i} position={[0, -height / 2 + (i * 2), 0]}>
                    <boxGeometry args={[width - 0.1, 0.2, depth - 0.1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            ))}

            {/* Internal Volumetric Lights (Simulated) */}
            <Instances range={windows.length}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial toneMapped={false} />
                {windows.map((data, i) => (
                    <Instance
                        key={i}
                        position={data.pos as any}
                        color={data.color}
                    />
                ))}
            </Instances>

            {/* Metallic Frames */}
            <mesh position={[width / 2, 0, width / 2]}>
                <boxGeometry args={[0.2, height, 0.2]} />
                <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-width / 2, 0, width / 2]}>
                <boxGeometry args={[0.2, height, 0.2]} />
                <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[width / 2, 0, -width / 2]}>
                <boxGeometry args={[0.2, height, 0.2]} />
                <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-width / 2, 0, -width / 2]}>
                <boxGeometry args={[0.2, height, 0.2]} />
                <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
};

export const RealisticTree = ({ position }) => (
    <group position={position}>
        {/* Trunk */}
        <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.2, 0.4, 3, 7]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
        {/* Foliage - Subsurface Scattering Simulation using Physical Material */}
        <mesh position={[0, 3.5, 0]}>
            <dodecahedronGeometry args={[1.5]} />
            <meshPhysicalMaterial
                color="#ffb7c5" // Cherry blossom pink
                emissive="#ffb7c5"
                emissiveIntensity={0.2} // SSS fake
                roughness={0.8}
                metalness={0.1}
                clearcoat={0.1}
                thickness={0.5} // Light passing through
            />
        </mesh>
        <mesh position={[0.8, 2.5, 0]}>
            <dodecahedronGeometry args={[1]} />
            <meshPhysicalMaterial color="#ffc0cb" roughness={0.8} thickness={2} />
        </mesh>
        <mesh position={[-0.8, 2.8, 0]}>
            <dodecahedronGeometry args={[1.1]} />
            <meshPhysicalMaterial color="#ffc0cb" roughness={0.8} thickness={2} />
        </mesh>
    </group>
);

// --- MOUNTAINS ---
export const Mountains = () => {
    // Generate mountains ONCE using useMemo to prevent flickering from re-randomization
    const mountains = useMemo(() => {
        const peaks = [];
        // Reduced count for performance - 15 instead of 30
        for (let i = 0; i < 15; i++) {
            peaks.push({
                key: `peak-${i}`,
                position: [(Math.random() - 0.5) * 500, 0, -200 + (Math.random() - 0.5) * 100] as [number, number, number],
                rotation: [Math.random() * 0.3, Math.random() * Math.PI * 2, 0] as [number, number, number],
                scale: 80 + Math.random() * 50,
                color: Math.random() > 0.5 ? "#2a2a35" : "#1a1a25"
            });
        }
        // Foothills - 12 instead of 30
        for (let i = 0; i < 12; i++) {
            peaks.push({
                key: `hill-${i}`,
                position: [(Math.random() - 0.5) * 300, -20, -120 + (Math.random() - 0.5) * 50] as [number, number, number],
                rotation: [Math.random() * 0.3, Math.random() * Math.PI * 2, 0] as [number, number, number],
                scale: 50 + Math.random() * 30,
                color: "#0f0f1a"
            });
        }
        return peaks;
    }, []); // Empty dependency array - generate only once

    return (
        <group position={[0, -20, 0]}>
            {mountains.map((m) => (
                <mesh key={m.key} position={m.position} rotation={m.rotation} scale={m.scale}>
                    <coneGeometry args={[1, 2, 4]} />
                    <meshBasicMaterial color={m.color} fog={true} />
                </mesh>
            ))}
        </group>
    );
};

export const Road = () => {
    // Shop positions (matching LoveCityScene.tsx)
    const shopPositions = [
        { x: 15, z: 30 },   // Star Cafe
        { x: -15, z: 50 },  // Memory Shop
        { x: 20, z: 70 },   // Love Bakery
        { x: -20, z: 20 },  // Dream Store
        { x: 25, z: 40 }    // Heart Boutique
    ];

    return (
        <group>
            {/* Main Avenue to Palace */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 40]} receiveShadow>
                <planeGeometry args={[12, 100]} />
                <meshStandardMaterial color="#333" roughness={0.8} />
            </mesh>

            {/* Main Road Center Line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 40]}>
                <planeGeometry args={[0.5, 90]} />
                <meshStandardMaterial color="#fff" />
            </mesh>

            {/* Connecting Roads to Each Shop */}
            {shopPositions.map((shop, i) => {
                // Determine if shop is on left or right of main road
                const isRight = shop.x > 0;
                const roadWidth = 6;
                const roadLength = Math.abs(shop.x) - 6; // Distance from main road edge to shop

                // Position road between main road and shop
                const roadX = isRight ? (6 + roadLength / 2) : (-6 - roadLength / 2);
                const roadZ = shop.z;

                return (
                    <group key={i}>
                        {/* Horizontal connecting road */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadX, 0.05, roadZ]} receiveShadow>
                            <planeGeometry args={[roadLength, roadWidth]} />
                            <meshStandardMaterial color="#444" roughness={0.8} />
                        </mesh>

                        {/* Road marking */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadX, 0.06, roadZ]}>
                            <planeGeometry args={[roadLength - 1, 0.3]} />
                            <meshStandardMaterial color="#fff" opacity={0.6} transparent />
                        </mesh>

                        {/* Intersection marker at main road */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[isRight ? 6 : -6, 0.07, roadZ]}>
                            <planeGeometry args={[2, 2]} />
                            <meshStandardMaterial color="#555" />
                        </mesh>
                    </group>
                );
            })}

            {/* Sidewalks along main road */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.04, 40]} receiveShadow>
                <planeGeometry args={[2, 100]} />
                <meshStandardMaterial color="#555" roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7, 0.04, 40]} receiveShadow>
                <planeGeometry args={[2, 100]} />
                <meshStandardMaterial color="#555" roughness={0.9} />
            </mesh>
        </group>
    );
};

export const ShopBuilding = ({ position, label, color = "#ff69b4", onClick }) => {
    // A distinct little shop/cafe model
    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
            {/* Base */}
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[8, 5, 8]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 5.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[6, 3, 4]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Awning */}
            <mesh position={[0, 3, 4.2]} rotation={[0.5, 0, 0]}>
                <boxGeometry args={[7, 0.2, 2]} />
                <meshStandardMaterial color={color === "#ff69b4" ? "white" : "gold"} />
            </mesh>
            {/* Signage */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                <Text
                    position={[0, 7, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="black"
                    rotation={[0, Math.PI, 0]} // Back side check? Standard is Front
                >
                    {label}
                </Text>
                <Text
                    position={[0, 7, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="black"
                >
                    {label}
                </Text>
            </Float>
            {/* Interactive Glow */}
            <pointLight position={[0, 3, 5]} distance={5} intensity={2} color="orange" />
        </group>
    );
};

export const GrassField = ({ count = 5000 }) => {
    // Simple blades of grass - optimized
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const r = 100 * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const scale = Math.random() * 0.5 + 0.5;
            const rotation = Math.random() * Math.PI * 2;
            temp.push({ x, z, scale, rotation });
        }
        return temp;
    }, [count]);

    // Set matrices ONCE on mount instead of every frame
    useEffect(() => {
        if (!meshRef.current) return;
        particles.forEach((p, i) => {
            dummy.position.set(p.x, 0, p.z);
            dummy.rotation.y = p.rotation;
            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [particles, dummy]);

    return (
        <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
            <coneGeometry args={[0.05, 0.4, 3]} />
            <meshStandardMaterial color="#228b22" roughness={0.8} />
        </instancedMesh>
    );
};

export const generateCityLayout = (count = 60) => {
    const items = [];

    // Memory shop positions - keep these areas clear
    const shopPositions = [
        { x: 15, z: 30 },   // Star Cafe
        { x: -15, z: 50 },  // Memory Shop
        { x: 20, z: 70 },   // Love Bakery
        { x: -20, z: 20 },  // Dream Store
        { x: 25, z: 40 }    // Heart Boutique
    ];

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 160;
        const z = (Math.random() - 0.5) * 160;

        // CLEARANCE LOGIC
        // Palace Clearance (Center)
        if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;

        // Road Clearance (Central Avenue to Palace)
        if (Math.abs(x) < 15 && z > -30 && z < 110) continue;

        // Memory Shop Clearance - 25 unit radius around each shop
        let tooCloseToShop = false;
        for (const shop of shopPositions) {
            const distance = Math.sqrt((x - shop.x) ** 2 + (z - shop.z) ** 2);
            if (distance < 25) {
                tooCloseToShop = true;
                break;
            }
        }
        if (tooCloseToShop) continue;

        // Connecting Roads Clearance
        for (const shop of shopPositions) {
            const isRight = shop.x > 0;
            const roadX = isRight ? (6 + Math.abs(shop.x) / 2) : (-6 - Math.abs(shop.x) / 2);
            // Clear area around connecting roads
            if (Math.abs(x - roadX) < 8 && Math.abs(z - shop.z) < 8) {
                tooCloseToShop = true;
                break;
            }
        }
        if (tooCloseToShop) continue;

        const type = Math.random();
        if (type > 0.6) {
            // Iconic buildings - properly grounded at y=0
            items.push({
                type: 'iconicBuilding',
                id: `bld-${i}`,
                position: [x, 0, z] as [number, number, number],
                seed: i + Math.random(), // For random building selection
                args: [0, 0, 0] as [number, number, number] // Not used for iconic buildings
            });
        } else if (type > 0.3) {
            items.push({ type: 'tree', id: `tree-${i}`, position: [x, 0, z] as [number, number, number] });
        } else {
            items.push({ type: 'lamp', id: `lamp-${i}`, position: [x, 0, z] as [number, number, number] });
        }
    }
    return items;
};

interface CityBlockProps {
    items: any[];
}

export const CityBlock: React.FC<CityBlockProps> = ({ items }) => {
    return (
        <group>
            {items.map((item) => {
                if (item.type === 'iconicBuilding') {
                    return <React.Fragment key={item.id}>{getRandomIconicBuilding(item.position, item.seed)}</React.Fragment>;
                } else if (item.type === 'building') {
                    return <ModernBuilding key={item.id} position={item.position} args={item.args} color={item.color} />;
                } else if (item.type === 'tree') {
                    return <RealisticTree key={item.id} position={item.position} />;
                } else {
                    return <StreetLamp key={item.id} position={item.position} />;
                }
            })}
        </group>
    );
};

// --- INHABITANTS ---
export const Inhabitants = ({ count = 20 }) => {
    const people = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 60,
            z: (Math.random() - 0.5) * 60,
            speed: Math.random() * 0.05 + 0.02,
            offset: Math.random() * 100
        }));
    }, [count]);

    return (
        <group>
            {people.map((person, i) => (
                <Person key={i} {...person} />
            ))}
        </group>
    );
};

const Person = ({ x, z, speed, offset }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            // Simple wandering logic
            const t = clock.elapsedTime * speed + offset;
            ref.current.position.x = x + Math.sin(t) * 10;
            ref.current.position.z = z + Math.cos(t * 0.8) * 10;
            ref.current.lookAt(
                x + Math.sin(t + 0.1) * 10,
                1,
                z + Math.cos((t + 0.1) * 0.8) * 10
            );
        }
    });

    return (
        <group ref={ref} position={[x, 1, z]}>
            <mesh position={[0, 0.5, 0]}>
                <capsuleGeometry args={[0.3, 1, 4]} />
                <meshStandardMaterial color="hotpink" />
            </mesh>
            <mesh position={[0, 1.2, 0.2]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};

// --- MEMORY LANDMARK ---
export const MemoryLandmark = ({ position, onClick, isCollected, label, isActive }) => {
    const ref = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current && !isCollected) {
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
            ref.current.rotation.y += 0.02;
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
        }
        if (glowRef.current) {
            glowRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* The Clickable Hitbox - Invisible but large */}
            <mesh onClick={onClick} visible={false}>
                <sphereGeometry args={[3]} /> {/* Large hitbox */}
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Visuals */}
            <group scale={isCollected ? 0.5 : 1}>
                {/* Core Crystal */}
                <mesh>
                    <octahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial
                        color={isCollected ? "gray" : "#FF1493"}
                        emissive={isCollected ? "black" : "#FF69B4"}
                        emissiveIntensity={isActive ? 2 : 0.5}
                        roughness={0}
                        metalness={0.8}
                    />
                </mesh>

                {/* Outer Glow Ring */}
                {!isCollected && (
                    <mesh ref={glowRef}>
                        <torusGeometry args={[2.5, 0.1, 8, 32]} />
                        <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} toneMapped={false} />
                    </mesh>
                )}
            </group>

            {!isCollected && (
                <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                    <Text
                        position={[0, 3.5, 0]}
                        fontSize={0.8}
                        color={isActive ? "yellow" : "white"}
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="black"
                    >
                        {label || "Memory Fragment"}
                    </Text>
                </Float>
            )}
        </group>
    );
};
