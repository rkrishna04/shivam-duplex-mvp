// Shivam Duplex - Exact annotated map version loading...
// Black dots = houses, Yellow = roads, Green = parks, Pink = Society Office
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-wrap') ? document.getElementById('canvas-wrap').appendChild(renderer.domElement) : document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 500);
camera.position.set(0, 55, 70);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
sun.position.set(40, 70, 30);
scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 180), new THREE.MeshStandardMaterial({ color: 0x3d8b4a }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
// Simple marker for parks (green)
const parkGeo = new THREE.CircleGeometry(12, 32);
const parkMat = new THREE.MeshStandardMaterial({ color: 0x32D583 });
const park1 = new THREE.Mesh(parkGeo, parkMat);
park1.rotation.x = -Math.PI / 2;
park1.position.set(38, 0.1, 32);
scene.add(park1);
// Office (pink)
const office = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
office.position.set(-36, 1.5, -18);
scene.add(office);
// Temporary notice
const notice = document.createElement('div');
notice.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 20px;border-radius:12px;font-family:sans-serif;z-index:100;text-align:center;';
notice.innerHTML = 'Exact map update in progress.<br>Hard-refresh (Ctrl+Shift+R) after 1 minute.';
document.body.appendChild(notice);
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
