
import React, { Suspense, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Perf } from 'r3f-perf';
import { Vector2, Vector3 } from 'three';
import { gsap } from 'gsap';
import * as THREE from 'three';

import Stars from './Stars';
import MemoryCrystal from './MemoryCrystal';
import AstraGlow from './AstraGlow';
import RingBox from './RingBox';
import LightRig from './LightRig';
import LoadingScreen from '../components/LoadingScreen';
import ProposalUI from '../components/ProposalUI';
import { MemoryFrame } from './MemoryFrame';

import { useStore } from '../hooks/useStore';
import { GamePhase, MemoryCrystal as MemoryCrystalType } from '../types';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { speakText, cancelSpeech } from '../services/ttsService';
import { generateAstroGlowNarrative } from '../services/geminiService';
import { updateCrystalCollectedStatus } from '../services/apiService';
import { CRYSTAL_SPAWN_RADIUS, PROPOSAL_BLOOM_COLOR } from '../constants';

interface CameraControllerProps {
  startAudioContext: () => void;
  disabled?: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({ startAudioContext, disabled }) => {
  const { camera } = useThree();
  const mouse = useRef<Vector2>(new Vector2(0, 0));
  const target = useRef<Vector3>(new Vector3(0, 0, 0));
  const hasInteractedRef = useRef(false);

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (disabled) return;
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Attempt to resume audio context on first mouse move (user interaction)
    if (!hasInteractedRef.current) {
      startAudioContext();
      hasInteractedRef.current = true;
    }
  }, [startAudioContext, disabled]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]); // Dependency on onMouseMove

  useFrame(() => {
    if (disabled) return;
    // Determine the target position based on mouse/touch input
    // This creates a smooth "wisp-like" movement for the camera
    target.current.x = mouse.current.x * CRYSTAL_SPAWN_RADIUS * 0.5;
    target.current.y = mouse.current.y * CRYSTAL_SPAWN_RADIUS * 0.5;
    target.current.z = 0; // Keep camera movement in X/Y plane for simpler navigation

    camera.position.lerp(target.current, 0.03); // Smoothly move camera towards target
    camera.lookAt(0, 0, 0); // Always look at the center of the scene
  });

  return null;
};

const SceneContent: React.FC = () => {
  const { proposalData, setGamePhase, gamePhase, collectedCrystalIds, addCollectedCrystal, setCurrentNarrative, currentNarrative } = useStore();
  // Ensure 'romantic_track.mp3' is placed in your project's 'public/' directory
  const { getAverageFrequency, audioReady, startAudioContext } = useAudioAnalyser('/romantic_track.mp3');
  const { camera } = useThree();
  const cameraRef = useRef(camera); // Persist camera ref for GSAP
  const currentCrystalIndex = useRef(0);
  const bloomRef = useRef<any>(null); // Ref for Bloom effect
  const [activeMemory, setActiveMemory] = React.useState<MemoryCrystalType | null>(null);

  useEffect(() => {
    cameraRef.current = camera; // Update ref if camera instance changes
  }, [camera]);

  // Initial narration
  useEffect(() => {
    if (proposalData && gamePhase === GamePhase.PLAYING && !currentNarrative) {
      const initialNarrative = `Welcome, ${proposalData.partner_name}, to your Galactic Memory Odyssey. I am Astra-Glow, your guide through the stardust of shared moments. Collect the shimmering crystals to unveil our journey's constellations.`;
      setCurrentNarrative(initialNarrative);
      speakText(initialNarrative);
    }
  }, [proposalData, gamePhase, currentNarrative, setCurrentNarrative]);

  // Handle crystal collection
  const handleCrystalCollect = useCallback(async (crystal: MemoryCrystalType) => {
    if (collectedCrystalIds.has(crystal.id) || gamePhase !== GamePhase.PLAYING) return;

    addCollectedCrystal(crystal.id);
    setActiveMemory(crystal); // Show the memory image
    setCurrentNarrative(`Memory ${crystal.order_index + 1} collected!`);

    // Temporarily increase bloom for a flash effect
    if (bloomRef.current) {
      gsap.to(bloomRef.current, {
        intensity: 3.5, // Brighter flash
        duration: 0.3,
        onComplete: () => {
          gsap.to(bloomRef.current, { intensity: 1.5, duration: 1.5 }); // Fade back to normal
        }
      });
    }

    // Generate and speak AI narration
    const narration = await generateAstroGlowNarrative(crystal.caption_text, proposalData!.partner_name);
    setCurrentNarrative(narration);
    speakText(narration, () => {
      // After speaking, if all crystals are collected, trigger finale
      if (collectedCrystalIds.size + 1 === proposalData?.memories.length) { // +1 because state not yet updated
        setGamePhase(GamePhase.REVEAL);
        console.log('All crystals collected! Initiating finale...');
      } else {
        // Move to next crystal in sequence (optional, for guided tour)
        currentCrystalIndex.current = crystal.order_index + 1;
      }
    });

    // Update backend
    await updateCrystalCollectedStatus(crystal.id, true);
  }, [collectedCrystalIds, addCollectedCrystal, proposalData, setGamePhase, setCurrentNarrative, gamePhase]);

  // Handle finale and proposal transitions
  useEffect(() => {
    if (gamePhase === GamePhase.REVEAL) {
      // Cinematic camera movement to center
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 4,
        ease: 'power2.inOut',
        onUpdate: () => cameraRef.current.lookAt(0, 0, 0),
        onComplete: () => {
          setCurrentNarrative("The stars align, revealing our ultimate destiny...");
          speakText("The stars align, revealing our ultimate destiny...", () => {
            setGamePhase(GamePhase.PROPOSAL);
          });
        },
      });

      // Dim main scene lights, focus on bloom for ring box (handled by LightRig and Bloom pass)
    }
  }, [gamePhase, camera, setCurrentNarrative, setGamePhase]);

  const handleAcceptProposal = useCallback(() => {
    setGamePhase(GamePhase.FINALE);
    setCurrentNarrative("YES! Our journey continues for eternity!");
    speakText("YES! Our journey continues for eternity!", () => {
      // Maybe a final animation or credits
    });
    console.log("Proposal accepted!");
  }, [setGamePhase, setCurrentNarrative]);


  if (!proposalData) {
    return <Html><LoadingScreen message="No proposal data found. Returning to entry." /></Html>;
  }

  const pulse = audioReady ? getAverageFrequency() / 255 : 0; // Normalize frequency to 0-1

  return (
    <>
      {gamePhase === GamePhase.PLAYING && <CameraController startAudioContext={startAudioContext} disabled={!!activeMemory} />}
      {/* <OrbitControls enableZoom={true} enablePan={false} enableRotate={false} /> */} {/* For dev purposes */}

      <LightRig gamePhase={gamePhase} bloomRef={bloomRef} /> {/* Manages lighting and bloom for different phases */}

      <Stars
        count={10000}
        radius={200}
        color={proposalData.star_color}
        pulse={pulse}
        gamePhase={gamePhase}
        partnerName={proposalData.partner_name}
      />

      {gamePhase === GamePhase.PLAYING && proposalData.memories.map((crystal, index) => (
        !collectedCrystalIds.has(crystal.id) && (
          <MemoryCrystal
            key={crystal.id}
            crystal={crystal}
            onCollect={handleCrystalCollect}
            position={[
              (Math.random() - 0.5) * 2 * CRYSTAL_SPAWN_RADIUS,
              (Math.random() - 0.5) * 2 * CRYSTAL_SPAWN_RADIUS,
              (Math.random() - 0.5) * 2 * CRYSTAL_SPAWN_RADIUS,
            ]}
          />
        )
      ))}

      {gamePhase === GamePhase.PLAYING && (
        <AstraGlow
          position={[0, 0, -3]} // Astra-Glow floats slightly in front of the camera
          scale={0.5}
          pulse={pulse}
        />
      )}


      {gamePhase === GamePhase.PROPOSAL && (
        <Suspense fallback={null}>
          <RingBox position={[0, -0.5, 0]} scale={0.5} />
        </Suspense>
      )}

      {/* Active Memory 3D Frame */}
      {activeMemory && (
        <Suspense fallback={null}>
          <group
            position={
              new THREE.Vector3(0, 0, -6).applyMatrix4(camera.matrixWorld)
            }
            quaternion={camera.quaternion}
          >
            <MemoryFrame
              imageUrl={activeMemory.image_url}
              caption={activeMemory.caption_text}
              onClose={() => setActiveMemory(null)}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
            />
          </group>
        </Suspense>
      )}

      {/* UI for narration and proposal */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="absolute top-4 left-4 p-3 bg-black bg-opacity-60 rounded-lg max-w-sm text-sm text-purple-200 pointer-events-none font-mono">
          Phase: {gamePhase} <br />
          Memories: {collectedCrystalIds.size} / {proposalData.memories.length}
        </div>

        <div className="absolute top-4 right-4 p-5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-2xl pointer-events-none max-w-xs transition-opacity duration-1000">
          <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 font-bold mb-3 text-sm uppercase tracking-widest flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Mission Guide
          </h3>
          <ul className="text-xs md:text-sm space-y-2 text-gray-100 font-light">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-pulse"></span>
              <span><strong>Move Cursor</strong> to steer your cosmic view</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
              <span><strong>Click Crystals</strong> to recover shared memories</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-pulse"></span>
              <span><strong>Enable Sound</strong> for the immersive journey</span>
            </li>
          </ul>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-4 bg-black bg-opacity-70 rounded-xl max-w-xl text-center text-lg md:text-xl font-medium shadow-2xl">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
            <span className="text-yellow-100 font-bold">Astra-Glow:</span> {currentNarrative}
          </p>
        </div>
      </Html>

      {gamePhase === GamePhase.PROPOSAL && (
        <Html fullscreen style={{ pointerEvents: 'auto' }}>
          <ProposalUI onAccept={handleAcceptProposal} />
        </Html>
      )}

      {/* Post-processing effects */}
      <EffectComposer multisampling={8}>
        <Bloom ref={bloomRef} luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur={true} radius={0.8}
          blendFunction={BlendFunction.ADD} // Ensure additive blending for glow
          kernelSize={KernelSize.MEDIUM} // Adjust for desired blur
        />
      </EffectComposer>

      {/* <Perf /> */} {/* Performance monitor for R3F */}
    </>
  );
};

const GalacticScene: React.FC = () => {
  const { gamePhase } = useStore();

  return (
    <Canvas
      linear
      flat
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{
        backgroundColor: 'black',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Suspense fallback={<Html><LoadingScreen message="Loading 3D assets..." /></Html>}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
};

export default GalacticScene;