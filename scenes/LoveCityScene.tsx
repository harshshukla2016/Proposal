
import React, { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, Environment, Sky, PointerLockControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

import { LovePalace, CityBlock, Inhabitants, MemoryLandmark, River, Mountains, GrassField, Road, ShopBuilding, generateCityLayout } from './CityAssets';
import LoadingScreen from '../components/LoadingScreen';
import ProposalUI from '../components/ProposalUI';
import { MemoryFrame } from './MemoryFrame';

import { useStore } from '../hooks/useStore';
import { GamePhase, MemoryCrystal as MemoryType } from '../types';
// import { speakText } from '../services/ttsService';
import { generateAstroGlowNarrative } from '../services/geminiService';
import { updateCrystalCollectedStatus } from '../services/apiService';

// --- CONTROLS ---
const SceneMemoryFrame = ({ memory, onClose }: { memory: MemoryType, onClose: () => void }) => {
    const { camera } = useThree();

    // Capture position once when memory changes
    const [spawnPos, spawnQuat] = React.useMemo(() => {
        const vec = new THREE.Vector3(0, 0, -3.5).applyMatrix4(camera.matrixWorld);
        const quat = camera.quaternion.clone();
        console.log("📍 Spawning Memory Frame at:", vec);
        return [vec, quat];
    }, [memory.id]); // Only re-calc if memory ID changes

    return (
        <group position={spawnPos} quaternion={spawnQuat}>
            <MemoryFrame
                imageUrl={memory.image_url}
                caption={memory.caption_text}
                onClose={onClose}
            />
        </group>
    );
};

const CityControls = ({ onInteract, disabled, buildings = [] }) => {
    const { camera, scene, gl } = useThree();
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
    const raycaster = useRef(new THREE.Raycaster());

    useEffect(() => {
        if (disabled) {
            setKeys({ w: false, a: false, s: false, d: false });
            document.exitPointerLock(); // Explicitly unlock cursor
            return;
        }

        const handleDown = (e) => {
            const k = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(k)) setKeys(p => ({ ...p, [k]: true }));
        };
        const handleUp = (e) => {
            const k = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(k)) setKeys(p => ({ ...p, [k]: false }));
        };
        const handleClick = () => {
            if (disabled) return;
            // Raycast from center
            if (document.pointerLockElement) {
                raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
                const intersects = raycaster.current.intersectObjects(scene.children, true);

                // Find first interactable memory object
                for (let hit of intersects) {
                    let obj = hit.object;
                    while (obj) {
                        if (obj.userData && obj.userData.isMemory) {
                            onInteract(obj.userData.memory);
                            return;
                        }
                        obj = obj.parent;
                    }
                    if (hit.distance > 15) break;
                }
            }
        };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        window.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            window.removeEventListener('mousedown', handleClick);
        };
    }, [camera, scene, onInteract, disabled]);

    useFrame((state, delta) => {
        if (disabled) return;

        const speed = 15 * delta;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        // Standard First Person Controls: Right is Cross(Direction, Up)
        right.crossVectors(direction, camera.up).normalize();

        const moveVec = new THREE.Vector3();
        if (keys.w) moveVec.add(direction);
        if (keys.s) moveVec.add(direction.clone().negate());
        if (keys.d) moveVec.add(right);
        if (keys.a) moveVec.add(right.clone().negate());

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(speed);
            const nextPos = camera.position.clone().add(moveVec);

            // COLLISION DETECTION
            let collided = false;
            const playerRadius = 1.5; // Avoid getting too close to walls

            for (const b of buildings) {
                // Building bounds
                // position is center [x, y, z]
                // args is [width, height, depth]
                const bx = b.position[0];
                const bz = b.position[2];
                const halfWidth = b.args[0] / 2 + playerRadius;
                const halfDepth = b.args[2] / 2 + playerRadius;

                // Check AABB
                if (
                    nextPos.x > bx - halfWidth &&
                    nextPos.x < bx + halfWidth &&
                    nextPos.z > bz - halfDepth &&
                    nextPos.z < bz + halfDepth
                ) {
                    collided = true;
                    break;
                }
            }

            if (!collided) {
                camera.position.add(moveVec);
            }
        }

        // Height clamping
        camera.position.y = Math.max(2, Math.min(camera.position.y, 50));

        // Bounds clamping (City Limits)
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -80, 80);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -80, 80);
    });

    return !disabled ? <PointerLockControls selector="#root" /> : null;
};

import { CastleInterior } from './CastleInterior';

// ... (existing imports)

// --- MINI MAP COMPONENT ---
const MiniMap = ({
    playerPosition,
    memories,
    palacePosition,
    playerRotation = 0
}: {
    playerPosition: { x: number, z: number },
    memories: MemoryType[],
    palacePosition: [number, number, number],
    playerRotation?: number
}) => {
    // Map constants - GTA V style
    const MAP_SIZE = 220; // Slightly larger for better visibility
    const CITY_SIZE = 160; // World units
    const SCALE = MAP_SIZE / CITY_SIZE;

    // Shop locations (matching the positions in the scene)
    const shopLocations = [
        { pos: [15, 30], label: "Star Cafe", color: "#ff69b4", icon: "☕" },
        { pos: [-15, 50], label: "Memory Shop", color: "#00bfff", icon: "🏪" },
        { pos: [20, 70], label: "Love Bakery", color: "#ffd700", icon: "🍰" },
        { pos: [-20, 20], label: "Dream Store", color: "#9370db", icon: "💭" },
        { pos: [25, 40], label: "Heart Boutique", color: "#ff1493", icon: "💝" }
    ];

    // Convert world coord to map coord (centered)
    const toMapX = (val: number) => (val * SCALE) + (MAP_SIZE / 2);
    const toMapY = (val: number) => (val * SCALE) + (MAP_SIZE / 2);

    return (
        <div style={{
            position: 'fixed', // Changed to fixed for true screen lock
            top: '20px',
            right: '20px',
            width: `${MAP_SIZE}px`,
            height: `${MAP_SIZE}px`,
            backgroundColor: 'rgba(5, 5, 15, 0.92)', // Darker, more opaque
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 99999, // Maximum z-index
            boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
            pointerEvents: 'none' // Allow clicking through
        }}>
            {/* Background Grid/Radar effect - GTA V style */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(0deg, transparent 24%, rgba(100, 200, 255, .15) 25%, rgba(100, 200, 255, .15) 26%, transparent 27%, transparent 74%, rgba(100, 200, 255, .15) 75%, rgba(100, 200, 255, .15) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(100, 200, 255, .15) 25%, rgba(100, 200, 255, .15) 26%, transparent 27%, transparent 74%, rgba(100, 200, 255, .15) 75%, rgba(100, 200, 255, .15) 76%, transparent 77%)',
                backgroundSize: '40px 40px',
                opacity: 0.6
            }} />

            {/* Center crosshair */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '20px',
                height: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)'
            }} />

            {/* Roads on Map */}
            {/* Main Avenue */}
            <div style={{
                position: 'absolute',
                left: `${toMapX(0)}px`,
                top: `${toMapY(40)}px`,
                width: `${12 * SCALE}px`,
                height: `${100 * SCALE}px`,
                backgroundColor: 'rgba(80, 80, 80, 0.6)',
                transform: 'translate(-50%, -50%)',
                border: '1px solid rgba(100, 100, 100, 0.4)',
                zIndex: 1
            }} />

            {/* Connecting Roads to Shops */}
            {shopLocations.map((shop, i) => {
                const isRight = shop.pos[0] > 0;
                const roadLength = Math.abs(shop.pos[0]) - 6;
                const roadX = isRight ? (6 + roadLength / 2) : (-6 - roadLength / 2);

                return (
                    <div key={`road-${i}`} style={{
                        position: 'absolute',
                        left: `${toMapX(roadX)}px`,
                        top: `${toMapY(shop.pos[1])}px`,
                        width: `${roadLength * SCALE}px`,
                        height: `${6 * SCALE}px`,
                        backgroundColor: 'rgba(90, 90, 90, 0.5)',
                        transform: 'translate(-50%, -50%)',
                        border: '1px solid rgba(110, 110, 110, 0.3)',
                        zIndex: 1
                    }} />
                );
            })}

            {/* Palace Marker - Enhanced */}
            <div style={{
                position: 'absolute',
                left: `${toMapX(palacePosition[0])}px`,
                top: `${toMapY(palacePosition[2])}px`,
                width: '20px',
                height: '20px',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#FFD700',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.8), 0 0 5px rgba(255, 215, 0, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                }}>
                    👑
                </div>
            </div>

            {/* Shop Markers - GTA V style */}
            {shopLocations.map((shop, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${toMapX(shop.pos[0])}px`,
                    top: `${toMapY(shop.pos[1])}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5
                }}>
                    {/* Shop icon background */}
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: shop.color,
                        borderRadius: '3px',
                        border: '1.5px solid white',
                        boxShadow: `0 0 8px ${shop.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold'
                    }}>
                        {shop.icon}
                    </div>
                    {/* Shop label on hover */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-18px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        fontSize: '8px',
                        color: 'white',
                        textShadow: '0 0 3px black',
                        fontWeight: 'bold',
                        opacity: 0.8
                    }}>
                        {shop.label}
                    </div>
                </div>
            ))}

            {/* Memory Markers - Smaller, less prominent */}
            {memories.map((m, i) => {
                const shopPos = shopLocations[i % shopLocations.length];
                return (
                    <div key={m.id} style={{
                        position: 'absolute',
                        left: `${toMapX(shopPos.pos[0])}px`,
                        top: `${toMapY(shopPos.pos[1])}px`,
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#00ffff',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 6px cyan',
                        zIndex: 4,
                        animation: 'pulse 2s infinite'
                    }} />
                );
            })}

            {/* Player Marker (Arrow) - Rotates with player */}
            <div style={{
                position: 'absolute',
                left: `${toMapX(playerPosition.x)}px`,
                top: `${toMapY(playerPosition.z)}px`,
                transform: `translate(-50%, -50%) rotate(${playerRotation}rad)`,
                zIndex: 20
            }}>
                {/* Background pulse circle */}
                <div style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'playerPulse 1.5s infinite'
                }} />
                {/* Arrow */}
                <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '16px solid white',
                    filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 0 2px rgba(255,255,255,0.5))',
                    position: 'relative'
                }} />
            </div>

            {/* Map Label - GTA V style */}
            <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textShadow: '0 0 3px black',
                letterSpacing: '1px'
            }}>
                LOVE CITY
            </div>

            {/* Coordinates display */}
            <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'monospace',
                textShadow: '0 0 2px black'
            }}>
                {Math.round(playerPosition.x)}, {Math.round(playerPosition.z)}
            </div>

            {/* Add pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
                }
                @keyframes playerPulse {
                    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.4); }
                }
            `}</style>
        </div>
    );
};

// --- MAIN SCENE CONTENT ---
const LoveCityContent = ({ setMapData }: {
    setMapData: React.Dispatch<React.SetStateAction<{
        playerPosition: { x: number; z: number };
        playerRotation: number;
        memories: MemoryType[];
        palacePosition: [number, number, number];
    }>>
}) => {
    const { proposalData, gamePhase, setGamePhase, collectedCrystalIds, addCollectedCrystal, setCurrentNarrative, currentNarrative } = useStore();
    const [activeMemory, setActiveMemory] = useState<MemoryType | null>(null);
    const [aimedMemoryId, setAimedMemoryId] = useState<string | null>(null);
    const [isInsideCastle, setIsInsideCastle] = useState(false);

    // Player Position State for Minimap
    const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
    const [playerRotation, setPlayerRotation] = useState(0);

    // Generate City Layout ONCE
    const cityItems = React.useMemo(() => generateCityLayout(60), []);
    const buildings = React.useMemo(() => cityItems.filter(i => i.type === 'building'), [cityItems]);

    // Raycaster for hover effect in center of screen
    const { camera, scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());

    // Debug Data
    useEffect(() => {
        if (proposalData) {
            console.log("🔥 Loaded Proposal Data:", proposalData);
            if (proposalData.gallery_images && proposalData.gallery_images.length > 0) {
                console.log("🖼️ Gallery Images Found:", proposalData.gallery_images);
            } else {
                console.warn("⚠️ No Gallery Images Found in proposalData");
            }
            if (proposalData.memories && proposalData.memories.length > 0) {
                console.log("💎 Memories Found:", proposalData.memories);
            } else {
                console.warn("⚠️ No Memories Found in proposalData");
            }
        }
    }, [proposalData]);

    useFrame(() => {
        // Always update map position when not inside castle
        if (!isInsideCastle) {
            const newPos = { x: camera.position.x, z: camera.position.z };
            setPlayerPos(newPos);

            // Get camera rotation (Y-axis for top-down map)
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const rotation = Math.atan2(direction.x, direction.z);
            setPlayerRotation(rotation);

            // Update external map data
            setMapData({
                playerPosition: newPos,
                playerRotation: rotation,
                memories: proposalData?.memories || [],
                palacePosition: [0, 0, 0]
            });
        }

        // Raycasting for memory interaction (only during PLAYING phase)
        if (gamePhase === GamePhase.PLAYING && !isInsideCastle) {
            raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.current.intersectObjects(scene.children, true);
            let found = null;
            for (let hit of intersects) {
                if (hit.distance > 20) break;
                let obj = hit.object;
                while (obj) {
                    if (obj.userData && obj.userData.isMemory) {
                        found = obj.userData.memory.id;
                        break;
                    }
                    obj = obj.parent;
                }
                if (found) break;
            }
            if (found !== aimedMemoryId) setAimedMemoryId(found);
        }
    });

    // ... (rest of audio and listeners)
    const [audio] = useState(new Audio());

    // Initial Welcome
    useEffect(() => {
        if (proposalData && gamePhase === GamePhase.PLAYING && !currentNarrative) {
            const welcome = `Welcome to the City of Eternal Love, ${proposalData.partner_name}. Use W, A, S, D to explore the avenues. Click anywhere to look around.`;
            setCurrentNarrative(welcome);
        }
    }, [proposalData, gamePhase]);

    const handleLandmarkInteract = useCallback(async (memory: MemoryType) => {
        if (collectedCrystalIds.has(memory.id)) return;

        setActiveMemory(memory);
        addCollectedCrystal(memory.id);

        const narration = await generateAstroGlowNarrative(memory.caption_text, proposalData?.partner_name || "Beloved");
        setCurrentNarrative(narration);

        if (collectedCrystalIds.size + 1 === proposalData?.memories.length) {
            setGamePhase(GamePhase.REVEAL);
        }

        updateCrystalCollectedStatus(memory.id, true);
    }, [collectedCrystalIds, addCollectedCrystal, proposalData, setGamePhase, setCurrentNarrative]);

    // Finale Sequence
    useEffect(() => {
        if (gamePhase === GamePhase.REVEAL) {
            setCurrentNarrative("The memories are united. The Palace Gates open for the final question...");
            setGamePhase(GamePhase.PROPOSAL);
        }
    }, [gamePhase, setGamePhase]);

    const handleEnterCastle = useCallback(() => {
        setIsInsideCastle(true);
        document.exitPointerLock();

        // Play Romantic Song
        if (proposalData?.music_url) {
            audio.src = proposalData.music_url;
            audio.loop = true;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }, [proposalData, audio]);

    const handleAcceptProposal = () => {
        setGamePhase(GamePhase.FINALE);
        setIsInsideCastle(false); // Return to city
        setCurrentNarrative("Welcome home, forever. The city is yours to explore.");
    };

    if (!proposalData) return null;

    if (isInsideCastle) {
        return (
            <>
                <color attach="background" args={['#000']} />
                <CastleInterior
                    proposalText={proposalData.proposal_text || "Will you marry me?"}
                    musicUrl={proposalData.music_url}
                    musicStartTime={proposalData.music_start_time}
                    videoUrl={proposalData.video_url}
                    onComplete={() => setGamePhase(GamePhase.PROPOSAL)}
                    onExit={() => setIsInsideCastle(false)}
                />
            </>
        );
    }

    return (
        <>
            {/* UI Overlay - Consolidated */}
            <Html fullscreen style={{ pointerEvents: 'none', zIndex: 10 }}>
                {/* Title & Info - Top Left */}
                <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl pointer-events-auto">
                    <h2 className="font-serif text-2xl text-pink-300 tracking-widest">NEO-LOVE CITY</h2>
                    <p className="text-xs font-mono opacity-70">SECTOR: MEMORY CORE</p>
                    <p className="text-xs mt-1 opacity-50">Phase: {gamePhase}</p>
                </div>

                {/* Controls HUD - Bottom Right */}
                <div className="absolute bottom-4 right-4 p-5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-2xl pointer-events-none max-w-xs transition-opacity duration-1000">
                    <h3 className="text-pink-300 font-bold mb-3 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="text-xl">💠</span> CONTROLS
                    </h3>
                    <ul className="text-xs md:text-sm space-y-2 text-gray-100 font-light font-mono">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-pulse"></span>
                            <span><strong>CLICK</strong> :: ENGAGE VIEW</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
                            <span><strong>W S A D</strong> :: NAVIGATE</span>
                        </li>
                    </ul>
                </div>

                {/* Narrative Subtitles - Bottom Center */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl text-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm p-6 rounded-2xl border-t border-pink-500/50 inline-block">
                        <p className="text-xl md:text-2xl font-light text-pink-100 italic">
                            "{currentNarrative}"
                        </p>
                    </div>
                </div>
            </Html>

            <CityControls onInteract={handleLandmarkInteract} disabled={!!activeMemory || isInsideCastle} buildings={buildings} />

            {/* Lights & Atmosphere */}
            <color attach="background" args={['#87CEEB']} />
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[100, 100, 50]}
                intensity={2.5}
                color="#ffffdd"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <Sky sunPosition={[100, 100, 50]} turbidity={8} rayleigh={3} />
            <fogExp2 attach="fog" args={['#cce0ff', 0.002]} />

            {/* The City */}
            <LovePalace position={[0, 0, 0]} onClick={handleEnterCastle} />
            <CityBlock items={cityItems} />
            <Inhabitants count={15} />
            <River />
            <Mountains />
            <Road />

            {/* Ground Cover */}
            <GrassField count={3000} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#3a5a40" roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Extended Ground Plane for Horizon */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <planeGeometry args={[2000, 2000]} />
                <meshBasicMaterial color="#2d4a3e" />
            </mesh>

            {/* Memory Landmarks - Fixed Locations (Shops/Cafes) */}
            {(gamePhase === GamePhase.PLAYING || gamePhase === GamePhase.REVEAL || gamePhase === GamePhase.FINALE) && proposalData.memories.map((mem, i) => {
                // Fixed positions for 5 memories along the road/city
                const positions = [
                    { pos: [15, 0, 30], label: "Star Cafe", color: "#ff69b4" },
                    { pos: [-15, 0, 50], label: "Memory Shop", color: "#00bfff" },
                    { pos: [20, 0, 70], label: "Love Bakery", color: "#ffd700" },
                    { pos: [-20, 0, 20], label: "Dream Store", color: "#9370db" },
                    { pos: [25, 0, 40], label: "Heart Boutique", color: "#ff1493" }
                ];

                const loc = positions[i % positions.length];
                const x = loc.pos[0];
                const z = loc.pos[2];

                return (
                    <group key={mem.id} userData={{ isMemory: true, memory: mem }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLandmarkInteract(mem);
                        }}
                    >
                        {/* The Shop Building interacting as the memory holder */}
                        <ShopBuilding
                            position={[x, 0, z]}
                            label={loc.label}
                            color={loc.color}
                            onClick={() => handleLandmarkInteract(mem)}
                        />

                        {/* Floating Marker above shop */}
                        <MemoryLandmark
                            position={[x, 10, z]}
                            isCollected={collectedCrystalIds.has(mem.id)}
                            isActive={aimedMemoryId === mem.id}
                            label={collectedCrystalIds.has(mem.id) ? "Visited" : "New Memory"}
                            onClick={() => handleLandmarkInteract(mem)}
                        />
                    </group>
                );
            })}

            {/* Active Memory 3D Frame */}
            {activeMemory && (
                <SceneMemoryFrame
                    key={activeMemory.id}
                    memory={activeMemory}
                    onClose={() => setActiveMemory(null)}
                />
            )}

            {gamePhase === GamePhase.PROPOSAL && (
                <Html fullscreen style={{ pointerEvents: 'auto' }}>
                    <ProposalUI onAccept={handleAcceptProposal} />
                </Html>
            )}

            <EffectComposer>
                <Bloom luminanceThreshold={0.5} intensity={1.2} radius={0.4} mipmapBlur />
                <Vignette eskil={false} offset={0.1} darkness={0.6} />
            </EffectComposer>
        </>
    );
};




export default function LoveCityScene() {
    const [mapData, setMapData] = useState({
        playerPosition: { x: 0, z: 0 },
        playerRotation: 0,
        memories: [] as MemoryType[],
        palacePosition: [0, 0, 0] as [number, number, number]
    });

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* MiniMap - Outside Canvas for true fixed positioning */}
            <MiniMap
                playerPosition={mapData.playerPosition}
                memories={mapData.memories}
                palacePosition={mapData.palacePosition}
                playerRotation={mapData.playerRotation}
            />

            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [0, 5, 30], fov: 60, near: 0.1, far: 3000 }}
                gl={{ logarithmicDepthBuffer: true, antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Suspense fallback={<Html><LoadingScreen message="Rendering High-Fidelity Neural City..." /></Html>}>
                    <LoveCityContent setMapData={setMapData} />
                </Suspense>
            </Canvas>
        </div>
    );
}

