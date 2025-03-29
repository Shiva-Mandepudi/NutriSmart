import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useTheme } from "@/hooks/use-theme";
import { Loader2 } from "lucide-react";

interface ThreeDFoodModelProps {
  modelType: "protein" | "carb" | "fat" | "plate" | "water";
  animate?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThreeDModel({ 
  modelType, 
  animate = true, 
  size = "md",
  className = ""
}: ThreeDFoodModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  
  // Determine size dimensions
  const getDimensions = () => {
    switch(size) {
      case "sm": return { width: 100, height: 100 };
      case "lg": return { width: 300, height: 300 };
      case "md":
      default: return { width: 200, height: 200 };
    }
  };
  
  const { width, height } = getDimensions();

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Setup renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear existing canvas
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(
      theme === 'dark' ? 0x555555 : 0x777777
    );
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create model based on type
    let model: THREE.Mesh | THREE.Group;
    
    const getModelColor = () => {
      switch(modelType) {
        case "protein": return 0x4f46e5; // Primary blue
        case "carb": return 0x10b981; // Green
        case "fat": return 0xfbbf24; // Yellow
        case "water": return 0x60a5fa; // Light blue
        case "plate":
        default: return 0xec4899; // Pink
      }
    };
    
    switch (modelType) {
      case "protein":
        model = new THREE.Mesh(
          new THREE.TorusKnotGeometry(1, 0.3, 128, 64),
          new THREE.MeshPhongMaterial({ 
            color: getModelColor(),
            shininess: 100,
            flatShading: false
          })
        );
        break;
        
      case "carb":
        model = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1, 0),
          new THREE.MeshPhongMaterial({ 
            color: getModelColor(),
            shininess: 80,
            flatShading: false
          })
        );
        break;
        
      case "fat":
        model = new THREE.Mesh(
          new THREE.SphereGeometry(1, 32, 32),
          new THREE.MeshPhongMaterial({ 
            color: getModelColor(),
            shininess: 120,
            flatShading: false
          })
        );
        break;
        
      case "water":
        model = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1, 0),
          new THREE.MeshPhongMaterial({ 
            color: getModelColor(),
            shininess: 130,
            opacity: 0.8,
            transparent: true
          })
        );
        break;
        
      case "plate":
      default:
        const group = new THREE.Group();
        
        // Create plate
        const plate = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32),
          new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            shininess: 100 
          })
        );
        
        // Add food items on plate
        const food1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshPhongMaterial({ color: 0x10b981 }) // Green
        );
        food1.position.set(0.5, 0.2, 0.3);
        
        const food2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.2, 0.4),
          new THREE.MeshPhongMaterial({ color: 0xf59e0b }) // Amber
        );
        food2.position.set(-0.4, 0.2, 0.2);
        
        const food3 = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 16, 16),
          new THREE.MeshPhongMaterial({ color: 0xef4444 }) // Red
        );
        food3.position.set(0, 0.2, -0.5);
        
        group.add(plate, food1, food2, food3);
        model = group;
        break;
    }
    
    scene.add(model);
    
    // Add OrbitControls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    
    // Animation loop
    let frameId: number;
    
    const animateScene = () => {
      frameId = requestAnimationFrame(animateScene);
      
      if (animate) {
        model.rotation.x += 0.01;
        model.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animateScene();
    setIsLoading(false);
    
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [modelType, animate, theme, width, height]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
