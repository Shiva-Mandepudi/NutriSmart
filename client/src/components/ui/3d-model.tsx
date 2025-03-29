import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/hooks/use-theme";
import { Loader2 } from "lucide-react";

interface ThreeDModelProps {
  modelType: "protein" | "carb" | "fat" | "plate" | "water";
  animate?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Global storage for Three.js instances to prevent memory leaks
const instanceStore = new Map<string, {
  renderer?: THREE.WebGLRenderer,
  scene?: THREE.Scene,
  frameId?: number
}>();

export function ThreeDModel({ 
  modelType, 
  animate = true, 
  size = "md",
  className = ""
}: ThreeDModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const instanceId = useRef(`three-model-${Math.random().toString(36).substring(2, 9)}`);
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
  
  // Clean up function to safely dispose Three.js resources
  const cleanupThreeJS = () => {
    const instance = instanceStore.get(instanceId.current);
    if (!instance) return;
    
    // Cancel animation frame
    if (instance.frameId) {
      cancelAnimationFrame(instance.frameId);
    }
    
    // Dispose of renderer
    if (instance.renderer) {
      instance.renderer.dispose();
    }
    
    // Clean up scene and geometries
    if (instance.scene) {
      instance.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            // Check if material is an array
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    }
    
    // Remove from store
    instanceStore.delete(instanceId.current);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up any existing instance first
    cleanupThreeJS();
    
    // Create a new instance entry
    instanceStore.set(instanceId.current, {});
    
    // Set up scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Store renderer and scene in instance store
    instanceStore.set(instanceId.current, { 
      renderer, 
      scene 
    });
    
    // Clear any existing children from the container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    // Add new renderer
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
    let model: THREE.Object3D;
    
    const getModelColor = () => {
      switch(modelType) {
        case "protein": return 0x4f46e5; // Blue
        case "carb": return 0x10b981;    // Green
        case "fat": return 0xfbbf24;     // Yellow
        case "water": return 0x60a5fa;   // Light blue
        case "plate":
        default: return 0xec4899;        // Pink
      }
    };
    
    // Create simplified shapes for better performance
    switch (modelType) {
      case "protein":
        model = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.3, 16, 32),
          new THREE.MeshPhongMaterial({ color: getModelColor() })
        );
        break;
        
      case "carb":
        model = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1.5, 1.5),
          new THREE.MeshPhongMaterial({ color: getModelColor() })
        );
        break;
        
      case "fat":
        model = new THREE.Mesh(
          new THREE.SphereGeometry(1, 16, 16),
          new THREE.MeshPhongMaterial({ color: getModelColor() })
        );
        break;
        
      case "water":
        model = new THREE.Mesh(
          new THREE.TetrahedronGeometry(1, 0),
          new THREE.MeshPhongMaterial({ 
            color: getModelColor(),
            opacity: 0.8,
            transparent: true
          })
        );
        break;
        
      case "plate":
      default:
        // Create a simplified plate
        model = new THREE.Group();
        
        const plate = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16),
          new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        
        // Add simple food items
        const food1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshPhongMaterial({ color: 0x10b981 }) // Green
        );
        food1.position.set(0.5, 0.2, 0.3);
        
        const food2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.2, 0.4),
          new THREE.MeshPhongMaterial({ color: 0xf59e0b }) // Amber
        );
        food2.position.set(-0.4, 0.2, 0.2);
        
        (model as THREE.Group).add(plate, food1, food2);
        break;
    }
    
    scene.add(model);
    
    // Animation loop
    const animateScene = () => {
      const instance = instanceStore.get(instanceId.current);
      if (!instance || !instance.renderer || !instance.scene) return;
      
      const frameId = requestAnimationFrame(animateScene);
      instanceStore.set(instanceId.current, { ...instance, frameId });
      
      if (model && animate) {
        model.rotation.x += 0.01;
        model.rotation.y += 0.005;
      }
      
      instance.renderer.render(instance.scene, camera);
    };
    
    // Start animation and update loading state
    animateScene();
    setIsLoading(false);
    
    // Clean up on unmount
    return () => {
      cleanupThreeJS();
      
      // Extra safety: if the DOM element still exists, try to remove it
      if (containerRef.current) {
        const instance = instanceStore.get(instanceId.current);
        if (instance && instance.renderer && containerRef.current.contains(instance.renderer.domElement)) {
          try {
            containerRef.current.removeChild(instance.renderer.domElement);
          } catch (err) {
            console.error("Error removing renderer on cleanup", err);
          }
        }
      }
    };
  }, [modelType, animate, theme, width, height]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
      data-testid="three-model-container"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
