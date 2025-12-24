import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import * as THREE from 'three';

// Satürn benzeri 3D gezegen (halkalı), dokunarak çevrilebilir
export default function Planet3D() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
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

        // Işık
        const light = new THREE.PointLight(0xffffff, 1.2, 100);
        light.position.set(0, 0, 2);
        scene.add(light);

        // Satürn gezegeni (küre)
        const geometry = new THREE.SphereGeometry(0.7, 48, 48);
        const material = new THREE.MeshStandardMaterial({
          color: '#e0c97f', // Satürn sarısı
          roughness: 0.5,
          metalness: 0.2,
        });
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        // --- Satürn yüzeyine çıkıntılar (detaylar) ekle ---
        // Küçük küreler ile rastgele çıkıntılar
        for (let i = 0; i < 12; i++) {
          const bumpGeo = new THREE.SphereGeometry(0.09 + Math.random() * 0.04, 16, 16);
          const bumpMat = new THREE.MeshStandardMaterial({
            color: '#e6d8a3',
            roughness: 0.4,
            metalness: 0.3,
          });
          const bump = new THREE.Mesh(bumpGeo, bumpMat);
          // Rastgele bir noktaya yerleştir (küre yüzeyinde)
          const phi = Math.random() * Math.PI;
          const theta = Math.random() * 2 * Math.PI;
          const r = 0.7 + 0.05;
          bump.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          );
          mesh.add(bump);
        }

        // Satürn halkası
        const ringGeometry = new THREE.RingGeometry(0.85, 1.15, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: '#d2b48c',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ringRef.current = ring;
        ring.rotation.x = Math.PI / 2.2; // Hafif eğik
        mesh.add(ring);

        // Animasyon döngüsü
        const render = () => {
          requestAnimationFrame(render);
          mesh.rotation.y += 0.01;
          ring.rotation.z += 0.012; // Halka da döner
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
        if (meshRef.current && ringRef.current) {
          meshRef.current.rotation.y += dx * 0.01;
          meshRef.current.rotation.x += dy * 0.01;
          ringRef.current.rotation.z += dx * 0.012; // Halka da döner
        }
      }}
    />
  );
}
