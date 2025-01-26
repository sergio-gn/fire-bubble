import { Scene } from "phaser";

export class MainScene extends Scene {
    constructor() {
        super("MainScene");
        this.player = null;
        this.controls = null;
        this.npcs = [];
        this.terreno = null;
        this.npcSpawnTimer = null;

        // lifeFood System
        this.lifeFood = [];
        this.bar = null;
        this.barTween = null;
        this.score = 0;
        this.scoreText = null;

        this.obstacles = [];
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("life_food", "life_food.png");
        this.load.image("life_food2", "life_food2.png");
        this.load.image("life_food3", "life_food3.png");
        this.load.image("fire_bubble", "fire_bubble.png");

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
        this.load.spritesheet(
            "npc1_walk",
            "animations/mega_spritesheet_npc_1.png",
            {
                frameWidth: 98,
                frameHeight: 136,
            }
        );

        this.load.spritesheet("npc1_idle", "animations/npc_idle_1.png", {
            frameWidth: 98,
            frameHeight: 136,
        });

        this.load.spritesheet(
            "npc2_walk",
            "animations/mega_spritesheet_npc_2.png",
            {
                frameWidth: 98,
                frameHeight: 136,
            }
        );

        this.load.spritesheet("npc2_idle", "animations/npc_idle_2.png", {
            frameWidth: 98,
            frameHeight: 136,
        });
        this.load.spritesheet("fire_sprite", "animations/fire_sprite.png", {
            frameWidth: 49,
            frameHeight: 102,
        });

        this.load.atlas(
            "obstacles",
            "obstacles/spritesheet.png",
            "obstacles/obstacles.json"
        );

        this.load.image("terreno", "terreno.jpg");
    }

    create() {
        // Configurando evento de shutdown para limpar a cena
        this.events.on("shutdown", () => {
            this.destroy();
        });

        // Criando o fundo
        this.terreno = this.add.image(0, 0, "terreno").setOrigin(0, 0);
        this.terreno.setDisplaySize(3500, 3500).setDepth(-1);

        //Fire Bubble
        this.fire_bubble = this.physics.add
            .image(500, 500, "fire_bubble")
            .setOrigin(0.5)
            .setDisplaySize(400, 400)
            .setDepth(3);

        // Barra de Sobrevivência
        this.add
            .rectangle(1600, 32, 468, 32)
            .setStrokeStyle(1, 0xffffff)
            .setDepth(10)
            .setScrollFactor(0);

        this.bar = this.add
            .rectangle(1600, 32, 468, 28, 0xffffff)
            .setDepth(10)
            .setScrollFactor(0);

        this.add
            .text(1600, 30, "Barra de Sobrevivência", { color: "0x000000" })
            .setDepth(10)
            .setScrollFactor(0);

        this.barTween = this.tweens.add({
            targets: this.bar,
            width: 0,
            duration: 20000,
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

      // Update score every second
      this.time.addEvent({
          delay: 1000,
          callback: () => this.updateScore(),
          loop: true,
      });

        // Criando o jogador
        this.player = this.physics.add
            .sprite(1750, 1750, "mega_sprite_player")
            .setCollideWorldBounds(true)
            .setDepth(2);
            
        // Criando todos os obstáculos de uma vez no início
        for (let i = 0; i < 10; i++) {
            this.spawnObstacle();
        }
        this.torch = this.physics.add
            .sprite(1780, 1750, "fire_sprite")
            .setDepth(1);

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
            key: "npc1-walk",
            frames: this.anims.generateFrameNumbers("npc1_walk", {
                start: 0,
                end: 18,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "npc1-idle",
            frames: this.anims.generateFrameNumbers("npc1_idle", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "npc2-walk",
            frames: this.anims.generateFrameNumbers("npc2_walk", {
                start: 0,
                end: 18,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "npc2-idle",
            frames: this.anims.generateFrameNumbers("npc2_idle", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        // Configurando os controles
        this.controls = this.createControls(300);

        // Configurando a câmera
        this.cameras.main.setBounds(0, 0, 3500, 3500);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1); // Garante que o zoom seja padrão

        // Criando NPCs inicialmente
        for (let i = 0; i < 10; i++) {
            const npcInstance = this.createNPC();
            this.npcs.push(npcInstance);
        }

        // Timer para criar NPCs continuamente
        this.npcSpawnTimer = this.time.addEvent({
            delay: 4000,
            callback: () => this.spawnNPC(),
            loop: true,
        });

        // Definindo os limites do mundo
        this.physics.world.setBounds(0, 0, 3500, 3500);

        // Life Food
        for (let i = 0; i < 5; i++) {
            const lifeFoodInstance = this.createLifeFood();
            this.lifeFood.push(lifeFoodInstance);
        }
        this.time.addEvent({
            delay: 4000,
            callback: () => this.spawnLifeFood(),
            loop: true,
        });

        
    }

    spawnObstacle() {
        // Imagem aleatória dos obstáculos
        const obstacleTypes = [
            "Cenario1.png",
            "Cenario2.png",
            "Cenario3.png",
            "Cenario4.png",
            "Cenario5.png",
            "Cenario6.png",
            "Cenario7.png",
            "Cenario8.png",
            "Cenario9.png",
        ]; // Nome das imagens de obstáculos carregadas
        const randomObstacle = Phaser.Math.RND.pick(obstacleTypes);

        // Posição aleatória dentro dos limites do mapa
        const randomX = Phaser.Math.RND.between(0, 3500);
        const randomY = Phaser.Math.RND.between(0, 3500);

        const scale = 0.3;
        // Criação do obstáculo
        const obstacle = this.physics.add
            .image(randomX, randomY, "obstacles", randomObstacle)
            .setOrigin(0.5)
            .setScale(scale)
            .setDepth(1)
            .setCollideWorldBounds(true)
            .setImmovable(true);

        const radius = (obstacle.width * scale) / 1.2; // Raio do círculo, metade da largura da imagem escalada
        obstacle.body.setCircle(radius); // Define uma colisão circular com o raio calculado

        // Agora, definimos a posição da colisão diretamente, sem usar 'setPosition'
        obstacle.body.position.set(obstacle.x, obstacle.y);

        // Adicionar ao array de obstáculos
        this.obstacles.push(obstacle);

        this.physics.add.collider(this.player, obstacle);
    }

  update() {
      this.controls.update();

      this.npcs.forEach((npc) => {
          npc.update(this.player, this.npcs, this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0);
      });

        this.lifeFood.forEach((food) => {
            food.update(this.player);
        });

        const speed = 0.05; // Adjust speed for smooth following
        this.fire_bubble.x = Phaser.Math.Interpolation.Linear(
            [this.fire_bubble.x, this.player.x],
            speed
        );
        this.fire_bubble.y = Phaser.Math.Interpolation.Linear(
            [this.fire_bubble.y, this.player.y],
            speed
        );
    }

    updateScore() {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
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

    createControls(speed) {
        const keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("mega_sprite_player", {
                start: 12,
                end: 17,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNumbers("mega_sprite_player", {
                start: 18,
                end: 23,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("mega_sprite_player", {
                start: 0,
                end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("mega_sprite_player", {
                start: 6,
                end: 11,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "fire-torch",
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
        const npcConfigs = [
            {
                id: "npc1",
                walkSprite: "mega_spritesheet_npc_1",
                idleSprite: "npc_idle_1",
            },
            {
                id: "npc2",
                walkSprite: "mega_spritesheet_npc_2",
                idleSprite: "npc_idle_2",
            },
        ];

        npcConfigs.forEach((npc) => {
            this.anims.create({
                key: `idle-${npc.id}`,
                frames: this.anims.generateFrameNumbers(npc.idleSprite, {
                    start: 0,
                    end: 3,
                }),
                frameRate: 8,
                repeat: -1,
            });

            this.anims.create({
                key: `walk-${npc.id}`,
                frames: this.anims.generateFrameNumbers(npc.walkSprite, {
                    start: 0,
                    end: 17,
                }),
                frameRate: 8,
                repeat: -1,
            });
        });

        this.torch.anims.play("fire-torch");

        return {
            update: () => {
                let speedX = 0,
                    speedY = 0;
                let animKey = null;

                const pad = this.input?.gamepad.getPad(0);

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
                }
                if (right) {
                    speedX += speed;
                    animKey = "walk-right";
                }
                if (down) {
                    speedY += speed;
                    animKey = "walk-down";
                }
                if (left) {
                    speedX -= speed;
                    animKey = "walk-left";
                }
                if (up && !right && !down && !left) {
                    this.torch.setPosition(this.player.x + 30, this.player.y);
                }
                if (up && right && !down && !left) {
                    this.torch.setPosition(this.player.x + 50, this.player.y);
                }
                if (!up && right && !down && !left) {
                    this.torch.setPosition(this.player.x + 50, this.player.y);
                }
                if (!up && right && down && !left) {
                    this.torch.setPosition(this.player.x + 30, this.player.y);
                }
                if (!up && !right && down && !left) {
                    this.torch.setPosition(this.player.x + 30, this.player.y);
                }
                if (!up && !right && down && left) {
                    this.torch.setPosition(this.player.x - 30, this.player.y);
                }
                if (!up && !right && !down && left) {
                    this.torch.setPosition(this.player.x - 30, this.player.y);
                }
                if (up && !right && !down && left) {
                    this.torch.setPosition(this.player.x - 30, this.player.y);
                }
                if (!up && !left && !right && !down) {
                    this.torch.setPosition(this.player.x + 30, this.player.y);
                }

                this.player.setVelocity(speedX, speedY);
                this.torch.setVelocity(speedX, speedY);

                if (animKey) {
                    this.player.anims.play(animKey, true);
                    return true;
                } else {
                    this.player.anims.play("idle", true);
                }
            },
        };
    }

    createNPC() {
        const x = Phaser.Math.Between(0, 3500);
        const y = Phaser.Math.Between(0, 3500);
        const randomFrame = Phaser.Math.Between(0, 3);
    
        // Randomly choose NPC 1 or NPC 2
        const npcChoice = Phaser.Math.Between(1, 2); // Choose either npc1 or npc2
    
        // Set sprite and animations based on the chosen NPC
        let spriteKey, idleAnim, walkAnim;
        if (npcChoice === 1) {
            spriteKey = "npc1_idle"; // NPC 1's idle sprite
            idleAnim = "npc1-idle"; // NPC 1's idle animation
            walkAnim = "npc1-walk"; // NPC 1's walk animation
        } else {
            spriteKey = "npc2_idle"; // NPC 2's idle sprite
            idleAnim = "npc2-idle"; // NPC 2's idle animation
            walkAnim = "npc2-walk"; // NPC 2's walk animation
        }
    
        const npc = {
            sprite: this.physics.add
                .sprite(x, y, spriteKey, randomFrame) // Use the randomFrame for initial frame
                .setCollideWorldBounds(true)
                .play(idleAnim), // Start with the idle animation for the chosen NPC
            isFollowing: false,
            isAlly: false,
    
            update: (player, allNpcs, playerMoving) => {
                const distanceToPlayer = Phaser.Math.Distance.Between(
                    npc.sprite.x,
                    npc.sprite.y,
                    player.x,
                    player.y
                );
    
                if (distanceToPlayer < 50 && !npc.isAlly) {
                    npc.isFollowing = true;
                    npc.isAlly = true;
                
                    console.log("Morrendo mais rápido! Pegou um NPC!");
                
                    // Calcule a nova duração com base no número de NPCs aliados
                    const baseDuration = 20000; // Duração base sem NPCs
                    const npcMultiplier = 500;  // Fator de multiplicação para diminuir o tempo com cada NPC aliado
                    
                    // Ajuste a duração com base no número de NPCs aliados
                    const Total = (npcMultiplier * allNpcs.filter((n) => n.isAlly).length);
                    console.log("Total:", Total);

                    const adjustedDuration = baseDuration - Total;
                    
                    
                    
                    // Se a duração do novo "tween" for diferente da anterior, pare o atual e crie um novo.
                    if (this.barTween) {
                        // Verifica se a duração foi alterada e atualiza o tween.
                        if (this.barTween.duration !== adjustedDuration) {
                            this.barTween.stop(); // Para a animação existente, mas somente se a duração for diferente
                            this.barTween = this.tweens.add({
                                targets: this.bar,
                                width: 0,
                                duration: adjustedDuration, // Usando a nova duração calculada
                                repeat: 0,
                                onComplete: () => {
                                    this.destroy();
                                    this.scene.start("GameOver");
                                },
                            });
                        }
                    } else {
                        // Caso não exista um tween ativo, cria um novo.
                        this.barTween = this.tweens.add({
                            targets: this.bar,
                            width: 0,
                            duration: newDuration,
                            repeat: 0,
                            onComplete: () => {
                                this.destroy();
                                this.scene.start("GameOver");
                            },
                        });
                    }
                }
                
    
                if (npc.isAlly && npc.isFollowing) {
                    const allies = allNpcs.filter((n) => n.isAlly);
                    const totalAllies = allies.length;
    
                    const index = allies.indexOf(npc);
                    const angle = (index / totalAllies) * Phaser.Math.PI2;
                    const radius = 100;
    
                    const targetX = player.x + radius * Math.cos(angle);
                    const targetY = player.y + radius * Math.sin(angle);
    
                    npc.sprite.x += (targetX - npc.sprite.x) * 0.1;
                    npc.sprite.y += (targetY - npc.sprite.y) * 0.1;
    
                    // Switch between walk and idle animations based on player movement
                    if (playerMoving) {
                        npc.sprite.anims.play(walkAnim, true); // Play walking animation
                    } else {
                        npc.sprite.anims.play(idleAnim, true); // Play idle animation
                    }
                }
            }
        };
    
        return npc;
    }
    
    
    spawnNPC() {
        const npcInstance = this.createNPC();
        this.npcs.push(npcInstance);
    }


    createLifeFood() {
        const x = Phaser.Math.Between(0, 3500);
        const y = Phaser.Math.Between(0, 3500);
    
        // Escolhe aleatoriamente entre 'life_food' e 'life_food2'
        const foodType = Phaser.Math.Between(0, 2) === 0 ? 'life_food' :
        Phaser.Math.Between(0, 1) === 0 ? 'life_food2' : 'life_food3';

        const food = this.physics.add.sprite(x, y, foodType).setDepth(1);
    
        return {
            sprite: food,
            update: (player) => {
                const distance = Phaser.Math.Distance.Between(
                    food.x,
                    food.y,
                    player.x,
                    player.y
                );
    
                if (distance < 50) {
                    if (this.bar.width !== 468) {
                        console.log("Comida coletada!");
    
                        food.destroy();
    
                        // Remove do array de comidas
                        this.lifeFood = this.lifeFood.filter(
                            (f) => f.sprite !== food
                        );
    
                        // Para o tween atual
                        this.barTween.stop();
    
                        console.log("Largura antes:", this.bar.width);
    
                        // Ajusta a largura da barra sem recriá-la
                        const newWidth = Math.min(
                            this.bar.width + (5 / 20) * 468,
                            468
                        );
                        this.bar.width = newWidth;
    
                        this.bar.displayWidth = newWidth;
                        console.log("Nova largura:", this.bar.width);
    
                        // Reinicia o tween ajustando o tempo restante
                        const newDuration = 20000 * (newWidth / 468);
    
                        this.barTween = this.tweens.add({
                            targets: this.bar,
                            width: 0,
                            duration: newDuration,
                            repeat: 0,
                            onComplete: () => {
                                this.destroy();
                                this.scene.start("GameOver");
                            },
                        });
                    }
                }
            },
        };
    }
    

    spawnLifeFood() {
        const lifeFoodInstance = this.createLifeFood();
        this.lifeFood.push(lifeFoodInstance);
    }
}

