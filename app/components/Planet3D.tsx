import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import * as THREE from 'three';

// Gerçekçi 3D Satürn modeli (GLB formatı), dokunarak çevrilebilir
export default function Planet3D() {
  const modelRef = useRef<THREE.Group | null>(null);
  const lastTouch = useRef({ x: 0, y: 0 });

  return (
    <GLView
      style={{ width: 140, height: 140, borderRadius: 70, overflow: 'hidden', backgroundColor: 'transparent' }}
      onContextCreate={async (gl: ExpoWebGLRenderingContext) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 3.5;

        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);

        // Gelişmiş ışıklandırma - Satürn'ü daha güzel gösterir
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight1.position.set(3, 2, 2);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffeedd, 0.4);
        directionalLight2.position.set(-2, -1, 1);
        scene.add(directionalLight2);

        // Hafif bir nokta ışığı - derinlik kazandırır
        const pointLight = new THREE.PointLight(0xffd700, 0.5, 100);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        // Manuel olarak güzel bir Satürn oluştur
        const group = new THREE.Group();
        
        // Satürn gezegeni
        const geometry = new THREE.SphereGeometry(0.8, 64, 64);
        const material = new THREE.MeshStandardMaterial({
          color: '#ead9a8',
          roughness: 0.4,
          metalness: 0.2,
        });
        const planet = new THREE.Mesh(geometry, material);
        group.add(planet);
        
        // Satürn halkası - çoklu halka katmanları (5 katman)
        for (let i = 0; i < 5; i++) {
          const innerRadius = 1.0 + (i * 0.08);
          const outerRadius = 1.08 + (i * 0.08);
          const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128);
          const ringMat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? '#d2b48c' : '#c4a376',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85 - (i * 0.05),
            roughness: 0.6,
            metalness: 0.1,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2.3;
          group.add(ring);
        }
        
        group.rotation.x = THREE.MathUtils.degToRad(15);
        modelRef.current = group;
        scene.add(group);

        // Animasyon döngüsü - yumuşak dönüş
        const render = () => {
          requestAnimationFrame(render);
          if (modelRef.current) {
            modelRef.current.rotation.y += 0.008; // Yavaş ve yumuşak dönüş
          }
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
        if (modelRef.current) {
          modelRef.current.rotation.y += dx * 0.015;
          modelRef.current.rotation.x += dy * 0.015;
        }
      }}
    />
  );
}
