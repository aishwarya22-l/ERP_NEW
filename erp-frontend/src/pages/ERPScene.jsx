import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Background() {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.y += 0.0015;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial
        color="#1e293b"
        wireframe
        opacity={0.15}
        transparent
      />
    </mesh>
  );
}

export default function ERPScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.4} />
      <Background />
    </Canvas>
  );
}