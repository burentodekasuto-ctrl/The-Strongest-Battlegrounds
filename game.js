let currentStyle = "saitama";

// Platform Verification Matrix
const mobileLayer = document.getElementById('mobile-touch-layer');
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) { mobileLayer.style.display = 'block'; }

// Engine Initialization Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);
scene.fog = new THREE.FogExp2(0x111318, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting Vectors
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0xffffff, 0.85);
light.position.set(30, 45, 20);
light.castShadow = true;
scene.add(light);

// Arena Generation
const floorGeo = new THREE.PlaneGeometry(300, 300);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.85 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const arenaGrid = new THREE.GridHelper(300, 60, 0xff3e3e, 0x2b2e3a);
arenaGrid.position.y = 0.01;
scene.add(arenaGrid);

// Procedural Character Mesh Assembler Factory
function createMinecraftModel(suitColor, limbColor) {
    const group = new THREE.Group();
    const matSuit = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.6 });
    const matLimb = new THREE.MeshStandardMaterial({ color: limbColor, roughness: 0.6 });
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.8), matSuit);
    torso.position.y = 2.4;
    torso.castShadow = true; torso.receiveShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), matSkin);
    head.position.y = 1.7;
    torso.add(head);

    const createLimbPivot = (x, y, z, geo, mat) => {
        const pivot = new THREE.Group();
        pivot.position.set(x, y, z);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = -0.6;
        mesh.castShadow = true; mesh.receiveShadow = true;
        pivot.add(mesh);
        return pivot;
    };

    const limbGeo = new THREE.BoxGeometry(0.7, 1.2, 0.7);
    const leftArm = createLimbPivot(1.2, 0.6, 0, limbGeo, matLimb);
    const rightArm = createLimbPivot(-1.2, 0.6, 0, limbGeo, matLimb);
    const leftLeg = createLimbPivot(0.45, -1.2, 0, limbGeo, matSuit);
    const rightLeg = createLimbPivot(-0.45, -1.2, 0, limbGeo, matSuit);

    torso.add(leftArm); torso.add(rightArm);
    torso.add(leftLeg); torso.add(rightLeg);

    return { root: group, torso, head, leftArm, rightArm, leftLeg, rightLeg };
}

let player = createMinecraftModel(CHARACTERS.saitama.suit, CHARACTERS.saitama.arms);
scene.add(player.root);

let dummies = [];
function spawnDummy() {
    let dummy = createMinecraftModel(0x334455, 0x556677);
    dummy.root.position.set((Math.random() - 0.5) * 25, 0, (Math.random() - 0.5) * 25);
    dummy.state = { knockbackVel: new THREE.Vector3(), recovery: 0 };
    scene.add(dummy.root);
    dummies.push(dummy);
}
spawnDummy(); spawnDummy();

// Global System Vector States
const inputState = { x: 0, z: 0 };
const keysPressed = {};
let isDashing = false, dashCooldown = false, isAttacking = false;
let moveSpeed = 0.16, comboTicks = 0, comboTimer = null;

// Desktop Inputs listeners
window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'q') executeDash();
});
window.addEventListener('keyup', (e) => { keysPressed[e.key.toLowerCase()] = false; });
window.addEventListener('mousedown', (e) => { if (e.button === 0 && !isTouchDevice) executeAttack(); });

// Touch Interface Controllers Layout Engine
const stick = document.getElementById('joystick-stick');
const zone = document.getElementById('joystick-zone');
let joyActive = false, joyStart = { x: 0, y: 0 };

zone.addEventListener('touchstart', (e) => {
    joyActive = true;
    const b = zone.getBoundingClientRect();
    joyStart = { x: b.left + b.width/2, y: b.top + b.height/2 };
});
window.addEventListener('touchmove', (e) => {
    if (!joyActive) return;
    const t = e.touches[0];
    let dx = t.clientX - joyStart.x;
    let dy = t.clientY - joyStart.y;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const rad = Math.atan2(dy, dx);
    const mx = (dist / 50) * Math.cos(rad);
    const mz = (dist / 50) * Math.sin(rad);
    stick.style.transform = `translate(${mx * 40}px, ${mz * 40}px)`;
    inputState.x = mx; inputState.z = mz;
});
window.addEventListener('touchend', () => {
    joyActive = false; stick.style.transform = 'translate(0px, 0px)';
    inputState.x = 0; inputState.z = 0;
});

document.getElementById('btn-attack').addEventListener('touchstart', (e) => { e.preventDefault(); executeAttack(); });
document.getElementById('btn-dash').addEventListener('touchstart', (e) => { e.preventDefault(); executeDash(); });

function executeDash() {
    if (isDashing || dashCooldown) return;
    isDashing = true; dashCooldown = true;
    moveSpeed = 0.65;
    setTimeout(() => { isDashing = false; moveSpeed = 0.16; }, 180);
    setTimeout(() => { dashCooldown = false; }, 900);
}

function executeAttack() {
    if (isAttacking) return;
    isAttacking = true; comboTicks++;
    const ui = document.getElementById('combo-counter');
    ui.innerText = `${comboTicks} HIT${comboTicks % 4 === 0 ? '!' : ''}`;
    ui.style.display = 'block';

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => { comboTicks = 0; ui.style.display = 'none'; }, 1600);

    let activeArm = (comboTicks % 2 === 0) ? player.leftArm : player.rightArm;
    let timeline = 0;
    const punchAnim = setInterval(() => {
        timeline += 0.15;
        activeArm.rotation.x = -Math.sin(timeline * Math.PI) * 1.4;
        if (timeline >= 1.0) { clearInterval(punchAnim); activeArm.rotation.x = 0; isAttacking = false; }
    }, 22);

    checkCombatCollisions();
}

function checkCombatCollisions() {
    const pPos = player.root.position;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.root.quaternion);
    const config = CHARACTERS[currentStyle];
    createImpactFX(pPos.clone().add(forward.multiplyScalar(2)), config.fx);

    dummies.forEach(d => {
        if (pPos.distanceTo(d.root.position) < 3.2) {
            const dir = new THREE.Vector3().subVectors(d.root.position, pPos).normalize();
            const force = (comboTicks % 4 === 0) ? 1.4 : 0.45;
            d.state.knockbackVel.copy(dir).multiplyScalar(force);
            d.state.knockbackVel.y = (comboTicks % 4 === 0) ? 0.4 : 0.1;
            d.state.recovery = 30;
        }
    });
}

function createImpactFX(pos, colorHex) {
    const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex });
    for(let i=0; i < 10; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.copy(pos).add(new THREE.Vector3((Math.random()-0.5)*1.5, 1, (Math.random()-0.5)*1.5));
        p.userData = { v: new THREE.Vector3((Math.random()-0.5)*0.3, Math.random()*0.3, (Math.random()-0.5)*0.3) };
        scene.add(p);
        setTimeout(() => { scene.remove(p); }, 350);
    }
}

document.getElementById('char-selector').addEventListener('change', (e) => {
    currentStyle = e.target.value;
    const cfg = CHARACTERS[currentStyle];
    document.getElementById('char-display').innerText = cfg.name;
    scene.remove(player.root);
    player = createMinecraftModel(cfg.suit, cfg.arms);
    scene.add(player.root);
});

function toggleConfig() { alert("Config calibrated."); }

const clock = new THREE.Clock();
function renderEngineFrame() {
    requestAnimationFrame(renderEngineFrame);
    const time = clock.getElapsedTime();

    if (!joyActive) {
        inputState.x = 0; inputState.z = 0;
        if (keysPressed['w']) inputState.z = -1;
        if (keysPressed['s']) inputState.z = 1;
        if (keysPressed['a']) inputState.x = -1;
        if (keysPressed['d']) inputState.x = 1;
        if (inputState.x !== 0 && inputState.z !== 0) { inputState.x *= 0.7071; inputState.z *= 0.7071; }
    }

    if (inputState.x !== 0 || inputState.z !== 0) {
        player.root.position.x += inputState.x * moveSpeed;
        player.root.position.z += inputState.z * moveSpeed;
        player.root.rotation.y = Math.atan2(inputState.x, inputState.z);

        const cycle = Math.sin(time * 14);
        player.leftLeg.rotation.x = cycle * 0.6; player.rightLeg.rotation.x = -cycle * 0.6;
        if (!isAttacking) { player.leftArm.rotation.x = -cycle * 0.4; player.rightArm.rotation.x = cycle * 0.4; }
    } else {
        player.leftLeg.rotation.x *= 0.8; player.rightLeg.rotation.x *= 0.8;
        if (!isAttacking) { player.leftArm.rotation.x *= 0.8; player.rightArm.rotation.x *= 0.8; }
    }

    dummies.forEach(d => {
        if (d.state.recovery > 0) {
            d.root.position.add(d.state.knockbackVel);
            if (d.root.position.y > 0 || d.state.knockbackVel.y > 0) { d.state.knockbackVel.y -= 0.02; d.root.position.y += d.state.knockbackVel.y; }
            else { d.root.position.y = 0; d.state.knockbackVel.set(0,0,0); }
            d.state.recovery--; d.torso.rotation.z = 0.4;
        } else { d.torso.rotation.z *= 0.9; }
    });

    camera.position.set(player.root.position.x, player.root.position.y + 8, player.root.position.z + 14);
    camera.lookAt(player.root.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
renderEngineFrame();
