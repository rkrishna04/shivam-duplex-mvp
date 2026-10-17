import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- State ----------
const state = {
  mode: 'aerial',
  time: 'day',
  selectedPlot: null,
  plots: {},
  streetLights: [],
  cameras: [],
  vehicles: {},
  events: [],
  faults: new Set()
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
    plots: state.plots,
    vehicles: state.vehicles,
    faults: [...state.faults],
    events: state.events
  }));
}

// ---------- Scene ----------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.Fog(0x87b8e0, 80, 220);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 55, 70);

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
orbit.minDistance = 12;
orbit.maxDistance = 140;
orbit.target.set(0, 0, 0);

const streetCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
streetCamera.position.set(0, 1.7, 35);
let streetActive = false;
const move = { forward: false, back: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let yaw = 0, pitch = 0;

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
sun.position.set(40, 60, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 180;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
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
const matSelected = new THREE.MeshStandardMaterial({ color: 0x5E81F4, roughness: 0.5, emissive: 0x1a2a6a, emissiveIntensity: 0.3 });

const root = new THREE.Group();
scene.add(root);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 140), matGrass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
root.add(ground);

// North Gate
const gatePad = new THREE.Mesh(new THREE.BoxGeometry(18, 0.15, 12), matRoad);
gatePad.position.set(0, 0.08, 52);
gatePad.receiveShadow = true;
root.add(gatePad);

const barrier = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 0.4), matGate);
barrier.position.set(0, 1.2, 48);
root.add(barrier);
const postL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.4), matGate);
postL.position.set(-5.5, 1.2, 48);
root.add(postL);
const postR = postL.clone();
postR.position.x = 5.5;
root.add(postR);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.8, 3.2), matHouse);
cabin.position.set(-9, 1.4, 50);
cabin.castShadow = true;
root.add(cabin);
const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 3.6), matRoof);
cabinRoof.position.set(-9, 2.9, 50);
root.add(cabinRoof);

function makeRoad(x, z, w, l, rot = 0) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, l), matRoad);
  r.position.set(x, 0.06, z);
  r.rotation.y = rot;
  r.receiveShadow = true;
  root.add(r);
  return r;
}
makeRoad(0, 10, 8, 80);
makeRoad(22, 5, 7, 70);
makeRoad(0, -35, 7, 40);
makeRoad(-18, -42, 7, 30, Math.PI / 2 * 0.3);

const laneXs = [-32, -42, -52, -62];
laneXs.forEach((x) => {
  makeRoad(x, 5, 6, 55);
  const end = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.12, 24), matRoad);
  end.position.set(x, 0.06, -25);
  end.receiveShadow = true;
  root.add(end);
});

[-5.5, 5.5].forEach(x => {
  const sw = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 78), matSidewalk);
  sw.position.set(x, 0.04, 10);
  root.add(sw);
});

// Park
const park = new THREE.Mesh(new THREE.CircleGeometry(18, 48), matPark);
park.rotation.x = -Math.PI / 2;
park.position.set(38, 0.05, 0);
park.receiveShadow = true;
root.add(park);

const track = new THREE.Mesh(new THREE.RingGeometry(14, 16.5, 48), new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 }));
track.rotation.x = -Math.PI / 2;
track.position.set(38, 0.07, 0);
root.add(track);

const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.3, 8), matHouse);
gazeboBase.position.set(38, 0.2, 0);
root.add(gazeboBase);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.8, 8), matHouse);
  col.position.set(38 + Math.cos(a) * 2.8, 1.5, Math.sin(a) * 2.8);
  root.add(col);
}
const gazeboRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.8, 8), matRoof);
gazeboRoof.position.set(38, 3.4, 0);
root.add(gazeboRoof);

function makeTree(x, z) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
  trunk.position.set(x, 1.1, z);
  trunk.castShadow = true;
  root.add(trunk);
  const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2d6b2d, roughness: 0.9 }));
  foliage.position.set(x, 3.0, z);
  foliage.castShadow = true;
  root.add(foliage);
}
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  makeTree(38 + Math.cos(a) * 19, Math.sin(a) * 19);
}

// Plots
const plotMeshes = new Map();
const plotData = [];

function createHouse(id, x, z, rot = 0, lane = '') {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rot;

  const body = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 8), matHouse.clone());
  body.position.y = 1.6;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData = { type: 'plot', id };
  group.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 8.6), matRoof.clone());
  roof.position.y = 3.4;
  group.add(roof);

  const porch = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 2.5), matSidewalk);
  porch.position.set(0, 0.15, 5.2);
  group.add(porch);

  const win = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x88aacc, emissive: 0x224466, emissiveIntensity: 0 })
  );
  win.position.set(1.8, 2.0, 4.05);
  group.add(win);
  group.userData.win = win;

  root.add(group);
  plotMeshes.set(id, { group, body, roof, win });
  plotData.push({ id, x, z, lane, rot });

  if (!state.plots[id]) {
    state.plots[id] = { owner: '', phone: '', vehicle: null, plate: '', cctv: false };
  }
  return group;
}

laneXs.forEach((lx, li) => {
  for (let i = 0; i < 8; i++) {
    const z = 28 - i * 7.5;
    const id = `W${li + 1}-${String(i + 1).padStart(2, '0')}`;
    createHouse(id, lx + (li % 2 === 0 ? 5.5 : -5.5), z, li % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, `Lane ${li + 1}`);
  }
});

for (let i = 0; i < 10; i++) {
  const z = 35 - i * 7;
  createHouse(`E-${String(i + 1).padStart(2, '0')}`, 8, z, -Math.PI / 2, 'East Spine');
  createHouse(`C-${String(i + 1).padStart(2, '0')}`, -8, z, Math.PI / 2, 'Central');
}

for (let i = 0; i < 8; i++) {
  createHouse(`S-${String(i + 1).padStart(2, '0')}`, -28 + i * 8, -48, 0, 'South');
}

// Street lights
const lightGroup = new THREE.Group();
root.add(lightGroup);
const lightPositions = [
  [0, 40], [0, 25], [0, 10], [0, -5], [0, -20],
  [22, 30], [22, 10], [22, -10],
  [-32, 20], [-42, 15], [-52, 10], [-62, 5],
  [38, 12], [38, -12]
];
lightPositions.forEach((p, i) => {
  const id = `SL-${String(i + 1).padStart(2, '0')}`;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5.5, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  pole.position.set(p[0], 2.75, p[1]);
  pole.castShadow = true;
  lightGroup.add(pole);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  head.position.set(p[0], 5.5, p[1]);
  lightGroup.add(head);

  const lamp = new THREE.PointLight(0xffe8c0, 0, 18, 1.5);
  lamp.position.set(p[0], 5.3, p[1]);
  lightGroup.add(lamp);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffe8c0, emissive: 0xffcc66, emissiveIntensity: 0 })
  );
  glow.position.set(p[0], 5.3, p[1]);
  lightGroup.add(glow);

  state.streetLights.push({ id, lamp, glow, pole, head, pos: p, fault: state.faults.has(id) });
});

// Society CCTV
const camPositions = [[0, 48], [22, 20], [-42, 0], [38, 0], [0, -30]];
camPositions.forEach((p, i) => {
  const id = `CAM-${String(i + 1).padStart(2, '0')}`;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  pole.position.set(p[0], 2.1, p[1]);
  root.add(pole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0x333 }));
  box.position.set(p[0], 4.3, p[1]);
  root.add(box);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(4, 8, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x5E81F4, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  cone.position.set(p[0], 2, p[1] - 4);
  cone.rotation.x = Math.PI;
  root.add(cone);
  state.cameras.push({ id, cone, fault: state.faults.has(id) });
});

// Vehicles
const vehicleGroup = new THREE.Group();
root.add(vehicleGroup);
const vehicleMeshes = new Map();

function makeVehicle(type, color = 0x3366aa) {
  const g = new THREE.Group();
  if (type === 'sedan' || type === 'suv') {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(type === 'suv' ? 2.2 : 1.9, 0.7, type === 'suv' ? 4.2 : 3.8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
    );
    body.position.y = 0.55;
    body.castShadow = true;
    g.add(body);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.6, 2),
      new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.7 })
    );
    cabin.position.set(0, 1.15, -0.2);
    g.add(cabin);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 1.6), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    body.position.y = 0.5;
    g.add(body);
    const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0x111 }));
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(0, 0.28, 0.55);
    g.add(wheel1);
    const wheel2 = wheel1.clone();
    wheel2.position.z = -0.55;
    g.add(wheel2);
  }
  return g;
}

function syncVehicles() {
  vehicleMeshes.forEach(m => vehicleGroup.remove(m));
  vehicleMeshes.clear();
  Object.entries(state.vehicles).forEach(([plotId, v]) => {
    const plot = plotMeshes.get(plotId);
    if (!plot || !v.type) return;
    const mesh = makeVehicle(v.type, v.color || 0x3366aa);
    const pd = plotData.find(p => p.id === plotId);
    if (!pd) return;
    const offset = new THREE.Vector3(0, 0, 6.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), pd.rot);
    mesh.position.set(pd.x + offset.x, 0, pd.z + offset.z);
    mesh.rotation.y = pd.rot;
    vehicleGroup.add(mesh);
    vehicleMeshes.set(plotId, mesh);
  });
}
syncVehicles();

// Interaction
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
    if (obj?.userData?.type === 'plot') {
      selectPlot(obj.userData.id);
      return;
    }
  }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);

function selectPlot(id) {
  if (state.selectedPlot) {
    const prev = plotMeshes.get(state.selectedPlot);
    if (prev) prev.body.material = matHouse.clone();
  }
  state.selectedPlot = id;
  const curr = plotMeshes.get(id);
  if (curr) curr.body.material = matSelected.clone();

  const data = state.plots[id] || {};
  document.getElementById('detail-title').textContent = `Plot ${id}`;
  const meta = plotData.find(p => p.id === id);
  document.getElementById('detail-meta').textContent = `${meta?.lane || 'Society'} • G+1 Duplex`;
  document.getElementById('owner-name').value = data.owner || '';
  document.getElementById('owner-phone').value = data.phone || '';
  document.getElementById('vehicle-type').value = data.vehicle || '';
  document.getElementById('vehicle-plate').value = data.plate || '';
  document.getElementById('detail-panel').classList.add('visible');
  toast(`Selected ${id}`);
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

document.getElementById('btn-close-detail').onclick = () => {
  document.getElementById('detail-panel').classList.remove('visible');
};

document.getElementById('btn-save-plot').onclick = () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot;
  state.plots[id] = {
    owner: document.getElementById('owner-name').value,
    phone: document.getElementById('owner-phone').value,
    vehicle: document.getElementById('vehicle-type').value || null,
    plate: document.getElementById('vehicle-plate').value,
    cctv: state.plots[id]?.cctv || false
  };
  if (state.plots[id].vehicle) {
    state.vehicles[id] = { type: state.plots[id].vehicle, plate: state.plots[id].plate, color: 0x3366aa };
  } else {
    delete state.vehicles[id];
  }
  syncVehicles();
  persist();
  toast('Plot saved');
  refreshPlotsList();
};

document.getElementById('btn-clear-vehicle').onclick = () => {
  if (!state.selectedPlot) return;
  delete state.vehicles[state.selectedPlot];
  if (state.plots[state.selectedPlot]) state.plots[state.selectedPlot].vehicle = null;
  document.getElementById('vehicle-type').value = '';
  syncVehicles();
  persist();
  toast('Vehicle cleared');
};

document.getElementById('btn-add-cctv-here').onclick = () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot;
  state.plots[id].cctv = true;
  const pd = plotData.find(p => p.id === id);
  if (pd) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 7, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x32D583, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    cone.position.set(pd.x, 1.5, pd.z + 5);
    cone.rotation.x = Math.PI * 0.85;
    root.add(cone);
  }
  persist();
  toast('Home CCTV registered — cone visible');
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
  const evt = {
    id: 'EVT-' + Date.now(),
    type: 'Marriage Mandap',
    host: state.selectedPlot || 'Central Spine',
    from: new Date().toLocaleDateString(),
    active: true
  };
  state.events.push(evt);
  const tent = new THREE.Mesh(new THREE.ConeGeometry(4, 3.5, 4), new THREE.MeshStandardMaterial({ color: 0xe8d4a8 }));
  tent.position.set(0, 1.75, 5);
  root.add(tent);
  for (let i = -3; i <= 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.15), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
    b.position.set(i * 1.8, 0.55, 12);
    root.add(b);
  }
  persist();
  refreshEvents();
  toast('Road closure scheduled — tent & barricades placed');
};

function setTime(t) {
  state.time = t;
  document.querySelectorAll('#bottombar .ctrl-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + t)?.classList.add('active');

  state.streetLights.forEach(sl => {
    const on = t !== 'day' && !sl.fault;
    sl.lamp.intensity = on ? (t === 'night' ? 1.4 : 0.7) : 0;
    sl.glow.material.emissiveIntensity = on ? 1.2 : 0;
  });

  plotMeshes.forEach(({ win }) => {
    win.material.emissiveIntensity = t === 'night' ? 0.8 : 0;
  });

  if (t === 'day') {
    scene.background.set(0x87b8e0);
    scene.fog.color.set(0x87b8e0);
    ambient.intensity = 0.45;
    sun.intensity = 1.2;
    sun.color.set(0xfff4e0);
    hemi.intensity = 0.35;
  } else if (t === 'dusk') {
    scene.background.set(0x4a3a5a);
    scene.fog.color.set(0x4a3a5a);
    ambient.intensity = 0.25;
    sun.intensity = 0.55;
    sun.color.set(0xff8844);
    hemi.intensity = 0.2;
  } else {
    scene.background.set(0x0a0e18);
    scene.fog.color.set(0x0a0e18);
    ambient.intensity = 0.12;
    sun.intensity = 0.08;
    sun.color.set(0x4455aa);
    hemi.intensity = 0.08;
  }
}
document.getElementById('btn-day').onclick = () => setTime('day');
document.getElementById('btn-dusk').onclick = () => setTime('dusk');
document.getElementById('btn-night').onclick = () => setTime('night');

document.getElementById('btn-reset-cam').onclick = () => {
  camera.position.set(0, 55, 70);
  orbit.target.set(0, 0, 0);
  orbit.update();
};
document.getElementById('btn-focus-gate').onclick = () => {
  camera.position.set(0, 18, 70);
  orbit.target.set(0, 0, 48);
  orbit.update();
};
document.getElementById('btn-focus-park').onclick = () => {
  camera.position.set(55, 25, 25);
  orbit.target.set(38, 0, 0);
  orbit.update();
};

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    state.mode = mode;
    if (mode === 'aerial') {
      streetActive = false;
      camera.position.set(0, 55, 70);
      orbit.enabled = true;
      orbit.maxPolarAngle = Math.PI * 0.48;
    } else if (mode === 'top') {
      streetActive = false;
      camera.position.set(0, 95, 0.1);
      orbit.target.set(0, 0, 0);
      orbit.enabled = true;
      orbit.maxPolarAngle = Math.PI * 0.05;
    } else if (mode === 'street') {
      streetActive = true;
      orbit.enabled = false;
      streetCamera.position.set(0, 1.7, 35);
      streetCamera.lookAt(0, 1.7, 0);
      toast('Street View — W/A/S/D to walk, click canvas then move mouse to look');
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
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
});

function refreshInfra() {
  const list = document.getElementById('infra-list');
  list.innerHTML = '';
  state.streetLights.forEach(sl => {
    const div = document.createElement('div');
    div.className = 'card';
    const status = sl.fault ? 'fault' : 'ok';
    div.innerHTML = `<h3><span class="status-dot ${status}"></span>${sl.id}</h3>
      <p>${sl.fault ? 'FAULT — click to resolve' : 'Operational'}</p>`;
    div.onclick = () => {
      sl.fault = !sl.fault;
      if (sl.fault) state.faults.add(sl.id); else state.faults.delete(sl.id);
      setTime(state.time);
      persist();
      refreshInfra();
      toast(sl.fault ? `${sl.id} marked FAULT` : `${sl.id} resolved ✓`);
    };
    list.appendChild(div);
  });
  state.cameras.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card';
    const status = c.fault ? 'fault' : 'ok';
    div.innerHTML = `<h3><span class="status-dot ${status}"></span>${c.id}</h3>
      <p>${c.fault ? 'OFFLINE' : 'Online'}</p>`;
    div.onclick = () => {
      c.fault = !c.fault;
      c.cone.material.opacity = c.fault ? 0.03 : 0.12;
      c.cone.material.color.set(c.fault ? 0xF97066 : 0x5E81F4);
      if (c.fault) state.faults.add(c.id); else state.faults.delete(c.id);
      persist();
      refreshInfra();
      toast(c.fault ? `${c.id} offline` : `${c.id} restored`);
    };
    list.appendChild(div);
  });
}

function refreshEvents() {
  const list = document.getElementById('events-list');
  if (!state.events.length) {
    list.innerHTML = `<div class="card" style="opacity:0.6"><h3>No active closures</h3><p>Schedule one from the actions above</p></div>`;
    return;
  }
  list.innerHTML = state.events.map(e => `
    <div class="card">
      <h3>🚧 ${e.type}</h3>
      <p>Host: ${e.host} • ${e.from}</p>
    </div>
  `).join('');
}

function refreshPlotsList() {
  const list = document.getElementById('plots-list');
  const sample = plotData.slice(0, 12);
  list.innerHTML = sample.map(p => {
    const d = state.plots[p.id] || {};
    return `<div class="card" data-id="${p.id}">
      <h3>${p.id}</h3>
      <p>${d.owner || 'Unassigned'} ${d.vehicle ? '• 🚗' : ''}</p>
    </div>`;
  }).join('');
  list.querySelectorAll('.card').forEach(c => {
    c.onclick = () => selectPlot(c.dataset.id);
  });
}

document.getElementById('toggle-sidebar').onclick = () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
};

const radarCanvas = document.getElementById('radar-canvas');
const rctx = radarCanvas.getContext('2d');
function drawRadar() {
  const s = 120;
  radarCanvas.width = s;
  radarCanvas.height = s;
  rctx.clearRect(0, 0, s, s);
  rctx.fillStyle = 'rgba(10,14,22,0.6)';
  rctx.beginPath();
  rctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
  rctx.fill();
  rctx.strokeStyle = 'rgba(94,129,244,0.5)';
  rctx.lineWidth = 1;
  rctx.strokeRect(20, 15, 80, 90);
  const cam = streetActive ? streetCamera : camera;
  const rx = s / 2 + (cam.position.x / 80) * 40;
  const ry = s / 2 + (cam.position.z / 80) * 40;
  rctx.fillStyle = '#5E81F4';
  rctx.beginPath();
  rctx.arc(rx, ry, 4, 0, Math.PI * 2);
  rctx.fill();
  rctx.strokeStyle = 'rgba(94,129,244,0.4)';
  rctx.beginPath();
  rctx.moveTo(rx, ry);
  const angle = streetActive ? yaw : Math.atan2(orbit.target.x - cam.position.x, orbit.target.z - cam.position.z);
  rctx.lineTo(rx + Math.sin(angle) * 25, ry + Math.cos(angle) * 25);
  rctx.stroke();
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
setTimeout(() => document.getElementById('loader').classList.add('hidden'), 600);

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
    streetCamera.position.x = Math.max(-70, Math.min(55, streetCamera.position.x));
    streetCamera.position.z = Math.max(-55, Math.min(55, streetCamera.position.z));
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
