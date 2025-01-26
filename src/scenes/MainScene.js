import { Scene } from "phaser";

export class MainScene extends Scene {
    constructor() {
        super("MainScene");
        this.player = null;
        this.controls = null;
        this.npcs = [];
        this.bg2 = null;
        this.npcSpawnTimer = null;
    }

    init() {
        this.npcs = [];
        this.npcSpawnTimer = null;
        this.score = 0;
    }

    preload() {
        this.load.setPath("assets");
        this.load.spritesheet("mega_sprite", "animations/mega_sprite.png", {
            frameWidth: 98,
            frameHeight: 136,
        });
        this.load.spritesheet(
            "mega_sprite_player",
            "animations/mega_sprite_holding_fire.png",
            {
                frameWidth: 120,
                frameHeight: 136,
            }
        );
        this.load.spritesheet("idle_sprite", "animations/idle_sprite.png", {
            frameWidth: 98,
            frameHeight: 136,
        });
        this.load.spritesheet(
            "idle_sprite_player",
            "animations/idle_holding_fire.png",
            {
                frameWidth: 120,
                frameHeight: 136,
            }
        );
        this.load.spritesheet("fire_sprite", "animations/fire_sprite.png", {
            frameWidth: 49,
            frameHeight: 102,
        });
        this.load.image("bg2", "bg2.jpg");
    }

    create() {
        // Configurando evento de shutdown para limpar a cena
        this.events.on("shutdown", () => {
            this.destroy();
        });

        // Criando o fundo
        this.bg2 = this.add.image(0, 0, "bg2").setOrigin(0, 0);
        this.bg2.setDisplaySize(3500, 3500).setDepth(-1);

        // Barra de Sobrevivência
        this.add
            .rectangle(780, 32, 468, 32)
            .setStrokeStyle(1, 0xffffff)
            .setDepth(10)
            .setScrollFactor(0);

        const bar = this.add
            .rectangle(780, 32, 468, 28, 0xffffff)
            .setDepth(10)
            .setScrollFactor(0);

        this.add
            .text(780, 30, "Barra de Sobrevivência", { color: "0x000000" })
            .setDepth(10)
            .setScrollFactor(0);

        this.tweens.add({
            targets: bar,
            width: 0,
            duration: 5000,
            repeat: 0,
            onComplete: () => {
                this.destroy();
                this.scene.start("GameOver");
            },
        });

        // SCORE SYSTEM
        const highscore = this.registry.get("highscore");
        this.highscore =
            highscore !== null && highscore !== undefined ? highscore : 0;

        this.score = 0;

        const textStyle = {
            fontFamily: "Verdana",
            fontSize: 32,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 6,
        };

        // Texto do score com scroll fixo e profundidade
        this.scoreText = this.add
            .text(32, 32, `Score: ${this.score}`, textStyle)
            .setDepth(1)
            .setScrollFactor(0);

        // Atualiza o score a cada segundo
        this.time.addEvent({
            delay: 1000,
            callback: () => this.updateScore(),
            loop: true,
        });
        // END SCORE SYSTEM

        // Criando o jogador
        this.player = this.physics.add
            .sprite(1750, 1750, "mega_sprite_player")
            .setCollideWorldBounds(true);

        // this.npc = this.physics.add
        //     .sprite(1750, 1750, "mega_sprite")
        //     .setCollideWorldBounds(true);

        this.torch = this.physics.add
            .sprite(1780, 1750, "fire_sprite")
            .setDepth(5);

        // this.idle = this.physics.add
        //     .sprite(1780, 1750, "idle_sprite")
        //     .setDepth(5);

        // Criando animações
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("mega_sprite_player", {
                start: 0,
                end: 17,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-npc",
            frames: this.anims.generateFrameNumbers("mega_sprite", {
                start: 0,
                end: 17,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "torch",
            frames: this.anims.generateFrameNumbers("fire_sprite", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("idle_sprite_player", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "idle-npc",
            frames: this.anims.generateFrameNumbers("idle_sprite", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        // Configurando os controles
        this.controls = createControls(this, 300);

        // Configurando a câmera
        this.cameras.main.setBounds(0, 0, 3500, 3500);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1); // Garante que o zoom seja padrão

        // Criando NPCs inicialmente
        for (let i = 0; i < 10; i++) {
            const npcInstance = createNPC(this);
            this.npcs.push(npcInstance);
        }

        // Timer para criar NPCs continuamente
        this.npcSpawnTimer = this.time.addEvent({
            delay: 4000,
            callback: () => spawnNPC(this),
            loop: true,
        });

        // Definindo os limites do mundo
        this.physics.world.setBounds(0, 0, 3500, 3500);
    }

    update() {
        const playerMoving = this.controls.update();

        // Atualizando NPCs
        this.npcs.forEach((npc) => {
            npc.update(this.player, this.npcs, playerMoving);
        });
    }

    updateScore() {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        console.log(`Score atualizado: ${this.score}`);
        this.registry.set("highscore", this.score);
    }

    destroy() {
        if (this.npcSpawnTimer) {
            this.npcSpawnTimer.remove();
            this.npcSpawnTimer = null;
        }
        this.npcs.forEach((npc) => npc.sprite.destroy());
        this.npcs = [];

        this.time.removeAllEvents();
    }
}

function createControls(scene, speed = 300) {
    const keys = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    scene.anims.create({
        key: "walk-right",
        frames: scene.anims.generateFrameNumbers("mega_sprite_player", {
            start: 12,
            end: 17,
        }),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: "walk-left",
        frames: scene.anims.generateFrameNumbers("mega_sprite_player", {
            start: 12,
            end: 17,
        }),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: "walk-down",
        frames: scene.anims.generateFrameNumbers("mega_sprite_player", {
            start: 0,
            end: 5,
        }),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: "walk-up",
        frames: scene.anims.generateFrameNumbers("mega_sprite_player", {
            start: 6,
            end: 11,
        }),
        frameRate: 8,
        repeat: -1,
    });

    scene.anims.create({
        key: "fire-torch",
        frames: scene.anims.generateFrameNumbers("fire_sprite", {
            start: 0,
            end: 3,
        }),
        frameRate: 8,
        repeat: -1,
    });

    scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers("idle_sprite_player", {
            start: 0,
            end: 3,
        }),
        frameRate: 8,
        repeat: -1,
    });

    scene.anims.create({
        key: "idle-npc",
        frames: scene.anims.generateFrameNumbers("idle_sprite", {
            start: 0,
            end: 3,
        }),
        frameRate: 8,
        repeat: -1,
    });

    scene.torch.anims.play("fire-torch");

    return {
        update() {
            let speedX = 0,
                speedY = 0;
            let animKey = null;

            const pad = scene.input.gamepad.getPad(0);

            // if (this.gamepadDetected) {
            const leftStickX = pad?.axes[0].getValue(),
                leftStickY = pad?.axes[1].getValue();

            // const gamepad = pads[0];

            const up = leftStickY < -0.25 || keys.up.isDown;
            const down = leftStickY > 0.25 || keys.down.isDown;
            const left = leftStickX < -0.25 || keys.left.isDown;
            const right = leftStickX > 0.25 || keys.right.isDown;

            if (up) {
                speedY -= speed;
                animKey = "walk-up";
                if (left) {
                    scene.torch.setPosition(
                        scene.player.x + 30,
                        scene.player.y
                    );
                }
                if (right) {
                    scene.torch.setPosition(
                        scene.player.x - 30,
                        scene.player.y
                    );
                }
            }
            if (right) {
                speedX += speed;
                animKey = "walk-right";
                scene.player.setFlipX(true);
                scene.torch.setPosition(scene.player.x + 30, scene.player.y);
            }
            if (down) {
                speedY += speed;
                animKey = "walk-down";
                if (left) {
                    scene.torch.setPosition(
                        scene.player.x + 30,
                        scene.player.y
                    );
                }
                if (right) {
                    scene.torch.setPosition(
                        scene.player.x - 30,
                        scene.player.y
                    );
                }
            }
            if (left) {
                speedX -= speed;
                animKey = "walk-left";
                scene.player.setFlipX(false);
                scene.torch.setPosition(scene.player.x - 30, scene.player.y);
            }

            scene.player.setVelocity(speedX, speedY);
            scene.torch.setVelocity(speedX, speedY);

            if (animKey) {
                scene.player.anims.play(animKey, true);
                return true;
            } else {
                scene.torch.setPosition(scene.player.x + 30, scene.player.y);

                    scene.player.setFlipX(false);
                scene.player.anims.play("idle", true);
            }
        },
    };
}

function createNPC(scene) {
    const x = Phaser.Math.Between(0, 3500);
    const y = Phaser.Math.Between(0, 3500);

    const npc = {
        sprite: scene.physics.add
            .sprite(x, y, "idle-npc", 0)
            .setCollideWorldBounds(true)
            .play("idle-npc"),
        isFollowing: false,
        isAlly: false,

        update(player, allNpcs, playerMoving) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                npc.sprite.x,
                npc.sprite.y,
                player.x,
                player.y
            );

            if (distanceToPlayer < 50 && !npc.isAlly) {
                npc.isFollowing = true;
                npc.isAlly = true;
            }

            if (npc.isAlly && npc.isFollowing) {
                const allies = allNpcs.filter((n) => n.isAlly);
                const totalAllies = allies.length;

                // Calculate circular formation around player
                const index = allies.indexOf(npc);
                const angle = (index / totalAllies) * Phaser.Math.PI2;
                const radius = 100;

                const targetX = player.x + radius * Math.cos(angle);
                const targetY = player.y + radius * Math.sin(angle);

                // Smooth movement towards target position
                npc.sprite.x += (targetX - npc.sprite.x) * 0.1;
                npc.sprite.y += (targetY - npc.sprite.y) * 0.1;

                // Apply separation to avoid overlapping
                applySeparation(npc, allNpcs);

                // Manage animations
                if (playerMoving) {
                    npc.sprite.anims.play("walk-npc", true);
                    console.error(
                        "NPC sprite não foi inicializado corretamente!",
                        npc
                    );
                    return true;
                } else {
                    npc.sprite.anims.play("idle-npc", true);
                    console.error("NPC sprite ELSE!", npc);
                    return false;
                }
            }
        },
    };

    return npc;
}

function spawnNPC(scene) {
    const npcInstance = createNPC(scene);
    scene.npcs.push(npcInstance);
}

function applySeparation(npc, allNpcs) {
    const separationDistance = 50; // Distância mínima entre NPCs
    allNpcs.forEach((otherNpc) => {
        if (otherNpc !== npc) {
            const distance = Phaser.Math.Distance.Between(
                npc.sprite.x,
                npc.sprite.y,
                otherNpc.sprite.x,
                otherNpc.sprite.y
            );

            if (distance < separationDistance) {
                const angle = Phaser.Math.Angle.Between(
                    otherNpc.sprite.x,
                    otherNpc.sprite.y,
                    npc.sprite.x,
                    npc.sprite.y
                );

                const offset = separationDistance - distance;
                npc.sprite.x += Math.cos(angle) * offset * 0.1;
                npc.sprite.y += Math.sin(angle) * offset * 0.1;
            }
        }
    });
}

