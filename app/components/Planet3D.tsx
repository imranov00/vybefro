import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import * as THREE from 'three';

// Güneş benzeri 3D gezegen (küre) örneği, dokunarak çevrilebilir
export default function Planet3D() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lastTouch = useRef({ x: 0, y: 0 });

  return (
    <GLView
      style={{ width: 140, height: 140, borderRadius: 70, overflow: 'hidden', backgroundColor: 'transparent' }}
      onContextCreate={async (gl: ExpoWebGLRenderingContext) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2.5;

        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);

        // Ana ışık (güneş ışığı)
        const light = new THREE.PointLight(0xfff7b2, 1.5, 100);
        light.position.set(0, 0, 2);
        scene.add(light);

        // Küre (Güneş)
        const geometry = new THREE.SphereGeometry(0.9, 48, 48);
        const material = new THREE.MeshStandardMaterial({
          color: '#FFD700', // Altın sarısı
          emissive: '#FFB300', // Parlaklık
          emissiveIntensity: 0.8,
          roughness: 0.3,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        // Hafif bir glow efekti için ikinci bir şeffaf küre
        const glowGeometry = new THREE.SphereGeometry(1.05, 48, 48);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: '#FFFACD',
          transparent: true,
          opacity: 0.35,
          side: THREE.BackSide,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);

        // Animasyon döngüsü
        const render = () => {
          requestAnimationFrame(render);
          mesh.rotation.y += 0.01;
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        render();
      }}
      onTouchStart={(e: GestureResponderEvent) => {
        const touch = e.nativeEvent.touches[0];
        lastTouch.current = { x: touch.locationX, y: touch.locationY };
      }}
      onTouchMove={(e: GestureResponderEvent) => {
        const touch = e.nativeEvent.touches[0];
        const dx = touch.locationX - lastTouch.current.x;
        const dy = touch.locationY - lastTouch.current.y;
        lastTouch.current = { x: touch.locationX, y: touch.locationY };
        if (meshRef.current) {
          meshRef.current.rotation.y += dx * 0.01;
          meshRef.current.rotation.x += dy * 0.01;
        }
      }}
    />
  );
}
