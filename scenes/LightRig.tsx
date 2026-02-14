
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { AmbientLight, PointLight } from 'three'; // Specific named imports
import { gsap } from 'gsap';
import { GamePhase } from '../types';
import { PROPOSAL_LIGHT_COLOR, PROPOSAL_BLOOM_COLOR } from '../constants';

interface LightRigProps {
  gamePhase: GamePhase;
  bloomRef: React.MutableRefObject<any>; // Ref to the Bloom effect
}

const LightRig: React.FC<LightRigProps> = ({ gamePhase, bloomRef }) => {
  const ambientLightRef = useRef<AmbientLight>(null); // Use named import
  const pointLightRef = useRef<PointLight>(null); // Use named import

  useEffect(() => {
    // Initial setup
    if (ambientLightRef.current && pointLightRef.current && bloomRef.current) {
      if (gamePhase === GamePhase.PLAYING) {
        ambientLightRef.current.intensity = 0.5;
        pointLightRef.current.intensity = 1;
        pointLightRef.current.position.set(0, 0, 10);
        pointLightRef.current.color.set(0xffffff);
        gsap.to(bloomRef.current, {
          intensity: 1.5,
          duration: 1,
        });
      } else if (gamePhase === GamePhase.REVEAL) {
        // Dim ambient, bring point light to center, prepare for proposal bloom
        gsap.to(ambientLightRef.current, { intensity: 0.1, duration: 2 });
        gsap.to(pointLightRef.current.position, { x: 0, y: 0, z: 2, duration: 2 });
        gsap.to(pointLightRef.current, { intensity: 5, duration: 2, color: PROPOSAL_LIGHT_COLOR }); // Stronger light on center
        gsap.to(bloomRef.current, {
          intensity: 0.5, // Reduce overall scene bloom slightly, then specific bloom for ring
          duration: 2,
        });
      } else if (gamePhase === GamePhase.PROPOSAL) {
        // Final bloom focus on the ring box
        gsap.to(bloomRef.current, {
          intensity: 2.5, // High bloom for ring box
          luminanceThreshold: 0.3, // Capture more light for bloom
          luminanceSmoothing: 0.8,
          duration: 1.5,
          delay: 0.5, // Delay after reveal lights settle
          ease: "power2.inOut",
        });
      } else if (gamePhase === GamePhase.FINALE) {
        // Fade out lights
        gsap.to(ambientLightRef.current, { intensity: 0, duration: 3 });
        gsap.to(pointLightRef.current, { intensity: 0, duration: 3 });
        gsap.to(bloomRef.current, { intensity: 0, duration: 3 });
      }
    }
  }, [gamePhase, bloomRef]);

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <pointLight ref={pointLightRef} position={[0, 0, 10]} intensity={1} distance={100} decay={2} />
      {/* Additional lights can be added here if needed */}
    </>
  );
};

export default LightRig;