
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GamePhase } from '../types';
import { gsap } from 'gsap';
 // Removed: import { Back } from 'gsap/EasePack'; 

interface StarsProps {
  count: number;
  radius: number;
  color: string;
  pulse: number; // Normalized audio frequency (0-1)
  gamePhase: GamePhase;
  partnerName: string;
}

const Stars: React.FC<StarsProps> = ({ count, radius, color, pulse, gamePhase, partnerName }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { viewport } = useThree();

  const starData = useMemo(() => {
    const temp: { position: THREE.Vector3; scale: number; originalPosition: THREE.Vector3; }[] = [];
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2 * radius,
        (Math.random() - 0.5) * 2 * radius,
        (Math.random() - 0.5) * 2 * radius
      );
      temp.push({
        position,
        scale: Math.random() * 0.5 + 0.1, // Random scale for stars
        originalPosition: position.clone(), // Store original scattered position
      });
    }
    return temp;
  }, [count, radius]);

  // Generate target heart shape points
  const heartShapePoints = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector2>();
    curve.add(new THREE.LineCurve(new THREE.Vector2(0, 0.4), new THREE.Vector2(-0.4, 0)));
    curve.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(-0.4, 0), new THREE.Vector2(-0.8, -0.4), new THREE.Vector2(-0.4, -0.8)));
    curve.add(new THREE.LineCurve(new THREE.Vector2(-0.4, -0.8), new THREE.Vector2(0, -1.2)));
    curve.add(new THREE.LineCurve(new THREE.Vector2(0, -1.2), new THREE.Vector2(0.4, -0.8)));
    curve.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(0.4, -0.8), new THREE.Vector2(0.8, -0.4), new THREE.Vector2(0.4, 0)));
    curve.add(new THREE.LineCurve(new THREE.Vector2(0.4, 0), new THREE.Vector2(0, 0.4)));

    // Scale heart to fit scene
    const scaleFactor = radius * 0.6;
    const points2D = curve.getPoints(Math.floor(count / 10)); // Get fewer points for path
    const points3D: THREE.Vector3[] = [];
    points2D.forEach(p => {
        // Create 3D points by adding depth, making it a "heart cloud"
        for (let i = 0; i < 10; i++) { // Generate 10 stars per curve point for density
            points3D.push(
                new THREE.Vector3(
                    p.x * scaleFactor + (Math.random() - 0.5) * 5, // Random offset for cloud effect
                    p.y * scaleFactor + (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 10 // Spread in Z
                )
            );
        }
    });

    return points3D;
  }, [count, radius]);


  useEffect(() => {
    if (gamePhase === GamePhase.REVEAL && meshRef.current) {
      // Animate stars to form a heart
      starData.forEach((star, i) => {
        const targetPos = heartShapePoints[i % heartShapePoints.length]; // Loop through heart points
        gsap.to(star.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 6,
          delay: Math.random() * 2, // Staggered delay for cinematic effect
          ease: "power2.inOut", // Changed ease to a standard one
          onUpdate: () => {
            if (meshRef.current) {
              dummy.position.copy(star.position);
              dummy.scale.set(star.scale, star.scale, star.scale);
              dummy.lookAt(0,0,0) // Optional: make stars face center
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
              meshRef.current.instanceMatrix.needsUpdate = true;
            }
          },
        });
      });
    }
    else if (gamePhase === GamePhase.FINALE && meshRef.current) {
      // Animate stars to form partner name (simplified: central convergence or fade out)
      starData.forEach((star, i) => {
        gsap.to(star.position, {
          x: 0, y: 0, z: -50, // Converge or move away
          scale: 0.1, // Shrink
          duration: 3,
          delay: Math.random() * 1,
          ease: "power2.in", // Changed ease to a standard one
          onUpdate: () => {
            if (meshRef.current) {
              dummy.position.copy(star.position);
              dummy.scale.set(star.scale, star.scale, star.scale);
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
              meshRef.current.instanceMatrix.needsUpdate = true;
            }
          },
        });
      });
    }

  }, [gamePhase, starData, heartShapePoints, dummy]);

  useFrame(() => {
    if (!meshRef.current) return;

    // Apply audio pulse and update positions based on game phase
    starData.forEach((star, i) => {
      // Apply pulse to scale
      star.scale = (Math.random() * 0.5 + 0.1) * (1 + pulse * 0.5); // Base scale + pulse effect

      // Update matrix
      dummy.position.copy(star.position);
      dummy.scale.set(star.scale, star.scale, star.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.2, 8, 8]} /> {/* Small, low-poly spheres for stars */}
      <meshBasicMaterial color={color} toneMapped={false} /> {/* Not affected by tone mapping */}
    </instancedMesh>
  );
};

export default Stars;