
"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  useTexture,
} from "@react-three/drei";

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

const BOX_WIDTH = 2.2;
const BOX_HEIGHT = 3.05;
const BOX_DEPTH = 1.15;

const HALF_WIDTH = BOX_WIDTH / 2;
const HALF_HEIGHT = BOX_HEIGHT / 2;
const HALF_DEPTH = BOX_DEPTH / 2;
const SURFACE_OFFSET = 0.006;

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
    <mesh position={[0, 0, SURFACE_OFFSET]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
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
  rotation,
  showText = false,
}: {
  face: Face;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
  showText?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={face.color}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {face.image ? (
        <Suspense fallback={null}>
          <ImageLayer
            image={face.image}
            width={width * 0.99}
            height={height * 0.99}
          />
        </Suspense>
      ) : showText ? (
        <>
          <Text
            position={[0, height * 0.25, SURFACE_OFFSET * 2]}
            fontSize={0.19}
            maxWidth={width * 0.82}
            textAlign="center"
            color="#172033"
            anchorX="center"
            anchorY="middle"
          >
            {face.title || "YOUR BRAND"}
          </Text>

          <Text
            position={[0, height * 0.02, SURFACE_OFFSET * 2]}
            fontSize={0.105}
            maxWidth={width * 0.8}
            textAlign="center"
            color="#172033"
            anchorX="center"
            anchorY="middle"
          >
            {face.text || "Your product story goes here"}
          </Text>

          <mesh position={[0, -height * 0.26, SURFACE_OFFSET * 1.5]}>
            <planeGeometry args={[width * 0.38, height * 0.18]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>

          <Text
            position={[0, -height * 0.26, SURFACE_OFFSET * 3]}
            fontSize={0.07}
            color="#334155"
            anchorX="center"
            anchorY="middle"
          >
            PRODUCT
          </Text>
        </>
      ) : (
        <>
          <Text
            position={[0, 0, SURFACE_OFFSET * 2]}
            fontSize={0.15}
            maxWidth={width * 0.8}
            textAlign="center"
            color="#172033"
            anchorX="center"
            anchorY="middle"
          >
            {face.title}
          </Text>

          {face.text ? (
            <Text
              position={[0, -0.23, SURFACE_OFFSET * 2]}
              fontSize={0.075}
              maxWidth={width * 0.8}
              textAlign="center"
              color="#334155"
              anchorX="center"
              anchorY="middle"
            >
              {face.text}
            </Text>
          ) : null}
        </>
      )}
    </group>
  );
}

function Package({ design }: { design: BoxDesign }) {
  return (
    <group>
      {/* Main box body */}
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={[BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH]}
        />
        <meshStandardMaterial
          color="#f6f4ef"
          roughness={0.72}
        />
      </mesh>

      {/* Front */}
      <FaceSurface
        face={design.front}
        width={BOX_WIDTH}
        height={BOX_HEIGHT}
        position={[0, 0, HALF_DEPTH]}
        rotation={[0, 0, 0]}
        showText
      />

      {/* Back */}
      <FaceSurface
        face={design.back}
        width={BOX_WIDTH}
        height={BOX_HEIGHT}
        position={[0, 0, -HALF_DEPTH]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Right */}
      <FaceSurface
        face={design.right}
        width={BOX_DEPTH}
        height={BOX_HEIGHT}
        position={[HALF_WIDTH, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Left */}
      <FaceSurface
        face={design.left}
        width={BOX_DEPTH}
        height={BOX_HEIGHT}
        position={[-HALF_WIDTH, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Top */}
      <FaceSurface
        face={design.top}
        width={BOX_WIDTH}
        height={BOX_DEPTH}
        position={[0, HALF_HEIGHT, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Bottom */}
      <FaceSurface
        face={design.bottom}
        width={BOX_WIDTH}
        height={BOX_DEPTH}
        position={[0, -HALF_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

export default function BoxPreview({
  design,
}: {
  design: BoxDesign;
}) {
  return (
    <div className="h-[480px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-violet-100 sm:h-[520px]">
      <Canvas
        shadows
        camera={{
          position: [4.5, 3.5, 5.5],
          fov: 38,
        }}
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
            position={[0, -1.65, 0]}
            opacity={0.25}
            blur={2.5}
            scale={5.5}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={9}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
