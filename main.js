import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get the container
const container = document.getElementById('canvas-container');
if (!container) {
    console.error('Container not found!');
    throw new Error('Container not found!');
}

// Initialize renderer with proper color management
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x333333);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Setup camera
const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
camera.position.set(4, 5, 11);

// Setup controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 2;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.autoRotate = false;

// Improved lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
scene.add(dirLight);

// Add fill light from the opposite side
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Add grid helper
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Add axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
    const progress = (loaded / total * 100).toFixed(2);
    console.log(`Loading: ${progress}%`);
};

// Set the correct base path for loading
const loader = new GLTFLoader(loadingManager);
loader.setPath('/public/3d/');  // Set base path for model loading

// Add a texture loader
const textureLoader = new THREE.TextureLoader();
textureLoader.setPath('/public/3d/textures/');
loader.load(
    'scene.gltf',
    (gltf) => {
        const model = gltf.scene;
        
        // Handle materials and shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    // Log material info for debugging
                    console.log('Material settings for', child.name, ':', {
                        hasMap: !!child.material.map,
                        hasNormalMap: !!child.material.normalMap,
                        hasRoughnessMap: !!child.material.roughnessMap,
                        color: child.material.color
                    });
                }
            }
        });

        // Get model dimensions
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('Original model dimensions:', {
            width: size.x,
            height: size.y,
            depth: size.z
        });

        // Set desired height and calculate scale
        const desiredHeight = 10; // Adjust this value to change model height
        const scale = desiredHeight / size.y;
        model.scale.setScalar(scale);

        // Position model on ground plane
        model.position.set(
            -center.x * scale, 
            (size.y * scale) / 2,  // Offset by half the scaled height
            -center.z * scale
        );

        scene.add(model);

        // Update camera and controls based on scaled model size
        const scaledSize = size.clone().multiplyScalar(scale);
        const distance = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 2;
        
        camera.position.set(
            distance * 0.7,
            distance * 0.5,
            distance * 0.7
        );
        
        controls.target.set(0, scaledSize.y / 2, 0);
        controls.update();

        console.log('Scaled model dimensions:', {
            width: scaledSize.x,
            height: scaledSize.y,
            depth: scaledSize.z
        });
    },
    (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => {
        console.error('Error loading model:', error);
    }
);

// Handle window resize
window.addEventListener('resize', () => {
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});

// Add container styling
const style = document.createElement('style');
style.textContent = `
    .description.view {
        width: 100%;
        height: 600px;  /* Increased height for better visibility */
        position: relative;
        overflow: hidden;
    }
    
    .description.view canvas {
        width: 100% !important;
        height: 100% !important;
    }
`;
document.head.appendChild(style);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();