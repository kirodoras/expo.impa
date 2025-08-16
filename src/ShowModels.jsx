import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import "./App.css";
import PropTypes from "prop-types";
import MarkdownWithMath from "./MarkdownWithMath";

const models = [
  {
    file: "singularidade_hiperbolica.ply",
    md: `### Singularidade hiperbólica
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&-y+\\frac 1{10}x\\\\
\\dot y &=&x+\\frac 1{10}y\\\\
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $(1,1)$.

As curvas integrais desta EDO são superfícies de Riemann que ilustram o comportamento na vizinhança de uma singularidade hiperbólica.

Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Re}(y) \\times \\mathrm{Im}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(x)$ diferentes.`,
    title: "Singularidade hiperbólica",
  },
  {
    file: "genero2.ply",
    md: `
### Curva algébrica de gênero 2

Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&2y  \\\\
\\dot y &=&5x^4
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $(1,0)$.

As curvas integrais desta EDO são curvas algébricas de gênero $2$ com um ponto no infinito, definidas pela equação
$$y^2-x^5=cte$$

A ilustração é do bitoro $y^2-x^5=1$ subtraído de um disco.

Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Im}(x) \\times \\mathrm{Re}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(y)$ diferentes.
`,
    title: "Curva algébrica de gênero 2",
  },
  {
    file: "cubica_I.ply",
    md: `### Cúbica I
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&2y\\\\
\\dot y &=&3x^2
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $(1,0)$.

As curvas integrais desta EDO são curvas algébricas de gênero $1$ com um ponto no infinito, definidas pela equação
$$y^2-x^3=cte$$

A ilustração é do toro $y^2-x^3=1$ subtraído de um disco.
Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Im}(x) \\times \\mathrm{Re}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(y)$ diferentes.`,
    title: "Cúbica I",
  },
  {
    file: "cubica_II.ply",
    md: `### Cúbica II
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&x^2+2xy-2y^2-x+2y\\\\
\\dot y &=&2x^2-2xy-y^2-2x+y
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $\\left(-\\dfrac 15,-\\dfrac 15\\right)$.

As curvas integrais desta EDO são, genericamente, curvas algébricas de gênero $1$ com $3$ pontos no infinito, definidas pela equação
$$
(x+y-1)(2x-y+1)(x-2y-1) = \\mathrm{cte}
$$

A ilustração é do toro
$$
(x+y-1)(2x-y+1)(x-2y-1)=-\\dfrac{112}{125}
$$
subtraído de três discos.

Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Im}(x) \\times \\mathrm{Re}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(y)$ diferentes.`,
    title: "Cúbica II",
  },
  {
    file: "cilindro_I.ply",
    md: `### Cilindro I
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&-y\\\\
\\dot y &=&x
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $(1,0)$.

As curvas integrais desta EDO são os cilindros
$$x^2+y^2=cte$$

A ilustração é o cilindro $x^2+y^2=1$.
Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Re}(y) \\times \\mathrm{Im}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(x)$ diferentes.`,
    title: "Cilindro I",
  },
  {
    file: "cilindro_II.ply",
    md: `### Cilindro II
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&x\\\\
\\dot y &=&-y
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $(1,0)$.

As curvas integrais desta EDO são os cilindros $$xy=cte$$

A ilustração é o cilindro $xy=1$.
Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Im}(x) \\times \\mathrm{Re}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(y)$ diferentes.`,
    title: "Cilindro II",
  },
  {
    file: "vander_pol.ply",
    md: `### Folheação de Vander Pol
Curva integral da EDO complexa
$$
\\left\\{
\\begin{array}{rcl}
\\dot x &=&y - x^3+x\\\\
\\dot y &=&-x
\\end{array}
\\right.
$$

em $\\mathbb C^2$ passando pelo ponto $\\left(\\dfrac 12,0\\right)$.

As curvas integrais desta EDO são superfícies de Riemann que definem uma folheação de grau $3$ em $\\mathbb {CP}^2$.

Para ser visualizada, esta superfície foi projetada ortogonalmente no espaço euclidiano tridimensional
$$
\\mathrm{Re}(x) \\times \\mathrm{Re}(y) \\times \\mathrm{Im}(y)
$$

Pontos de cores diferentes indicam que são pontos com coordenada $\\mathrm{Im}(x)$ diferentes.`,
    title: "Folheação de Vander Pol",
  },
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

const InfoPanel = ({ isOpen, onClose, md }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 180000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="info-panel">
      <button onClick={onClose} className="close-btn">
        &times;
      </button>
      <MarkdownWithMath content={md} />
    </div>
  );
};

InfoPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  md: PropTypes.string.isRequired,
};

const AboutModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 180000); // 3 minutos
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button onClick={onClose} className="close-btn">
          &times;
        </button>
        <h2>Sobre os autores</h2>
        <p>
          <strong>Evilson Vieira</strong> -{" "}
          <a href="mailto:evilson@ufs.br">evilson@ufs.br</a>
          <br />
          Universidade Federal de Sergipe - UFS
        </p>
        <p>
          <strong>Mateus Figueiredo</strong> -{" "}
          <a href="mailto:figueiredo1497@gmail.com">figueiredo1497@gmail.com</a>
          <br />
          <a
            href="https://www.linkedin.com/in/mateus-fig-pe"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.linkedin.com/in/mateus-fig-pe
          </a>
          <br />
          Universidade Federal de Sergipe - UFS
        </p>
        <h3>Referência</h3>
        <p>
          E. Vieira, Ciclos limites projetivos e aplicações computacionais à
          Dinâmica Complexa, Ph.D. thesis, Impa (2009).
        </p>
      </div>
    </div>
  );
};

AboutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>Carregando modelo...</p>
  </div>
);

export default function ShowModels() {
  const mountRef = useRef();
  const meshRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;
  const rotationSpeedRef = useRef(rotationSpeed);
  rotationSpeedRef.current = rotationSpeed;
  const [isMobile, setIsMobile] = useState(false);
  const [viewHeight, setViewHeight] = useState(window.innerHeight);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setViewHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(10, 10, 10);
    scene.add(dir);

    import("three/examples/jsm/controls/OrbitControls").then(
      ({ OrbitControls }) => {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enablePan = false;
        controls.minDistance = 2;
        controls.maxDistance = 100;
        loadModel(models[currentIndex].file);
      }
    );

    function loadModel(modelName) {
      setLoading(true);
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
      if (meshRef.current && isRotatingRef.current) {
        meshRef.current.rotation.y += rotationSpeedRef.current;
      }
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountNode) {
        mountNode.innerHTML = "";
      }
    };
  }, [currentIndex]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.wireframe = showWireframe;
    }
  }, [showWireframe]);

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % models.length);
    if (isMobile) {
      setIsInfoOpen(false);
    }
  };
  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + models.length) % models.length);
    if (isMobile) {
      setIsInfoOpen(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: viewHeight,
        overflow: "hidden",
        background: "#0f0f0f",
        fontFamily: "Segoe UI",
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: viewHeight,
          zIndex: 1,
          background: "#111",
        }}
      />
      {loading && <LoadingSpinner />}
      <InfoPanel
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        md={models[currentIndex].md}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <div
        style={{
          position: "fixed",
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
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? 8 : 0,
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
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
          <div>
            {!isMobile && (
              <div
                className="desktop-nav-title"
                style={{ marginBottom: "10px" }}
              >
                Navegue pelos modelos
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 8 : 16,
              }}
            >
              <div className="nav-button-container">
                <button
                  onClick={goPrev}
                  className="nav-button"
                  style={navBtnStyle}
                  title={"Anterior"}
                  aria-label="Anterior"
                >
                  <svg
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
              </div>
              <div
                style={{
                  minWidth: isMobile ? 0 : 200,
                  textAlign: "center",
                  marginBottom: isMobile ? 2 : 0,
                  padding: isMobile ? 0 : undefined,
                }}
              >
                <div
                  className="model-title-text"
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: isMobile ? 15 : undefined,
                    letterSpacing: 0.5,
                    marginBottom: isMobile ? 0 : 2,
                    textShadow: "0 2px 8px #0007",
                    lineHeight: 1.1,
                  }}
                >
                  {models[currentIndex].title}
                </div>
                <button
                  onClick={() => setIsInfoOpen((v) => !v)}
                  className="info-button"
                >
                  {isMobile ? "Info" : "Informações"}
                </button>
              </div>
              <div className="nav-button-container">
                <button
                  onClick={goNext}
                  className="nav-button"
                  style={navBtnStyle}
                  title={"Próximo"}
                  aria-label="Próximo"
                >
                  <svg
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
            </div>
          </div>
          <div>
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
              </div>
            )}
          </div>
          <div className="qrcode-wrapper">
            <p className="qrcode-caption">Acesse no celular</p>
            <img src="/qrcode.png" alt="QR Code" className="qrcode-image" />
          </div>
        </div>
      </div>
      <div className="about">
        <button onClick={() => setIsAboutOpen(true)} className="about-button">
          {isMobile ? "Autores" : "Sobre os autores"}
        </button>
      </div>
    </div>
  );
}
