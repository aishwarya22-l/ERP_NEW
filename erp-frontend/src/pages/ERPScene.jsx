import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function WireframeSphere() {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current)  meshRef.current.rotation.y  += delta * 0.18;
    if (meshRef.current)  meshRef.current.rotation.x  += delta * 0.06;
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.28;
    if (innerRef.current) innerRef.current.rotation.z += delta * 0.10;
  });

  return (
    <group>
      {/* Outer wireframe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.6, 48, 48]} />
        <meshStandardMaterial
          wireframe
          color="#7c3aed"
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Inner denser grid */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshStandardMaterial
          wireframe
          color="#a855f7"
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* Solid center glow core */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

export default function ERPScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5] }} style={{ background: "transparent" }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[4, 4, 4]}  intensity={1.5} color="#7c3aed" />
      <pointLight position={[-4, -3, 2]} intensity={0.8} color="#c084fc" />
      <WireframeSphere />
    </Canvas>
  );
}