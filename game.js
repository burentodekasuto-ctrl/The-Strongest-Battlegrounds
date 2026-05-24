// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let config = GAME_CONFIG;
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const state = {
    camera: { x: 1000, y: 1000, zoom: 0.95, angle: -Math.PI / 4, pitch: 0.58 },
    player: {
        x: 900, y: 1000, z: 0, vx: 0, vy: 0, heading: 0, radius: 24, height: 60,
        characterName: "Saitama", characterData: config.characters["Saitama"],
        isAwakened: false, awakeningMeter: 0, isMoving: false, walkCycle: 0,
        currentMove: null, moveFrame: 0, totalMoveFrames: 0
    },
    dummies: [
        { id: 1, x: 1100, y: 1000, z: 0, heading: Math.PI, radius: 24, height: 60, maxHealth: 200, health: 200, hitTimer: 0, knockbackX: 0, knockbackY: 0 }
    ],
    particles: [],
    keys: {},
    mobileJoystick: { active: false, startX: 0, startY: 0, vx: 0, vy: 0 }
};

function playSound(soundKey, volume = 0.4) {
    if (config.sounds && config.sounds[soundKey]) {
        let audio = new Audio(config.sounds[soundKey]);
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

// True 3D Isometric Screen Projector Matrix
function projectToScreen(worldX, worldY, worldZ = 0) {
    let dx = worldX - state.camera.x;
    let dy = worldY - state.camera.y;
    let cos = Math.cos(-state.camera.angle);
    let sin = Math.sin(-state.camera.angle);
    
    let rotX = dx * cos - dy * sin;
    let rotY = dx * sin + dy * cos;
    
    return {
        x: canvas.width / 2 + rotX * state.camera.zoom,
        y: canvas.height / 2 + (rotY * state.camera.pitch - worldZ) * state.camera.zoom
    };
}

function spawnFXExplosion(x, y, count = 10, color = "#ffcc00") {
    for (let i = 0; i < count; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, z: Math.random() * 30,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, vz: Math.random() * 8 + 3,
            life: 30, maxLife: 30, color: color
        });
    }
}

function updateUI() {
    const p = state.player;
    const currentMoveset = p.isAwakened ? p.characterData.awakenedMoves : p.characterData.baseMoves;
    
    document.getElementById("char-display").innerText = p.isAwakened ? `${p.characterName} (SERIOUS STATE)` : p.characterName.toUpperCase();
    
    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`skill-${i}`);
        if (slot) slot.innerText = currentMoveset[i - 1].name;
    }

    document.getElementById("awakening-fill-bar").style.width = `${p.awakeningMeter}%`;
    document.getElementById("awaken-percentage").innerText = `${Math.floor(p.awakeningMeter)}%`;

    const awakenBtn = document.getElementById("btn-awaken");
    if (p.awakeningMeter >= 100 || p.isAwakened) {
        awakenBtn.classList.remove("locked");
        awakenBtn.innerText = p.isAwakened ? "SERIOUS MODE RUNNING" : "G - AWAKEN READY";
    } else {
        awakenBtn.classList.add("locked");
        awakenBtn.innerText = "G - AWAKEN";
    }
}

// Input listeners
window.addEventListener("keydown", (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'g') activateAwakening();
});
window.addEventListener("keyup", (e) => state.keys[e.key.toLowerCase()] = false);

function activateAwakening() {
    let p = state.player;
    if (p.awakeningMeter < 100 && !p.isAwakened) return;
    
    p.isAwakened = !p.isAwakened;
    p.currentMove = { name: "BURST AWAKENING MODE", type: "buff", duration: 50 };
    p.moveFrame = 50; p.totalMoveFrames = 50;
    playSound("awakenSound", 0.65);
    
    if (!p.isAwakened) p.awakeningMeter = 0;
    updateUI();
}

// Attach listeners to slots
for (let i = 1; i <= 4; i++) {
    const slot = document.getElementById(`skill-${i}`);
    if (slot) {
        const useSkill = () => {
            let p = state.player;
            if (p.currentMove) return;
            const currentMoveset = p.isAwakened ? p.characterData.awakenedMoves : p.characterData.baseMoves;
            triggerCombatSkill(currentMoveset[i - 1]);
        };
        slot.addEventListener("click", useSkill);
        slot.addEventListener("touchstart", (e) => { e.preventDefault(); useSkill(); });
    }
}
document.getElementById("btn-awaken").addEventListener("click", activateAwakening);
document.getElementById("btn-awaken").addEventListener("touchstart", (e) => { e.preventDefault(); activateAwakening(); });

// Joystick interface handling
const jBase = document.getElementById("mobile-joystick-base");
const jStick = document.getElementById("mobile-joystick-stick");

window.addEventListener("touchstart", (e) => {
    if (e.touches[0].clientX < window.innerWidth / 2) {
        state.mobileJoystick.active = true;
        state.mobileJoystick.startX = e.touches[0].clientX;
        state.mobileJoystick.startY = e.touches[0].clientY;
        jBase.style.left = `${state.mobileJoystick.startX - 50}px`;
        jBase.style.top = `${state.mobileJoystick.startY - 50}px`;
        jBase.style.display = "block";
    }
});
window.addEventListener("touchmove", (e) => {
    if (!state.mobileJoystick.active) return;
    let t = e.touches[0];
    let dx = t.clientX - state.mobileJoystick.startX;
    let dy = t.clientY - state.mobileJoystick.startY;
    let d = Math.hypot(dx, dy);
    if (d > 50) { dx = (dx / d) * 50; dy = (dy / d) * 50; }
    jStick.style.transform = `translate(${dx}px, ${dy}px)`;
    state.mobileJoystick.vx = dx / 50;
    state.mobileJoystick.vy = dy / 50;
});
window.addEventListener("touchend", () => {
    state.mobileJoystick.active = false;
    state.mobileJoystick.vx = 0; state.mobileJoystick.vy = 0;
    jBase.style.display = "none";
});

let footstepTimer = 0;
function runEnginePhysics() {
    let p = state.player;

    // Handle Active Visual Particles Updates
    state.particles.forEach((pt, idx) => {
        pt.x += pt.vx; pt.y += pt.vy; pt.z += pt.vz;
        pt.vz -= 0.35; // Simulate gravity drops
        pt.life--;
        if (pt.z <= 0) { pt.z = 0; pt.vx *= 0.75; pt.vy *= 0.75; }
        if (pt.life <= 0) state.particles.splice(idx, 1);
    });

    if (p.currentMove) {
        p.moveFrame--;
        // Visual attack fx trailing tracking matrix
        if (Math.random() > 0.4) {
            let col = p.isAwakened ? p.characterData.awakenedColor : p.characterData.fxColor;
            spawnFXExplosion(p.x, p.y, 1, col);
        }
        if (p.moveFrame <= 0) p.currentMove = null;
        return;
    }

    p.vx = 0; p.vy = 0; p.isMoving = false;
    let dx = 0; let dy = 0;

    if (state.keys['w']) dy = -1;
    if (state.keys['s']) dy = 1;
    if (state.keys['a']) dx = -1;
    if (state.keys['d']) dx = 1;

    let cos = Math.cos(state.camera.angle);
    let sin = Math.sin(state.camera.angle);

    if (dx !== 0 || dy !== 0) {
        p.isMoving = true;
        p.vx = (dx * cos - dy * sin) * p.characterData.speed;
        p.vy = (dx * sin + dy * cos) * p.characterData.speed;
    } else if (state.mobileJoystick.active && (Math.abs(state.mobileJoystick.vx) > 0.1 || Math.abs(state.mobileJoystick.vy) > 0.1)) {
        p.isMoving = true;
        p.vx = (state.mobileJoystick.vx * cos - state.mobileJoystick.vy * sin) * p.characterData.speed;
        p.vy = (state.mobileJoystick.vx * sin + state.mobileJoystick.vy * cos) * p.characterData.speed;
    }

    if (p.isMoving) {
        p.heading = Math.atan2(p.vy, p.vx);
        p.walkCycle += 0.25;
        footstepTimer++;
        if (footstepTimer % 18 === 0) playSound("walk", 0.12);
    } else { p.walkCycle *= 0.6; footstepTimer = 0; }

    p.x += p.vx; p.y += p.vy;
    p.x = Math.max(p.radius, Math.min(config.map.width - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(config.map.height - p.radius, p.y));
}

function triggerCombatSkill(move) {
    let p = state.player;
    p.currentMove = move;
    p.moveFrame = move.duration;
    p.totalMoveFrames = move.duration;
    
    if (move.sound) playSound(move.sound, 0.45);

    state.dummies.forEach(d => {
        let dist = Math.hypot(d.x - p.x, d.y - p.y);
        if (dist < move.range) {
            d.heading = Math.atan2(d.y - p.y, d.x - p.x);
            let targetKnockDirectionX = Math.cos(d.heading);
            let targetKnockDirectionY = Math.sin(d.heading);
            
            if (move.type === "counter") {
                p.x = d.x - targetKnockDirectionX * 55;
                p.y = d.y - targetKnockDirectionY * 55;
                d.knockbackX = targetKnockDirectionX * 24;
                d.knockbackY = targetKnockDirectionY * 24;
            } else if (move.type === "pull") {
                d.knockbackX = -targetKnockDirectionX * 18;
                d.knockbackY = -targetKnockDirectionY * 18;
            } else {
                d.knockbackX = targetKnockDirectionX * (move.damage * 0.45);
                d.knockbackY = targetKnockDirectionY * (move.damage * 0.45);
            }
            
            d.health = Math.max(0, d.health - move.damage);
            d.hitTimer = 25;
            
            if (!p.isAwakened) {
                p.awakeningMeter = Math.min(100, p.awakeningMeter + move.damage * 0.6);
            }
            
            let fxCol = p.isAwakened ? p.characterData.awakenedColor : p.characterData.fxColor;
            spawnFXExplosion(d.x, d.y, 14, fxCol);
            playSound("hit", 0.5);
            updateUI();
        }
    });
}

function render3DAvatar(entity, posX, posY, posZ, heading, walkingActive, stepCycle, colors, skillFX, fxColor) {
    let renderBase = projectToScreen(posX, posY, posZ);
    let zoomScale = state.camera.zoom;

    // Draw Ground Shadow Disc
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(renderBase.x, renderBase.y, entity.radius * zoomScale, entity.radius * 0.5 * zoomScale, 0, 0, Math.PI * 2);
    ctx.fill();

    let legOscillation = walkingActive ? Math.sin(stepCycle) * 15 * zoomScale : 0;
    let midTorsoHeight = entity.height * 0.35;
    
    let torsoCoords = projectToScreen(posX, posY, posZ + midTorsoHeight);
    let headCoords = projectToScreen(posX, posY, posZ + entity.height);

    ctx.lineWidth = 8 * zoomScale; ctx.lineCap = "round"; ctx.strokeStyle = colors.limbColor;
    
    // Left and Right Leg Limbs Rendering Lines
    ctx.beginPath(); ctx.moveTo(torsoCoords.x - 4*zoomScale, torsoCoords.y); ctx.lineTo(renderBase.x - 5*zoomScale + legOscillation, renderBase.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(torsoCoords.x + 4*zoomScale, torsoCoords.y); ctx.lineTo(renderBase.x + 5*zoomScale - legOscillation, renderBase.y); ctx.stroke();

    // Central Torso Block Representation
    ctx.fillStyle = colors.torsoColor; ctx.beginPath();
    ctx.ellipse(torsoCoords.x, torsoCoords.y - 10*zoomScale, 11*zoomScale, 15*zoomScale, 0, 0, Math.PI * 2); ctx.fill();

    // Rotating Head Node Representation
    ctx.fillStyle = colors.skinColor; ctx.beginPath();
    ctx.arc(headCoords.x, headCoords.y + 4*zoomScale, 9 * zoomScale, 0, Math.PI * 2); ctx.fill();

    // Orientation Face Forward Angle Direction Pointer Vector
    ctx.fillStyle = "#111111";
    let lookTargetX = headCoords.x + Math.cos(heading) * 5 * zoomScale;
    let lookTargetY = (headCoords.y + 4*zoomScale) + Math.sin(heading) * 3 * zoomScale * state.camera.pitch;
    ctx.beginPath(); ctx.arc(lookTargetX, lookTargetY, 2 * zoomScale, 0, Math.PI * 2); ctx.fill();

    // Continuous Mode Aura Tracking Circle Elements
    if (skillFX) {
        ctx.strokeStyle = fxColor; ctx.lineWidth = 3 * zoomScale;
        ctx.beginPath();
        ctx.ellipse(renderBase.x, renderBase.y - 8*zoomScale, entity.radius * 1.3 * zoomScale, entity.radius * 0.6 * zoomScale, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function renderCanvasScene() {
    ctx.fillStyle = config.canvas.backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.camera.x += (state.player.x - state.camera.x) * 0.08;
    state.camera.y += (state.player.y - state.camera.y) * 0.08;

    let m = config.map;
    let pTL = projectToScreen(0, 0); let pTR = projectToScreen(m.width, 0);
    let pBR = projectToScreen(m.width, m.height); let pBL = projectToScreen(0, m.height);

    ctx.fillStyle = m.theme.floorTile; ctx.beginPath();
    ctx.moveTo(pTL.x, pTL.y); ctx.lineTo(pTR.x, pTR.y); ctx.lineTo(pBR.x, pBR.y); ctx.lineTo(pBL.x, pBL.y); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = m.theme.floorGrid; ctx.lineWidth = 1;
    for (let x = 0; x <= m.width; x += m.gridSize) {
        let l1 = projectToScreen(x, 0); let l2 = projectToScreen(x, m.height);
        ctx.beginPath(); ctx.moveTo(l1.x, l1.y); ctx.lineTo(l2.x, l2.y); ctx.stroke();
    }
    for (let y = 0; y <= m.height; y += m.gridSize) {
        let l1 = projectToScreen(0, y); let l2 = projectToScreen(m.width, y);
        ctx.beginPath(); ctx.moveTo(l1.x, l1.y); ctx.lineTo(l2.x, l2.y); ctx.stroke();
    }

    ctx.strokeStyle = m.theme.wallTrim; ctx.lineWidth = 4 * state.camera.zoom;
    ctx.beginPath(); ctx.moveTo(pTL.x, pTL.y); ctx.lineTo(pTR.x, pTR.y); ctx.lineTo(pBR.x, pBR.y); ctx.lineTo(pBL.x, pBL.y); ctx.closePath(); ctx.stroke();

    // Compile Render Sort Queue Arrays
    let renderQueue = [];

    m.obstacles.forEach(o => {
        renderQueue.push({ type: 'obstacle', sortBy: o.y, data: o });
    });

    state.dummies.forEach(d => {
        if (d.health > 0) {
            if (d.hitTimer > 0) {
                d.x += d.knockbackX; d.y += d.knockbackY;
                d.knockbackX *= 0.88; d.knockbackY *= 0.88; d.hitTimer--;
                d.x = Math.max(d.radius, Math.min(m.width - d.radius, d.x));
                d.y = Math.max(d.radius, Math.min(m.height - d.radius, d.y));
            }
            renderQueue.push({ type: 'dummy', sortBy: d.y, data: d });
        }
    });

    let p = state.player;
    renderQueue.push({ type: 'player', sortBy: p.y, data: p });

    state.particles.forEach(pt => {
        renderQueue.push({ type: 'particle', sortBy: pt.y, data: pt });
    });

    renderQueue.sort((a, b) => a.sortBy - b.sortBy);

    renderQueue.forEach(node => {
        let sc = state.camera.zoom;
        if (node.type === 'obstacle') {
            let o = node.data;
            let bPos = projectToScreen(o.x, o.y, 0);
            let tPos = projectToScreen(o.x, o.y, o.height);

            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath(); ctx.arc(bPos.x, bPos.y, o.radius * sc, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = m.theme.wallColor; ctx.beginPath();
            ctx.arc(tPos.x, tPos.y, o.radius * sc, 0, Math.PI, false);
            ctx.arc(bPos.x, bPos.y, o.radius * sc, Math.PI, 0, true);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = "#50556e"; ctx.beginPath(); ctx.arc(tPos.x, tPos.y, o.radius * sc, 0, Math.PI * 2); ctx.fill();
        } 
        else if (node.type === 'dummy') {
            let d = node.data;
            let dmColors = { skinColor: "#fcd5a1", torsoColor: "#565b6e", limbColor: "#3c4052" };
            render3DAvatar(d, d.x, d.y, d.z, d.heading, d.hitTimer > 0, 0, dmColors, false, "");

            let hPos = projectToScreen(d.x, d.y, d.height + 15);
            ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(hPos.x - 25, hPos.y, 50, 5);
            ctx.fillStyle = "#ef233c"; ctx.fillRect(hPos.x - 25, hPos.y, 50 * (d.health / d.maxHealth), 5);
        } 
        else if (node.type === 'player') {
            let pl = node.data;
            let fxOn = pl.isAwakened || pl.currentMove !== null;
            let fxCol = pl.isAwakened ? pl.characterData.awakenedColor : pl.characterData.fxColor;
            
            render3DAvatar(pl, pl.x, pl.y, pl.z, pl.heading, pl.isMoving, pl.walkCycle, pl.characterData, fxOn, fxCol);

            if (pl.currentMove) {
                let textPos = projectToScreen(pl.x, pl.y, pl.height + 25);
                ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
                ctx.fillText(pl.currentMove.name.toUpperCase(), textPos.x, textPos.y);
            }
        }
        else if (node.type === 'particle') {
            let pt = node.data;
            let scrPos = projectToScreen(pt.x, pt.y, pt.z);
            ctx.fillStyle = pt.color; ctx.beginPath();
            ctx.arc(scrPos.x, scrPos.y, 4 * sc * (pt.life / pt.maxLife), 0, Math.PI * 2); ctx.fill();
        }
    });
}

function runEngineLoop() {
    runEnginePhysics();
    renderCanvasScene();
    requestAnimationFrame(runEngineLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("char-selector");
    if (selector) {
        selector.addEventListener("change", (e) => {
            state.player.characterName = e.target.value;
            state.player.characterData = config.characters[e.target.value];
            state.player.isAwakened = false; state.player.awakeningMeter = 0;
            updateUI();
        });
    }
    updateUI();
    runEngineLoop();
});
                
