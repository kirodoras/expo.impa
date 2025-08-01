import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentModel, setCurrentModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  const [showWireframe, setShowWireframe] = useState(true); // Agora ON por padrão
  const [isRotating, setIsRotating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const availableModels = [
    "Cilindro_x2_y2_1.ply",
    "Cilindro xy=1.ply",
    "Cúbica.ply",
    "Curva algébrica de gênero 2.ply",
    "Folheação de grau 2.ply",
    "Folheação de Vander Pol.ply",
  ];

  // Inicialização da cena 3D
  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth - 350, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Função para enquadrar a câmera usando bounding sphere
    const fitCameraToObject = (object, camera, controls) => {
      const boundingSphere = new THREE.Sphere();
      new THREE.Box3().setFromObject(object).getBoundingSphere(boundingSphere);
      const { radius } = boundingSphere;
      const fov = camera.fov * (Math.PI / 180);
      // const aspect = camera.aspect;
      // Calcula a distância ideal para caber o objeto inteiro
      const distance = radius / Math.sin(fov / 2);
      camera.position.set(0, 0, distance * 1.1); // 1.1 para dar um pequeno espaço extra
      camera.lookAt(0, 0, 0);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    };

    // Carregar modelo inicial com wireframe ON
    const loadInitialModel = () => {
      setShowWireframe(true); // Garante que o estado também fique ON
      const loader = new PLYLoader();
      loader.load("/objects/Cilindro_x2_y2_1.ply", (geometry) => {
        geometry.computeVertexNormals();
        const hasColors = geometry.attributes.color !== undefined;

        const material = new THREE.MeshPhongMaterial({
          vertexColors: hasColors,
          color: hasColors ? 0xffffff : 0x00ff00,
          side: THREE.DoubleSide,
          flatShading: false,
          wireframe: true, // ON
        });

        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;

        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        mesh.position.sub(center);

        scene.add(mesh);

        fitCameraToObject(mesh, camera, controls);
      });
    };

    loadInitialModel();
    setCurrentModel("Cilindro_x2_y2_1.ply");

    return () => {
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [uploadedFiles]);

  useEffect(() => {
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (meshRef.current && isRotating) {
        meshRef.current.rotation.y += rotationSpeed;
        meshRef.current.rotation.x += rotationSpeed * 0.5;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRotating, rotationSpeed]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);

      if (cameraRef.current && rendererRef.current) {
        const sidebarWidth = window.innerWidth <= 768 ? 300 : 350;
        const width = window.innerWidth - sidebarWidth;
        const height = window.innerHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadPLYFile = (url) => {
    setShowWireframe(true); // Sempre ativa o wireframe ao carregar
    setLoading(true);
    const loader = new PLYLoader();
    loader.load(
      url,
      (geometry) => {
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current);
        }

        geometry.computeVertexNormals();
        const hasColors = geometry.attributes.color !== undefined;

        const material = new THREE.MeshPhongMaterial({
          vertexColors: hasColors,
          color: hasColors ? 0xffffff : 0x00ff00,
          side: THREE.DoubleSide,
          flatShading: false,
          wireframe: true, // Sempre ON ao carregar
        });

        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;

        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        mesh.position.sub(center);

        sceneRef.current.add(mesh);

        // Ajuste de câmera para enquadrar o objeto usando bounding sphere
        const boundingSphere = new THREE.Sphere();
        new THREE.Box3().setFromObject(mesh).getBoundingSphere(boundingSphere);
        const { radius } = boundingSphere;
        const fov = cameraRef.current.fov * (Math.PI / 180);
        // const aspect = cameraRef.current.aspect;
        const distance = radius / Math.sin(fov / 2);
        cameraRef.current.position.set(0, 0, distance * 1.1);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
        setLoading(false);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% carregado");
      },
      (error) => {
        console.error("Erro ao carregar o arquivo .ply", error);
        setLoading(false);
      }
    );
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files) => {
    const plyFiles = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".ply")
    );

    console.log("Arquivos recebidos:", files.length);
    console.log("Arquivos .ply encontrados:", plyFiles.length);
    console.log(
      "Lista de arquivos:",
      Array.from(files).map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }))
    );

    if (plyFiles.length === 0) {
      alert("Nenhum arquivo .ply encontrado");
      return;
    }

    setUploadProgress(
      `Processando ${plyFiles.length} arquivo${
        plyFiles.length > 1 ? "s" : ""
      } .ply...`
    );

    const newFiles = [];
    let processedCount = 0;

    plyFiles.forEach((file) => {
      try {
        const url = URL.createObjectURL(file);
        newFiles.push({ name: file.name, url });
        processedCount++;
        console.log(`Arquivo processado: ${file.name}`);
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error);
      }
    });

    if (processedCount > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Carregar o primeiro arquivo automaticamente
      if (newFiles.length > 0) {
        loadPLYFile(newFiles[0].url);
        setCurrentModel(newFiles[0].name);
      }

      setTimeout(() => {
        setUploadProgress(null);
      }, 1500);
    } else {
      alert("Erro ao processar os arquivos .ply");
      setUploadProgress(null);
    }
  };

  const handleDirectoryUpload = async (files) => {
    const plyFiles = [];

    for (let file of Array.from(files)) {
      if (file.name.toLowerCase().endsWith(".ply")) {
        plyFiles.push(file);
      }
    }

    if (plyFiles.length > 0) {
      processFiles(plyFiles);
    } else {
      alert("Nenhum arquivo .ply encontrado na pasta selecionada");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    const files = [];

    const processEntry = (entry) => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file) => {
            if (file.name.toLowerCase().endsWith(".ply")) {
              files.push(file);
              console.log(`Arquivo .ply encontrado: ${file.name}`);
            }
            resolve();
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          reader.readEntries(async (entries) => {
            const promises = entries.map(processEntry);
            await Promise.all(promises);
            resolve();
          });
        } else {
          resolve();
        }
      });
    };

    try {
      if (items && items.length > 0) {
        const promises = [];
        for (let item of items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(processEntry(entry));
          }
        }

        await Promise.all(promises);
        console.log(`Total de arquivos .ply encontrados: ${files.length}`);

        if (files.length > 0) {
          processFiles(files);
        } else {
          alert("Nenhum arquivo .ply encontrado nos itens arrastados");
        }
      } else {
        const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
          file.name.toLowerCase().endsWith(".ply")
        );

        console.log(
          `Fallback: ${droppedFiles.length} arquivos .ply encontrados`
        );

        if (droppedFiles.length > 0) {
          processFiles(droppedFiles);
        } else {
          alert("Nenhum arquivo .ply encontrado");
        }
      }
    } catch (error) {
      console.error("Erro no processamento do drag and drop:", error);
      alert("Erro ao processar os arquivos arrastados");
    }
  };

  const selectModel = (modelName, isUploaded = false) => {
    setCurrentModel(modelName);
    if (isUploaded) {
      const uploadedFile = uploadedFiles.find((f) => f.name === modelName);
      if (uploadedFile) {
        loadPLYFile(uploadedFile.url);
      }
    } else {
      loadPLYFile(`/objects/${modelName}`);
    }
  };

  const toggleWireframe = () => {
    setShowWireframe((prev) => !prev);
    if (meshRef.current) {
      meshRef.current.material.wireframe = !showWireframe;
    }
  };

  const toggleRotation = () => {
    setIsRotating((prev) => !prev);
  };

  const clearUploadedFiles = () => {
    if (
      uploadedFiles.length > 0 &&
      window.confirm("Deseja remover todos os arquivos carregados?")
    ) {
      uploadedFiles.forEach((file) => {
        if (file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      });
      setUploadedFiles([]);

      const isCurrentModelUploaded = uploadedFiles.some(
        (file) => file.name === currentModel
      );
      if (isCurrentModelUploaded) {
        loadPLYFile("/objects/Cilindro_x2_y2_1.ply");
        setCurrentModel("Cilindro_x2_y2_1.ply");
      }
    }
  };

  const removeUploadedFile = (fileName) => {
    const fileToRemove = uploadedFiles.find((f) => f.name === fileName);
    if (fileToRemove && fileToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));

    if (currentModel === fileName) {
      loadPLYFile("/objects/Cilindro_x2_y2_1.ply");
      setCurrentModel("Cilindro_x2_y2_1.ply");
    }
  };

  const getSidebarWidth = () => {
    if (isMobile) return sidebarVisible ? "100%" : "0px";
    return "350px";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f0f0f",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: "relative",
      }}
    >
      {isMobile && (
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{
            position: "fixed",
            top: "20px",
            left: sidebarVisible ? "310px" : "20px",
            zIndex: 1001,
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {sidebarVisible ? "✕" : "☰"}
        </button>
      )}

      <div
        className="sidebar"
        style={{
          width: getSidebarWidth(),
          minWidth: getSidebarWidth(),
          backgroundColor: "#1a1a1a",
          padding: isMobile ? "80px 24px 24px 24px" : "24px",
          overflowY: "auto",
          borderRight: "1px solid #333",
          boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
          position: isMobile ? "fixed" : "relative",
          height: "100vh",
          zIndex: 1000,
          transform:
            isMobile && !sidebarVisible ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <div
          style={{
            border: isDragOver ? "2px solid #22c55e" : "2px dashed #646cff",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "24px",
            backgroundColor: isDragOver ? "#1a2e1a" : "#242424",
            transition: "all 0.2s ease",
            position: "relative",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            style={{
              color: isDragOver ? "#22c55e" : "#646cff",
              marginBottom: "16px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            {isDragOver ? "Solte aqui!" : "UPLOAD PLY"}
          </div>

          {!isDragOver && (
            <>
              <div
                style={{
                  color: "#888",
                  fontSize: "12px",
                  marginBottom: "16px",
                  lineHeight: "1.4",
                }}
              >
                Arraste arquivos .ply ou pastas aqui
                <br />
                ou clique para selecionar
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".ply"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                multiple
              />

              <input
                type="file"
                webkitdirectory=""
                onChange={(e) => handleDirectoryUpload(e.target.files)}
                style={{ display: "none" }}
                id="directoryInput"
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    backgroundColor: "#646cff",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#5a5fcf")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#646cff")
                  }
                >
                  📄 Arquivos
                </button>

                <button
                  onClick={() =>
                    document.getElementById("directoryInput").click()
                  }
                  style={{
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#16a34a")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#22c55e")
                  }
                >
                  📁 Pasta
                </button>
              </div>
            </>
          )}

          {isDragOver && (
            <div
              style={{
                fontSize: "14px",
                color: "#22c55e",
                marginTop: "8px",
              }}
            >
              Arquivos .ply e pastas são suportados
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#242424",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginBottom: "16px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Controles
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label style={{ color: "#ccc", fontSize: "14px" }}>
                Rotação:
              </label>
              <button
                onClick={toggleRotation}
                style={{
                  backgroundColor: isRotating ? "#22c55e" : "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {isRotating ? "ON" : "OFF"}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              disabled={!isRotating}
              style={{
                width: "100%",
                height: "4px",
                borderRadius: "2px",
                background: "#444",
                outline: "none",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                color: "#888",
                fontSize: "12px",
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              Velocidade: {(rotationSpeed * 1000).toFixed(1)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={{ color: "#ccc", fontSize: "14px" }}>
              Wireframe:
            </label>
            <button
              onClick={toggleWireframe}
              style={{
                backgroundColor: showWireframe ? "#646cff" : "#444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "background-color 0.2s ease",
              }}
            >
              {showWireframe ? "🔲 ON" : "⬜ OFF"}
            </button>
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  color: "#fff",
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                📂 Arquivos Carregados ({uploadedFiles.length})
              </h3>
              <button
                onClick={clearUploadedFiles}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "500",
                }}
                title="Limpar todos"
              >
                🗑️
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor:
                      currentModel === file.name ? "#646cff" : "#333",
                    border:
                      currentModel === file.name
                        ? "2px solid #646cff"
                        : "1px solid #444",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    onClick={() => selectModel(file.name, true)}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      textAlign: "left",
                      fontWeight: currentModel === file.name ? "500" : "400",
                      flex: 1,
                    }}
                  >
                    📄 {file.name}
                  </button>
                  <button
                    onClick={() => removeUploadedFile(file.name)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: "500",
                    }}
                    title={`Remover ${file.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              color: "#fff",
              marginBottom: "12px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Modelos Disponíveis
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {availableModels.map((model, index) => (
              <button
                key={index}
                onClick={() => selectModel(model)}
                style={{
                  backgroundColor: currentModel === model ? "#646cff" : "#333",
                  color: "white",
                  border:
                    currentModel === model
                      ? "2px solid #646cff"
                      : "1px solid #444",
                  padding: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: currentModel === model ? "600" : "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
                onMouseOver={(e) => {
                  if (currentModel !== model) {
                    e.target.style.backgroundColor = "#404040";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (currentModel !== model) {
                    e.target.style.backgroundColor = "#333";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      currentModel === model ? "#fff" : "#646cff",
                    color: currentModel === model ? "#646cff" : "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>
                {(() => {
                  const name = model.replace(/_/g, " ").replace(/\.ply$/i, "");
                  return name.charAt(0).toUpperCase() + name.slice(1);
                })()}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#242424",
            borderRadius: "12px",
            border: "1px solid #333",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              marginBottom: "8px",
              color: "#ccc",
              fontWeight: "500",
            }}
          >
            Status:
          </div>
          <div
            style={{
              fontSize: "13px",
              color: currentModel ? "#22c55e" : "#888",
              marginBottom: "8px",
            }}
          >
            {currentModel ? `${currentModel}` : "Nenhum modelo selecionado"}
          </div>
          {loading && (
            <div
              style={{
                fontSize: "13px",
                color: "#646cff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid #646cff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Carregando modelo...
            </div>
          )}
          {uploadProgress && (
            <div
              style={{
                fontSize: "13px",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid #22c55e",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              {uploadProgress}
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#1a1a1a",
                borderRadius: "6px",
              }}
            >
              💡 Dica: Arraste arquivos .ply ou pastas diretamente na área de
              upload
            </div>
          )}
        </div>
      </div>
      <div
        ref={mountRef}
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: "#000",
          marginLeft: isMobile && sidebarVisible ? "0" : "0",
        }}
      >
        {!currentModel && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#888",
              fontSize: "18px",
              textAlign: "center",
              maxWidth: "300px",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                opacity: 0.5,
              }}
            >
              🎯
            </div>
            <div style={{ fontWeight: "500", marginBottom: "8px" }}>
              Selecione um modelo
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.4",
              }}
            >
              Escolha um modelo da lista ou faça upload de um arquivo .ply
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #646cff;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #646cff;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          input[type="range"]:disabled::-webkit-slider-thumb {
            background: #666;
          }
          
          input[type="range"]:disabled::-moz-range-thumb {
            background: #666;
          }

          @media (max-width: 768px) {
            .sidebar {
              transition: transform 0.3s ease !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;
