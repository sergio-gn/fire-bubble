export default class NPC {
  constructor(scene, texture, speed = 100) {
    const x = Phaser.Math.Between(0, scene.scale.width);
    const y = Phaser.Math.Between(0, scene.scale.height);

    this.sprite = scene.physics.add.image(x, y, texture);
    this.sprite.setCollideWorldBounds(true);

    this.speed = speed;
    this.isFollowing = false;
    this.isAlly = false;
  }

  update(player, allNpcs) {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      player.x,
      player.y
    );

    if (distance < 40 && !this.isAlly) {
      this.isFollowing = true;
      this.isAlly = true;
    }

    if (this.isAlly && this.isFollowing) {
      const allies = allNpcs.filter(npc => npc.isAlly);
      const totalAllies = allies.length;
      const angle = (allies.indexOf(this) / totalAllies) * Phaser.Math.PI2;
      const radius = 100;

      this.sprite.x = player.x + radius * Math.cos(angle);
      this.sprite.y = player.y + radius * Math.sin(angle);
    }
  }

}
