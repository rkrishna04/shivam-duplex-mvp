import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Shivam Duplex — ~155 houses, footprint from satellite (D Mart Rd / Kapurai)
const COMMITTEE = {
  '01': { title: 'Chairman', name: 'Rameshbhai Patel', icon: '👑', phone: '9825011001' },
  '04': { title: 'Committee', name: 'Rajeshbhai Patel', icon: '⚖️', phone: '9825012341' },
  '11': { title: 'Vice-Chair', name: 'Vinodbhai Shah', icon: '🤝', phone: '9825011002' },
  '21': { title: 'Secretary', name: 'Alpeshbhai Desai', icon: '📋', phone: '9825011003' },
  '31': { title: 'Treasurer', name: 'Mukeshbhai Pandya', icon: '🏦', phone: '9825011004' },
  '45': { title: 'Security', name: 'Hareshbhai Joshi', icon: '🛡️', phone: '9825011006' },
  '60': { title: 'Electrical', name: 'Bhavinbhai Shah', icon: '💡', phone: '9825011008' },
  '78': { title: 'Sanitation', name: 'Deepakbhai Panchal', icon: '🧹', phone: '9825011007' },
  '95': { title: 'Water', name: 'Pradeepbhai Patel', icon: '💧', phone: '9825011005' },
  '110': { title: 'Festivals', name: 'Jitendrabhai Trivedi', icon: '🌺', phone: '9825011009' },
  '125': { title: 'Parking', name: 'Sanjaybhai Barot', icon: '🚗', phone: '9825011010' },
  '140': { title: 'Garden', name: 'Narendrabhai Rana', icon: '🌳', phone: '9825011011' }
};
const LINE_META = [
  { id: 'L1', name: 'North Block (near D Mart Rd)', color: 0x60a5fa },
  { id: 'L2', name: 'West Block A', color: 0xf59e0b },
  { id: 'L3', name: 'West Block B', color: 0x34d399 },
  { id: 'L4', name: 'Central Spine', color: 0xa78bfa },
  { id: 'L5', name: 'East Block (near Park)', color: 0xf472b6 },
  { id: 'L6', name: 'South Block', color: 0xfb923c }
];
const state = {
  mode: 'aerial', time: 'day', selectedPlot: null,
  plots: {}, streetLights: [], cameras: [], vehicles: {}, events: [], faults: new Set()
};
try {
  const saved = JSON.parse(localStorage.getItem('shivam-duplex-mvp-v2') || '{}');
  if (saved.plots) state.plots = saved.plots;
  if (saved.vehicles) state.vehicles = saved.vehicles;
  if (saved.faults) state.faults = new Set(saved.faults);
  if (saved.events) state.events = saved.events;
} catch (e) {}
function persist() {
  localStorage.setItem('shivam-duplex-mvp-v2', JSON.stringify({
    plots: state.plots, vehicles: state.vehicles, faults: [...state.faults], events: state.events
  }));
}
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.Fog(0x87b8e0, 90, 220);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 70, 85);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.maxPolarAngle = Math.PI * 0.48;
orbit.minDistance = 15;
orbit.maxDistance = 180;
orbit.target.set(0, 0, 0);
const streetCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 250);
streetCamera.position.set(0, 1.7, 30);
let streetActive = false;
const move = { forward: false, back: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let yaw = 0, pitch = 0;
const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff4e0, 1.15);
sun.position.set(40, 70, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
scene.add(sun);
const hemi = new THREE.HemisphereLight(0x87b8e0, 0x3a5a3a, 0.35);
scene.add(hemi);
const matRoad = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.85, metalness: 0.05 });
const matSidewalk = new THREE.MeshStandardMaterial({ color: 0x6b7078, roughness: 0.9 });
const matGrass = new THREE.MeshStandardMaterial({ color: 0x3d6b3d, roughness: 0.95 });
const matHouse = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.72, metalness: 0.05 });
const matRoof = new THREE.MeshStandardMaterial({ color: 0x8b5a3c, roughness: 0.8 });
const matPark = new THREE.MeshStandardMaterial({ color: 0x4a8c4a, roughness: 0.9 });
const matGate = new THREE.MeshStandardMaterial({ color: 0x2a2e38, roughness: 0.6, metalness: 0.3 });
const matSelected = new THREE.MeshStandardMaterial({ color: 0x5E81F4, roughness: 0.5, emissive: 0x1a2a6a, emissiveIntensity: 0.35 });
const matCommittee = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5, emissive: 0x664400, emissiveIntensity: 0.25 });
const matDirt = new THREE.MeshStandardMaterial({ color: 0xb5a07a, roughness: 0.95 });
const root = new THREE.Group();
scene.add(root);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 180), matGrass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
root.add(ground);
const openLot = new THREE.Mesh(new THREE.PlaneGeometry(35, 40), matDirt);
openLot.rotation.x = -Math.PI / 2;
openLot.position.set(42, 0.02, -35);
root.add(openLot);
function road(x, z, w, l, rotY = 0) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, l), matRoad);
  r.position.set(x, 0.05, z);
  r.rotation.y = rotY;
  r.receiveShadow = true;
  root.add(r);
}
road(0, 0, 7, 150);
road(-28, -40, 5, 45, Math.PI / 2);
road(-28, -10, 5, 50, Math.PI / 2);
road(-28, 25, 5, 50, Math.PI / 2);
road(-28, 55, 5, 40, Math.PI / 2);
road(22, -25, 5, 40, Math.PI / 2);
road(22, 15, 5, 45, Math.PI / 2);
road(22, 50, 5, 35, Math.PI / 2);
road(-35, 5, 5.5, 120);
road(-50, 10, 5, 90);
road(28, 5, 5.5, 100);
const gatePad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 10), matRoad);
gatePad.position.set(0, 0.07, -72);
gatePad.receiveShadow = true;
root.add(gatePad);
const barrier = new THREE.Mesh(new THREE.BoxGeometry(9, 0.22, 0.35), matGate);
barrier.position.set(0, 1.05, -68);
root.add(barrier);
[-4.5, 4.5].forEach(x => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.2, 0.35), matGate);
  p.position.set(x, 1.1, -68);
  root.add(p);
});
const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.5, 2.8), matHouse);
cabin.position.set(-8, 1.25, -70);
cabin.castShadow = true;
root.add(cabin);
const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 3.2), matRoof);
cabinRoof.position.set(-8, 2.6, -70);
root.add(cabinRoof);
const park = new THREE.Mesh(new THREE.CircleGeometry(16, 48), matPark);
park.rotation.x = -Math.PI / 2;
park.position.set(48, 0.04, 35);
park.receiveShadow = true;
root.add(park);
const track = new THREE.Mesh(new THREE.RingGeometry(12, 14.5, 48), new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 }));
track.rotation.x = -Math.PI / 2;
track.position.set(48, 0.06, 35);
root.add(track);
const gazebo = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.6, 8), matRoof);
gazebo.position.set(48, 3.1, 35);
root.add(gazebo);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.5, 6), matHouse);
  col.position.set(48 + Math.cos(a) * 2.4, 1.35, 35 + Math.sin(a) * 2.4);
  root.add(col);
}
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2;
  const tx = 48 + Math.cos(a) * 17;
  const tz = 35 + Math.sin(a) * 17;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.7, 6), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
  trunk.position.set(tx, 0.85, tz);
  trunk.castShadow = true;
  root.add(trunk);
  const fol = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2d6b2d, roughness: 0.9 }));
  fol.position.set(tx, 2.3, tz);
  fol.castShadow = true;
  root.add(fol);
}
const plotMeshes = new Map();
const plotData = [];
let houseNum = 1;
function addHouse(x, z, rot, lineIdx) {
  if (houseNum > 155) return;
  const id = String(houseNum).padStart(2, '0');
  const line = LINE_META[lineIdx % LINE_META.length];
  const c = COMMITTEE[id] || null;
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rot;
  const bodyMat = c ? matCommittee.clone() : matHouse.clone();
  bodyMat.color.lerp(new THREE.Color(line.color), 0.12);
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 5.0), bodyMat);
  body.position.y = 1.3;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData = { type: 'plot', id };
  group.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 5.4), matRoof.clone());
  roof.position.y = 2.75;
  group.add(roof);
  const porch = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 1.5), matSidewalk);
  porch.position.set(0, 0.1, 3.1);
  group.add(porch);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.06), new THREE.MeshStandardMaterial({ color: 0x88aacc, emissive: 0x224466, emissiveIntensity: 0 }));
  win.position.set(1.1, 1.55, 2.52);
  group.add(win);
  group.userData.win = win;
  root.add(group);
  plotMeshes.set(id, { group, body, roof, win, isCommittee: !!c, lineId: line.id });
  plotData.push({ id, x, z, lane: line.name, rot, lineId: line.id });
  if (!state.plots[id]) {
    state.plots[id] = { owner: c ? c.name : '', phone: c ? c.phone : '', vehicle: null, plate: '', cctv: false, role: c ? c.title : '' };
  }
  houseNum++;
}
const westRows = [
  { z0: -55, n: 8, x: -18, rot: Math.PI / 2, line: 1 },
  { z0: -55, n: 8, x: -28, rot: -Math.PI / 2, line: 1 },
  { z0: -30, n: 9, x: -18, rot: Math.PI / 2, line: 2 },
  { z0: -30, n: 9, x: -28, rot: -Math.PI / 2, line: 2 },
  { z0: -30, n: 8, x: -42, rot: Math.PI / 2, line: 2 },
  { z0: -30, n: 8, x: -52, rot: -Math.PI / 2, line: 2 },
  { z0: 5, n: 10, x: -18, rot: Math.PI / 2, line: 3 },
  { z0: 5, n: 10, x: -28, rot: -Math.PI / 2, line: 3 },
  { z0: 5, n: 9, x: -42, rot: Math.PI / 2, line: 3 },
  { z0: 5, n: 9, x: -52, rot: -Math.PI / 2, line: 3 },
  { z0: 40, n: 8, x: -18, rot: Math.PI / 2, line: 5 },
  { z0: 40, n: 8, x: -28, rot: -Math.PI / 2, line: 5 },
  { z0: 40, n: 7, x: -42, rot: Math.PI / 2, line: 5 }
];
westRows.forEach(row => { for (let i = 0; i < row.n; i++) addHouse(row.x, row.z0 + i * 5.8, row.rot, row.line); });
const eastRows = [
  { z0: -50, n: 8, x: 14, rot: -Math.PI / 2, line: 0 },
  { z0: -50, n: 8, x: 24, rot: Math.PI / 2, line: 0 },
  { z0: -20, n: 9, x: 14, rot: -Math.PI / 2, line: 4 },
  { z0: -20, n: 9, x: 24, rot: Math.PI / 2, line: 4 },
  { z0: 15, n: 8, x: 14, rot: -Math.PI / 2, line: 4 },
  { z0: 15, n: 7, x: 24, rot: Math.PI / 2, line: 4 }
];
eastRows.forEach(row => { for (let i = 0; i < row.n; i++) addHouse(row.x, row.z0 + i * 5.8, row.rot, row.line); });
for (let i = 0; i < 10; i++) {
  addHouse(-35 + i * 6.5, 68, 0, 5);
  if (houseNum <= 155) addHouse(-32 + i * 6.5, 78, Math.PI, 5);
}
let fillZ = -60;
while (houseNum <= 155) {
  addHouse(-60, fillZ, Math.PI / 2, 1);
  fillZ += 6;
  if (fillZ > 60) fillZ = -55;
  if (houseNum > 155) break;
  addHouse(32, fillZ - 3, -Math.PI / 2, 4);
  fillZ += 5.5;
}
const TOTAL = houseNum - 1;
const lightGroup = new THREE.Group();
root.add(lightGroup);
const lightSpots = [];
for (let z = -65; z <= 70; z += 14) lightSpots.push([0, z]);
for (let z = -50; z <= 55; z += 16) { lightSpots.push([-35, z]); lightSpots.push([28, z]); }
[[-20, -40], [20, -25], [-20, 25], [20, 50], [48, 35], [48, 20]].forEach(p => lightSpots.push(p));
lightSpots.forEach((p, i) => {
  const id = 'SL-' + String(i + 1).padStart(2, '0');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.8, 8), new THREE.MeshStandardMaterial({ color: 0x333 }));
  pole.position.set(p[0], 2.4, p[1]);
  pole.castShadow = true;
  lightGroup.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.38), new THREE.MeshStandardMaterial({ color: 0x222 }));
  head.position.set(p[0], 4.85, p[1]);
  lightGroup.add(head);
  const lamp = new THREE.PointLight(0xffe8c0, 0, 15, 1.5);
  lamp.position.set(p[0], 4.7, p[1]);
  lightGroup.add(lamp);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffe8c0, emissive: 0xffcc66, emissiveIntensity: 0 }));
  glow.position.set(p[0], 4.7, p[1]);
  lightGroup.add(glow);
  state.streetLights.push({ id, name: 'Street light ' + id, lamp, glow, pos: p, fault: state.faults.has(id) });
});
[[0, -68], [0, 0], [-35, 20], [28, 30], [48, 35], [0, 60]].forEach((p, i) => {
  const id = 'CAM-' + String(i + 1).padStart(2, '0');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  pole.position.set(p[0], 1.8, p[1]);
  root.add(pole);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(3.0, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x5E81F4, transparent: true, opacity: 0.11, side: THREE.DoubleSide }));
  cone.position.set(p[0], 1.5, p[1] - 2.8);
  cone.rotation.x = Math.PI;
  root.add(cone);
  state.cameras.push({ id, cone, fault: state.faults.has(id) });
});
const vehicleGroup = new THREE.Group();
root.add(vehicleGroup);
const vehicleMeshes = new Map();
function makeVehicle(type, color = 0x3366aa) {
  const g = new THREE.Group();
  if (type === 'sedan' || type === 'suv') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(type === 'suv' ? 1.9 : 1.6, 0.55, type === 'suv' ? 3.4 : 3.0), new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 }));
    body.position.y = 0.45;
    body.castShadow = true;
    g.add(body);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 1.3), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    body.position.y = 0.4;
    g.add(body);
  }
  return g;
}
function syncVehicles() {
  vehicleMeshes.forEach(m => vehicleGroup.remove(m));
  vehicleMeshes.clear();
  Object.entries(state.vehicles).forEach(([plotId, v]) => {
    if (!v.type) return;
    const pd = plotData.find(p => p.id === plotId);
    if (!pd) return;
    const mesh = makeVehicle(v.type, v.color || 0x3366aa);
    const off = new THREE.Vector3(0, 0, 3.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), pd.rot);
    mesh.position.set(pd.x + off.x, 0, pd.z + off.z);
    mesh.rotation.y = pd.rot;
    vehicleGroup.add(mesh);
    vehicleMeshes.set(plotId, mesh);
  });
}
syncVehicles();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerDown(e) {
  if (streetActive) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(root.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && !obj.userData?.type) obj = obj.parent;
    if (obj?.userData?.type === 'plot') { selectPlot(obj.userData.id); return; }
  }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);
function selectPlot(id) {
  if (state.selectedPlot) {
    const prev = plotMeshes.get(state.selectedPlot);
    if (prev) {
      const wasC = prev.isCommittee;
      prev.body.material = wasC ? matCommittee.clone() : matHouse.clone();
      const pd = plotData.find(p => p.id === state.selectedPlot);
      const line = LINE_META.find(l => l.id === pd?.lineId);
      if (line && !wasC) prev.body.material.color.lerp(new THREE.Color(line.color), 0.12);
    }
  }
  state.selectedPlot = id;
  const curr = plotMeshes.get(id);
  if (curr) curr.body.material = matSelected.clone();
  const data = state.plots[id] || {};
  const c = COMMITTEE[id];
  const pd = plotData.find(p => p.id === id);
  document.getElementById('detail-title').textContent = 'Duplex ' + id + (c ? ' ' + c.icon : '');
  document.getElementById('detail-meta').textContent = (pd?.lane || 'Society') + ' · G+1' + (c ? ' · ' + c.title : '');
  document.getElementById('owner-name').value = data.owner || (c ? c.name : '');
  document.getElementById('owner-phone').value = data.phone || (c ? c.phone : '');
  document.getElementById('vehicle-type').value = data.vehicle || '';
  document.getElementById('vehicle-plate').value = data.plate || '';
  document.getElementById('detail-panel').classList.add('visible');
  toast('Duplex ' + id + (c ? ' · ' + c.title : '') + ' · ' + TOTAL + ' total');
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
document.getElementById('btn-close-detail').onclick = () => document.getElementById('detail-panel').classList.remove('visible');
document.getElementById('btn-save-plot').onclick = () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot;
  state.plots[id] = {
    owner: document.getElementById('owner-name').value,
    phone: document.getElementById('owner-phone').value,
    vehicle: document.getElementById('vehicle-type').value || null,
    plate: document.getElementById('vehicle-plate').value,
    cctv: state.plots[id]?.cctv || false,
    role: state.plots[id]?.role || ''
  };
  if (state.plots[id].vehicle) state.vehicles[id] = { type: state.plots[id].vehicle, plate: state.plots[id].plate, color: 0x3366aa };
  else delete state.vehicles[id];
  syncVehicles(); persist(); toast('Saved Duplex ' + id); refreshPlotsList();
};
document.getElementById('btn-clear-vehicle').onclick = () => {
  if (!state.selectedPlot) return;
  delete state.vehicles[state.selectedPlot];
  if (state.plots[state.selectedPlot]) state.plots[state.selectedPlot].vehicle = null;
  document.getElementById('vehicle-type').value = '';
  syncVehicles(); persist(); toast('Vehicle cleared');
};
document.getElementById('btn-add-cctv-here').onclick = () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot;
  state.plots[id].cctv = true;
  const pd = plotData.find(p => p.id === id);
  if (pd) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x32D583, transparent: true, opacity: 0.14, side: THREE.DoubleSide }));
    cone.position.set(pd.x, 1.2, pd.z + 3.2);
    cone.rotation.x = Math.PI * 0.85;
    root.add(cone);
  }
  persist(); toast('Home CCTV registered');
};
document.getElementById('btn-add-vehicle').onclick = () => {
  if (!state.selectedPlot) { toast('Select a duplex first'); return; }
  document.getElementById('vehicle-type').value = 'sedan';
  document.getElementById('detail-panel').classList.add('visible');
};
document.getElementById('btn-register-cctv').onclick = () => {
  if (!state.selectedPlot) { toast('Select a duplex first'); return; }
  document.getElementById('btn-add-cctv-here').click();
};
document.getElementById('btn-road-closure').onclick = () => {
  state.events.push({ id: 'EVT-' + Date.now(), type: 'Marriage Mandap', host: state.selectedPlot || 'Central', from: new Date().toLocaleDateString(), active: true });
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xe8d4a8 }));
  tent.position.set(0, 1.5, 10);
  root.add(tent);
  for (let i = -2; i <= 2; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.12), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
    b.position.set(i * 1.5, 0.5, 15);
    root.add(b);
  }
  persist(); refreshEvents(); toast('Road closure scheduled');
};
function setTime(t) {
  state.time = t;
  document.querySelectorAll('#bottombar .ctrl-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + t)?.classList.add('active');
  state.streetLights.forEach(sl => {
    const on = t !== 'day' && !sl.fault;
    sl.lamp.intensity = on ? (t === 'night' ? 1.25 : 0.6) : 0;
    sl.glow.material.emissiveIntensity = on ? 1.0 : 0;
  });
  plotMeshes.forEach(({ win }) => { win.material.emissiveIntensity = t === 'night' ? 0.7 : 0; });
  if (t === 'day') {
    scene.background.set(0x87b8e0); scene.fog.color.set(0x87b8e0);
    ambient.intensity = 0.45; sun.intensity = 1.15; sun.color.set(0xfff4e0); hemi.intensity = 0.35;
  } else if (t === 'dusk') {
    scene.background.set(0x4a3a5a); scene.fog.color.set(0x4a3a5a);
    ambient.intensity = 0.25; sun.intensity = 0.5; sun.color.set(0xff8844); hemi.intensity = 0.2;
  } else {
    scene.background.set(0x0a0e18); scene.fog.color.set(0x0a0e18);
    ambient.intensity = 0.12; sun.intensity = 0.08; sun.color.set(0x4455aa); hemi.intensity = 0.08;
  }
}
document.getElementById('btn-day').onclick = () => setTime('day');
document.getElementById('btn-dusk').onclick = () => setTime('dusk');
document.getElementById('btn-night').onclick = () => setTime('night');
document.getElementById('btn-reset-cam').onclick = () => { camera.position.set(0, 70, 85); orbit.target.set(0, 0, 0); orbit.update(); };
document.getElementById('btn-focus-gate').onclick = () => { camera.position.set(0, 22, -45); orbit.target.set(0, 0, -68); orbit.update(); };
document.getElementById('btn-focus-park').onclick = () => { camera.position.set(65, 28, 50); orbit.target.set(48, 0, 35); orbit.update(); };
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    state.mode = mode;
    if (mode === 'aerial') { streetActive = false; camera.position.set(0, 70, 85); orbit.enabled = true; orbit.maxPolarAngle = Math.PI * 0.48; }
    else if (mode === 'top') { streetActive = false; camera.position.set(0, 120, 0.1); orbit.target.set(0, 0, 0); orbit.enabled = true; orbit.maxPolarAngle = Math.PI * 0.05; }
    else if (mode === 'street') {
      streetActive = true; orbit.enabled = false;
      streetCamera.position.set(0, 1.7, 20);
      toast('Street View — W/A/S/D · click canvas to look');
      renderer.domElement.requestPointerLock?.();
    }
  };
});
window.addEventListener('keydown', e => {
  if (!streetActive) return;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') move.forward = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') move.back = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') move.right = true;
});
window.addEventListener('keyup', e => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') move.forward = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') move.back = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') move.right = false;
});
document.addEventListener('mousemove', e => {
  if (!streetActive || document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * 0.002;
  pitch = Math.max(-1.2, Math.min(1.2, pitch - e.movementY * 0.002));
});
function refreshInfra() {
  const list = document.getElementById('infra-list');
  list.innerHTML = '';
  state.streetLights.slice(0, 24).forEach(sl => {
    const div = document.createElement('div');
    div.className = 'card';
    const status = sl.fault ? 'fault' : 'ok';
    div.innerHTML = '<h3><span class="status-dot ' + status + '"></span>' + sl.id + '</h3><p>' + (sl.fault ? 'FAULT' : 'OK') + '</p>';
    div.onclick = () => {
      sl.fault = !sl.fault;
      if (sl.fault) state.faults.add(sl.id); else state.faults.delete(sl.id);
      setTime(state.time); persist(); refreshInfra();
      toast(sl.fault ? sl.id + ' FAULT' : sl.id + ' fixed');
    };
    list.appendChild(div);
  });
  state.cameras.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card';
    const status = c.fault ? 'fault' : 'ok';
    div.innerHTML = '<h3><span class="status-dot ' + status + '"></span>' + c.id + '</h3><p>' + (c.fault ? 'OFFLINE' : 'Online') + '</p>';
    div.onclick = () => {
      c.fault = !c.fault;
      c.cone.material.opacity = c.fault ? 0.03 : 0.11;
      c.cone.material.color.set(c.fault ? 0xF97066 : 0x5E81F4);
      if (c.fault) state.faults.add(c.id); else state.faults.delete(c.id);
      persist(); refreshInfra();
    };
    list.appendChild(div);
  });
}
function refreshEvents() {
  const list = document.getElementById('events-list');
  if (!state.events.length) {
    list.innerHTML = '<div class="card" style="opacity:0.6"><h3>No active closures</h3><p>Schedule from actions</p></div>';
    return;
  }
  list.innerHTML = state.events.map(e => '<div class="card"><h3>🚧 ' + e.type + '</h3><p>' + e.host + ' · ' + e.from + '</p></div>').join('');
}
function refreshPlotsList() {
  const list = document.getElementById('plots-list');
  const ids = Object.keys(state.plots).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const show = ids.filter(id => COMMITTEE[id]).concat(ids.filter(id => !COMMITTEE[id]).slice(0, 20));
  list.innerHTML = '<div class="card" style="opacity:0.8"><h3>' + TOTAL + ' Duplexes</h3><p>Click any house on the 3D map</p></div>' +
    show.map(id => {
      const d = state.plots[id] || {};
      const c = COMMITTEE[id];
      return '<div class="card" data-id="' + id + '"><h3>' + (c ? c.icon + ' ' : '') + 'Duplex ' + id + '</h3><p>' + (d.owner || c?.name || '—') + (d.vehicle ? ' · 🚗' : '') + '</p></div>';
    }).join('');
  list.querySelectorAll('.card[data-id]').forEach(c => { c.onclick = () => selectPlot(c.dataset.id); });
}
document.getElementById('toggle-sidebar').onclick = () => document.getElementById('sidebar').classList.toggle('collapsed');
const radarCanvas = document.getElementById('radar-canvas');
const rctx = radarCanvas.getContext('2d');
function drawRadar() {
  const s = 120;
  radarCanvas.width = s; radarCanvas.height = s;
  rctx.clearRect(0, 0, s, s);
  rctx.fillStyle = 'rgba(10,14,22,0.6)';
  rctx.beginPath(); rctx.arc(s/2, s/2, s/2-2, 0, Math.PI*2); rctx.fill();
  rctx.strokeStyle = 'rgba(94,129,244,0.45)'; rctx.lineWidth = 1;
  rctx.strokeRect(30, 15, 60, 90);
  const cam = streetActive ? streetCamera : camera;
  const rx = s/2 + (cam.position.x / 70) * 30;
  const ry = s/2 + (cam.position.z / 80) * 40;
  rctx.fillStyle = '#5E81F4';
  rctx.beginPath(); rctx.arc(rx, ry, 3.5, 0, Math.PI*2); rctx.fill();
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  streetCamera.aspect = window.innerWidth / window.innerHeight;
  streetCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
refreshInfra();
refreshEvents();
refreshPlotsList();
setTime('day');
setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (streetActive) {
    velocity.x -= velocity.x * 8 * dt;
    velocity.z -= velocity.z * 8 * dt;
    direction.z = Number(move.forward) - Number(move.back);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();
    if (move.forward || move.back) velocity.z -= direction.z * 28 * dt;
    if (move.left || move.right) velocity.x -= direction.x * 28 * dt;
    const dx = -velocity.x * Math.cos(yaw) + velocity.z * Math.sin(yaw);
    const dz = -velocity.x * Math.sin(yaw) - velocity.z * Math.cos(yaw);
    streetCamera.position.x += dx * dt * 12;
    streetCamera.position.z += dz * dt * 12;
    streetCamera.position.y = 1.7;
    streetCamera.position.x = Math.max(-65, Math.min(55, streetCamera.position.x));
    streetCamera.position.z = Math.max(-75, Math.min(85, streetCamera.position.z));
    streetCamera.rotation.order = 'YXZ';
    streetCamera.rotation.y = yaw;
    streetCamera.rotation.x = pitch;
    renderer.render(scene, streetCamera);
  } else {
    orbit.update();
    renderer.render(scene, camera);
  }
  drawRadar();
}
animate();
