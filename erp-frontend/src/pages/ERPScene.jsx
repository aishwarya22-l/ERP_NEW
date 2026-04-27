import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";

// Background animation
function BackgroundSphere() {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current.rotation, {
      y: Math.PI * 2,
      duration: 20,
      repeat: -1,
      ease: "none",
    });
  }, []);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial
        wireframe
        color="#1e293b"
        transparent
        opacity={0.2}
      />
    </mesh>
  );
}

// 👇 THIS WAS MISSING
export default function ERPScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <BackgroundSphere />
    </Canvas>
  );
}