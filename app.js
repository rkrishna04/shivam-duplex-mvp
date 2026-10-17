import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Real layout from shivam-duplex-society society-map.js
const SOCIETY_LINES = [
  { id: 'line-1', name: 'Line 1 · North Lane', duplexes: ['01','02','03','04','05','06','07','08'],
    incharge: { name: 'Rajeshbhai Patel', house: '04', phone: '9825012341', role: 'Line 1 Mentor' }, color: 0x60a5fa },
  { id: 'line-2', name: 'Line 2 · West Lane 1', duplexes: ['09','10','11','12','13','14','15','16'],
    incharge: { name: 'Vinodbhai Shah', house: '11', phone: '9825011002', role: 'Vice-Chair · Line 2' }, color: 0xf59e0b },
  { id: 'line-3', name: 'Line 3 · West Lane 2', duplexes: ['17','18','19','20','21','22','23','24'],
    incharge: { name: 'Alpeshbhai Desai', house: '21', phone: '9825011003', role: 'Secretary · Line 3' }, color: 0x34d399 },
  { id: 'line-4', name: 'Line 4 · Central Lane', duplexes: ['25','26','27','28','29','30','31','32'],
    incharge: { name: 'Mukeshbhai Pandya', house: '31', phone: '9825011004', role: 'Treasurer · Line 4' }, color: 0xa78bfa },
  { id: 'line-5', name: 'Line 5 · Parkside', duplexes: ['33','34','35','36','37','38','39','40'],
    incharge: { name: 'Sanjaybhai Barot & Narendrabhai Rana', house: '34 & 38', phone: '9825011010', role: 'Parking & Garden' }, color: 0xf472b6 }
];

const COMMITTEE = {
  '01': { title: 'Chairman', name: 'Rameshbhai Patel', icon: '👑', phone: '9825011001' },
  '04': { title: 'Committee', name: 'Rajeshbhai Patel', icon: '⚖️', phone: '9825012341' },
  '06': { title: 'Water Supply', name: 'Pradeepbhai Patel', icon: '💧', phone: '9825011005' },
  '11': { title: 'Vice-Chair', name: 'Vinodbhai Shah', icon: '🤝', phone: '9825011002' },
  '14': { title: 'Security', name: 'Hareshbhai Joshi', icon: '🛡️', phone: '9825011006' },
  '18': { title: 'Sanitation', name: 'Deepakbhai Panchal', icon: '🧹', phone: '9825011007' },
  '21': { title: 'Secretary', name: 'Alpeshbhai Desai', icon: '📋', phone: '9825011003' },
  '23': { title: 'Electrical', name: 'Bhavinbhai Shah', icon: '💡', phone: '9825011008' },
  '24': { title: 'Committee', name: 'Sureshbhai Shah', icon: '⚖️', phone: '9825012342' },
  '27': { title: 'Festivals', name: 'Jitendrabhai Trivedi', icon: '🌺', phone: '9825011009' },
  '31': { title: 'Treasurer', name: 'Mukeshbhai Pandya', icon: '🏦', phone: '9825011004' },
  '34': { title: 'Parking', name: 'Sanjaybhai Barot', icon: '🚗', phone: '9825011010' },
  '38': { title: 'Garden', name: 'Narendrabhai Rana', icon: '🌳', phone: '9825011011' }
};

function svgTo3D(sx, sy) {
  return { x: (sx - 440) * 0.12, z: (sy - 360) * 0.12 };
}

const DUPLEX_SVG = {
  '01':{x:220,y:90},'02':{x:268,y:96},'03':{x:316,y:104},'04':{x:364,y:112},
  '05':{x:200,y:140},'06':{x:248,y:146},'07':{x:296,y:154},'08':{x:344,y:162},
  '09':{x:80,y:200},'10':{x:128,y:204},'11':{x:176,y:208},'12':{x:224,y:212},
  '13':{x:74,y:248},'14':{x:122,y:252},'15':{x:170,y:256},'16':{x:218,y:260},
  '17':{x:90,y:310},'18':{x:138,y:314},'19':{x:186,y:318},'20':{x:234,y:322},
  '21':{x:96,y:358},'22':{x:144,y:362},'23':{x:192,y:366},'24':{x:240,y:370},
  '25':{x:420,y:190},'26':{x:468,y:200},'27':{x:516,y:210},'28':{x:564,y:220},
  '29':{x:430,y:270},'30':{x:478,y:280},'31':{x:526,y:290},'32':{x:574,y:300},
  '33':{x:380,y:410},'34':{x:428,y:424},'35':{x:476,y:438},'36':{x:524,y:452},
  '37':{x:260,y:490},'38':{x:280,y:536},'39':{x:260,y:580},'40':{x:230,y:624}
};

const SL_SVG = [
  { id:'SL-01', x:260, y:70, name:'Main Gate Entry' },
  { id:'SL-02', x:190, y:130, name:'Line 1 NW Corner' },
  { id:'SL-03', x:340, y:140, name:'Line 1 Central' },
  { id:'SL-04', x:380, y:220, name:'Central Circle North' },
  { id:'SL-05', x:140, y:220, name:'Line 2 West End' },
  { id:'SL-06', x:90, y:280, name:'Near Temple Path' },
  { id:'SL-07', x:120, y:360, name:'Line 3 West End' },
  { id:'SL-08', x:240, y:370, name:'Line 3 Central' },
  { id:'SL-09', x:390, y:340, name:'Central Circle South' },
  { id:'SL-10', x:490, y:260, name:'Line 4 Entrance' },
  { id:'SL-11', x:530, y:350, name:'Line 4 Mid Block' },
  { id:'SL-12', x:440, y:440, name:'Line 4 South Junction' },
  { id:'SL-13', x:670, y:360, name:'Park Main Entrance' },
  { id:'SL-14', x:740, y:440, name:'Park Walking Track' },
  { id:'SL-15', x:310, y:520, name:'Line 5 SW Entrance' },
  { id:'SL-16', x:250, y:640, name:'South Boundary Gate' }
];

const state = {
  mode: 'aerial', time: 'day', selectedPlot: null,
  plots: {}, streetLights: [], cameras: [], vehicles: {}, events: [], faults: new Set()
};

try {
  const saved = JSON.parse(localStorage.getItem('shivam-duplex-mvp') || '{}');
  if (saved.plots) state.plots = saved.plots;
  if (saved.vehicles) state.vehicles = saved.vehicles;
  if (saved.faults) state.faults = new Set(saved.faults);
  if (saved.events) state.events = saved.events;
} catch (e) {}

function persist() {
  localStorage.setItem('shivam-duplex-mvp', JSON.stringify({
    plots: state.plots, vehicles: state.vehicles, faults: [...state.faults], events: state.events
  }));
}

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.Fog(0x87b8e0, 60, 160);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 48, 55);

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
orbit.minDistance = 10;
orbit.maxDistance = 120;
orbit.target.set(0, 0, 5);

const streetCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
streetCamera.position.set(0, 1.7, 25);
let streetActive = false;
const move = { forward: false, back: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let yaw = 0, pitch = 0;

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
sun.position.set(30, 50, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 140;
sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;
scene.add(sun);
const hemi = new THREE.HemisphereLight(0x87b8e0, 0x3a5a3a, 0.35);
scene.add(hemi);

const matRoad = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.85, metalness: 0.05 });
const matSidewalk = new THREE.MeshStandardMaterial({ color: 0x6b7078, roughness: 0.9 });
const matGrass = new THREE.MeshStandardMaterial({ color: 0x3d6b3d, roughness: 0.95 });
const matHouse = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.7, metalness: 0.05 });
const matRoof = new THREE.MeshStandardMaterial({ color: 0x8b5a3c, roughness: 0.8 });
const matPark = new THREE.MeshStandardMaterial({ color: 0x4a8c4a, roughness: 0.9 });
const matGate = new THREE.MeshStandardMaterial({ color: 0x2a2e38, roughness: 0.6, metalness: 0.3 });
const matSelected = new THREE.MeshStandardMaterial({ color: 0x5E81F4, roughness: 0.5, emissive: 0x1a2a6a, emissiveIntensity: 0.35 });
const matCommittee = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5, emissive: 0x664400, emissiveIntensity: 0.25 });

const root = new THREE.Group();
scene.add(root);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 110), matGrass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
root.add(ground);

function makeRoadSeg(x1, z1, x2, z2, w = 5) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz) || 0.1;
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, len), matRoad);
  r.position.set((x1 + x2) / 2, 0.06, (z1 + z2) / 2);
  r.rotation.y = Math.atan2(dx, dz);
  r.receiveShadow = true;
  root.add(r);
}

const g = svgTo3D(260, 40);
const g2 = svgTo3D(260, 680);
makeRoadSeg(g.x, g.z, g2.x, g2.z, 6);
[[190,135,370,135],[70,240,240,240],[80,350,250,350],[400,240,590,250],[420,380,680,390]].forEach(([a,b,c,d]) => {
  const p1 = svgTo3D(a,b), p2 = svgTo3D(c,d);
  makeRoadSeg(p1.x, p1.z, p2.x, p2.z, 4.5);
});

const gatePos = svgTo3D(260, 50);
const gatePad = new THREE.Mesh(new THREE.BoxGeometry(14, 0.15, 8), matRoad);
gatePad.position.set(gatePos.x, 0.08, gatePos.z);
gatePad.receiveShadow = true;
root.add(gatePad);
const barrier = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, 0.35), matGate);
barrier.position.set(gatePos.x, 1.1, gatePos.z + 2);
root.add(barrier);
const cabin = new THREE.Mesh(new THREE.BoxGeometry(3, 2.6, 2.8), matHouse);
cabin.position.set(gatePos.x - 7, 1.3, gatePos.z);
cabin.castShadow = true;
root.add(cabin);

const parkPos = svgTo3D(720, 420);
const park = new THREE.Mesh(new THREE.CircleGeometry(12, 40), matPark);
park.rotation.x = -Math.PI / 2;
park.position.set(parkPos.x, 0.05, parkPos.z);
park.receiveShadow = true;
root.add(park);
const track = new THREE.Mesh(new THREE.RingGeometry(9, 11, 40), new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 }));
track.rotation.x = -Math.PI / 2;
track.position.set(parkPos.x, 0.07, parkPos.z);
root.add(track);
const gazeboRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.5, 8), matRoof);
gazeboRoof.position.set(parkPos.x, 3.0, parkPos.z);
root.add(gazeboRoof);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.4, 6), matHouse);
  col.position.set(parkPos.x + Math.cos(a) * 2.2, 1.3, parkPos.z + Math.sin(a) * 2.2);
  root.add(col);
}
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  const tx = parkPos.x + Math.cos(a) * 13;
  const tz = parkPos.z + Math.sin(a) * 13;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
  trunk.position.set(tx, 0.9, tz);
  trunk.castShadow = true;
  root.add(trunk);
  const fol = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2d6b2d, roughness: 0.9 }));
  fol.position.set(tx, 2.5, tz);
  fol.castShadow = true;
  root.add(fol);
}

const plotMeshes = new Map();
const plotData = [];

function lineOf(id) {
  return SOCIETY_LINES.find(l => l.duplexes.includes(id));
}

function createHouse(id) {
  const svg = DUPLEX_SVG[id];
  if (!svg) return;
  const pos = svgTo3D(svg.x, svg.y);
  const line = lineOf(id);
  const isCommittee = !!COMMITTEE[id];
  const group = new THREE.Group();
  group.position.set(pos.x, 0, pos.z);
  const bodyMat = isCommittee ? matCommittee.clone() : matHouse.clone();
  if (line) bodyMat.color.lerp(new THREE.Color(line.color), 0.15);
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.8, 5.5), bodyMat);
  body.position.y = 1.4;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData = { type: 'plot', id };
  group.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.3, 6), matRoof.clone());
  roof.position.y = 2.95;
  group.add(roof);
  const porch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1.8), matSidewalk);
  porch.position.set(0, 0.12, 3.4);
  group.add(porch);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x88aacc, emissive: 0x224466, emissiveIntensity: 0 }));
  win.position.set(1.2, 1.7, 2.78);
  group.add(win);
  group.userData.win = win;
  root.add(group);
  plotMeshes.set(id, { group, body, roof, win, isCommittee, lineId: line?.id });
  plotData.push({ id, x: pos.x, z: pos.z, lane: line?.name || '', rot: 0, lineId: line?.id });
  if (!state.plots[id]) {
    const c = COMMITTEE[id];
    state.plots[id] = { owner: c ? c.name : '', phone: c ? c.phone : '', vehicle: null, plate: '', cctv: false, role: c ? c.title : '' };
  }
}

Object.keys(DUPLEX_SVG).forEach(createHouse);

const lightGroup = new THREE.Group();
root.add(lightGroup);
SL_SVG.forEach((sl) => {
  const pos = svgTo3D(sl.x, sl.y);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 5, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  pole.position.set(pos.x, 2.5, pos.z);
  pole.castShadow = true;
  lightGroup.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.4), new THREE.MeshStandardMaterial({ color: 0x222 }));
  head.position.set(pos.x, 5.05, pos.z);
  lightGroup.add(head);
  const lamp = new THREE.PointLight(0xffe8c0, 0, 16, 1.5);
  lamp.position.set(pos.x, 4.9, pos.z);
  lightGroup.add(lamp);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffe8c0, emissive: 0xffcc66, emissiveIntensity: 0 }));
  glow.position.set(pos.x, 4.9, pos.z);
  lightGroup.add(glow);
  state.streetLights.push({ id: sl.id, name: sl.name, lamp, glow, pos: [pos.x, pos.z], fault: state.faults.has(sl.id) });
});

[[260,55],[390,220],[90,280],[720,400],[250,640]].forEach((p, i) => {
  const id = 'CAM-' + String(i + 1).padStart(2, '0');
  const pos = svgTo3D(p[0], p[1]);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  pole.position.set(pos.x, 1.9, pos.z);
  root.add(pole);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 6.5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x5E81F4, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
  cone.position.set(pos.x, 1.6, pos.z - 3);
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
    const body = new THREE.Mesh(new THREE.BoxGeometry(type === 'suv' ? 2.0 : 1.7, 0.6, type === 'suv' ? 3.6 : 3.2), new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 }));
    body.position.y = 0.5;
    body.castShadow = true;
    g.add(body);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 1.4), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    body.position.y = 0.45;
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
    mesh.position.set(pd.x, 0, pd.z + 4.2);
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
  const intersects = raycaster.intersectObjects(root.children, true);
  for (const hit of intersects) {
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
      const line = lineOf(state.selectedPlot);
      if (line && !wasC) prev.body.material.color.lerp(new THREE.Color(line.color), 0.15);
    }
  }
  state.selectedPlot = id;
  const curr = plotMeshes.get(id);
  if (curr) curr.body.material = matSelected.clone();
  const data = state.plots[id] || {};
  const c = COMMITTEE[id];
  const line = lineOf(id);
  document.getElementById('detail-title').textContent = 'Duplex ' + id + (c ? ' ' + c.icon : '');
  document.getElementById('detail-meta').textContent = (line?.name || 'Society') + ' · G+1' + (c ? ' · ' + c.title : '');
  document.getElementById('owner-name').value = data.owner || (c ? c.name : '');
  document.getElementById('owner-phone').value = data.phone || (c ? c.phone : '');
  document.getElementById('vehicle-type').value = data.vehicle || '';
  document.getElementById('vehicle-plate').value = data.plate || '';
  document.getElementById('detail-panel').classList.add('visible');
  toast('Selected Duplex ' + id + (c ? ' · ' + c.title : ''));
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
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
  syncVehicles(); persist(); toast('Plot saved'); refreshPlotsList();
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
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.8, 5.5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x32D583, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    cone.position.set(pd.x, 1.3, pd.z + 3.5);
    cone.rotation.x = Math.PI * 0.85;
    root.add(cone);
  }
  persist(); toast('Home CCTV registered');
};

document.getElementById('btn-add-vehicle').onclick = () => {
  if (!state.selectedPlot) { toast('Select a plot first'); return; }
  document.getElementById('vehicle-type').value = 'sedan';
  document.getElementById('detail-panel').classList.add('visible');
};
document.getElementById('btn-register-cctv').onclick = () => {
  if (!state.selectedPlot) { toast('Select a plot first'); return; }
  document.getElementById('btn-add-cctv-here').click();
};
document.getElementById('btn-road-closure').onclick = () => {
  state.events.push({ id: 'EVT-' + Date.now(), type: 'Marriage Mandap', host: state.selectedPlot || 'Central', from: new Date().toLocaleDateString(), active: true });
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xe8d4a8 }));
  tent.position.set(0, 1.5, 8);
  root.add(tent);
  for (let i = -2; i <= 2; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.12), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
    b.position.set(i * 1.5, 0.5, 12);
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
    sl.lamp.intensity = on ? (t === 'night' ? 1.3 : 0.65) : 0;
    sl.glow.material.emissiveIntensity = on ? 1.1 : 0;
  });
  plotMeshes.forEach(({ win }) => { win.material.emissiveIntensity = t === 'night' ? 0.75 : 0; });
  if (t === 'day') {
    scene.background.set(0x87b8e0); scene.fog.color.set(0x87b8e0);
    ambient.intensity = 0.45; sun.intensity = 1.2; sun.color.set(0xfff4e0); hemi.intensity = 0.35;
  } else if (t === 'dusk') {
    scene.background.set(0x4a3a5a); scene.fog.color.set(0x4a3a5a);
    ambient.intensity = 0.25; sun.intensity = 0.55; sun.color.set(0xff8844); hemi.intensity = 0.2;
  } else {
    scene.background.set(0x0a0e18); scene.fog.color.set(0x0a0e18);
    ambient.intensity = 0.12; sun.intensity = 0.08; sun.color.set(0x4455aa); hemi.intensity = 0.08;
  }
}
document.getElementById('btn-day').onclick = () => setTime('day');
document.getElementById('btn-dusk').onclick = () => setTime('dusk');
document.getElementById('btn-night').onclick = () => setTime('night');

document.getElementById('btn-reset-cam').onclick = () => { camera.position.set(0, 48, 55); orbit.target.set(0, 0, 5); orbit.update(); };
document.getElementById('btn-focus-gate').onclick = () => {
  const p = svgTo3D(260, 50);
  camera.position.set(p.x, 16, p.z + 22); orbit.target.set(p.x, 0, p.z); orbit.update();
};
document.getElementById('btn-focus-park').onclick = () => {
  const p = svgTo3D(720, 420);
  camera.position.set(p.x + 18, 20, p.z + 15); orbit.target.set(p.x, 0, p.z); orbit.update();
};

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    state.mode = mode;
    if (mode === 'aerial') { streetActive = false; camera.position.set(0, 48, 55); orbit.enabled = true; orbit.maxPolarAngle = Math.PI * 0.48; }
    else if (mode === 'top') { streetActive = false; camera.position.set(0, 85, 0.1); orbit.target.set(0, 0, 5); orbit.enabled = true; orbit.maxPolarAngle = Math.PI * 0.05; }
    else if (mode === 'street') {
      streetActive = true; orbit.enabled = false;
      streetCamera.position.set(0, 1.7, 20);
      toast('Street View — W/A/S/D walk · click canvas to look');
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
  state.streetLights.forEach(sl => {
    const div = document.createElement('div');
    div.className = 'card';
    const status = sl.fault ? 'fault' : 'ok';
    div.innerHTML = '<h3><span class="status-dot ' + status + '"></span>' + sl.id + '</h3><p>' + (sl.fault ? 'FAULT — click to resolve' : (sl.name || 'Operational')) + '</p>';
    div.onclick = () => {
      sl.fault = !sl.fault;
      if (sl.fault) state.faults.add(sl.id); else state.faults.delete(sl.id);
      setTime(state.time); persist(); refreshInfra();
      toast(sl.fault ? sl.id + ' FAULT' : sl.id + ' resolved');
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
      c.cone.material.opacity = c.fault ? 0.03 : 0.12;
      c.cone.material.color.set(c.fault ? 0xF97066 : 0x5E81F4);
      if (c.fault) state.faults.add(c.id); else state.faults.delete(c.id);
      persist(); refreshInfra();
      toast(c.fault ? c.id + ' offline' : c.id + ' restored');
    };
    list.appendChild(div);
  });
}

function refreshEvents() {
  const list = document.getElementById('events-list');
  if (!state.events.length) {
    list.innerHTML = '<div class="card" style="opacity:0.6"><h3>No active closures</h3><p>Schedule one from actions above</p></div>';
    return;
  }
  list.innerHTML = state.events.map(e => '<div class="card"><h3>🚧 ' + e.type + '</h3><p>Host: ' + e.host + ' · ' + e.from + '</p></div>').join('');
}

function refreshPlotsList() {
  const list = document.getElementById('plots-list');
  const ids = Object.keys(DUPLEX_SVG).sort();
  list.innerHTML = ids.map(id => {
    const d = state.plots[id] || {};
    const c = COMMITTEE[id];
    return '<div class="card" data-id="' + id + '"><h3>' + (c ? c.icon + ' ' : '') + 'Duplex ' + id + '</h3><p>' + (d.owner || c?.name || 'Unassigned') + (d.vehicle ? ' · 🚗' : '') + '</p></div>';
  }).join('');
  list.querySelectorAll('.card').forEach(c => { c.onclick = () => selectPlot(c.dataset.id); });
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
  rctx.strokeStyle = 'rgba(94,129,244,0.5)'; rctx.lineWidth = 1;
  rctx.strokeRect(25, 18, 70, 85);
  const cam = streetActive ? streetCamera : camera;
  const rx = s/2 + (cam.position.x / 50) * 35;
  const ry = s/2 + (cam.position.z / 50) * 35;
  rctx.fillStyle = '#5E81F4';
  rctx.beginPath(); rctx.arc(rx, ry, 4, 0, Math.PI*2); rctx.fill();
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
    streetCamera.position.x = Math.max(-50, Math.min(45, streetCamera.position.x));
    streetCamera.position.z = Math.max(-45, Math.min(45, streetCamera.position.z));
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
