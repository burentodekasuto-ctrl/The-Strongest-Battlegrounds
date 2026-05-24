// config.js
const GAME_CONFIG = {
    canvas: {
        backgroundColor: "#060709"
    },
    sounds: {
        walk: "https://actions.google.com/sounds/v1/foley/running_on_gravel.ogg",
        hit: "https://actions.google.com/sounds/v1/impacts/crash_impact.ogg",
        awakenSound: "https://actions.google.com/sounds/v1/science_fiction/glitch_power_up.ogg",
        meleeSwipe: "https://actions.google.com/sounds/v1/foley/whip_swoosh.ogg",
        heavyBlast: "https://actions.google.com/sounds/v1/science_fiction/deep_space_explosion.ogg"
    },
    map: {
        width: 2000,
        height: 2000,
        gridSize: 100,
        theme: {
            floorTile: "#1a1b24",
            floorGrid: "#282a36",
            wallColor: "#3e4254",
            wallTrim: "#ff0055"
        },
        obstacles: [
            { x: 500, y: 500, radius: 40, height: 160 },
            { x: 1500, y: 500, radius: 40, height: 160 },
            { x: 500, y: 1500, radius: 40, height: 160 },
            { x: 1500, y: 1500, radius: 40, height: 160 },
            { x: 1000, y: 1000, radius: 80, height: 30 } 
        ]
    },
    characters: {
        "Saitama": {
            speed: 5.8,
            skinColor: "#fcd5a1", torsoColor: "#ffcc00", limbColor: "#d90429",
            awakenedColor: "#ff3e3e", fxColor: "#ffcc00",
            baseMoves: [
                { id: 1, name: "Normal Punch", damage: 15, range: 110, duration: 20, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Consecutive Punches", damage: 28, range: 130, duration: 45, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Shove", damage: 12, range: 90, duration: 15, type: "knockback", sound: "meleeSwipe" },
                { id: 4, name: "Uppercut", damage: 22, range: 115, duration: 25, type: "launcher", sound: "heavyBlast" }
            ],
            awakenedMoves: [
                { id: 1, name: "Death Counter", damage: 45, range: 130, duration: 30, type: "counter", sound: "heavyBlast" },
                { id: 2, name: "Table Flip", damage: 60, range: 350, duration: 60, type: "aoe", sound: "heavyBlast" },
                { id: 3, name: "Serious Punch", damage: 90, range: 700, duration: 50, type: "line", sound: "heavyBlast" },
                { id: 4, name: "Omnidirectional Punch", damage: 99, range: 500, duration: 70, type: "rush", sound: "heavyBlast" }
            ]
        },
        "Garou": {
            speed: 6.2,
            skinColor: "#fcd5a1", torsoColor: "#e5e5e5", limbColor: "#222222",
            awakenedColor: "#a44cff", fxColor: "#0096ff",
            baseMoves: [
                { id: 1, name: "Flowing Water", damage: 14, range: 115, duration: 22, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Lethal Whirlwind", damage: 24, range: 140, duration: 40, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Hunter's Grasp", damage: 15, range: 180, duration: 25, type: "pull", sound: "meleeSwipe" },
                { id: 4, name: "Prey's Peril", damage: 18, range: 100, duration: 30, type: "counter", sound: "meleeSwipe" }
            ],
            awakenedMoves: [
                { id: 1, name: "Water Stream Cutting Fist", damage: 42, range: 140, duration: 35, type: "melee", sound: "meleeSwipe" },
                { id: 2, name: "Crushed Rock Burst", damage: 48, range: 180, duration: 45, type: "aoe", sound: "heavyBlast" },
                { id: 3, name: "Rock Splitting Fist", damage: 55, range: 320, duration: 50, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Grand Fissure Extreme", damage: 85, range: 550, duration: 65, type: "line", sound: "heavyBlast" }
            ]
        },
        "Genos": {
            speed: 5.5,
            skinColor: "#444444", torsoColor: "#3a3f58", limbColor: "#ff7700",
            awakenedColor: "#ffaa00", fxColor: "#ff5500",
            baseMoves: [
                { id: 1, name: "Incinerate Cannon", damage: 20, range: 500, duration: 30, type: "line", sound: "heavyBlast" },
                { id: 2, name: "Machine Gun Blows", damage: 26, range: 125, duration: 45, type: "flurry", sound: "meleeSwipe" },
                { id: 3, name: "Jet Drive Arrow", damage: 18, range: 280, duration: 24, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Ignition Burst", damage: 15, range: 160, duration: 20, type: "aoe", sound: "heavyBlast" }
            ],
            awakenedMoves: [
                { id: 1, name: "Thunder Drill Cannon", damage: 58, range: 700, duration: 45, type: "line", sound: "heavyBlast" },
                { id: 2, name: "Lightning Quick Overdrive", damage: 48, range: 170, duration: 35, type: "melee", sound: "meleeSwipe" },
                { id: 3, name: "Flash Strike Combo", damage: 54, range: 360, duration: 55, type: "rush", sound: "meleeSwipe" },
                { id: 4, name: "Core Melt Detonation", damage: 95, range: 600, duration: 75, type: "aoe", sound: "heavyBlast" }
            ]
        }
    }
};
