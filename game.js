// game.js
const canvas = document.getElementById("gameCanvas") || document.createElement("canvas");
const ctx = canvas.getContext("2d");
if (!document.getElementById("gameCanvas")) {
    canvas.id = "gameCanvas";
    document.body.insertBefore(canvas, document.body.firstChild);
}

let config = GAME_CONFIG;
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;

// Global Game State Storage Matrix
const state = {
    camera: { x: 2000, y: 2000, zoom: 1, angle: 0, isDragging: false, lastMouseX: 0 },
    player: {
        x: 1900, y: 2000, vx: 0, vy: 0, radius: 26,
        characterName: "Saitama",
        characterData: config.characters["Saitama"],
        isAwakened: false,
        awakeningProgress: 100, // Ready to active G-trigger instantly
        walkCycle: 0, isMoving: false,
        currentMove: null, moveFrame: 0, activeCooldowns: {}
    },
    dummies: [
        { x: 2150, y: 2000, radius: 26, isHit: false, hitTimer: 0, knockbackX: 0, knockbackY: 0 }
    ],
    keys: {}
};

// UI Element Synchronization Hook Engine
function updateUIOverlay() {
    const charData = state.player.characterData;
    const currentMoveset = state.player.isAwakened ? charData.awakenedMoves : charData.baseMoves;
    
    document.getElementById("char-display").innerText = `${state.player.characterName} ${state.player.isAwakened ? "(SERIOUS MODE)" : ""}`;
    
    // Iterates cleanly over standard elements inside the HTML UI frame wrapper slots
    for (let i = 1; i <= 4; i++) {
        const btnSlot = document.getElementById(`skill-${i}`);
        if (btnSlot) {
            btnSlot.innerText = currentMoveset[i-1].name;
            if (state.player.isAwakened) {
                btnSlot.classList.add("awakened-slot");
            } else {
                btnSlot.classList.remove("awakened-slot");
            }
        }
    }

    const gBtn = document.getElementById("btn-awaken");
    if (gBtn) {
        gBtn.style.display = state.player.awakeningProgress >= 100 ? "flex" : "none";
    }
}

// Mouse Drag Orbit Tracking Camera Controls setup
window.addEventListener("mousedown", (e) => {
    if (e.button === 0 && e.target.tagName !== "BUTTON" && e.target.tagName !== "SELECT") {
        state.camera.isDragging = true;
        state.camera.lastMouseX = e.clientX;
    }
});
window.addEventListener("mousemove", (e) => {
    if (state.camera.isDragging) {
        let deltaX = e.clientX - state.camera.lastMouseX;
        state.camera.angle += deltaX * 0.007; // Fine angle scaling tuning
        state.camera.lastMouseX = e.clientX;
    }
});
window.addEventListener("mouseup", () => state.camera.isDragging = false);

// Key Listeners
window.addEventListener("keydown", (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'g' && state.player.awakeningProgress >= 100) triggerAwakening();
});
window.addEventListener("keyup", (e) => state.keys[e.key.toLowerCase()] = false);

function triggerAwakening() {
    state.player.isAwakened = !state.player.isAwakened;
    state.player.moveFrame = 45; // Triggers invulnerability visual freeze frames
    state.player.currentMove = { name: "AWAKENING RELEASE", type: "burst_freeze" };
    createImpactFX(state.player.x, state.player.y, "#ffffff", 40);
    updateUIOverlay();
}

function handleInputLoop() {
    let p = state.player;
    if (p.currentMove && p.currentMove.type !== "counter") return; // Freeze walking during attack frames

    p.vx = 0; p.vy = 0; p.isMoving = false;

    // Relative movement calculated base vectors matching exact camera orbit angle offsets
    let cos = Math.cos(state.camera.angle);
    let sin = Math.sin(state.camera.angle);

    let moveX = 0; let moveY = 0;
    if (state.keys['w']) moveY = -1;
    if (state.keys['s']) moveY = 1;
    if (state.keys['a']) moveX = -1;
    if (state.keys['d']) moveX = 1;

    if (moveX !== 0 || moveY !== 0) {
        p.isMoving = true;
        // Transform basic vector maps smoothly over relative viewport space coords
        let worldVx = moveX * cos - moveY * sin;
        let worldVy = moveX * sin + moveY * cos;
        
        p.vx = worldVx * p.characterData.speed;
        p.vy = worldVy * p.characterData.speed;
    }

    // Input slot keys bind checks
    const activeMoveset = p.isAwakened ? p.characterData.awakenedMoves : p.characterData.baseMoves;
    for (let i = 1; i <= 4; i++) {
        if (state.keys[i.toString()] && !p.currentMove) {
            executeMove(activeMoveset[i - 1]);
        }
    }

    p.x += p.vx; p.y += p.vy;
    p.x = Math.max(p.radius, Math.min(config.map.width - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(config.map.height - p.radius, p.y));
}

function executeMove(move) {
    let p = state.player;
    p.currentMove = move;
    p.moveFrame = 35; // Visual frame duration tick counter
    
    // Death Counter Special Logic Hook: Triggers instantly if dummy is inside forward hitbox range
    if (move.type === "counter") {
        state.dummies.forEach(d => {
            let dist = Math.hypot(d.x - p.x, d.y - p.y);
            if (dist < move.range + 30) {
                // Exact Saitama video playback feature clone: Instantly reposition behind target
                let dirX = (d.x - p.x) / dist;
                let dirY = (d.y - p.y) / dist;
                p.x = d.x + dirX * 50; 
                p.y = d.y + dirY * 50;
                d.knockbackX = -dirX * 18; d.knockbackY = -dirY * 18;
                d.isHit = true; d.hitTimer = 25;
            }
        });
    } else {
        // Standard combat bounds checks loops
        state.dummies.forEach(d => {
            let dist = Math.hypot(d.x - p.x, d.y - p.y);
            if (dist < move.range) {
                let dirX = (d.x - p.x) / dist;
                let dirY = (d.y - p.y) / dist;
                d.knockbackX = dirX * (move.damage * 0.4);
                d.knockbackY = dirY * (move.damage * 0.4);
                d.isHit = true; d.hitTimer = 20;
            }
        });
    }
    createImpactFX(p.x, p.y, p.isAwakened ? p.characterData.awakenedFxColor : p.characterData.fxColor, 15);
}

function createImpactFX(x, y, color, qty) {
    // Generates short-lived combat vector rings for hit confirm visual clarity
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.stroke();
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

function drawEngineFrame() {
    ctx.fillStyle = config.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic Tracking camera anchor ease logic
    state.camera.x += (state.player.x - state.camera.x) * 0.08;
    state.camera.y += (state.player.y - state.camera.y) * 0.08;

    // Map Grid Generator Engine
    ctx.strokeStyle = config.map.theme.lines;
    ctx.lineWidth = 1;
    let grid = config.map.gridSize;
    for (let x = 0; x <= config.map.width; x += grid) {
        let p1 = getRenderCoords(x, 0); let p2 = getRenderCoords(x, config.map.height);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    for (let y = 0; y <= config.map.height; y += grid) {
        let p1 = getRenderCoords(0, y); let p2 = getRenderCoords(config.map.width, y);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    // Process Target Training Dummies physics
    state.dummies.forEach(d => {
        if (d.hitTimer > 0) {
            d.x += d.knockbackX; d.y += d.knockbackY;
            d.knockbackX *= 0.85; d.knockbackY *= 0.85;
            d.hitTimer--;
        }
        let renderPos = getRenderCoords(d.x, d.y);
        ctx.fillStyle = d.hitTimer > 0 ? "#ff4444" : "#4e5464";
        ctx.beginPath(); ctx.arc(renderPos.x, renderPos.y, d.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Animate Character Leg Bobbing Cycle
    let p = state.player;
    if (p.isMoving) p.walkCycle += 0.25; else p.walkCycle *= 0.8;
    let smoothBob = Math.abs(Math.sin(p.walkCycle)) * 6;

    let playerRender = getRenderCoords(p.x, p.y);
    ctx.fillStyle = p.characterData.baseColor;
    ctx.beginPath();
    ctx.arc(playerRender.x, playerRender.y - smoothBob, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Visual Move Rendering Overlays
    if (p.currentMove) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.font = "italic bold 16px Arial";
        ctx.fillText(p.currentMove.name, playerRender.x - 50, playerRender.y - 45);
        
        p.moveFrame--;
        if (p.moveFrame <= 0) p.currentMove = null;
    }
}

function spawnDummy() {
    state.dummies.push({
        x: state.player.x + (Math.random() - 0.5) * 300,
        y: state.player.y + (Math.random() - 0.5) * 300,
        radius: 26, isHit: false, hitTimer: 0, knockbackX: 0, knockbackY: 0
    });
}

// Selector element interface runtime hook configuration
document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("char-selector");
    if (selector) {
        selector.addEventListener("change", (e) => {
            state.player.characterName = e.target.value;
            state.player.characterData = config.characters[e.target.value];
            state.player.isAwakened = false;
            updateUIOverlay();
        });
    }
    updateUIOverlay();
});

function engineTick() {
    handleInputLoop();
    drawEngineFrame();
    requestAnimationFrame(engineTick);
}
engineTick();
        
