export default class cam {
  constructor(scene, x, y) {
    this.cam = scene.cameras.main;
    this.cam.startFollow(this.sprite);
  }

  getSprite() {
    return this.sprite;
  }
}