import React from 'react';
import * as THREE from 'three';

// Burj Khalifa inspired - Tall tapered tower
export const BurjKhalifaBuilding = ({ position, color = "#c0c0c0" }: { position: [number, number, number], color?: string }) => {
    const height = 120;
    return (
        <group position={[position[0], 0, position[2]]}>
            {/* Base */}
            <mesh position={[0, 15, 0]} castShadow>
                <boxGeometry args={[12, 30, 12]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Mid section */}
            <mesh position={[0, 50, 0]} castShadow>
                <boxGeometry args={[9, 40, 9]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Upper section */}
            <mesh position={[0, 85, 0]} castShadow>
                <boxGeometry args={[6, 30, 6]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Spire */}
            <mesh position={[0, 105, 0]} castShadow>
                <coneGeometry args={[3, 20, 4]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};

// London Tower inspired - Medieval castle style
export const LondonTowerBuilding = ({ position, color = "#8b7355" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            {/* Main tower */}
            <mesh position={[0, 20, 0]} castShadow>
                <boxGeometry args={[10, 40, 10]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Corner turrets */}
            {[[-5, 5], [5, 5], [-5, -5], [5, -5]].map((pos, i) => (
                <group key={i} position={[pos[0], 0, pos[1]]}>
                    <mesh position={[0, 22, 0]} castShadow>
                        <cylinderGeometry args={[2, 2, 44, 8]} />
                        <meshStandardMaterial color={color} roughness={0.8} />
                    </mesh>
                    {/* Turret top */}
                    <mesh position={[0, 46, 0]} castShadow>
                        <coneGeometry args={[2.5, 4, 8]} />
                        <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// Empire State Building inspired
export const EmpireStateBuilding = ({ position, color = "#d4af37" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            {/* Base */}
            <mesh position={[0, 12, 0]} castShadow>
                <boxGeometry args={[14, 24, 14]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Mid */}
            <mesh position={[0, 42, 0]} castShadow>
                <boxGeometry args={[11, 36, 11]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Top */}
            <mesh position={[0, 70, 0]} castShadow>
                <boxGeometry args={[8, 20, 8]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Spire */}
            <mesh position={[0, 85, 0]} castShadow>
                <cylinderGeometry args={[1, 2, 15, 8]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};

// Modern Glass Skyscraper
export const GlassSkyscraper = ({ position, color = "#4a90e2" }: { position: [number, number, number], color?: string }) => {
    const height = 80;
    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh position={[0, height / 2, 0]} castShadow>
                <boxGeometry args={[10, height, 10]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.9}
                    roughness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            {/* Window grid effect */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[0, (i + 1) * 9, 5.1]} castShadow>
                    <planeGeometry args={[9, 0.3]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            ))}
        </group>
    );
};

// Twisted Tower (Shanghai Tower inspired)
export const TwistedTower = ({ position, color = "#6a5acd" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh
                    key={i}
                    position={[0, i * 8 + 4, 0]}
                    rotation={[0, (i * Math.PI) / 20, 0]}
                    castShadow
                >
                    <boxGeometry args={[10 - i * 0.5, 8, 10 - i * 0.5]} />
                    <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
                </mesh>
            ))}
        </group>
    );
};

// Pyramid Building
export const PyramidBuilding = ({ position, color = "#daa520" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh position={[0, 25, 0]} castShadow>
                <coneGeometry args={[20, 50, 4]} />
                <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
            </mesh>
        </group>
    );
};

// Cylindrical Tower
export const CylindricalTower = ({ position, color = "#ff6b6b" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh position={[0, 35, 0]} castShadow>
                <cylinderGeometry args={[6, 8, 70, 16]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Top dome */}
            <mesh position={[0, 72, 0]} castShadow>
                <sphereGeometry args={[7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
        </group>
    );
};

// Asian Pagoda Style
export const PagodaTower = ({ position, color = "#dc143c" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            {Array.from({ length: 5 }).map((_, i) => (
                <group key={i} position={[0, i * 12, 0]}>
                    {/* Floor */}
                    <mesh position={[0, 4, 0]} castShadow>
                        <boxGeometry args={[8 - i * 0.8, 8, 8 - i * 0.8]} />
                        <meshStandardMaterial color={color} roughness={0.7} />
                    </mesh>
                    {/* Roof */}
                    <mesh position={[0, 9, 0]} castShadow>
                        <coneGeometry args={[6 - i * 0.6, 3, 4]} />
                        <meshStandardMaterial color="#2c1810" roughness={0.8} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// Art Deco Building
export const ArtDecoBuilding = ({ position, color = "#20b2aa" }: { position: [number, number, number], color?: string }) => {
    return (
        <group position={[position[0], 0, position[2]]}>
            {/* Base */}
            <mesh position={[0, 10, 0]} castShadow>
                <boxGeometry args={[12, 20, 12]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* Stepped sections */}
            <mesh position={[0, 28, 0]} castShadow>
                <boxGeometry args={[10, 16, 10]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            <mesh position={[0, 42, 0]} castShadow>
                <boxGeometry args={[8, 12, 8]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* Top */}
            <mesh position={[0, 52, 0]} castShadow>
                <boxGeometry args={[6, 8, 6]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
        </group>
    );
};

// Random building selector
export const getRandomIconicBuilding = (position: [number, number, number], seed: number) => {
    const buildings = [
        BurjKhalifaBuilding,
        LondonTowerBuilding,
        EmpireStateBuilding,
        GlassSkyscraper,
        TwistedTower,
        PyramidBuilding,
        CylindricalTower,
        PagodaTower,
        ArtDecoBuilding
    ];

    const colors = [
        "#c0c0c0", // Silver
        "#8b7355", // Brown
        "#d4af37", // Gold
        "#4a90e2", // Blue
        "#6a5acd", // Slate Blue
        "#daa520", // Goldenrod
        "#ff6b6b", // Red
        "#dc143c", // Crimson
        "#20b2aa", // Light Sea Green
        "#9370db", // Medium Purple
        "#ff8c00", // Dark Orange
        "#4682b4"  // Steel Blue
    ];

    const buildingIndex = Math.floor(seed * buildings.length) % buildings.length;
    const colorIndex = Math.floor(seed * 17 * colors.length) % colors.length;

    const Building = buildings[buildingIndex];
    const color = colors[colorIndex];

    return <Building position={position} color={color} />;
};
