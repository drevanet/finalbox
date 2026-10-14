
"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  useTexture,
} from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

export type Face = {
  title: string;
  text: string;
  color: string;
  image?: string;
};

export type BoxDesign = Record<
  "front" | "back" | "left" | "right" | "top" | "bottom",
  Face
>;

function ImageLayer({
  image,
  width,
  height,
}: {
  image: string;
  width: number;
  height: number;
}) {
  const texture = useTexture(image);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return (
    <mesh position={[0, 0, 0.003]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        color="white"
        roughness={0.85}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function FaceSurface({
  face,
  width,
  height,
  position,
  rotation = [0, 0, 0],
}: {
  face: Face;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={face.color || "#f6f4ef"}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {face.image && (
        <Suspense fallback={null}>
          <ImageLayer
            image={face.image}
            width={width - 0.015}
            height={height - 0.015}
          />
        </Suspense>
      )}
    </group>
  );
}

function Package({ design }: { design: BoxDesign }) {
  const front = design.front;

  return (
    <group>
      {/* Main box body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2.8, 1.05]} />
        <meshStandardMaterial
          color="#f6f4ef"
          roughness={0.72}
        />
      </mesh>

      {/* FRONT */}
      <FaceSurface
        face={design.front}
        width={1.98}
        height={2.78}
        position={[0, 0, 0.531]}
      />

      {/* BACK */}
      <FaceSurface
        face={design.back}
        width={1.98}
        height={2.78}
        position={[0, 0, -0.531]}
        rotation={[0, Math.PI, 0]}
      />

      {/* RIGHT */}
      <FaceSurface
        face={design.right}
        width={1.035}
        height={2.78}
        position={[1.001, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* LEFT */}
      <FaceSurface
        face={design.left}
        width={1.035}
        height={2.78}
        position={[-1.001, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* TOP */}
      <FaceSurface
        face={design.top}
        width={1.98}
        height={1.035}
        position={[0, 1.401, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* BOTTOM */}
      <FaceSurface
        face={design.bottom}
        width={1.98}
        height={1.035}
        position={[0, -1.401, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Front branding overlay when no image is uploaded */}
      {!front.image && (
        <>
          <Text
            position={[0, 0.7, 0.545]}
            fontSize={0.19}
            maxWidth={1.65}
            textAlign="center"
            color="#172033"
            anchorX="center"
            anchorY="middle"
          >
            {front.title || "YOUR BRAND"}
          </Text>

          <Text
            position={[0, 0.15, 0.545]}
            fontSize={0.105}
            maxWidth={1.55}
            textAlign="center"
            color="#172033"
            anchorX="center"
            anchorY="middle"
          >
            {front.text || "Your product story goes here"}
          </Text>

          <mesh position={[0, -0.72, 0.545]}>
            <planeGeometry args={[0.75, 0.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>

          <Text
            position={[0, -0.72, 0.55]}
            fontSize={0.07}
            color="#334155"
            anchorX="center"
            anchorY="middle"
          >
            PRODUCT
          </Text>
        </>
      )}
    </group>
  );
}

export default function BoxPreview({
  design,
}: {
  design: BoxDesign;
}) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-violet-100">
      <Canvas
        shadows
        camera={{ position: [4, 3.1, 4.8], fov: 38 }}
      >
        <color attach="background" args={["#f5f5fb"]} />

        <ambientLight intensity={1.1} />

        <directionalLight
          castShadow
          position={[4, 6, 5]}
          intensity={2.2}
        />

        <Suspense fallback={null}>
          <Package design={design} />

          <Environment preset="studio" />

          <ContactShadows
            position={[0, -1.45, 0]}
            opacity={0.25}
            blur={2.5}
            scale={5}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
