// config.js
const GAME_CONFIG = {
    canvas: {
        width: 1280,
        height: 720,
        backgroundColor: "#0d0e12"
    },
    sounds: {
        walk: "https://actions.google.com/sounds/v1/foley/running_on_gravel.ogg",
        hit: "https://actions.google.com/sounds/v1/impacts/crash_impact.ogg",
        awaken: "https://actions.google.com/sounds/v1/science_fiction/glitch_power_up.ogg",
        meleeSwipe: "https://actions.google.com/sounds/v1/foley/whip_swoosh.ogg",
        heavyBlast: "https://actions.google.com/sounds/v1/science_fiction/deep_space_explosion.ogg"
    },
    map: {
        width: 3000,
        height: 3000,
        gridSize: 100,
        theme: {
            ground: "#1f212a",
            lines: "#2c2f3c",
            obstacles: "#cc2828"
        },
        obstacles: [
            { x: 1500, y: 1500, radius: 60, type: 'pillar' },
            { x: 1000, y: 1200, radius: 80, type: 'wall_debris' },
            { x: 2000, y: 1800, radius: 50, type: 'ruins' }
        ]
    },
    characters: {
        "Saitama": {
            speed: 5.5,
            baseColor: "#ffcc00", 
            awakenedColor: "#d90429", 
            fxColor: "rgba(255, 204, 0, 0.5)",
            awakenedFxColor: "rgba(217, 4, 41, 0.8)",
            baseMoves: [
                { id: 1, name: "Normal Punch", damage: 15, range: 90, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Consecutive Punches", damage: 25, range: 110, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Shove", damage: 12, range: 80, type: "knockback", sound: "meleeSwipe" },
                { id: 4, name: "Uppercut", damage: 18, range: 95, type: "launcher", sound: "heavyBlast" }
            ],
            awakenedMoves: [
                { id: 1, name: "Death Counter", damage: 45, range: 100, type: "counter", sound: "heavyBlast" },
                { id: 2, name: "Table Flip", damage: 55, range: 250, type: "aoe", sound: "heavyBlast" },
                { id: 3, name: "Serious Punch", damage: 80, range: 500, type: "line", sound: "heavyBlast" },
                { id: 4, name: "Omnidirectional Punch", damage: 95, range: 350, type: "rush", sound: "heavyBlast" }
            ]
        },
        "Garou": {
            speed: 5.8,
            baseColor: "#cfd2cd", 
            awakenedColor: "#560bad", 
            fxColor: "rgba(0, 150, 255, 0.5)",
            awakenedFxColor: "rgba(120, 0, 255, 0.8)",
            baseMoves: [
                { id: 1, name: "Flowing Water", damage: 14, range: 95, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Lethal Whirlwind", damage: 20, range: 120, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Hunter's Grasp", damage: 12, range: 140, type: "pull", sound: "meleeSwipe" },
                { id: 4, name: "Prey's Peril", damage: 15, range: 85, type: "counter", sound: "meleeSwipe" }
            ],
            awakenedMoves: [
                { id: 1, name: "Water Stream Cutting Fist", damage: 40, range: 110, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Crushed Rock", damage: 42, range: 130, type: "aoe", sound: "heavyBlast" },
                { id: 3, name: "Rock Splitting Fist", damage: 48, range: 250, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Grand Fissure Extreme", damage: 80, range: 450, type: "line", sound: "heavyBlast" }
            ]
        },
        "Genos": {
            speed: 5.2,
            baseColor: "#4a4e69", 
            awakenedColor: "#f77f00", 
            fxColor: "rgba(255, 110, 0, 0.6)",
            awakenedFxColor: "rgba(255, 200, 0, 0.9)",
            baseMoves: [
                { id: 1, name: "Incinerate Cannon", damage: 18, range: 400, type: "line", sound: "heavyBlast" },
                { id: 2, name: "Machine Gun Blows", damage: 22, range: 100, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Jet Drive Arrow", damage: 15, range: 250, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Ignition Burst", damage: 12, range: 140, type: "aoe", sound: "heavyBlast" }
            ],
            awakenedMoves: [
                { id: 1, name: "Thunder Drill Cannon", damage: 55, range: 600, type: "line", sound: "heavyBlast" },
                { id: 2, name: "Lightning Quick Strike", damage: 45, range: 150, type: "melee", sound: "meleeSwipe" },
                { id: 3, name: "Flash Strike Overdrive", damage: 48, range: 300, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Core Melt Explosion", damage: 90, range: 500, type: "aoe", sound: "heavyBlast" }
            ]
        }
    }
};
