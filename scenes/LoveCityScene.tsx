
import React, { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { MobileJoystick } from '../components/MobileJoystick';
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

// Mobile Helper
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const CityControls = ({ onInteract, disabled, buildings = [], mobileMoveRef }: {
    onInteract: (m: any) => void,
    disabled: boolean,
    buildings: any[],
    mobileMoveRef?: React.MutableRefObject<{ x: number, y: number }>
}) => {
    const { camera, scene, gl } = useThree();
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
    const raycaster = useRef(new THREE.Raycaster());
    const isMobile = useRef(isMobileDevice());

    // Mobile Look State
    const touchLook = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        if (disabled) {
            setKeys({ w: false, a: false, s: false, d: false });
            if (!isMobile.current) document.exitPointerLock();
            return;
        }

        // --- DESKTOP LISTENERS ---
        const handleDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(k)) setKeys(p => ({ ...p, [k]: true }));
        };
        const handleUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(k)) setKeys(p => ({ ...p, [k]: false }));
        };

        // --- SHARED CLICK/TAP LISTENERS ---
        const handleClick = (e: MouseEvent | TouchEvent) => {
            if (disabled) return;

            // For Mobile: Only interact if tap is clearly NOT a drag
            // (Simplified: Just raycast center)

            raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.current.intersectObjects(scene.children, true);

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
        };

        // --- MOBILE LOOK LISTENERS ---
        const handleTouchStart = (e: TouchEvent) => {
            // Only look with right side of screen
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.clientX > window.innerWidth / 2) {
                    touchLook.current.x = touch.clientX;
                    touchLook.current.y = touch.clientY;
                    touchLook.current.active = true;
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchLook.current.active) return;
            e.preventDefault(); // Prevent scroll

            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                // If this touch started on right side (simplified check)
                if (touch.clientX > window.innerWidth / 3) {
                    const dx = touch.clientX - touchLook.current.x;
                    const dy = touch.clientY - touchLook.current.y;

                    // Rotate Camera
                    const sensitivity = 0.005;
                    camera.rotation.y -= dx * sensitivity;
                    // camera.rotation.x -= dy * sensitivity; // Optional pitch

                    touchLook.current.x = touch.clientX;
                    touchLook.current.y = touch.clientY;
                }
            }
        };

        const handleTouchEnd = () => {
            touchLook.current.active = false;
        };

        if (isMobile.current) {
            const dom = gl.domElement;
            dom.addEventListener('touchstart', handleTouchStart, { passive: false });
            dom.addEventListener('touchmove', handleTouchMove, { passive: false });
            dom.addEventListener('touchend', handleTouchEnd);
            // Add click for interaction via tap
            dom.addEventListener('click', handleClick); // Might conflict, rely on UI button?
        } else {
            window.addEventListener('keydown', handleDown);
            window.addEventListener('keyup', handleUp);
            window.addEventListener('mousedown', handleClick);
        }

        return () => {
            if (isMobile.current) {
                const dom = gl.domElement;
                dom.removeEventListener('touchstart', handleTouchStart);
                dom.removeEventListener('touchmove', handleTouchMove);
                dom.removeEventListener('touchend', handleTouchEnd);
                dom.removeEventListener('click', handleClick);
            } else {
                window.removeEventListener('keydown', handleDown);
                window.removeEventListener('keyup', handleUp);
                window.removeEventListener('mousedown', handleClick);
            }
        };
    }, [camera, scene, onInteract, disabled, gl]);

    useFrame((state, delta) => {
        if (disabled) return;

        const speed = 15 * delta;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction, camera.up).normalize();

        const moveVec = new THREE.Vector3();

        // KEYBOARD INPUT
        if (keys.w) moveVec.add(direction);
        if (keys.s) moveVec.add(direction.clone().negate());
        if (keys.d) moveVec.add(right);
        if (keys.a) moveVec.add(right.clone().negate());

        // MOBILE JOYSTICK INPUT
        if (mobileMoveRef && mobileMoveRef.current) {
            const { x, y } = mobileMoveRef.current; // x=right/left, y=up/down
            if (y > 0) moveVec.add(direction.clone().multiplyScalar(y)); // Forward
            if (y < 0) moveVec.add(direction.clone().multiplyScalar(Math.abs(y)).negate()); // Backward
            if (x > 0) moveVec.add(right.clone().multiplyScalar(x)); // Right
            if (x < 0) moveVec.add(right.clone().multiplyScalar(Math.abs(x)).negate()); // Left
        }

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(speed);
            const nextPos = camera.position.clone().add(moveVec);

            // COLLISION DETECTION
            let collided = false;
            const playerRadius = 1.5;

            for (const b of buildings) {
                const bx = b.position[0];
                const bz = b.position[2];
                const halfWidth = b.args[0] / 2 + playerRadius;
                const halfDepth = b.args[2] / 2 + playerRadius;

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

        // Height & Bounds clamping
        camera.position.y = Math.max(2, Math.min(camera.position.y, 50));
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -80, 80);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -80, 80);
    });

    return (!disabled && !isMobile.current) ? <PointerLockControls selector="#root" /> : null;
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
    // Detect mobile for responsive sizing
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Map constants - GTA V style (smaller on mobile)
    const MAP_SIZE = isMobile ? 140 : 220; // Smaller on mobile
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
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px',
            width: `${MAP_SIZE}px`,
            height: `${MAP_SIZE}px`,
            backgroundColor: 'rgba(5, 5, 15, 0.92)', // Darker, more opaque
            border: `${isMobile ? 2 : 3}px solid rgba(255, 255, 255, 0.3)`,
            borderRadius: isMobile ? '8px' : '12px',
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
const LoveCityContent = ({ setMapData, mobileMoveRef, setIsInsideCastle, isMobile, isInsideCastle }: {
    setMapData: React.Dispatch<React.SetStateAction<{
        playerPosition: { x: number; z: number };
        playerRotation: number;
        memories: MemoryType[];
        palacePosition: [number, number, number];
    }>>;
    mobileMoveRef: React.MutableRefObject<{ x: number; y: number }>;
    setIsInsideCastle: React.Dispatch<React.SetStateAction<boolean>>;
    isMobile: React.MutableRefObject<boolean>;
    isInsideCastle: boolean;
}) => {
    const { proposalData, gamePhase, setGamePhase, collectedCrystalIds, addCollectedCrystal, setCurrentNarrative, currentNarrative } = useStore();
    const [activeMemory, setActiveMemory] = useState<MemoryType | null>(null);
    const [aimedMemoryId, setAimedMemoryId] = useState<string | null>(null);
    // isInsideCastle, isMobile, and mobileMoveRef now come from props

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
            const welcome = isMobile.current
                ? `Welcome, ${proposalData.partner_name}. Use the joystick to move and drag right side to look.`
                : `Welcome, ${proposalData.partner_name}. Use W, A, S, D to explore. Click to look around.`;
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
        if (!isMobile.current) document.exitPointerLock();

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
                {!isMobile.current && (
                    <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl pointer-events-auto">
                        <h2 className="font-serif text-2xl text-pink-300 tracking-widest">NEO-LOVE CITY</h2>
                        <p className="text-xs font-mono opacity-70">SECTOR: MEMORY CORE</p>
                        <p className="text-xs mt-1 opacity-50">Phase: {gamePhase}</p>
                    </div>
                )}

                {/* Mobile Title - Smaller */}
                {isMobile.current && (
                    <div className="absolute top-2 left-2 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white shadow-xl pointer-events-auto origin-top-left scale-75">
                        <h2 className="font-serif text-lg text-pink-300 tracking-widest">NEO-LOVE CITY</h2>
                    </div>
                )}

                {/* Controls HUD - Bottom Right */}
                {!isMobile.current && (
                    <div className="absolute bottom-4 right-4 p-5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-2xl pointer-events-none max-w-xs transition-opacity duration-1000">
                        <h3 className="text-pink-300 font-bold mb-3 text-sm uppercase tracking-widest flex items-center gap-2">
                            <span className="text-xl">💠</span> CONTROLS
                        </h3>
                        <ul className="text-xs md:text-sm space-y-2 text-gray-100 font-light font-mono">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-pulse"></span>
                                <span><b>W, A, S, D</b> / Arrows to Move</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                                <span><b>Mouse</b> to Look Around</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                                <span><b>Click</b> on Crystals to Collect</span>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Mobile Joystick - Now rendered outside Canvas */}



                {/* Narrative Subtitles - Bottom Center */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl text-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm p-6 rounded-2xl border-t border-pink-500/50 inline-block">
                        <p className="text-xl md:text-2xl font-light text-pink-100 italic">
                            "{currentNarrative}"
                        </p>
                    </div>
                </div>
            </Html >

            <CityControls
                onInteract={handleLandmarkInteract}
                disabled={!!activeMemory || isInsideCastle}
                buildings={buildings}
                mobileMoveRef={mobileMoveRef}
            />

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
            {
                (gamePhase === GamePhase.PLAYING || gamePhase === GamePhase.REVEAL || gamePhase === GamePhase.FINALE) && proposalData.memories.map((mem, i) => {
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
                })
            }

            {/* Active Memory 3D Frame */}
            {
                activeMemory && (
                    <SceneMemoryFrame
                        key={activeMemory.id}
                        memory={activeMemory}
                        onClose={() => setActiveMemory(null)}
                    />
                )
            }

            {
                gamePhase === GamePhase.PROPOSAL && (
                    <Html fullscreen style={{ pointerEvents: 'auto' }}>
                        <ProposalUI onAccept={handleAcceptProposal} />
                    </Html>
                )
            }

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

    // Mobile controls state - lifted to parent so joystick can be outside Canvas
    const isMobile = useRef(isMobileDevice());
    const mobileMoveRef = useRef({ x: 0, y: 0 });
    const [isInsideCastle, setIsInsideCastle] = useState(false);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* MiniMap - Outside Canvas for true fixed positioning */}
            <MiniMap
                playerPosition={mapData.playerPosition}
                memories={mapData.memories}
                palacePosition={mapData.palacePosition}
                playerRotation={mapData.playerRotation}
            />

            {/* Mobile Joystick - Outside Canvas for true fixed positioning */}
            {isMobile.current && !isInsideCastle && (
                <>
                    <MobileJoystick moveRef={mobileMoveRef} />
                    <div className="fixed bottom-10 right-10 text-white/50 text-sm font-bold pointer-events-none z-50">
                        DRAG HERE TO LOOK
                    </div>
                </>
            )}

            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [0, 5, 30], fov: 60, near: 0.1, far: 3000 }}
                gl={{ logarithmicDepthBuffer: true, antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Suspense fallback={<Html><LoadingScreen message="Rendering High-Fidelity Neural City..." /></Html>}>
                    <LoveCityContent
                        setMapData={setMapData}
                        mobileMoveRef={mobileMoveRef}
                        setIsInsideCastle={setIsInsideCastle}
                        isMobile={isMobile}
                        isInsideCastle={isInsideCastle}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

