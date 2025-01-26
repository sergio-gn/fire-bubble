import { Scene } from "phaser";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        //  Get the current highscore from the registry
        const score = this.registry.get("highscore");

        const textStyle = {
            fontFamily: "Arial Black",
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
        };

        this.add.image(960, 540, "main_menu_bg");

        const logo = this.add.image(960, 540, "logo").setAlpha(0); // Set initial alpha to 0

        this.tweens.add({
            targets: logo,
            alpha: 1, // Fade in
            duration: 1000,
            ease: "Linear",
        });

        this.add.text(32, 32, `High Score: ${score}`, textStyle);

        const instructions = ["Clique com o botão esquerdo do mouse ou A do controle para começar"];

        this.add
            .text(960, 840, instructions, textStyle)
            .setAlign("center")
            .setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("Story");
        });

        this.input.gamepad.once(
            "down",
            () => {
                this.scene.start("Story");
            },
            this
        );
    }
}