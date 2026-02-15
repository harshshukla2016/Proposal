
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { MobileJoystick } from '../components/MobileJoystick';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sparkles, PointerLockControls, Html, Image } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Mobile Helper
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

interface CastleInteriorProps {
    proposalText: string;
    musicUrl?: string;
    musicStartTime?: number;
    videoUrl?: string;
    onComplete: () => void;
    onExit: () => void;
}

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const CastleInterior: React.FC<CastleInteriorProps> = ({ proposalText, musicUrl, musicStartTime = 0, videoUrl, onComplete, onExit }) => {
    const [heartBurst, setHeartBurst] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // Background Music State
    const [isBgMusicYouTube, setIsBgMusicYouTube] = useState(false);
    const [bgMusicYouTubeId, setBgMusicYouTubeId] = useState<string | null>(null);

    // Proposal Video State
    const [isProposalVideoYouTube, setIsProposalVideoYouTube] = useState(false);
    const [proposalYouTubeId, setProposalYouTubeId] = useState<string | null>(null);
    const [isVideoMuted, setIsVideoMuted] = useState(true);

    const [burstParticles, setBurstParticles] = useState<Array<{ id: number; position: THREE.Vector3; velocity: THREE.Vector3; rotation: THREE.Euler }>>([]);
    const heartRef = useRef<THREE.Group>(null);
    const textRef = useRef<THREE.Group>(null);
    const chandelierRef = useRef<THREE.Group>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const bgMusicPlayerRef = useRef<HTMLIFrameElement>(null);
    const proposalVideoIframeRef = useRef<HTMLIFrameElement>(null);

    // Mobile Controls State
    const isMobile = useRef(isMobileDevice());
    const mobileMoveRef = useRef({ x: 0, y: 0 });
    const touchLook = useRef({ x: 0, y: 0, active: false });

    // Initial Setup: Check URLs
    useEffect(() => {
        // Check Background Music
        const ytId = musicUrl ? getYouTubeId(musicUrl) : null;
        if (ytId) {
            setIsBgMusicYouTube(true);
            setBgMusicYouTubeId(ytId);
        } else if (audioRef.current && musicUrl) {
            audioRef.current.src = musicUrl;
            audioRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
        } else if (audioRef.current) {
            audioRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
        }

        // Check Proposal Video
        if (videoUrl) {
            const vidYtId = getYouTubeId(videoUrl);
            if (vidYtId) {
                setIsProposalVideoYouTube(true);
                setProposalYouTubeId(vidYtId);
            }
        }

        const timer = setTimeout(() => {
            setShowHeart(true);
        }, 2000);

        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [musicUrl, videoUrl]);

    // Control Background Music (Pause/Resume)
    const setBackgroundMusicState = (play: boolean) => {
        if (isBgMusicYouTube && bgMusicPlayerRef.current) {
            // For YouTube iframe, we need to postMessage
            const command = play ? 'playVideo' : 'pauseVideo';
            bgMusicPlayerRef.current.contentWindow?.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
        } else if (audioRef.current) {
            if (play) {
                audioRef.current.play().catch(e => console.error("Error playing audio", e));
            } else {
                audioRef.current.pause();
            }
        }
    };

    // Toggle Proposal Video Audio
    const toggleVideoAudio = () => {
        const newMutedState = !isVideoMuted;
        setIsVideoMuted(newMutedState);

        if (newMutedState) {
            // Video is now MUTED
            // 1. Resume Background Music
            setBackgroundMusicState(true);

            // 2. Mute Proposal Video
            if (isProposalVideoYouTube && proposalVideoIframeRef.current) {
                proposalVideoIframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
            } else if (videoRef.current) {
                videoRef.current.muted = true;
            }
        } else {
            // Video is now UNMUTED
            // 1. Pause Background Music
            setBackgroundMusicState(false);

            // 2. Unmute Proposal Video
            if (isProposalVideoYouTube && proposalVideoIframeRef.current) {
                proposalVideoIframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            } else if (videoRef.current) {
                videoRef.current.muted = false;
            }
        }
    };

    const handleCloseVideo = () => {
        setShowVideo(false);
        setIsVideoMuted(true);
        // Always resume background music when closing video
        setBackgroundMusicState(true);
    };

    const heartShape = useMemo(() => {
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x + 0.5, y + 0.5);
        heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
        heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
        heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
        heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
        heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
        heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
        return heartShape;
    }, []);

    const handleHeartClick = () => {
        if (heartBurst) return;
        setHeartBurst(true);

        // Create burst particles
        const particles = [];
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI;
            const speed = 5 + Math.random() * 10;

            particles.push({
                id: i,
                position: new THREE.Vector3(0, 5, -10),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * Math.cos(elevation) * speed,
                    Math.sin(elevation) * speed,
                    Math.sin(angle) * Math.cos(elevation) * speed
                ),
                rotation: new THREE.Euler(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                )
            });
        }
        setBurstParticles(particles);

        if (heartRef.current) {
            // Pulse and fade animation
            gsap.to(heartRef.current.scale, {
                x: 8, y: 8, z: 8,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(heartRef.current.rotation, {
                y: heartRef.current.rotation.y + Math.PI * 4,
                duration: 1,
                ease: "power2.out"
            });

            setTimeout(() => {
                if (heartRef.current) heartRef.current.visible = false;

                // Show video after heart disappears (MUTED so music continues)
                setShowVideo(true);
                setIsVideoMuted(true);

                // If direct video, play it muted
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(err => console.log('Video autoplay prevented:', err));
                }
                // If YouTube video, iframe will handle autoplay via URL params
            }, 800);
        }

        setTimeout(() => {
            if (textRef.current) {
                textRef.current.visible = true;
                gsap.fromTo(textRef.current.position, { y: -5 }, { y: 0, duration: 2, ease: "elastic.out(1, 0.3)" });
            }
        }, 1000);

        setTimeout(() => {
            onComplete();
        }, 10000);
    };

    const { camera } = useThree();
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });

    // Set initial camera position
    React.useEffect(() => {
        camera.position.set(0, 2, 30); // Start at back of room
        camera.lookAt(0, 5, -10); // Look at heart area
    }, [camera]);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys(prev => ({ ...prev, [key]: true }));
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys(prev => ({ ...prev, [key]: false }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Mobile Touch Look Controls
    useEffect(() => {
        if (!isMobile.current) return;

        const dom = document.body;

        const handleTouchStart = (e: TouchEvent) => {
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
            e.preventDefault();

            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.clientX > window.innerWidth / 3) {
                    const dx = touch.clientX - touchLook.current.x;
                    const sensitivity = 0.005;
                    camera.rotation.y -= dx * sensitivity;

                    touchLook.current.x = touch.clientX;
                    touchLook.current.y = touch.clientY;
                }
            }
        };

        const handleTouchEnd = () => {
            touchLook.current.active = false;
        };

        dom.addEventListener('touchstart', handleTouchStart, { passive: false });
        dom.addEventListener('touchmove', handleTouchMove, { passive: false });
        dom.addEventListener('touchend', handleTouchEnd);

        return () => {
            dom.removeEventListener('touchstart', handleTouchStart);
            dom.removeEventListener('touchmove', handleTouchMove);
            dom.removeEventListener('touchend', handleTouchEnd);
        };
    }, [camera]);

    useFrame((state, delta) => {
        // Movement
        const speed = 10 * delta;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction, camera.up).normalize();

        const moveVec = new THREE.Vector3();
        if (keys.w) moveVec.add(direction);
        if (keys.s) moveVec.add(direction.clone().negate());
        if (keys.d) moveVec.add(right);
        if (keys.a) moveVec.add(right.clone().negate());

        // MOBILE JOYSTICK
        if (mobileMoveRef.current) {
            const { x, y } = mobileMoveRef.current;
            if (y > 0) moveVec.add(direction.clone().multiplyScalar(y));
            if (y < 0) moveVec.add(direction.clone().multiplyScalar(Math.abs(y)).negate());
            if (x > 0) moveVec.add(right.clone().multiplyScalar(x));
            if (x < 0) moveVec.add(right.clone().multiplyScalar(Math.abs(x)).negate());
        }

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(speed);
            camera.position.add(moveVec);
        }

        // Boundaries - keep player inside palace
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -30, 30);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -30, 30);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0, 15);

        // Heart animation - BIGGER
        if (!heartBurst && heartRef.current && showHeart) {
            const scale = 3.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
            heartRef.current.scale.set(scale, scale, scale);
            heartRef.current.rotation.y += 0.02;
        }

        // Burst particles animation
        if (burstParticles.length > 0) {
            setBurstParticles(prev =>
                prev.map(p => ({
                    ...p,
                    position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
                    velocity: p.velocity.clone().multiplyScalar(0.95), // Slow down
                    rotation: new THREE.Euler(
                        p.rotation.x + delta * 5,
                        p.rotation.y + delta * 5,
                        p.rotation.z + delta * 5
                    )
                })).filter(p => p.velocity.length() > 0.1) // Remove slow particles
            );
        }

        // Chandelier rotation
        if (chandelierRef.current) {
            chandelierRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group>
            {/* Pointer Lock Controls for mouse look (Desktop Only) */}
            {!isMobile.current && <PointerLockControls selector="#root" />}

            {/* Mobile Joystick (Mobile Only) */}
            {isMobile.current && (
                <Html fullscreen style={{ pointerEvents: 'none', zIndex: 10 }}>
                    <div className="pointer-events-auto">
                        <MobileJoystick moveRef={mobileMoveRef} />
                        <div className="absolute bottom-10 right-10 text-white/50 text-sm font-bold pointer-events-none">
                            DRAG HERE TO LOOK
                        </div>
                    </div>
                </Html>
            )}



            {/* Entrance Gate - Behind player */}
            <group position={[0, 0, 35]}>
                {/* Gate frame */}
                <mesh position={[-4, 8, 0]}>
                    <boxGeometry args={[1, 16, 1]} />
                    <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[4, 8, 0]}>
                    <boxGeometry args={[1, 16, 1]} />
                    <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 16, 0]}>
                    <boxGeometry args={[10, 1, 1]} />
                    <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Gate doors */}
                <mesh position={[-2, 8, 0]}>
                    <boxGeometry args={[3.5, 15, 0.3]} />
                    <meshStandardMaterial color="#8b4513" roughness={0.6} />
                </mesh>
                <mesh position={[2, 8, 0]}>
                    <boxGeometry args={[3.5, 15, 0.3]} />
                    <meshStandardMaterial color="#8b4513" roughness={0.6} />
                </mesh>
                <Text position={[0, 18, 0.5]} fontSize={1.2} color="#ffd700" outlineWidth={0.05} outlineColor="#000">
                    PALACE ENTRANCE
                </Text>
            </group>

            {/* Walls - Cream/Ivory with gold trim */}
            <mesh scale={[80, 80, 80]}>
                <boxGeometry />
                <meshStandardMaterial side={THREE.BackSide} color="#f5f5dc" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Marble Floor - White with gold veins */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.1}
                    metalness={0.8}
                    envMapIntensity={1}
                />
            </mesh>

            {/* Marble Pattern Overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -9.9, 0]}>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial
                    color="#d4af37"
                    transparent
                    opacity={0.1}
                    roughness={0.2}
                />
            </mesh>

            {/* Red Carpet Runner */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -9.8, 0]}>
                <planeGeometry args={[8, 60]} />
                <meshStandardMaterial color="#8b0000" roughness={0.8} />
            </mesh>

            {/* Ornate Pillars - Gold with details */}
            {[-15, 15].map((x, idx) => (
                <React.Fragment key={idx}>
                    {[-20, -10, 0, 10, 20].map((z, i) => (
                        <group key={i} position={[x, 0, z]}>
                            {/* Main pillar */}
                            <mesh position={[0, 0, 0]} castShadow>
                                <cylinderGeometry args={[1.2, 1.5, 20, 16]} />
                                <meshStandardMaterial
                                    color="#f5f5dc"
                                    roughness={0.2}
                                    metalness={0.3}
                                />
                            </mesh>
                            {/* Gold capital */}
                            <mesh position={[0, 10.5, 0]}>
                                <cylinderGeometry args={[1.8, 1.2, 1, 16]} />
                                <meshStandardMaterial
                                    color="#d4af37"
                                    roughness={0.2}
                                    metalness={0.9}
                                    emissive="#d4af37"
                                    emissiveIntensity={0.3}
                                />
                            </mesh>
                            {/* Gold base */}
                            <mesh position={[0, -10.5, 0]}>
                                <cylinderGeometry args={[1.5, 1.8, 1, 16]} />
                                <meshStandardMaterial
                                    color="#d4af37"
                                    roughness={0.2}
                                    metalness={0.9}
                                />
                            </mesh>
                            {/* Wall sconce light */}
                            <pointLight
                                position={[0, 5, 0]}
                                intensity={2}
                                distance={15}
                                color="#ffd700"
                                castShadow
                            />
                        </group>
                    ))}
                </React.Fragment>
            ))}

            {/* Grand Crystal Chandelier */}
            <group ref={chandelierRef} position={[0, 15, -5]}>
                {/* Main chandelier body */}
                <mesh>
                    <sphereGeometry args={[2, 16, 16]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        metalness={1}
                        roughness={0}
                        transmission={0.9}
                        thickness={0.5}
                        clearcoat={1}
                    />
                </mesh>
                {/* Crystal drops */}
                {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * Math.PI * 2;
                    const radius = 3;
                    return (
                        <mesh
                            key={i}
                            position={[
                                Math.cos(angle) * radius,
                                -2 - Math.random() * 2,
                                Math.sin(angle) * radius
                            ]}
                        >
                            <coneGeometry args={[0.2, 1.5, 6]} />
                            <meshPhysicalMaterial
                                color="#ffffff"
                                metalness={0.9}
                                roughness={0}
                                transmission={0.95}
                                clearcoat={1}
                            />
                        </mesh>
                    );
                })}
                {/* Chandelier light */}
                <pointLight intensity={8} distance={40} color="#fff5e6" castShadow />
            </group>

            {/* Stained Glass Windows Effect */}
            {[-25, 25].map((x, idx) => (
                <React.Fragment key={idx}>
                    {[-15, 0, 15].map((z, i) => (
                        <mesh key={i} position={[x, 8, z]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                            <planeGeometry args={[6, 12]} />
                            <meshStandardMaterial
                                color={i === 0 ? "#ff69b4" : i === 1 ? "#ffd700" : "#87ceeb"}
                                transparent
                                opacity={0.6}
                                emissive={i === 0 ? "#ff69b4" : i === 1 ? "#ffd700" : "#87ceeb"}
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    ))}
                </React.Fragment>
            ))}

            {/* Rose Petals on Floor */}
            <Sparkles
                count={200}
                scale={[60, 0.5, 60]}
                size={2}
                speed={0.1}
                opacity={0.8}
                color="#ff69b4"
                position={[0, -9.5, 0]}
            />

            {/* Floating Particles - Gold dust */}
            <Sparkles
                count={500}
                scale={60}
                size={3}
                speed={0.2}
                opacity={0.4}
                color="#ffd700"
            />

            {/* Exit Door - Ornate */}
            <group position={[0, 0, 35]} rotation={[0, 0, 0]}>
                <mesh
                    onClick={onExit}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'default'; }}
                    castShadow
                >
                    <boxGeometry args={[8, 16, 0.5]} />
                    <meshStandardMaterial
                        color="#8b4513"
                        roughness={0.6}
                        metalness={0.2}
                    />
                </mesh>
                {/* Door frame - gold */}
                <mesh position={[0, 0, 0.3]}>
                    <boxGeometry args={[9, 17, 0.3]} />
                    <meshStandardMaterial
                        color="#d4af37"
                        roughness={0.2}
                        metalness={0.9}
                    />
                </mesh>
                <Text position={[0, 10, 0.5]} fontSize={1} color="#ffd700" outlineWidth={0.05} outlineColor="#000">
                    EXIT TO CITY
                </Text>
                <pointLight position={[0, 8, 2]} intensity={3} color="#ffd700" distance={15} />
            </group>

            {/* The Heart - Floating in center - BIGGER & MORE 3D */}
            {showHeart && !heartBurst && (
                <group
                    ref={heartRef}
                    onClick={handleHeartClick}
                    position={[0, 5, -10]}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'default'; }}
                >
                    <Float speed={4} rotationIntensity={0.5} floatIntensity={2}>
                        <group rotation={[0, 0, Math.PI]} scale={[0.15, 0.15, 0.15]}>
                            <mesh castShadow receiveShadow>
                                <extrudeGeometry args={[heartShape, {
                                    depth: 12,
                                    bevelEnabled: true,
                                    bevelSegments: 8,
                                    steps: 6,
                                    bevelSize: 0.5,
                                    bevelThickness: 0.8,
                                    curveSegments: 24
                                }]} />
                                <meshPhysicalMaterial
                                    color="#ff1493"
                                    emissive="#ff0066"
                                    emissiveIntensity={2.5}
                                    roughness={0.05}
                                    metalness={0.9}
                                    clearcoat={1}
                                    clearcoatRoughness={0.05}
                                    reflectivity={1}
                                />
                            </mesh>
                        </group>
                    </Float>
                    <Text position={[0, 5.5, 0]} fontSize={1.5} color="#ffd700" anchorX="center" anchorY="middle" outlineWidth={0.1} outlineColor="#ff1493">
                        CLICK FOR YOUR SURPRISE! 💍
                    </Text>
                    <pointLight position={[0, 0, 2]} intensity={15} color="#ff1493" distance={25} />
                    <Sparkles count={150} scale={10} size={5} speed={0.5} opacity={1} color="#ff69b4" />
                </group>
            )}

            {/* Burst Particles */}
            {burstParticles.map((particle) => (
                <group key={particle.id} position={particle.position} rotation={particle.rotation}>
                    <mesh>
                        <extrudeGeometry args={[heartShape, {
                            depth: 2,
                            bevelEnabled: true,
                            bevelSegments: 2,
                            steps: 2,
                            bevelSize: 0.1,
                            bevelThickness: 0.2
                        }]} />
                        <meshPhysicalMaterial
                            color="#ff1493"
                            emissive="#ff0066"
                            emissiveIntensity={3}
                            transparent
                            opacity={Math.min(1, particle.velocity.length() / 10)}
                        />
                    </mesh>
                </group>
            ))}

            {/* Proposal Text */}
            <group ref={textRef} visible={false}>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                    <Text
                        position={[0, 5, -10]}
                        fontSize={3}
                        color="#ffd700"
                        anchorX="center"
                        anchorY="middle"
                        textAlign="center"
                        font="/fonts/Inter-Bold.ttf"
                        outlineWidth={0.15}
                        outlineColor="#8b4513"
                    >
                        {proposalText}
                    </Text>
                    <Text
                        position={[0, 0, -10]}
                        fontSize={1.2}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                        textAlign="center"
                        outlineWidth={0.05}
                        outlineColor="#ff69b4"
                    >
                        (The City of Love is Forever Yours) 💕
                    </Text>
                </Float>
                <Sparkles count={300} scale={20} size={10} speed={0.8} opacity={1} color="#ffd700" position={[0, 5, -10]} />
            </group>

            {/* Ambient Lighting */}
            <ambientLight intensity={0.8} color="#fff5e6" />

            {/* Main spotlight on heart area */}
            <spotLight
                position={[0, 25, -5]}
                angle={0.6}
                penumbra={0.5}
                intensity={3}
                color="#ffffff"
                castShadow
            />

            {/* Rim lights */}
            <pointLight position={[-20, 10, -20]} intensity={2} color="#ffd700" distance={50} />
            <pointLight position={[20, 10, -20]} intensity={2} color="#ff69b4" distance={50} />
            <pointLight position={[0, 10, 20]} intensity={2} color="#87ceeb" distance={50} />

            {/* Atmospheric fog */}
            <fog attach="fog" args={['#f5f5dc', 30, 80]} />

            {/* Background Audio - Hidden */}
            <Html>
                <audio
                    ref={audioRef}
                    loop
                    style={{ display: 'none' }}
                >
                    <source src="/audio/palace-music.mp3" type="audio/mpeg" />
                    <source src="/audio/palace-music.ogg" type="audio/ogg" />
                    Your browser does not support audio.
                </audio>
            </Html>

            {/* Video Player Modal */}
            {showVideo && (
                <Html fullscreen>
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10000,
                        width: '80vw',
                        maxWidth: '1200px',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: '20px',
                        borderRadius: '20px',
                        boxShadow: '0 0 50px rgba(255, 20, 147, 0.5)'
                    }}>
                        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0 }}>
                            {isProposalVideoYouTube && proposalYouTubeId ? (
                                <iframe
                                    ref={proposalVideoIframeRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '10px'
                                    }}
                                    src={`https://www.youtube.com/embed/${proposalYouTubeId}?autoplay=1&controls=1&mute=1&enablejsapi=1`}
                                    title="Proposal Video"
                                    allow="autoplay; encrypted-media"
                                    frameBorder="0"
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    controls
                                    autoPlay
                                    muted
                                    {...(videoUrl ? { src: videoUrl } : {})}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '10px',
                                        outline: 'none'
                                    }}
                                >
                                    {!videoUrl && (
                                        <>
                                            <source src="/video/proposal-video.mp4" type="video/mp4" />
                                            <source src="/video/proposal-video.webm" type="video/webm" />
                                        </>
                                    )}
                                    Your browser does not support video.
                                </video>
                            )}
                        </div>

                        {/* Audio Control Buttons */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '20px',
                            zIndex: 10001
                        }}>
                            <button
                                onClick={toggleVideoAudio}
                                style={{
                                    background: isVideoMuted ? '#4CAF50' : '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isVideoMuted ? (
                                    <>🔊 Unmute Video & Pause Music</>
                                ) : (
                                    <>🔇 Mute Video & Resume Music</>
                                )}
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleCloseVideo}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#ff1493',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                fontSize: '24px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </Html>
            )}

            {/* Background Music YouTube Player - Hidden */}
            {isBgMusicYouTube && bgMusicYouTubeId && (
                <Html>
                    <div style={{ pointerEvents: 'none', visibility: 'hidden', position: 'absolute', width: '1px', height: '1px' }}>
                        <iframe
                            ref={bgMusicPlayerRef}
                            width="1"
                            height="1"
                            src={`https://www.youtube.com/embed/${bgMusicYouTubeId}?autoplay=1&start=${musicStartTime}&controls=0&modestbranding=1&rel=0&enablejsapi=1`}
                            title="Background YouTube Audio"
                            allow="autoplay; encrypted-media"
                        />
                    </div>
                </Html>
            )}
        </group>
    );
};
