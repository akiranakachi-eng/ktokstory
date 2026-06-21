"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));
  }, [scene]);
  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.2; });
  return <group ref={groupRef}><primitive object={scene} /></group>;
}

export default function ModelViewer({ glbUrl, className = "" }: { glbUrl: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={45} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} />
        <Suspense fallback={<Html center><div className="text-purple-300 text-sm animate-pulse">モデル読み込み中...</div></Html>}>
          <Model url={glbUrl} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={6} blur={2} far={4} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} />
      </Canvas>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40 pointer-events-none">ドラッグで回転 • ピンチでズーム</div>
    </div>
  );
}
