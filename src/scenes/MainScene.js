export class MainScene extends Phaser.Scene {
  constructor() {
      super("MainScene");
      this.player = null;
      this.controls = null;
      this.npcs = [];
      this.bg2 = null;
      this.npcSpawnTimer = null;
      this.lifeFood = [];
      this.bar = null;
      this.barTween = null;
      this.score = 0;
      this.scoreText = null;
  }

  preload() {
      this.load.setPath("assets");
      this.load.spritesheet("mega_sprite", "animations/mega_sprite.png", {
          frameWidth: 98,
          frameHeight: 136,
      });
      this.load.image("bg2", "bg2.jpg");
      this.load.image("life_food", "life_food.png");
  }

  create() {
      // Background
      this.bg2 = this.add.image(0, 0, "bg2").setOrigin(0, 0);
      this.bg2.setDisplaySize(3500, 3500).setDepth(-1);

      // Survival bar
      this.add
          .rectangle(780, 32, 468, 32)
          .setStrokeStyle(1, 0xffffff)
          .setDepth(10)
          .setScrollFactor(0);

      this.bar = this.add
          .rectangle(780, 32, 468, 28, 0xffffff)
          .setDepth(10)
          .setScrollFactor(0);

      this.add
          .text(780, 30, "Barra de Sobrevivência", { color: "#000000" })
          .setDepth(10)
          .setScrollFactor(0);

      // Tween for survival bar
      this.barTween = this.tweens.add({
          targets: this.bar,
          width: 0,
          duration: 20000, // 20 seconds to deplete
          repeat: 0,
          onComplete: () => this.scene.start("GameOver"),
      });

      // Score
      this.scoreText = this.add
          .text(32, 32, `Score: ${this.score}`, {
              fontFamily: "Verdana",
              fontSize: 32,
              color: "#ffffff",
              stroke: "#000000",
              strokeThickness: 6,
          })
          .setDepth(1)
          .setScrollFactor(0);

      // Update score every second
      this.time.addEvent({
          delay: 1000,
          callback: () => this.updateScore(),
          loop: true,
      });

      // Player
      this.player = this.physics.add
          .sprite(1750, 1750, "mega_sprite")
          .setCollideWorldBounds(true)
          .setDepth(1);

      this.createAnimations();
      this.controls = this.createControls(300);

      // Camera
      this.cameras.main.setBounds(0, 0, 3500, 3500);
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setZoom(1);

      // NPCs
      for (let i = 0; i < 10; i++) {
          const npcInstance = this.createNPC();
          this.npcs.push(npcInstance);
      }

      this.npcSpawnTimer = this.time.addEvent({
          delay: 4000,
          callback: () => this.spawnNPC(),
          loop: true,
      });

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

      // Physics boundaries
      this.physics.world.setBounds(0, 0, 3500, 3500);
  }

  update() {
      this.controls.update();

      this.npcs.forEach((npc) => {
          npc.update(this.player, this.npcs, this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0);
      });

      this.lifeFood.forEach((food) => {
          food.update(this.player);
      });
  }

  updateScore() {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
  }

  createAnimations() {
      this.anims.create({
          key: "walk-right",
          frames: this.anims.generateFrameNumbers("mega_sprite", {
              start: 0,
              end: 5,
          }),
          frameRate: 8,
          repeat: -1,
      });
      this.anims.create({
          key: "walk-left",
          frames: this.anims.generateFrameNumbers("mega_sprite", {
              start: 0,
              end: 5,
          }),
          frameRate: 8,
          repeat: -1,
      });
      this.anims.create({
          key: "walk-down",
          frames: this.anims.generateFrameNumbers("mega_sprite", {
              start: 6,
              end: 11,
          }),
          frameRate: 8,
          repeat: -1,
      });
      this.anims.create({
          key: "walk-up",
          frames: this.anims.generateFrameNumbers("mega_sprite", {
              start: 12,
              end: 17,
          }),
          frameRate: 8,
          repeat: -1,
      });
  }

  createControls(speed) {
      const keys = this.input.keyboard.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      return {
          update: () => {
              let speedX = 0,
                  speedY = 0;
              let animKey = null;

              if (keys.left.isDown) {
                  speedX -= speed;
                  animKey = "walk-left";
                  this.player.setFlipX(false);
              }
              if (keys.right.isDown) {
                  speedX += speed;
                  animKey = "walk-right";
                  this.player.setFlipX(true);
              }
              if (keys.up.isDown) {
                  speedY -= speed;
                  animKey = "walk-up";
              }
              if (keys.down.isDown) {
                  speedY += speed;
                  animKey = "walk-down";
              }

              this.player.setVelocity(speedX, speedY);

              if (animKey) {
                  this.player.anims.play(animKey, true);
              } else {
                  this.player.anims.stop();
              }
          },
      };
  }

  createNPC() {
      const x = Phaser.Math.Between(0, 3500);
      const y = Phaser.Math.Between(0, 3500);
      const randomFrame = Phaser.Math.Between(0, 17);

      const npc = {
          sprite: this.physics.add
              .sprite(x, y, "mega_sprite", randomFrame)
              .setCollideWorldBounds(true),
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

                  const index = allies.indexOf(npc);
                  const angle = (index / totalAllies) * Phaser.Math.PI2;
                  const radius = 100;

                  const targetX = player.x + radius * Math.cos(angle);
                  const targetY = player.y + radius * Math.sin(angle);

                  npc.sprite.x += (targetX - npc.sprite.x) * 0.1;
                  npc.sprite.y += (targetY - npc.sprite.y) * 0.1;

                  if (playerMoving) {
                      npc.sprite.anims.play("walk-right", true);
                  } else {
                      npc.sprite.anims.play("walk-down", true);
                  }
              }
          },
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

    const food = this.physics.add.sprite(x, y, "life_food").setDepth(1);

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
                food.destroy();

                // Adiciona 5 segundos ao tempo de sobrevivência da barra
                this.barTween.stop();
                const remainingWidth = this.bar.width;
                this.bar.width = 468; // Reset survival bar to full
                this.barTween.restart({
                    duration: 20000 - (20 - remainingWidth / 468) * 20000, // adjust the duration to reflect the added time
                });
            }
        },
    };
}

  spawnLifeFood() {
      const lifeFoodInstance = this.createLifeFood();
      this.lifeFood.push(lifeFoodInstance);
  }
}
