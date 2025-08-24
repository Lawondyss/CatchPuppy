/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 */

export class Background {
  /**
   * @param {KaplayCtx} k
   */
  constructor(k) {
    this.k = k
    this.gameObject = k.add([
      k.rect(k.width(), k.height()),
      k.color(255, 255, 255),
      k.z(-1),
    ])
  }

  setRandomColor() {
    const h = this.k.rand(0, 1)
    const s = this.k.rand(0.7, 1)
    const l = 0.9
    this.gameObject.color = this.k.hsl2rgb(h, s, l)
  }
}
