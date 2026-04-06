import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  Sparkles,
  MeshReflectorMaterial,
  ContactShadows,
  Float,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { parts } from "../data/parts";
import PartDetailPanel from "./PartDetailPanel";
import "./Scene3D.css";

// ─────────────────────────────────────────────────────────────────────────────
//  PART-SPECIFIC 3D GEOMETRY COMPONENTS
//  Each returns a <group> of primitives shaped like the real component
// ─────────────────────────────────────────────────────────────────────────────

function BodyShellGeometry({ color, emissive, roughness, metalness, hovered, selected }) {
  const mat = { color, emissive, roughness, metalness, envMapIntensity: 1.2 };
  const wMat = { color, emissive, roughness: 0, metalness: 1, envMapIntensity: 2 };
  return (
    <group>
      {/* Main body teardrop — low swept roof */}
      <mesh castShadow>
        <capsuleGeometry args={[0.48, 2.8, 8, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Roof cockpit bulge */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...wMat} />
      </mesh>
      {/* Front pointed nose */}
      <mesh position={[-1.55, -0.1, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.3, 0.7, 10]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Rear haunch */}
      <mesh position={[1.3, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.52, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Side sill strips */}
      {[-0.5, 0.5].map((z, i) => (
        <mesh key={i} position={[0, -0.32, z]} castShadow>
          <boxGeometry args={[2.8, 0.08, 0.14]} />
          <meshStandardMaterial color={hovered || selected ? "#ffffff" : "#111"} metalness={1} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function MonocoqueGeometry({ color, emissive, roughness, metalness }) {
  return (
    <group>
      {/* Main tub */}
      <mesh castShadow>
        <boxGeometry args={[2.6, 0.18, 1.1]} />
        <meshStandardMaterial color={color} emissive={emissive} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Sills */}
      {[-0.58, 0.58].map((z, i) => (
        <mesh key={i} position={[0, -0.1, z]} castShadow>
          <boxGeometry args={[2.4, 0.22, 0.12]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* A-pillar */}
      <mesh position={[-0.9, 0.22, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* B-pillar */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 8]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
    </group>
  );
}

function EngineGeometry({ color, emissive, roughness, metalness }) {
  // W16 engine block — 16 cylinders in W-formation
  const cylinders = [];
  const bankAngles = [-30, -10, 10, 30];
  bankAngles.forEach((angle, bank) => {
    for (let i = 0; i < 4; i++) {
      cylinders.push({ bank, i, angle });
    }
  });
  return (
    <group>
      {/* Engine block */}
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.55, 0.9]} />
        <meshStandardMaterial color={color} emissive={emissive} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Cylinder bank rows — 4 banks of 4 cylinders */}
      {bankAngles.map((angle, bank) =>
        [0, 1, 2, 3].map((i) => (
          <mesh
            key={`${bank}-${i}`}
            position={[-0.3 + i * 0.22, 0.32, -0.32 + bank * 0.22]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.06, 0.28, 8]} />
            <meshStandardMaterial color="#c08030" metalness={0.9} roughness={0.3} emissive="#200800" />
          </mesh>
        ))
      )}
      {/* Intake manifold */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.9, 0.14, 0.75]} />
        <meshStandardMaterial color="#d0a060" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Oil pan */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.85, 0.14, 0.75]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

function TurboGeometry({ color, emissive }) {
  return (
    <group>
      {/* Compressor housing — large snail shell */}
      <mesh castShadow>
        <torusGeometry args={[0.2, 0.1, 10, 20]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Compressor inlet pipe */}
      <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#b87820" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Turbine inlet */}
      <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.25, 12]} />
        <meshStandardMaterial color="#7a4010" metalness={0.8} roughness={0.4} emissive="#200800" />
      </mesh>
      {/* Center shaft */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function ActiveWingGeometry({ color, emissive }) {
  return (
    <group>
      {/* Main wing plane — thin swept aerofoil profile */}
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.06, 1.4]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Gurney flap trailing edge */}
      <mesh position={[0.25, 0.06, 0]} castShadow>
        <boxGeometry args={[0.04, 0.12, 1.4]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Left swan-neck strut */}
      <mesh position={[0, -0.22, -0.52]} rotation={[0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right swan-neck strut */}
      <mesh position={[0, -0.22, 0.52]} rotation={[-0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* End plates */}
      {[-0.72, 0.72].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} castShadow>
          <boxGeometry args={[0.55, 0.2, 0.04]} />
          <meshStandardMaterial color={color} emissive={emissive} metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function SplitterGeometry({ color, emissive }) {
  return (
    <group>
      {/* Main flat splitter plate */}
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.04, 1.5]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Vertical strakes */}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0.04, -0.04, z]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.025]} />
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Front lip */}
      <mesh position={[0.05, 0.01, 0]} castShadow>
        <boxGeometry args={[0.04, 0.03, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.15} />
      </mesh>
    </group>
  );
}

function GearboxGeometry({ color, emissive, roughness, metalness }) {
  return (
    <group>
      {/* Main casing */}
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.45, 0.8]} />
        <meshStandardMaterial color={color} emissive={emissive} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Output shaft */}
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 12]} />
        <meshStandardMaterial color="#d0a000" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Input shaft */}
      <mesh position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
        <meshStandardMaterial color="#c09000" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Cooling fins */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.26, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.7]} />
          <meshStandardMaterial color="#e0b000" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function WheelGeometry({ color, emissive }) {
  return (
    <group>
      {/* Tyre */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.18, 16, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rim */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 20]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* 6 spokes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18]}
            castShadow
          >
            <boxGeometry args={[0.05, 0.04, 0.32]} />
            <meshStandardMaterial color={color} metalness={0.95} roughness={0.05} />
          </mesh>
        );
      })}
      {/* Centre hub */}
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#00B4E6" metalness={1} roughness={0} emissive="#003850" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function BrakeGeometry({ color, emissive }) {
  return (
    <group>
      {/* Carbon-ceramic disc */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.04, 20]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Disc vents (slots) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.26, 0.03, Math.sin(angle) * 0.26]} castShadow>
            <boxGeometry args={[0.04, 0.05, 0.12]} />
            <meshStandardMaterial color="#111" roughness={0.8} metalness={0.2} />
          </mesh>
        );
      })}
      {/* Caliper body */}
      <mesh position={[0, 0.06, 0.3]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.14]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Caliper pistons */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0.24]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 10]} />
          <meshStandardMaterial color="#cc2222" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function ExhaustGeometry({ color, emissive }) {
  // 5-pipe exhausts like the real Chiron
  const pipes = [
    [-0.28, 0.14], [-0.12, 0.14], [0, 0], [0.12, 0.14], [0.28, 0.14],
  ];
  return (
    <group>
      {pipes.map(([x, y], i) => (
        <group key={i}>
          {/* Pipe end face ring */}
          <mesh position={[x, y, 0.06]}>
            <torusGeometry args={[0.072, 0.012, 8, 16]} />
            <meshStandardMaterial color="#e0e0e0" metalness={1} roughness={0.05} />
          </mesh>
          {/* Pipe body */}
          <mesh position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.35, 12, 1, true]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              metalness={0.9}
              roughness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      {/* Exhaust manifold */}
      <mesh position={[0, 0.06, -0.2]} castShadow>
        <boxGeometry args={[0.7, 0.38, 0.12]} />
        <meshStandardMaterial color="#6a2a9a" metalness={0.8} roughness={0.3} emissive="#15003a" />
      </mesh>
    </group>
  );
}

function NacaDuctGeometry({ color, emissive }) {
  return (
    <group>
      {/* NACA duct scoop body */}
      <mesh castShadow>
        <boxGeometry args={[0.75, 0.08, 0.18]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.6} roughness={0.15} />
      </mesh>
      {/* Internal channel (slightly inset) */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.14]} />
        <meshStandardMaterial color="#000" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Lip at inlet */}
      <mesh position={[-0.38, 0.02, 0]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.18]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.7} roughness={0.1} />
      </mesh>
    </group>
  );
}

function FuelSystemGeometry({ color, emissive }) {
  return (
    <group>
      {/* Main fuel tank */}
      <mesh castShadow>
        <capsuleGeometry args={[0.22, 0.9, 6, 12]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Fuel rail high-pressure */}
      <mesh position={[0.28, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.85, 10]} />
        <meshStandardMaterial color="#00d4b0" metalness={0.9} roughness={0.15} emissive="#002a20" />
      </mesh>
      {/* Return line */}
      <mesh position={[-0.28, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.85, 8]} />
        <meshStandardMaterial color="#00b090" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Fuel pump */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 10]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Map part id → specific geometry component
function PartGeometrySwitch({ part, hovered, selected }) {
  const p = { ...part, hovered, selected };
  switch (part.id) {
    case "body-shell":   return <BodyShellGeometry   {...p} />;
    case "monocoque":    return <MonocoqueGeometry    {...p} />;
    case "w16-engine":   return <EngineGeometry       {...p} />;
    case "quad-turbos":  return <TurboGeometry        {...p} />;
    case "active-wing":  return <ActiveWingGeometry   {...p} />;
    case "front-splitter": return <SplitterGeometry   {...p} />;
    case "gearbox":      return <GearboxGeometry      {...p} />;
    case "wheels":       return <WheelGeometry        {...p} />;
    case "brakes":       return <BrakeGeometry        {...p} />;
    case "exhaust":      return <ExhaustGeometry      {...p} />;
    case "naca-ducts":   return <NacaDuctGeometry     {...p} />;
    case "fuel-system":  return <FuelSystemGeometry   {...p} />;
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={part.scale} />
          <meshStandardMaterial color={part.color} emissive={part.emissive} metalness={part.metalness} roughness={part.roughness} />
        </mesh>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Animated part group (handles explosion lerp + selection glow)
// ─────────────────────────────────────────────────────────────────────────────
function CarPart({ part, explodeProgress, onSelect, isSelected }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const currentPos = useRef(new THREE.Vector3(...part.position));
  const targetPos = useRef(new THREE.Vector3(...part.position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const ex = part.position[0] + part.explode[0] * explodeProgress;
    const ey = part.position[1] + part.explode[1] * explodeProgress;
    const ez = part.position[2] + part.explode[2] * explodeProgress;
    targetPos.current.set(ex, ey, ez);
    currentPos.current.lerp(targetPos.current, 0.055);
    groupRef.current.position.copy(currentPos.current);

    // Gentle rotation when exploded
    if (explodeProgress > 0.08) {
      const dir = part.id.charCodeAt(0) % 2 === 0 ? 1 : -1;
      groupRef.current.rotation.y += 0.0035 * explodeProgress * dir;
    }
  });

  return (
    <group
      ref={groupRef}
      position={part.position}
      onClick={(e) => { e.stopPropagation(); onSelect(part); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Outline ring when selected */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.7, 12, 12]} />
          <meshBasicMaterial color={part.color} wireframe transparent opacity={0.15} />
        </mesh>
      )}

      <PartGeometrySwitch part={part} hovered={hovered} selected={isSelected} />

      {/* Floating 3D label when exploded */}
      {explodeProgress > 0.35 && (
        <Html center distanceFactor={9} style={{ pointerEvents: "none" }}>
          <div
            className="part-3d-label"
            style={{
              opacity: Math.min((explodeProgress - 0.35) / 0.25, 1),
              borderColor: part.color,
            }}
          >
            <span className="part-3d-label__name">{part.shortLabel}</span>
            <span className="part-3d-label__stat" style={{ color: part.color }}>
              {part.stat}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Camera slow orbit
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig({ explodeProgress }) {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    angle.current += delta * 0.1;
    const radius = 7 + explodeProgress * 4;
    const height  = 1.8 + explodeProgress * 2;
    const tx = Math.sin(angle.current) * radius;
    const tz = Math.cos(angle.current) * radius;
    camera.position.lerp({ x: tx, y: height, z: tz }, 0.018);
    camera.lookAt(0, 0.5 * explodeProgress, 0);
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Full scene contents (inside Canvas)
// ─────────────────────────────────────────────────────────────────────────────
function CarScene({ explodeProgress, selectedPart, onPartSelect }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <spotLight position={[6, 9, 5]} intensity={3} angle={0.35} penumbra={0.8} castShadow shadow-mapSize={[2048, 2048]} color="#ffffff" />
      <spotLight position={[-7, 5, -5]} intensity={1.8} angle={0.45} penumbra={1} color="#00B4E6" />
      <pointLight position={[0, -0.5, 0]} intensity={0.8} color="#001830" />
      <directionalLight position={[4, 6, -4]} intensity={0.6} color="#c0d8ff" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#00B4E6" distance={14} />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050810"
          metalness={0.6}
        />
      </mesh>

      {/* Grid wireframe on floor */}
      <gridHelper args={[22, 22, "#00B4E6", "#001a30"]} position={[0, -1.08, 0]} />

      {/* Atmospheric particles */}
      <Sparkles count={100} scale={12} size={0.9} speed={0.12} color="#00B4E6" opacity={0.4} />

      {/* Contact shadows */}
      <ContactShadows position={[0, -1.09, 0]} opacity={0.6} scale={14} blur={2.5} far={4} />

      {/* Camera */}
      <CameraRig explodeProgress={explodeProgress} />

      {/* All car parts */}
      {parts.map((part) => (
        <CarPart
          key={part.id}
          part={part}
          explodeProgress={explodeProgress}
          onSelect={onPartSelect}
          isSelected={selectedPart?.id === part.id}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page Section wrapper — handles scroll → progress
// ─────────────────────────────────────────────────────────────────────────────
export default function Scene3DSection() {
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null);
  const sectionRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      progressRef.current = Math.max(0, Math.min(1, -rect.top / (rect.height - winH)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let smoothed = 0;
    let raf;
    const loop = () => {
      smoothed += (progressRef.current - smoothed) * 0.04;
      setExplodeProgress(Math.max(0, Math.min(1, smoothed)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stateLabel =
    explodeProgress < 0.12 ? "Scroll to disassemble"
    : explodeProgress < 0.85 ? "Click any part to inspect"
    : "Fully disassembled";

  return (
    <section id="teardown" className="scene3d-section" ref={sectionRef}>
      <div className="scene3d-sticky">
        {/* Header */}
        <div className="scene3d-header">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            Engineering Teardown
          </motion.span>
          <motion.h2
            className="scene3d-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Every Part. Every Detail.
          </motion.h2>
        </div>

        {/* Scroll progress */}
        <div className="scene3d-progress">
          <div className="scene3d-progress__bar" style={{ width: `${explodeProgress * 100}%` }} />
          <span className="scene3d-progress__label">{stateLabel}</span>
        </div>

        {/* 3D Canvas */}
        <Canvas
          className="scene3d-canvas"
          shadows
          camera={{ position: [0, 1.8, 7], fov: 48 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          onPointerMissed={() => setSelectedPart(null)}
        >
          <color attach="background" args={["#06070a"]} />
          <fog attach="fog" args={["#06070a", 20, 38]} />
          <CarScene
            explodeProgress={explodeProgress}
            selectedPart={selectedPart}
            onPartSelect={(p) => setSelectedPart((prev) => (prev?.id === p.id ? null : p))}
          />
        </Canvas>

        {/* Parts legend */}
        <div className="parts-legend">
          {parts.map((part, i) => (
            <motion.button
              key={part.id}
              className={`parts-legend__item ${selectedPart?.id === part.id ? "parts-legend__item--active" : ""}`}
              style={{ "--col": part.color }}
              onClick={() => setSelectedPart((prev) => (prev?.id === part.id ? null : part))}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="parts-legend__dot" />
              <span className="parts-legend__name">{part.shortLabel}</span>
              <span className="parts-legend__stat">{part.stat}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPart && (
          <PartDetailPanel part={selectedPart} onClose={() => setSelectedPart(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
