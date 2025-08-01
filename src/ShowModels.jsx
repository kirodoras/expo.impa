import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";

 const availableModels = [
   "Cilindro_x2_y2_1.ply",
   "Cilindro xy=1.ply",
   "Cúbica.ply",
   "Curva algébrica de gênero 2.ply",
   "Folheação de grau 2.ply",
   "Folheação de Vander Pol.ply",
 ];

const modelTitles = [
  "Cilindro x²+y²=1",
  "Cilindro xy=1",
  "Cúbica",
  "Curva algébrica de gênero 2",
  "Folheação de grau 2",
  "Folheação de Vander Pol",
];

const navBtnStyle = {
  background: "linear-gradient(90deg,#23234a 60%,#3939a1 100%)",
  border: "1.5px solid #646cff",
  borderRadius: 16,
  color: "#646cff",
  cursor: "pointer",
  outline: "none",
  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
  fontWeight: 700,
  userSelect: "none",
};

const ctrlBtnStyle = {
  borderRadius: 16,
  border: "1.5px solid #646cff",
  cursor: "pointer",
  outline: "none",
  fontWeight: 700,
  userSelect: "none",
  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
};

export default function ShowModels() {
  const mountRef = useRef();
  const meshRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  const [isMobile, setIsMobile] = useState(false);

  // Responsividade
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    checkMobile();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Inicialização da cena
  useEffect(() => {
    let renderer, scene, camera, controls, animationId;
    const mountNode = mountRef.current;
    let width = mountNode.clientWidth;
    let height = mountNode.clientHeight;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x0f0f0f, 1);
    renderer.setSize(width, height);
    mountNode.appendChild(renderer.domElement);

    // Luz
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(10, 10, 10);
    scene.add(dir);

    // OrbitControls
    import("three/examples/jsm/controls/OrbitControls").then(
      ({ OrbitControls }) => {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enablePan = false;
        controls.minDistance = 2;
        controls.maxDistance = 100;
        loadModel(availableModels[currentIndex]);
      }
    );

    function loadModel(modelName) {
      setLoading(true);
      // Remove mesh anterior
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
        meshRef.current = null;
      }
      const loader = new PLYLoader();
      loader.load(
        `/objects/${modelName}`,
        (geometry) => {
          const hasColors = geometry.attributes.color !== undefined;
          const material = new THREE.MeshPhongMaterial({
            vertexColors: hasColors,
            color: hasColors ? 0xffffff : 0x00ff00,
            side: THREE.DoubleSide,
            flatShading: false,
            wireframe: showWireframe,
          });
          const mesh = new THREE.Mesh(geometry, material);
          meshRef.current = mesh;
          geometry.computeBoundingBox();
          const center = geometry.boundingBox.getCenter(new THREE.Vector3());
          mesh.position.sub(center);
          scene.add(mesh);
          // Ajuste de câmera
          const boundingSphere = new THREE.Sphere();
          new THREE.Box3()
            .setFromObject(mesh)
            .getBoundingSphere(boundingSphere);
          const { radius } = boundingSphere;
          const fov = camera.fov * (Math.PI / 180);
          const distance = radius / Math.sin(fov / 2);
          camera.position.set(0, 0, distance * 1.1);
          camera.lookAt(0, 0, 0);
          setLoading(false);
        },
        undefined,
        () => {
          setLoading(false);
          alert("Erro ao carregar modelo");
        }
      );
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (meshRef.current && isRotating) {
        meshRef.current.rotation.y += rotationSpeed;
      }
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();
    // Atualiza modelo ao trocar
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountNode) {
        mountNode.innerHTML = "";
      }
    };
  }, [currentIndex, showWireframe, isRotating, rotationSpeed]);

  // Navegação
  const goNext = () => setCurrentIndex((i) => (i + 1) % availableModels.length);
  const goPrev = () =>
    setCurrentIndex(
      (i) => (i - 1 + availableModels.length) % availableModels.length
    );

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0f0f0f",
        fontFamily: "Segoe UI",
      }}
    >
      {/* Canvas 3D ocupa todo o fundo */}
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          background: "#111",
        }}
      />
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            color: "#646cff",
            fontSize: 24,
            background: "#111d",
            padding: 24,
            borderRadius: 12,
            zIndex: 10,
          }}
        >
          Carregando modelo...
        </div>
      )}
      {/* HUD de controles na parte inferior, sobreposto */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100vw",
          zIndex: 20,
          background: "rgba(24,24,27,0.7)",
          backdropFilter: "blur(16px) saturate(1.5)",
          WebkitBackdropFilter: "blur(16px) saturate(1.5)",
          boxShadow: "0 -8px 32px #000b",
          borderTop: "1.5px solid #3939a1cc",
          borderRadius: "24px 24px 0 0",
          padding: isMobile ? "6px 2px 8px 2px" : "18px 0 18px 0",
          display: "flex",
          flexDirection: "row",
          alignItems: isMobile ? "center" : "stretch",
          justifyContent: "center",
          gap: isMobile ? 8 : 0,
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Wrapper para alinhar verticalmente no desktop */}
        <div
          style={{
            display: isMobile ? "contents" : "flex",
            flexDirection: isMobile ? undefined : "row",
            alignItems: isMobile ? undefined : "center",
            justifyContent: isMobile ? undefined : "center",
            gap: isMobile ? undefined : 32,
            width: isMobile ? undefined : "100%",
            maxWidth: isMobile ? undefined : 900,
            margin: isMobile ? undefined : "0 auto",
          }}
        >
        {/* Nome e arquivo */}
        <div
          style={{
            minWidth: isMobile ? 0 : 200,
            textAlign: "center",
            marginBottom: isMobile ? 2 : 0,
            padding: isMobile ? 0 : undefined,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: isMobile ? 15 : 18,
              letterSpacing: 0.5,
              marginBottom: isMobile ? 0 : 2,
              textShadow: "0 2px 8px #0007",
              lineHeight: 1.1,
            }}
          >
            {modelTitles[currentIndex]}
          </div>
          <div
            style={{
              color: "#aab3ff",
              fontSize: isMobile ? 11 : 13,
              fontWeight: 500,
              letterSpacing: 0.2,
              marginTop: isMobile ? 0 : undefined,
              lineHeight: 1.1,
            }}
          >
            {availableModels[currentIndex]}
          </div>
        </div>
        {/* Navegação */}
        {isMobile ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              margin: "4px 0",
            }}
          >
            <button
              onClick={goPrev}
              style={{
                ...navBtnStyle,
                boxShadow: "0 2px 12px #3939a155",
                fontSize: 22,
                padding: 0,
                width: 38,
                height: 38,
                minWidth: 38,
                minHeight: 38,
                maxWidth: 38,
                maxHeight: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={"Anterior"}
              aria-label="Anterior"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="14"
                  cy="14"
                  r="13"
                  stroke="#646cff"
                  strokeWidth="2"
                  fill="#23234a"
                />
                <polyline
                  points="17,8 11,14 17,20"
                  fill="none"
                  stroke="#646cff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={goNext}
              style={{
                ...navBtnStyle,
                boxShadow: "0 2px 12px #3939a155",
                fontSize: 22,
                padding: 0,
                width: 38,
                height: 38,
                minWidth: 38,
                minHeight: 38,
                maxWidth: 38,
                maxHeight: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={"Próximo"}
              aria-label="Próximo"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="14"
                  cy="14"
                  r="13"
                  stroke="#646cff"
                  strokeWidth="2"
                  fill="#23234a"
                />
                <polyline
                  points="11,8 17,14 11,20"
                  fill="none"
                  stroke="#646cff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              margin: "0 auto",
              width: "max-content",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {modelTitles.map((title, idx) => (
              <button
                key={title}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  ...navBtnStyle,
                  fontSize: 14,
                  padding: "6px 8px",
                  minWidth: 180,
                  maxWidth: 200,
                  minHeight: 36,
                  maxHeight: 36,
                  border: idx === currentIndex ? "2.5px solid #aab3ff" : navBtnStyle.border,
                  color: idx === currentIndex ? "#fff" : navBtnStyle.color,
                  background: idx === currentIndex
                    ? "linear-gradient(90deg,#3939a1 60%,#646cff 100%)"
                    : navBtnStyle.background,
                  boxShadow: idx === currentIndex
                    ? "0 2px 16px #646cff55"
                    : navBtnStyle.boxShadow,
                  fontWeight: idx === currentIndex ? 800 : 700,
                  letterSpacing: 0.2,
                  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                  outline: idx === currentIndex ? "2px solid #aab3ff" : undefined,
                  cursor: idx === currentIndex ? "default" : "pointer",
                  opacity: idx === currentIndex ? 1 : 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
                disabled={idx === currentIndex}
                aria-label={title}
                title={title}
              >
                {title}
              </button>
            ))}
          </div>
        )}
        {/* Botões wireframe e rotação juntos, compactos no mobile */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 8 : 16,
            margin: isMobile ? "4px 0 0 0" : "0 0 0 0",
          }}
        >
          <button
            onClick={() => setShowWireframe((v) => !v)}
            style={{
              ...ctrlBtnStyle,
              background: showWireframe
                ? "linear-gradient(90deg,#646cff 60%,#aab3ff 100%)"
                : "linear-gradient(90deg,#444 60%,#888 100%)",
              boxShadow: showWireframe
                ? "0 2px 12px #646cff55"
                : "0 2px 12px #4445",
              border: showWireframe
                ? "1.5px solid #646cff"
                : "1.5px solid #444",
              color: showWireframe ? "#fff" : "#eee",
              fontWeight: 700,
              letterSpacing: 0.2,
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
              minWidth: isMobile ? 80 : 120,
              maxWidth: isMobile ? 80 : 120,
              minHeight: isMobile ? 32 : 40,
              maxHeight: isMobile ? 32 : 40,
              fontSize: isMobile ? 12 : 15,
              padding: 0,
              alignSelf: "center",
            }}
          >
            {showWireframe ? "Wireframe ON" : "Wireframe OFF"}
          </button>
          <button
            onClick={() => setIsRotating((v) => !v)}
            style={{
              ...ctrlBtnStyle,
              background: isRotating
                ? "linear-gradient(90deg,#22c55e 60%,#4ade80 100%)"
                : "linear-gradient(90deg,#ef4444 60%,#f87171 100%)",
              boxShadow: isRotating
                ? "0 2px 12px #22c55e55"
                : "0 2px 12px #ef444455",
              border: isRotating
                ? "1.5px solid #22c55e"
                : "1.5px solid #ef4444",
              color: "#fff",
              fontWeight: 700,
              letterSpacing: 0.2,
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
              minWidth: isMobile ? 80 : 120,
              maxWidth: isMobile ? 80 : 120,
              minHeight: isMobile ? 32 : 40,
              maxHeight: isMobile ? 32 : 40,
              fontSize: isMobile ? 12 : 15,
              padding: 0,
              alignSelf: "center",
            }}
          >
            {isRotating ? "Rotação ON" : "Rotação OFF"}
          </button>
        </div>
        {/* Controles desktop extras */}
        {!isMobile && (
          <div
            style={{
              minWidth: 200,
              maxWidth: 260,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            <label
              style={{
                color: "#aab3ff",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              Velocidade de Rotação
            </label>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              style={{
                width: "100%",
                marginTop: 6,
                accentColor: "#646cff",
                height: 4,
                borderRadius: 2,
                background: "#23234a",
              }}
            />
            <div
              style={{
                color: "#aab3ff",
                fontSize: 12,
                textAlign: "center",
                minWidth: 140,
                fontWeight: 500,
                textShadow: "0 1px 4px #0007",
                marginTop: 10,
              }}
            >
              Navegue, gire, aproxime e afaste com o mouse ou toque.
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
