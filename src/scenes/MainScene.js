import { Scene } from 'phaser';
import Controls from '../utils/controls';
import NPC from '../utils/npc';


export class MainScene extends Scene {
  player;
  controls;
  npcs = [];

  constructor() {
    super('MainScene');
  }

  preload() {
    //this.load.setBaseURL('http://localhost:5173/');
    this.load.setPath('assets');
    this.load.spritesheet('walk-up', 'animations/walk-up.png', {
        frameWidth: 98,
        frameHeight: 136,
      });
  }

  create() {
    this.player = this.physics.add.sprite(400, 500, 'walk-up').setCollideWorldBounds(true);   
    this.anims.create({
      key: 'wup',
      frames: this.anims.generateFrameNumbers('walk-up', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    this.controls = new Controls(this,/* this.player,*/ 300);
    //this.controls.create();


    for (let i = 0; i < 10; i++) {
      const npcInstance = new NPC(this, Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
      this.npcs.push(npcInstance);
    }
  }

  update() {
    this.controls.update();

    this.npcs.forEach(npc => {
      npc.update(this.player, this.npcs);
    });
  }
}
