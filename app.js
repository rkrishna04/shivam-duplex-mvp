import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Shivam Duplex — one black dot = one house
// Layout matched to your annotated satellite map
// Yellow = roads | Green = parks | Pink = society office

const COMMITTEE = {
  '01': { title: 'Chairman', name: 'Rameshbhai Patel', icon: '👑', phone: '9825011001' },
  '08': { title: 'Secretary', name: 'Alpeshbhai Desai', icon: '📋', phone: '9825011003' },
  '15': { title: 'Treasurer', name: 'Mukeshbhai Pandya', icon: '🏦', phone: '9825011004' },
  '22': { title: 'Vice-Chair', name: 'Vinodbhai Shah', icon: '🤝', phone: '9825011002' },
  '35': { title: 'Security', name: 'Hareshbhai Joshi', icon: '🛡️', phone: '9825011006' },
  '48': { title: 'Electrical', name: 'Bhavinbhai Shah', icon: '💡', phone: '9825011008' },
  '62': { title: 'Sanitation', name: 'Deepakbhai Panchal', icon: '🧹', phone: '9825011007' },
  '75': { title: 'Water', name: 'Pradeepbhai Patel', icon: '💧', phone: '9825011005' },
  '90': { title: 'Festivals', name: 'Jitendrabhai Trivedi', icon: '🌺', phone: '9825011009' },
  '110': { title: 'Parking', name: 'Sanjaybhai Barot', icon: '🚗', phone: '9825011010' },
  '130': { title: 'Garden', name: 'Narendrabhai Rana', icon: '🌳', phone: '9825011011' }
};

const state = { mode: 'aerial', time: 'day', selectedPlot: null, plots: {}, streetLights: [], cameras: [], vehicles: {}, events: [], faults: new Set() };
try { const s = JSON.parse(localStorage.getItem('shivam-duplex-mvp-v4')||'{}'); if(s.plots) state.plots=s.plots; if(s.vehicles) state.vehicles=s.vehicles; if(s.faults) state.faults=new Set(s.faults); } catch(e){}
function persist(){ localStorage.setItem('shivam-duplex-mvp-v4', JSON.stringify({plots:state.plots,vehicles:state.vehicles,faults:[...state.faults],events:state.events})); }

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.Fog(0x87b8e0, 110, 280);
const camera = new THREE.PerspectiveCamera(48, window.innerWidth/window.innerHeight, 0.3, 400);
camera.position.set(5, 70, 90);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.07;
orbit.maxPolarAngle = Math.PI * 0.47;
orbit.minDistance = 12;
orbit.maxDistance = 180;
orbit.target.set(0, 0, 8);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff2d9, 1.25);
sun.position.set(40, 80, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x87b8e0, 0x3a5a30, 0.4));

const matRoad = new THREE.MeshStandardMaterial({ color: 0x3d424c, roughness: 0.88 });
const matSidewalk = new THREE.MeshStandardMaterial({ color: 0x7a808a, roughness: 0.92 });
const matGrass = new THREE.MeshStandardMaterial({ color: 0x3a7a40, roughness: 0.95 });
const matHouse = new THREE.MeshStandardMaterial({ color: 0xeae6de, roughness: 0.74 });
const matRoof = new THREE.MeshStandardMaterial({ color: 0x9a5c3a, roughness: 0.82 });
const matPark = new THREE.MeshStandardMaterial({ color: 0x3d8f48, roughness: 0.9 });
const matGate = new THREE.MeshStandardMaterial({ color: 0x2c313c, roughness: 0.55 });
const matSelected = new THREE.MeshStandardMaterial({ color: 0x5E81F4, roughness: 0.45, emissive: 0x1a2a6a, emissiveIntensity: 0.4 });
const matCommittee = new THREE.MeshStandardMaterial({ color: 0xf5b942, roughness: 0.48, emissive: 0x5a3a00, emissiveIntensity: 0.28 });
const matOffice = new THREE.MeshStandardMaterial({ color: 0xe84a8a, roughness: 0.5, emissive: 0x6b1a45, emissiveIntensity: 0.25 });
const matDirt = new THREE.MeshStandardMaterial({ color: 0xb09a72, roughness: 0.95 });
const matTree = new THREE.MeshStandardMaterial({ color: 0x2a6b32 });
const matTrunk = new THREE.MeshStandardMaterial({ color: 0x5c3d22 });

const root = new THREE.Group();
scene.add(root);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 200), matGrass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
root.add(ground);
const openLot = new THREE.Mesh(new THREE.PlaneGeometry(42, 45), matDirt);
openLot.rotation.x = -Math.PI / 2;
openLot.position.set(42, 0.02, -40);
root.add(openLot);

function addRoad(x, z, w, len, rotY = 0) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, len), matRoad);
  r.position.set(x, 0.05, z);
  r.rotation.y = rotY;
  r.receiveShadow = true;
  root.add(r);
}
addRoad(0, 5, 6.8, 155);
addRoad(0, -72, 10, 20);
addRoad(-24, 0, 5.0, 120);
addRoad(-42, 8, 4.6, 100);
addRoad(22, 8, 5.0, 110);
addRoad(-8, -52, 4.4, 58, Math.PI/2);
addRoad(-6, -30, 4.4, 54, Math.PI/2);
addRoad(-4, -8, 4.6, 60, Math.PI/2);
addRoad(-3, 16, 4.6, 62, Math.PI/2);
addRoad(-2, 40, 4.4, 58, Math.PI/2);
addRoad(0, 62, 4.2, 50, Math.PI/2);
addRoad(34, 30, 4.2, 38, Math.PI/2);
addRoad(-6, 78, 4.5, 42, Math.PI/2);

const gatePad = new THREE.Mesh(new THREE.BoxGeometry(18, 0.12, 14), matRoad);
gatePad.position.set(0, 0.06, -78);
root.add(gatePad);
const boom = new THREE.Mesh(new THREE.BoxGeometry(11, 0.22, 0.35), new THREE.MeshStandardMaterial({ color: 0xd63a3a }));
boom.position.set(0, 1.15, -73);
root.add(boom);
[-5.5, 5.5].forEach(x => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 0.4), matGate); p.position.set(x, 1.25, -73); root.add(p); });
const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.7, 3.1), matHouse);
cabin.position.set(-9, 1.35, -76);
cabin.castShadow = true;
root.add(cabin);
const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.3, 3.5), matRoof);
cabinRoof.position.set(-9, 2.85, -76);
root.add(cabinRoof);

function makeTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 6), matTrunk);
  trunk.position.y = 0.8; trunk.castShadow = true; g.add(trunk);
  const fol = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), matTree);
  fol.position.y = 2.2; fol.castShadow = true; g.add(fol);
  g.position.set(x, 0, z); root.add(g);
}
function makePark(cx, cz, rx, rz, withTrack = true) {
  const geo = new THREE.CircleGeometry(1, 48); geo.scale(rx, 1, rz);
  const mesh = new THREE.Mesh(geo, matPark); mesh.rotation.x = -Math.PI/2; mesh.position.set(cx, 0.04, cz); mesh.receiveShadow = true; root.add(mesh);
  if (withTrack) {
    const track = new THREE.Mesh(new THREE.RingGeometry(Math.min(rx,rz)*0.52, Math.min(rx,rz)*0.7, 48), new THREE.MeshStandardMaterial({ color: 0xb89868, roughness: 0.9 }));
    track.rotation.x = -Math.PI/2; track.position.set(cx, 0.06, cz); root.add(track);
  }
  const gazebo = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.25, 8), matSidewalk); base.position.y = 0.15; gazebo.add(base);
  for (let i = 0; i < 6; i++) { const a = (i/6)*Math.PI*2; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,2.0,6), matTrunk); post.position.set(Math.cos(a)*1.15,1.15,Math.sin(a)*1.15); gazebo.add(post); }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.95, 8), matRoof); roof.position.y = 2.45; gazebo.add(roof);
  gazebo.position.set(cx, 0, cz); root.add(gazebo);
  for (let i = 0; i < 8; i++) { const a = (i/8)*Math.PI*2+0.15; const r = Math.min(rx,rz)*0.85; makeTree(cx+Math.cos(a)*r, cz+Math.sin(a)*r*0.9); }
}
makePark(44, 34, 14, 11, true);
makePark(-44, -10, 6, 7.5, false);
makePark(-8, 82, 10, 7.5, true);
[[-20,-58],[14,-55],[-32,28],[28,52],[-6,58],[32,-10],[-28,65],[8,20]].forEach(([x,z]) => makeTree(x,z));

const officeG = new THREE.Group();
const officeBody = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.5, 4.4), matOffice);
officeBody.position.y = 1.75; officeBody.castShadow = true; officeG.add(officeBody);
const officeRoof = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.35, 4.8), new THREE.MeshStandardMaterial({ color: 0xa32d65 }));
officeRoof.position.y = 3.65; officeG.add(officeRoof);
const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6), matGate);
flagPole.position.set(3.3, 2.75, 0); officeG.add(flagPole);
officeG.position.set(-42, 0, -18); root.add(officeG);

const plotMeshes = new Map();
const plotData = [];
let houseNum = 1;
function addHouse(x, z, rot = 0) {
  if (houseNum > 155) return;
  const id = String(houseNum).padStart(2, '0');
  const c = COMMITTEE[id] || null;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const bodyMat = c ? matCommittee.clone() : matHouse.clone();
  if (!c) bodyMat.color.offsetHSL(0, 0, ((houseNum % 7) * 0.012) - 0.03);
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.7, 2.6, 4.4), bodyMat);
  body.position.y = 1.3; body.castShadow = true; body.receiveShadow = true;
  body.userData = { type: 'plot', id }; g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.28, 4.8), matRoof.clone());
  roof.position.y = 2.75; g.add(roof);
  const porch = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 1.2), matSidewalk);
  porch.position.set(0, 0.07, 2.75); g.add(porch);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x8ab4d0, emissive: 0x224466, emissiveIntensity: 0.1 });
  [[-0.95,1.65,2.22],[0.95,1.65,2.22]].forEach(([wx,wy,wz]) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.65,0.05), winMat); w.position.set(wx,wy,wz); g.add(w); });
  root.add(g);
  plotMeshes.set(id, { group: g, body, isCommittee: !!c });
  plotData.push({ id, x, z, rot });
  if (!state.plots[id]) state.plots[id] = { owner: c ? c.name : '', phone: c ? c.phone : '', vehicle: null, plate: '', cctv: false, role: c ? c.title : '' };
  houseNum++;
}
for (let r=0;r<5;r++) for (let c=0;c<4;c++) if (houseNum<=155) addHouse(-15+c*5.2, -60+r*4.8, 0);
for (let r=0;r<4;r++) for (let c=0;c<5;c++) if (houseNum<=155) addHouse(-13+c*5.0, -34+r*4.7, 0);
for (let r=0;r<8;r++) for (let c=0;c<4;c++) if (houseNum<=155) addHouse(-44+c*4.9, -24+r*5.1, Math.PI/2);
for (let r=0;r<6;r++) for (let c=0;c<5;c++) if (houseNum<=155) addHouse(-11+c*5.0, -2+r*4.9, 0);
for (let r=0;r<5;r++) for (let c=0;c<4;c++) if (houseNum<=155) addHouse(20+c*4.9, -6+r*5.2, -Math.PI/2);
for (let r=0;r<5;r++) for (let c=0;c<5;c++) if (houseNum<=155) addHouse(-13+c*5.0, 38+r*4.9, 0);
for (let r=0;r<3;r++) for (let c=0;c<3;c++) if (houseNum<=155) addHouse(-36+c*4.9, 45+r*4.9, 0);
let ang = 0;
while (houseNum <= 155) { const r = 28+(houseNum%5)*2.6; addHouse(Math.cos(ang)*r*0.72, Math.sin(ang)*r*0.82+10, ang); ang += 0.52; }
const TOTAL = houseNum - 1;

const lightSpots = [];
for (let z=-70;z<=75;z+=13) lightSpots.push([0,z]);
for (let z=-48;z<=58;z+=15) { lightSpots.push([-24,z]); lightSpots.push([22,z]); }
[[-42,-12],[34,22],[44,34],[-8,72],[10,-52]].forEach(p => lightSpots.push(p));
lightSpots.forEach((p,i) => {
  const id = 'SL-'+String(i+1).padStart(2,'0');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,4.8,8), new THREE.MeshStandardMaterial({color:0x333}));
  pole.position.set(p[0],2.4,p[1]); pole.castShadow = true; root.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.14,0.32), new THREE.MeshStandardMaterial({color:0x222}));
  head.position.set(p[0],4.85,p[1]); root.add(head);
  const lamp = new THREE.PointLight(0xffe8c0,0,15,1.5); lamp.position.set(p[0],4.7,p[1]); root.add(lamp);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.17,8,8), new THREE.MeshStandardMaterial({color:0xffe8c0,emissive:0xffcc66,emissiveIntensity:0}));
  glow.position.set(p[0],4.7,p[1]); root.add(glow);
  state.streetLights.push({id,name:'Street light '+id,lamp,glow,pos:p,fault:state.faults.has(id)});
});
[[0,-73],[-22,-2],[0,14],[30,30],[-6,58]].forEach((p,i) => {
  const id = 'CAM-'+String(i+1).padStart(2,'0');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,3.7,8), new THREE.MeshStandardMaterial({color:0x1a1a1a}));
  pole.position.set(p[0],1.85,p[1]); root.add(pole);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(3.1,6.2,16,1,true), new THREE.MeshBasicMaterial({color:0x5E81F4,transparent:true,opacity:0.12,side:THREE.DoubleSide}));
  cone.position.set(p[0],1.35,p[1]-2.5); cone.rotation.x = Math.PI; root.add(cone);
  state.cameras.push({id,cone,fault:state.faults.has(id)});
});

const vehicleGroup = new THREE.Group(); root.add(vehicleGroup);
const vehicleMeshes = new Map();
function makeVehicle(type, color=0x3366aa) {
  const g = new THREE.Group();
  if (type==='sedan'||type==='suv') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(type==='suv'?1.85:1.6,0.5,type==='suv'?3.2:2.85), new THREE.MeshStandardMaterial({color,roughness:0.38,metalness:0.35}));
    body.position.y = 0.4; body.castShadow = true; g.add(body);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,1.2), new THREE.MeshStandardMaterial({color,roughness:0.5}));
    body.position.y = 0.35; g.add(body);
  }
  return g;
}
function syncVehicles() {
  vehicleMeshes.forEach(m => vehicleGroup.remove(m)); vehicleMeshes.clear();
  Object.entries(state.vehicles).forEach(([plotId,v]) => {
    if (!v.type) return;
    const pd = plotData.find(p => p.id===plotId); if (!pd) return;
    const mesh = makeVehicle(v.type, v.color||0x3366aa);
    const off = new THREE.Vector3(0,0,3.4).applyAxisAngle(new THREE.Vector3(0,1,0), pd.rot);
    mesh.position.set(pd.x+off.x, 0, pd.z+off.z); mesh.rotation.y = pd.rot;
    vehicleGroup.add(mesh); vehicleMeshes.set(plotId, mesh);
  });
}
syncVehicles();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerDown(e) {
  if (state.mode==='street') return;
  pointer.x = (e.clientX/window.innerWidth)*2-1;
  pointer.y = -(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(root.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && !obj.userData?.type) obj = obj.parent;
    if (obj?.userData?.type==='plot') { selectPlot(obj.userData.id); return; }
  }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);

function selectPlot(id) {
  if (state.selectedPlot) {
    const prev = plotMeshes.get(state.selectedPlot);
    if (prev) prev.body.material = prev.isCommittee ? matCommittee.clone() : matHouse.clone();
  }
  state.selectedPlot = id;
  const curr = plotMeshes.get(id);
  if (curr) curr.body.material = matSelected.clone();
  const data = state.plots[id] || {};
  const c = COMMITTEE[id];
  document.getElementById('detail-title').textContent = 'Duplex '+id+(c?' '+c.icon:'');
  document.getElementById('detail-meta').textContent = (c?c.title+' · ':'')+'G+1 · '+TOTAL+' houses';
  document.getElementById('owner-name').value = data.owner||(c?c.name:'');
  document.getElementById('owner-phone').value = data.phone||(c?c.phone:'');
  document.getElementById('vehicle-type').value = data.vehicle||'';
  document.getElementById('vehicle-plate').value = data.plate||'';
  document.getElementById('detail-panel').classList.add('visible');
  toast('Duplex '+id+(c?' · '+c.title:''));
}
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

const el = id => document.getElementById(id);
el('btn-close-detail')?.addEventListener('click', () => el('detail-panel').classList.remove('visible'));
el('btn-save-plot')?.addEventListener('click', () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot;
  state.plots[id] = { owner: el('owner-name').value, phone: el('owner-phone').value, vehicle: el('vehicle-type').value||null, plate: el('vehicle-plate').value, cctv: state.plots[id]?.cctv||false, role: state.plots[id]?.role||'' };
  if (state.plots[id].vehicle) state.vehicles[id] = { type: state.plots[id].vehicle, plate: state.plots[id].plate, color: 0x3366aa };
  else delete state.vehicles[id];
  syncVehicles(); persist(); toast('Saved Duplex '+id);
});
el('btn-clear-vehicle')?.addEventListener('click', () => {
  if (!state.selectedPlot) return;
  delete state.vehicles[state.selectedPlot];
  if (state.plots[state.selectedPlot]) state.plots[state.selectedPlot].vehicle = null;
  el('vehicle-type').value = ''; syncVehicles(); persist(); toast('Vehicle cleared');
});
el('btn-add-cctv-here')?.addEventListener('click', () => {
  if (!state.selectedPlot) return;
  const id = state.selectedPlot; state.plots[id].cctv = true;
  const pd = plotData.find(p => p.id===id);
  if (pd) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.7,5.0,16,1,true), new THREE.MeshBasicMaterial({color:0x32D583,transparent:true,opacity:0.16,side:THREE.DoubleSide}));
    cone.position.set(pd.x,1.25,pd.z+2.9); cone.rotation.x = Math.PI*0.88; root.add(cone);
  }
  persist(); toast('Home CCTV registered');
});
el('btn-add-vehicle')?.addEventListener('click', () => { if (!state.selectedPlot) { toast('Select a duplex first'); return; } el('vehicle-type').value = 'sedan'; el('detail-panel').classList.add('visible'); });
el('btn-register-cctv')?.addEventListener('click', () => { if (!state.selectedPlot) { toast('Select a duplex first'); return; } el('btn-add-cctv-here').click(); });
el('btn-road-closure')?.addEventListener('click', () => {
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3.0,2.8,4), new THREE.MeshStandardMaterial({color:0xf5f0e0,side:THREE.DoubleSide}));
  tent.position.set(1.5,1.4,12); tent.rotation.y = Math.PI/4; root.add(tent);
  for (let i=-3;i<=3;i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.35,1.0,0.35), new THREE.MeshStandardMaterial({color:0xF97066}));
    b.position.set(i*1.15,0.5,8); root.add(b);
    const b2 = b.clone(); b2.position.z = 16; root.add(b2);
  }
  state.events.push({type:'closure',at:Date.now()}); persist(); toast('Road closure placed');
});

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;
    if (state.mode==='aerial') { orbit.enabled = true; camera.position.set(5,70,90); orbit.target.set(0,0,8); }
    else if (state.mode==='top') { orbit.enabled = true; camera.position.set(0,140,0.5); orbit.target.set(0,0,8); }
    else if (state.mode==='street') { orbit.enabled = false; camera.position.set(0,1.7,-55); camera.lookAt(0,1.7,-65); }
  });
});

function setTime(t) {
  state.time = t;
  document.querySelectorAll('#btn-day,#btn-dusk,#btn-night').forEach(b => b.classList.remove('active'));
  if (t==='day') {
    el('btn-day')?.classList.add('active');
    scene.background.set(0x87b8e0); scene.fog.color.set(0x87b8e0); ambient.intensity = 0.5; sun.intensity = 1.25;
    state.streetLights.forEach(l => { if (!l.fault) { l.lamp.intensity = 0.1; l.glow.material.emissiveIntensity = 0; } });
  } else if (t==='dusk') {
    el('btn-dusk')?.classList.add('active');
    scene.background.set(0xc47a4a); scene.fog.color.set(0xc47a4a); ambient.intensity = 0.28; sun.intensity = 0.5;
    state.streetLights.forEach(l => { if (!l.fault) { l.lamp.intensity = 0.7; l.glow.material.emissiveIntensity = 0.5; } });
  } else {
    el('btn-night')?.classList.add('active');
    scene.background.set(0x0b1220); scene.fog.color.set(0x0b1220); ambient.intensity = 0.1; sun.intensity = 0.04;
    state.streetLights.forEach(l => { if (!l.fault) { l.lamp.intensity = 1.15; l.glow.material.emissiveIntensity = 0.85; } });
  }
}
el('btn-day')?.addEventListener('click', () => setTime('day'));
el('btn-dusk')?.addEventListener('click', () => setTime('dusk'));
el('btn-night')?.addEventListener('click', () => setTime('night'));
el('btn-reset-cam')?.addEventListener('click', () => { state.mode = 'aerial'; orbit.enabled = true; camera.position.set(5,70,90); orbit.target.set(0,0,8); });
el('btn-focus-gate')?.addEventListener('click', () => { camera.position.set(0,24,-45); orbit.target.set(0,0,-73); });
el('btn-focus-park')?.addEventListener('click', () => { camera.position.set(58,30,52); orbit.target.set(44,0,34); });

function refreshInfra() {
  const list = el('infra-list'); if (!list) return; list.innerHTML = '';
  [...state.streetLights, ...state.cameras].forEach(obj => {
    const item = document.createElement('div'); item.className = 'card';
    const isFault = obj.fault || state.faults.has(obj.id);
    item.innerHTML = `<h3><span class="status-dot ${isFault?'fault':'ok'}"></span>${obj.id}</h3><p>${isFault?'FAULT — click to resolve':'OK — click to report fault'}</p>`;
    item.addEventListener('click', () => {
      if (obj.fault || state.faults.has(obj.id)) {
        obj.fault = false; state.faults.delete(obj.id);
        if (obj.lamp) { obj.lamp.intensity = state.time==='night'?1.15:0.1; obj.glow.material.emissiveIntensity = state.time==='night'?0.85:0; }
        if (obj.cone) obj.cone.material.color.set(0x5E81F4);
      } else {
        obj.fault = true; state.faults.add(obj.id);
        if (obj.lamp) { obj.lamp.intensity = 0; obj.glow.material.emissiveIntensity = 0; }
        if (obj.cone) obj.cone.material.color.set(0xF97066);
      }
      persist(); refreshInfra();
    });
    list.appendChild(item);
  });
}
refreshInfra();

function refreshPlotsList() {
  const list = el('plots-list'); if (!list) return; list.innerHTML = '';
  plotData.slice(0,40).forEach(pd => {
    const c = COMMITTEE[pd.id];
    const item = document.createElement('div'); item.className = 'card';
    item.innerHTML = `<h3>${c?c.icon+' ':''}Duplex ${pd.id}</h3><p>${c?c.title+' · ':''}${state.plots[pd.id]?.owner||'Vacant'}</p>`;
    item.addEventListener('click', () => selectPlot(pd.id));
    list.appendChild(item);
  });
  if (plotData.length > 40) {
    const more = document.createElement('div'); more.className = 'card'; more.style.opacity = '0.6';
    more.innerHTML = `<h3>+ ${plotData.length-40} more duplexes</h3><p>Click any house on the map</p>`; list.appendChild(more);
  }
}
refreshPlotsList();

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

const radarCanvas = el('radar-canvas');
const rctx = radarCanvas ? radarCanvas.getContext('2d') : null;
if (radarCanvas) { radarCanvas.width = 240; radarCanvas.height = 240; }
function drawRadar() {
  if (!rctx) return;
  const w = radarCanvas.width, h = radarCanvas.height;
  rctx.clearRect(0,0,w,h);
  rctx.fillStyle = 'rgba(8,12,20,0.75)'; rctx.beginPath(); rctx.arc(w/2,h/2,w/2-2,0,Math.PI*2); rctx.fill();
  rctx.strokeStyle = 'rgba(94,129,244,0.35)'; rctx.beginPath(); rctx.arc(w/2,h/2,w/2-4,0,Math.PI*2); rctx.stroke();
  const scale = 1.0;
  plotData.forEach(pd => {
    const px = w/2 + pd.x*scale, py = h/2 + pd.z*scale;
    rctx.fillStyle = pd.id===state.selectedPlot ? '#5E81F4' : (COMMITTEE[pd.id] ? '#FDB022' : 'rgba(255,255,255,0.3)');
    rctx.fillRect(px-1.2, py-1.2, 2.4, 2.4);
  });
  const cx = w/2 + camera.position.x*scale, cy = h/2 + camera.position.z*scale;
  rctx.fillStyle = '#5E81F4'; rctx.beginPath(); rctx.arc(cx,cy,4,0,Math.PI*2); rctx.fill();
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  rctx.strokeStyle = 'rgba(94,129,244,0.55)'; rctx.beginPath(); rctx.moveTo(cx,cy); rctx.lineTo(cx+dir.x*26, cy+dir.z*26); rctx.stroke();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  if (state.mode==='street') {
    const speed = 0.2;
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0));
    if (keys['KeyW']||keys['ArrowUp']) camera.position.addScaledVector(dir, speed);
    if (keys['KeyS']||keys['ArrowDown']) camera.position.addScaledVector(dir, -speed);
    if (keys['KeyA']||keys['ArrowLeft']) camera.position.addScaledVector(right, -speed);
    if (keys['KeyD']||keys['ArrowRight']) camera.position.addScaledVector(right, speed);
    camera.position.y = 1.7;
  } else orbit.update();
  drawRadar();
  renderer.render(scene, camera);
}

const loader = el('loader');
if (loader) { requestAnimationFrame(() => { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 500); }); }
animate();
console.log('Shivam Duplex — 1 black dot = 1 house — total', TOTAL);
