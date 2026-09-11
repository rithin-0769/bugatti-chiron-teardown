import re

content = open('src/components/Scene3D.jsx', 'r').read()

if 'import ToolbarOverlay' not in content:
    content = content.replace('import PartDetailPanel from "./PartDetailPanel";', 'import PartDetailPanel from "./PartDetailPanel";\nimport ToolbarOverlay from "./ToolbarOverlay";')

body_shell_orig = 'function BodyShellGeometry({ color, emissive, roughness, metalness, hovered, selected }) {'
body_shell_new = '''function BodyShellGeometry({ color, emissive, roughness, metalness, hovered, selected, isXRayMode, carColor }) {
  const baseColor = carColor || color;
  const mat = isXRayMode ? { color: baseColor, transparent: true, transmission: 1, opacity: 1, roughness: 0.1, thickness: 2, ior: 1.5, envMapIntensity: 1.5 } : { color: baseColor, emissive, roughness, metalness, envMapIntensity: 1.2 };
  const wMat = isXRayMode ? { ...mat } : { color: baseColor, emissive, roughness: 0, metalness: 1, envMapIntensity: 2 };
  const Material = isXRayMode ? "meshPhysicalMaterial" : "meshStandardMaterial";'''

content = content.replace(body_shell_orig, body_shell_new)
content = content.replace('<meshStandardMaterial {...mat} />', '<Material {...mat} />')
content = content.replace('<meshStandardMaterial {...wMat} />', '<Material {...wMat} />')

wheel_orig = 'function WheelGeometry({ color, emissive }) {'
wheel_new = 'function WheelGeometry({ color, emissive, carColor }) {'
content = content.replace(wheel_orig, wheel_new)
content = content.replace('meshStandardMaterial color={color}', 'meshStandardMaterial color={carColor || color}')

part_switch_orig = 'function PartGeometrySwitch({ part, hovered, selected }) {'
part_switch_new = 'function PartGeometrySwitch({ part, hovered, selected, isXRayMode, carColor }) {'
content = content.replace(part_switch_orig, part_switch_new)
content = content.replace('const p = { ...part, hovered, selected };', 'const p = { ...part, hovered, selected, isXRayMode, carColor };')

car_part_orig = 'function CarPart({ part, explodeProgress, onSelect, isSelected }) {'
car_part_new = 'function CarPart({ part, explodeProgress, onSelect, isSelected, isXRayMode, carColor }) {'
content = content.replace(car_part_orig, car_part_new)
content = content.replace('<PartGeometrySwitch part={part} hovered={hovered} selected={isSelected} />', '<PartGeometrySwitch part={part} hovered={hovered} selected={isSelected} isXRayMode={isXRayMode} carColor={carColor} />')

car_scene_orig = 'function CarScene({ explodeProgress, selectedPart, onPartSelect }) {'
car_scene_new = 'function CarScene({ explodeProgress, selectedPart, onPartSelect, isXRayMode, carColor }) {'
content = content.replace(car_scene_orig, car_scene_new)
content = content.replace('isSelected={selectedPart?.id === part.id}', 'isSelected={selectedPart?.id === part.id}\n          isXRayMode={isXRayMode}\n          carColor={carColor}')

content = content.replace('  const sectionRef = useRef(null);', '  const [carColor, setCarColor] = useState("#0055ff");\n  const [isXRayMode, setIsXRayMode] = useState(false);\n  const [isTourMode, setIsTourMode] = useState(false);\n  const sectionRef = useRef(null);')

loop_effect = '''  useEffect(() => {
    let smoothed = 0;
    let raf;
    const loop = (t) => {
      if (isTourMode) {
         const cycle = (Math.sin(t * 0.0005 - Math.PI/2) + 1) / 2;
         setExplodeProgress(cycle);
      } else {
         smoothed += (progressRef.current - smoothed) * 0.04;
         setExplodeProgress(Math.max(0, Math.min(1, smoothed)));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isTourMode]);'''

content = re.sub(r'  useEffect\(\(\) => \{\n    let smoothed = 0;[\s\S]*?  \}, \[\]\);', loop_effect, content)

render_orig = '<div className="scene3d-sticky">'
render_new = '''<div className="scene3d-sticky">
        <ToolbarOverlay 
          carColor={carColor} setCarColor={setCarColor} 
          isXRayMode={isXRayMode} setIsXRayMode={setIsXRayMode} 
          isTourMode={isTourMode} setIsTourMode={setIsTourMode} 
        />'''
content = content.replace(render_orig, render_new)

car_scene_render_orig = 'onPartSelect={(p) => setSelectedPart((prev) => (prev?.id === p.id ? null : p))}\n          />'
car_scene_render_new = 'onPartSelect={(p) => setSelectedPart((prev) => (prev?.id === p.id ? null : p))}\n            isXRayMode={isXRayMode}\n            carColor={carColor}\n          />'
content = content.replace(car_scene_render_orig, car_scene_render_new)

with open('src/components/Scene3D.jsx', 'w') as f:
    f.write(content)

print("Patch successful!")
