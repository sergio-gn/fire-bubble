import { Boot } from "./scenes/Boot";
import { MainScene } from "./scenes/MainScene";
import { Game } from "phaser";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { GameOver } from "./scenes/GameOver";

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { gamepad: true },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
    scene: [Boot, Preloader, MainMenu, MainScene, GameOver],
};

export default new Game(config);

