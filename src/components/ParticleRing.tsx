"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { pointsInner, pointsOuter } from "@/lib/particleUtils";
import type { Group } from "three";

type PointProps = {
  position: [number, number, number];
  color: string;
};

const Point = ({ position, color }: PointProps) => (
  <Sphere position={position} args={[0.1, 10, 10]}>
    <meshStandardMaterial emissive={color} emissiveIntensity={0.5} roughness={0.5} color={color} />
  </Sphere>
);

const PointCircle = () => {
  const ref = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  );
};

const ParticleRing = () => (
  <div className="fixed inset-0 -z-20">
    <Canvas
      camera={{ position: [10, -7.5, -5] }}
      className="h-full w-full bg-slate-900"
      style={{ height: "100vh" }}
    >
      <OrbitControls maxDistance={20} minDistance={10} />
      <directionalLight />
      <pointLight position={[-30, 0, -30]} power={10.0} />
      <PointCircle />
    </Canvas>
  </div>
);

export default ParticleRing;
