// config.js
const GAME_CONFIG = {
    canvas: {
        width: 1280,
        height: 720,
        backgroundColor: "#0d0e12"
    },
    map: {
        width: 4000,
        height: 4000,
        gridSize: 80,
        theme: {
            ground: "#16181f",
            lines: "#222530",
            obstacles: "#cc2828"
        },
        obstacles: [
            { x: 2000, y: 1800, radius: 70, type: 'pillar' },
            { x: 1500, y: 2300, radius: 100, type: 'shattered_wall' },
            { x: 2500, y: 2200, radius: 55, type: 'boulder' }
        ]
    },
    characters: {
        "Saitama": {
            speed: 6.2,
            baseColor: "#ffcc00", 
            fxColor: "rgba(255, 183, 0, 0.6)",
            awakenedFxColor: "rgba(255, 30, 30, 0.8)",
            baseMoves: [
                { id: 1, name: "Normal Punch", damage: 12, range: 90, type: "melee" },
                { id: 2, name: "Consecutive Punches", damage: 24, range: 110, type: "flurry" },
                { id: 3, name: "Shove", damage: 10, range: 80, type: "knockback" },
                { id: 4, name: "Uppercut", damage: 15, range: 95, type: "launcher" }
            ],
            awakenedMoves: [
                { id: 1, name: "Death Counter", damage: 45, range: 100, type: "counter" },
                { id: 2, name: "Table Flip", damage: 50, range: 300, type: "aoe_shatter" },
                { id: 3, name: "Serious Punch", damage: 85, range: 650, type: "beam_line" },
                { id: 4, name: "Omnidirectional Punch", damage: 95, range: 400, type: "teleport_rush" }
            ]
        },
        "Garou": {
            speed: 5.8,
            baseColor: "#d3d3d3",
            fxColor: "rgba(0, 150, 255, 0.5)",
            awakenedFxColor: "rgba(120, 0, 255, 0.8)",
            baseMoves: [
                { id: 1, name: "Flowing Water", damage: 14, range: 95, type: "melee" },
                { id: 2, name: "Lethal Whirlwind Stream", damage: 20, range: 120, type: "flurry" },
                { id: 3, name: "Hunter's Grasp", damage: 12, range: 140, type: "pull" },
                { id: 4, name: "Prey's Peril", damage: 15, range: 85, type: "counter" }
            ],
            awakenedMoves: [
                { id: 1, name: "Water Stream Cutting Fist", damage: 40, range: 110, type: "melee" },
                { id: 2, name: "Crushed Rock", damage: 42, range: 130, type: "aoe_shatter" },
                { id: 3, name: "Rock Splitting Fist", damage: 48, range: 250, type: "dash_execute" },
                { id: 4, name: "Grand Fissure Extreme", damage: 80, range: 450, type: "beam_line" }
            ]
        },
        "Genos": {
            speed: 5.5,
            baseColor: "#474a51",
            fxColor: "rgba(255, 110, 0, 0.6)",
            awakenedFxColor: "rgba(255, 200, 0, 0.9)",
            baseMoves: [
                { id: 1, name: "Incinerate Cannon", damage: 18, range: 400, type: "beam_line" },
                { id: 2, name: "Machine Gun Blows", damage: 22, range: 100, type: "flurry" },
                { id: 3, name: "Jet Drive Arrow", damage: 15, range: 250, type: "dash_execute" },
                { id: 4, name: "Ignition Burst", damage: 12, range: 140, type: "aoe_shatter" }
            ],
            awakenedMoves: [
                { id: 1, name: "Thunder Drill Cannon", damage: 55, range: 600, type: "beam_line" },
                { id: 2, name: "Lightning Quick Strike", damage: 45, range: 150, type: "melee" },
                { id: 3, name: "Flash Strike Overdrive", damage: 48, range: 300, type: "teleport_rush" },
                { id: 4, name: "Core Melt Explosion Burst", damage: 90, range: 500, type: "aoe_shatter" }
            ]
        }
    }
};
