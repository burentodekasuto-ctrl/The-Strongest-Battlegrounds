// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let config = GAME_CONFIG;
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;

const state = {
    camera: { x: 1500, y: 1500, zoom: 1, angle: 0, isDragging: false, lastMouseX: 0 },
    player: {
        x: 1400, y: 1500, vx: 0, vy: 0, radius: 28,
        characterName: "Saitama",
        characterData: config.characters["Saitama"],
        isAwakened: false,
        walkCycle: 0, isMoving: false,
        currentMove: null, moveFrame: 0
    },
    dummies: [
        { x: 1600, y: 1500, radius: 28, isHit: false, hitTimer: 0, knockbackX: 0, knockbackY: 0 }
    ],
    keys: {}
};

function playSound(soundKey, volume = 0.5) {
    if (config.sounds && config.sounds[soundKey]) {
        let audio = new Audio(config.sounds[soundKey]);
        audio.volume = volume;
        audio.currentTime = 0; 
        audio.play().catch(() => {});
    }
}

function updateUI() {
    const p = state.player;
    const currentMoveset = p.isAwakened ? p.characterData.awakenedMoves : p.characterData.baseMoves;
    
    document.getElementById("char-display").innerText = p.isAwakened ? `${p.characterName} (AWAKENED)` : p.characterName.toUpperCase();
    
    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`skill-${i}`);
        if (slot) {
            slot.innerText = currentMoveset[i - 1].name;
            if (p.isAwakened) slot.classList.add("awakened-slot");
            else slot.classList.remove("awakened-slot");
        }
    }
}

window.addEventListener("mousedown", (e) => {
    if (e.button === 0 && e.target.tagName !== "BUTTON" && e.target.tagName !== "SELECT") {
        state.camera.isDragging = true;
        state.camera.lastMouseX = e.clientX;
    }
});
window.addEventListener("mousemove", (e) => {
    if (state.camera.isDragging) {
        let dx = e.clientX - state.camera.lastMouseX;
        state.camera.angle += dx * 0.007;
        state.camera.lastMouseX = e.clientX;
    }
});
window.addEventListener("mouseup", () => state.camera.isDragging = false);

window.addEventListener("keydown", (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'g') toggleAwakening();
});
window.addEventListener("keyup", (e) => state.keys[e.key.toLowerCase()] = false);
document.getElementById("btn-awaken").addEventListener("click", toggleAwakening);

function toggleAwakening() {
    state.player.isAwakened = !state.player.isAwakened;
    state.player.moveFrame = 40;
    state.player.currentMove = { name: "MODE SWITCH DETONATION", type: "buff" };
    playSound("awaken", 0.6);
    updateUI();
}

let walkSoundTimer = 0;
function handleInputLoop() {
    let p = state.player;
    if (p.currentMove) return;

    p.vx = 0; p.vy = 0; p.isMoving = false;

    let cos = Math.cos(state.camera.angle);
    let sin = Math.sin(state.camera.angle);

    let dx = 0; let dy = 0;
    if (state.keys['w']) dy = -1;
    if (state.keys['s']) dy = 1;
    if (state.keys['a']) dx = -1;
    if (state.keys['d']) dx = 1;

    if (dx !== 0 || dy !== 0) {
        p.isMoving = true;
        p.vx = (dx * cos - dy * sin) * p.characterData.speed;
        p.vy = (dx * sin + dy * cos) * p.characterData.speed;

        walkSoundTimer++;
        if (walkSoundTimer % 22 === 0) playSound("walk", 0.2);
    }

    const currentMoveset = p.isAwakened ? p.characterData.awakenedMoves : p.characterData.baseMoves;
    for (let i = 1; i <= 4; i++) {
        if (state.keys[i.toString()]) {
            executeSkill(currentMoveset[i - 1]);
        }
    }

    p.x += p.vx; p.y += p.vy;
    p.x = Math.max(p.radius, Math.min(config.map.width - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(config.map.height - p.radius, p.y));
}

function executeSkill(move) {
    let p = state.player;
    p.currentMove = move;
    p.moveFrame = 30;

    if (move.sound) playSound(move.sound, 0.5);

    state.dummies.forEach(d => {
        let dist = Math.hypot(d.x - p.x, d.y - p.y);
        if (move.type === "counter" && dist < move.range + 40) {
            let dirX = (d.x - p.x) / dist;
            let dirY = (d.y - p.y) / dist;
            p.x = d.x + dirX * 45; p.y = d.y + dirY * 45;
            d.knockbackX = -dirX * 16; d.knockbackY = -dirY * 16;
            d.hitTimer = 20;
            playSound("hit", 0.7);
        } else if (dist < move.range) {
            let dirX = (d.x - p.x) / dist;
            let dirY = (d.y - p.y) / dist;
            d.knockbackX = dirX * (move.damage * 0.35);
            d.knockbackY = dirY * (move.damage * 0.35);
            d.hitTimer = 20;
            playSound("hit", 0.5);
        }
    });
}

function getRenderCoords(worldX, worldY) {
    let dx = worldX - state.camera.x;
    let dy = worldY - state.camera.y;
    let cos = Math.cos(-state.camera.angle);
    let sin = Math.sin(-state.camera.angle);
    return {
        x: canvas.width / 2 + (dx * cos - dy * sin) * state.camera.zoom,
        y: canvas.height / 2 + (dx * sin + dy * cos) * state.camera.zoom
    };
}

function drawFrame() {
    ctx.fillStyle = config.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.camera.x += (state.player.x - state.camera.x) * 0.1;
    state.camera.y += (state.player.y - state.camera.y) * 0.1;

    ctx.strokeStyle = config.map.theme.lines;
    ctx.lineWidth = 1;
    for (let x = 0; x <= config.map.width; x += config.map.gridSize) {
        let p1 = getRenderCoords(x, 0); let p2 = getRenderCoords(x, config.map.height);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    for (let y = 0; y <= config.map.height; y += config.map.gridSize) {
        let p1 = getRenderCoords(0, y); let p2 = getRenderCoords(config.map.width, y);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    config.map.obstacles.forEach(obs => {
        let pos = getRenderCoords(obs.x, obs.y);
        ctx.fillStyle = config.map.theme.obstacles;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, obs.radius, 0, Math.PI*2); ctx.fill();
    });

    state.dummies.forEach(d => {
        if (d.hitTimer > 0) {
            d.x += d.knockbackX; d.y += d.knockbackY;
            d.knockbackX *= 0.88; d.knockbackY *= 0.88;
            d.hitTimer--;
        }
        let pos = getRenderCoords(d.x, d.y);
        ctx.fillStyle = d.hitTimer > 0 ? "#ef233c" : "#5c677d";
        ctx.beginPath(); ctx.arc(pos.x, pos.y, d.radius, 0, Math.PI * 2); ctx.fill();
    });

    let p = state.player;
    if (p.isMoving) p.walkCycle += 0.25; else p.walkCycle *= 0.8;
    let weightBob = Math.abs(Math.sin(p.walkCycle)) * 5;

    let pPos = getRenderCoords(p.x, p.y);
    ctx.fillStyle = p.isAwakened ? p.characterData.awakenedColor : p.characterData.baseColor;
    ctx.beginPath();
    ctx.arc(pPos.x, pPos.y - weightBob, p.radius, 0, Math.PI * 2);
    ctx.fill();

    if (p.currentMove) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px monospace";
        ctx.fillText(p.currentMove.name, pPos.x - 40, pPos.y - 45);
        p.moveFrame--;
        if (p.moveFrame <= 0) p.currentMove = null;
    }
}

function loop() {
    handleInputLoop();
    drawFrame();
    requestAnimationFrame(loop);
}

document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("char-selector");
    if (selector) {
        selector.addEventListener("change", (e) => {
            state.player.characterName = e.target.value;
            state.player.characterData = config.characters[e.target.value];
            state.player.isAwakened = false; 
            updateUI();
        });
    }
    updateUI();
    loop();
});
                          
