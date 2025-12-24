import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';

type UniverseSceneProps = {
  onSelectPlanet?: (name: string) => void;
};

type OrbitingBody = {
  name: string;
  radius: number;
  distance: number; // orbit radius
  orbitSpeed: number; // radians per second
  rotationSpeed: number; // radians per second (self-rotation)
  color: number;
  ring?: { inner: number; outer: number; color: number; opacity?: number };
};

export default function UniverseScene({ onSelectPlanet }: UniverseSceneProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const glViewRef = useRef<GLView | null>(null);

  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);

  const raycaster = useRef(new THREE.Raycaster());
  const planetMeshesRef = useRef<THREE.Mesh[]>([]);
  const anglesRef = useRef<Record<string, number>>({});

  // Bodies configuration (distances are arbitrary, scaled for mobile screen)
  const bodies: OrbitingBody[] = [
    { name: 'mercury', radius: 0.7, distance: 6, orbitSpeed: 1.6, rotationSpeed: 0.8, color: 0xe0c9b5 },
    { name: 'venus', radius: 0.9, distance: 8, orbitSpeed: 1.2, rotationSpeed: 0.6, color: 0xffc04a },
    { name: 'earth', radius: 1.0, distance: 10, orbitSpeed: 1.0, rotationSpeed: 1.0, color: 0x3ba7ff },
    { name: 'mars', radius: 0.8, distance: 12, orbitSpeed: 0.8, rotationSpeed: 1.2, color: 0xff5722 },
    { name: 'jupiter', radius: 1.8, distance: 16, orbitSpeed: 0.5, rotationSpeed: 1.5, color: 0xd4a373 },
    { name: 'saturn', radius: 1.5, distance: 20, orbitSpeed: 0.4, rotationSpeed: 1.3, color: 0xf4d47a, ring: { inner: 2.2, outer: 3.2, color: 0xe8d8a0, opacity: 0.75 } },
    { name: 'uranus', radius: 1.2, distance: 24, orbitSpeed: 0.3, rotationSpeed: 1.1, color: 0x6de6ff },
    { name: 'neptune', radius: 1.2, distance: 28, orbitSpeed: 0.25, rotationSpeed: 1.0, color: 0x6680ff },
  ];

  function createStars(scene: THREE.Scene) {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 200;
      const x = (Math.random() - 0.5) * 2 * r;
      const y = (Math.random() - 0.5) * 2 * r;
      const z = (Math.random() - 0.5) * 2 * r;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
  }

  function createOrbitRing(distance: number, scene: THREE.Scene) {
    const segments = 128;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * distance;
      const z = Math.sin(t) * distance;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x6b6b7a, transparent: true, opacity: 0.35 });
    const line = new THREE.LineLoop(geometry, material);
    scene.add(line);
  }

  function createTextLabel(text: string, color: string = '#ffffff'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 32px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text.toUpperCase(), 128, 32);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 1, 1);
    return sprite;
  }

  function handleTap(x: number, y: number) {
    if (!cameraRef.current || !rendererRef.current) return;
    const { width, height } = size;
    const ndc = new THREE.Vector2((x / width) * 2 - 1, -(y / height) * 2 + 1);
    raycaster.current.setFromCamera(ndc, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(planetMeshesRef.current, true);
    if (intersects.length > 0 && onSelectPlanet) {
      const mesh = intersects[0].object;
      const name = (mesh.userData && mesh.userData.name) || mesh.name;
      if (name) onSelectPlanet(name);
    }
  }

  return (
    <View
      style={{ width: '100%', height: 420 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
      onStartShouldSetResponder={() => true}
      onResponderRelease={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
    >
      <GLView
        ref={glViewRef}
        style={{ flex: 1 }}
        onContextCreate={async (gl) => {
          const renderer = new Renderer({ gl });
          renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
          rendererRef.current = renderer;

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x0f1126);
          sceneRef.current = scene;

          const camera = new THREE.PerspectiveCamera(55, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
          camera.position.set(0, 22, 48);
          camera.lookAt(new THREE.Vector3(0, 0, 0));
          cameraRef.current = camera;

          // Lights
          const ambient = new THREE.AmbientLight(0xffffff, 0.25);
          scene.add(ambient);

          const sunLight = new THREE.PointLight(0xffc34a, 2.0, 0, 2);
          sunLight.position.set(0, 0, 0);
          scene.add(sunLight);

          // Stars background
          createStars(scene);

          // Sun
          const sunGeometry = new THREE.SphereGeometry(2.6, 32, 32);
          const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffb700, emissive: 0xffa200, emissiveIntensity: 0.9 });
          const sun = new THREE.Mesh(sunGeometry, sunMaterial);
          sun.name = 'sun';
          sun.userData = { name: 'sun' };
          scene.add(sun);

          // Sun label
          const sunLabel = createTextLabel('Sun / Güneş', '#ffdd44');
          sunLabel.position.set(0, 4, 0);
          scene.add(sunLabel);

          // Orbits and planets
          planetMeshesRef.current = [];
          anglesRef.current = {};

          const planetNames: Record<string, string> = {
            mercury: 'Merkür',
            venus: 'Venüs',
            earth: 'Dünya',
            mars: 'Mars',
            jupiter: 'Jüpiter',
            saturn: 'Satürn',
            uranus: 'Uranüs',
            neptune: 'Neptün',
          };

          bodies.forEach((b) => {
            createOrbitRing(b.distance, scene);

            const planetGeo = new THREE.SphereGeometry(b.radius, 32, 32);
            const planetMat = new THREE.MeshStandardMaterial({ 
              color: b.color, 
              roughness: 0.7, 
              metalness: 0.2,
              emissive: b.color,
              emissiveIntensity: 0.15
            });
            const planet = new THREE.Mesh(planetGeo, planetMat);
            planet.name = b.name;
            planet.userData = { name: b.name };

            // initial position
            anglesRef.current[b.name] = Math.random() * Math.PI * 2;
            const a = anglesRef.current[b.name];
            planet.position.set(Math.cos(a) * b.distance, 0, Math.sin(a) * b.distance);

            // saturn ring
            if (b.ring) {
              const ringGeo = new THREE.RingGeometry(b.ring.inner, b.ring.outer, 64);
              const ringMat = new THREE.MeshBasicMaterial({ color: b.ring.color, side: THREE.DoubleSide, transparent: true, opacity: b.ring.opacity ?? 0.6 });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              ring.rotation.x = Math.PI / 2.2;
              // parent ring to planet so it follows
              planet.add(ring);
            }

            // Planet label
            const label = createTextLabel(planetNames[b.name] || b.name, '#ffffff');
            label.position.y = b.radius + 1.2;
            planet.add(label);

            scene.add(planet);
            planetMeshesRef.current.push(planet);
          });

          // Animation loop
          let last = Date.now();
          const render = () => {
            const now = Date.now();
            const dt = (now - last) / 1000; // seconds
            last = now;

            // Rotate sun slightly for life
            sun.rotation.y += 0.1 * dt;

            // Update bodies
            bodies.forEach((b, idx) => {
              const planet = planetMeshesRef.current[idx];
              // self rotation
              planet.rotation.y += b.rotationSpeed * 0.2 * dt;
              // orbit
              const a = (anglesRef.current[b.name] += b.orbitSpeed * 0.2 * dt);
              planet.position.set(Math.cos(a) * b.distance, 0, Math.sin(a) * b.distance);
            });

            renderer.render(scene, camera);
            gl.endFrameEXP();
            animationRef.current = requestAnimationFrame(render);
          };

          render();
        }}
      />
    </View>
  );
}
