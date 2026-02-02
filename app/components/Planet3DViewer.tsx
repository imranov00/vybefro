import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import * as THREE from 'three';

interface Planet3DViewerProps {
  name: string;
  size?: number;
}

export default function Planet3DViewer({ name, size = 220 }: Planet3DViewerProps) {
  const modelRef = useRef<THREE.Object3D | null>(null);
  const lastTouch = useRef({ x: 0, y: 0 });

  return (
    <GLView
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: 'transparent' }}
      onContextCreate={async (gl: ExpoWebGLRenderingContext) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 3.5;

        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 3, 5);
        scene.add(mainLight);
        
        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.6);
        fillLight.position.set(-3, -2, 2);
        scene.add(fillLight);

        if (name.toLowerCase() === 'saturn') {
          const group = new THREE.Group();
          
          const saturnSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 48, 48),
            new THREE.MeshStandardMaterial({ 
              color: '#ffeaa7', 
              roughness: 0.7,
              metalness: 0.1
            })
          );
          group.add(saturnSphere);
          
          for (let i = 0; i < 6; i++) {
            const inner = 1.0 + i * 0.08;
            const outer = 1.08 + i * 0.08;
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(inner, outer, 64),
              new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? '#d4af37' : '#c19a6b',
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8 - i * 0.1,
              })
            );
            ring.rotation.x = Math.PI / 2.1;
            group.add(ring);
          }
          
          modelRef.current = group;
          scene.add(group);
        } else {
          const planetMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 48, 48),
            new THREE.MeshStandardMaterial({ color: '#cfcfcf', roughness: 0.5 })
          );
          modelRef.current = planetMesh;
          scene.add(planetMesh);
        }

        const render = () => {
          requestAnimationFrame(render);
          if (modelRef.current) modelRef.current.rotation.y += 0.008;
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        render();
      }}
      onTouchStart={(e: GestureResponderEvent) => {
        const t = e.nativeEvent.touches[0];
        lastTouch.current = { x: t.locationX, y: t.locationY };
      }}
      onTouchMove={(e: GestureResponderEvent) => {
        const t = e.nativeEvent.touches[0];
        const dx = t.locationX - lastTouch.current.x;
        const dy = t.locationY - lastTouch.current.y;
        lastTouch.current = { x: t.locationX, y: t.locationY };
        if (modelRef.current) {
          modelRef.current.rotation.y += dx * 0.008;
          modelRef.current.rotation.x += dy * 0.008;
        }
      }}
    />
  );
}