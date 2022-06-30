import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const ATMOSPHERE_SCALE = 1.2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60, innerWidth / innerHeight, 0.01, 1000
);

// --------- LIGHTS ------------

const lights = [];
lights[0] = new THREE.PointLight(0xffffff, 0.4, 0);
lights[1] = new THREE.PointLight(0xffffff, 0.3, 0);
lights[2] = new THREE.PointLight(0xffffff, 0.8, 0);
lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100, 100);
scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

const ambientLight = new THREE.AmbientLight(0x916262);
scene.add(ambientLight);

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

// -------- Renderer configuration -----------

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);

// ------------ Controls -------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = -1;
controls.screenSpacePanning = true;

// ------------ Loader -------------

const loader = new GLTFLoader();
loader.load("models/earth.gltf", (gltf) => {
  const earth = gltf.scene;

  const box = new THREE.Box3().setFromObject(earth);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  controls.reset();

  earth.position.x += earth.position.x - center.x;
  earth.position.y += earth.position.y - center.y;
  earth.position.z += earth.position.z - center.z;

  const bSize = box.getSize(new THREE.Vector3());
  const EARTH_RADIUS = (bSize.x + bSize.y + bSize.z) / 6;

  controls.maxDistance = size * 10;

  camera.near = size / 100;
  camera.far = size * 100;

  camera.updateProjectionMatrix();
  camera.position.copy(center);
  camera.position.x += size / 2.0;
  camera.position.y += size / 5.0;
  camera.position.z += size / 1.0;
  camera.lookAt(center);

  controls.saveState();

  scene.add(earth);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 50, 50),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  );

  scene.add(atmosphere);

  atmosphere.scale.set(
    ATMOSPHERE_SCALE,
    ATMOSPHERE_SCALE,
    ATMOSPHERE_SCALE
  );

  atmosphere.position.x = earthPos.x;
  atmosphere.position.y = earthPos.y;
  atmosphere.position.z = earthPos.z;
});


// --------- STARS ----------
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 1000;
  const y = (Math.random() - 0.5) * 1000;
  const z = (Math.random() - 0.5) * 1000;
  starVertices.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(
  starGeometry, starMaterial
);

scene.add(stars);

// ------- RENDER --------

document.querySelector("#app").appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
