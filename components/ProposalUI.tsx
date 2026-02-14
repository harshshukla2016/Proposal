
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { GamePhase } from '../types';
import { gsap } from 'gsap';

interface ProposalUIProps {
  onAccept: () => void;
}

const ProposalUI: React.FC<ProposalUIProps> = ({ onAccept }) => {
  const { proposalData, setGamePhase } = useStore();
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonScale, setNoButtonScale] = useState(1);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!noButtonRef.current) return;

    const buttonRect = noButtonRef.current.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    const evadeRadius = 120; // Distance at which the button starts evading
    const maxEvadeDistance = 100; // Max pixels to move away
    const minScale = 0.2; // Min scale for the button

    if (distance < evadeRadius) {
      const evadeAmount = 1 - (distance / evadeRadius); // 0 to 1
      const moveX = (distanceX / distance) * maxEvadeDistance * evadeAmount;
      const moveY = (distanceY / distance) * maxEvadeDistance * evadeAmount;
      const scale = 1 - (evadeAmount * (1 - minScale));

      setNoButtonPosition({ x: moveX, y: moveY });
      setNoButtonScale(scale);
    } else {
      setNoButtonPosition({ x: 0, y: 0 });
      setNoButtonScale(1);
    }
  }, []);


  useEffect(() => {
    // GSAP animation for noButtonPosition and noButtonScale
    if (noButtonRef.current) {
        gsap.to(noButtonRef.current, {
            x: noButtonPosition.x,
            y: noButtonPosition.y,
            scale: noButtonScale,
            duration: 0.2,
            ease: "power2.out",
        });
    }
  }, [noButtonPosition, noButtonScale]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black bg-opacity-50 z-20">
      <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 text-center drop-shadow-lg mb-8">
        {proposalData?.partner_name},<br />
        Will you marry me?
      </h2>
      <div className="flex space-x-8 mt-8">
        <button
          onClick={onAccept}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white text-3xl font-bold rounded-full shadow-lg
                     hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          YES!
        </button>
        <button
          ref={noButtonRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            // Reset position and scale when cursor leaves
            setNoButtonPosition({ x: 0, y: 0 });
            setNoButtonScale(1);
          }}
          className="relative px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-3xl font-bold rounded-full shadow-lg
                     hover:from-red-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 active:scale-95 z-10"
          style={{
            touchAction: 'none', // Prevent touch events from triggering default browser behaviors
          }}
        >
          NO
        </button>
      </div>
    </div>
  );
};

export default ProposalUI;
    