import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const loadPLYFile = (url) => {
      const loader = new PLYLoader();
      loader.load(
        url,
        (geometry) => {
          geometry.computeVertexNormals();

          const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            flatShading: false,
          });

          const mesh = new THREE.Mesh(geometry, material);
          meshRef.current = mesh;
          
          // Centraliza a geometria
          geometry.computeBoundingBox();
          const center = geometry.boundingBox.getCenter(new THREE.Vector3());
          mesh.position.sub(center);

          scene.add(mesh);

          // Ajusta a câmera para enquadrar o objeto
          const box = new THREE.Box3().setFromObject(mesh);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2;
          camera.lookAt(scene.position);

          // Atualiza os controles
          controls.update();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% carregado');
        },
        (error) => {
          console.error('Erro ao carregar o arquivo .ply', error);
        }
      );
    };

    loadPLYFile('/folha.ply');

    // Adiciona luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);

      // Aplica uma leve rotação ao objeto
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005; // Ajuste este valor para controlar a velocidade da rotação
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }}></div>;
}

export default App;