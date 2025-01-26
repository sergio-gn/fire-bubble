import { Scene } from "phaser";

export class Story extends Scene {
    constructor() {
        super("Story");
    }
    create() {
        const fogo = this.add.image(960, 540, "fogo");
        const trovao = this.add.image(960, 540, "trovao");

        this.time.delayedCall(1000, () => {
            trovao.destroy();
        });

        this.input.once("pointerdown", () => {
            this.scene.start("MainScene");
        });

        this.input.gamepad.once(
            "down",
            () => {
                this.scene.start("MainScene");
            },
            this
        );
    }
}
