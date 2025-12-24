import { Asset } from 'expo-asset';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer, loadAsync } from 'expo-three';
import React, { useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import * as THREE from 'three';

interface Planet3DViewerProps {
  name: string; // lowercase key, e.g. "saturn"
  size?: number; // pixels
}

// Static require map to satisfy Metro bundler
const GLB_MAP: Record<string, any> = {
  mercury: require('../../simgeler/gltf/mercury.glb'),
  venus: require('../../simgeler/gltf/venus.glb'),
  earth: require('../../simgeler/gltf/earth.glb'),
  mars: require('../../simgeler/gltf/mars.glb'),
  jupiter: require('../../simgeler/gltf/jupiter.glb'),
  saturn: require('../../simgeler/gltf/saturn.glb'),
  uranus: require('../../simgeler/gltf/uranus.glb'),
  neptune: require('../../simgeler/gltf/neptune.glb'),
  sun: require('../../simgeler/gltf/sun.glb'),
  moon: require('../../simgeler/gltf/moon.glb'),
  io: require('../../simgeler/gltf/io.glb'),
  europa: require('../../simgeler/gltf/europa.glb'),
  ganymede: require('../../simgeler/gltf/ganymede.glb'),
  callisto: require('../../simgeler/gltf/callisto.glb'),
  titan: require('../../simgeler/gltf/titan.glb'),
  triton: require('../../simgeler/gltf/triton.glb'),
};

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

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dir1 = new THREE.DirectionalLight(0xffffff, 1.1);
        dir1.position.set(3, 2, 2);
        scene.add(dir1);
        const dir2 = new THREE.DirectionalLight(0xffeedd, 0.5);
        dir2.position.set(-2, -1, 1);
        scene.add(dir2);

        // Try to load GLB model, fallback to procedural
        const lower = name.toLowerCase();
        try {
          const mod = GLB_MAP[lower];
          if (!mod) throw new Error('Model mapping not found');
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const object = await loadAsync(asset.localUri || asset.uri);
          object.scale.set(1.6, 1.6, 1.6);
          modelRef.current = object;
          scene.add(object);
        } catch (e) {
          // Fallback
          const group = new THREE.Group();
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 48, 48),
            new THREE.MeshStandardMaterial({ color: '#cfcfcf', roughness: 0.5 })
          );
          group.add(sphere);
          if (lower === 'saturn') {
            for (let i = 0; i < 5; i++) {
              const inner = 1.1 + i * 0.08;
              const outer = 1.18 + i * 0.08;
              const ring = new THREE.Mesh(
                new THREE.RingGeometry(inner, outer, 128),
                new THREE.MeshStandardMaterial({
                  color: i % 2 === 0 ? '#d2b48c' : '#c4a376',
                  side: THREE.DoubleSide,
                  transparent: true,
                  opacity: 0.85 - i * 0.05,
                })
              );
              ring.rotation.x = Math.PI / 2.3;
              group.add(ring);
            }
          }
          modelRef.current = group;
          scene.add(group);
        }

        const render = () => {
          requestAnimationFrame(render);
          if (modelRef.current) modelRef.current.rotation.y += 0.01;
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
          modelRef.current.rotation.y += dx * 0.01;
          modelRef.current.rotation.x += dy * 0.01;
        }
      }}
    />
  );
}
