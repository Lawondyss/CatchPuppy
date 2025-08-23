/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('kaplay').GameObj} GameObj
 */

export class Player {
  /**
   * @param {KaplayCtx} k
   * @param {number} speed
   * @param {Vec2} pos
   */
  constructor(k, speed, pos) {
    this.k = k
    this.speed = speed
    /** @type {GameObj} */
    this.gameObject = k.add([
      k.sprite('girl'),
      k.anchor('center'),
      k.pos(pos),
      k.area({ scale: 0.9 }),
      k.body(),
      'player',
    ])

    this.setupMovement()
  }

  get pos() {
    return this.gameObject.pos
  }

  setupMovement() {
    this.k.onKeyDown('left', () => {
      this.gameObject.move(-this.speed, 0)
    })

    this.k.onKeyDown('right', () => {
      this.gameObject.move(this.speed, 0)
    })

    this.k.onKeyDown('up', () => {
      this.gameObject.move(0, -this.speed)
    })

    this.k.onKeyDown('down', () => {
      this.gameObject.move(0, this.speed)
    })

    /** @type {Vec2 | null} */
    let startPos = null
    /** @type {Vec2 | null} */
    let movePos = null

    this.k.onTouchStart((pos) => {
      startPos = pos
    })

    this.k.onTouchMove((pos) => {
      movePos = pos
    })

    this.k.onTouchEnd(() => {
      startPos = null
      movePos = null
    })

    this.k.onUpdate(() => {
      if (!startPos || !movePos) return
      const delta = movePos.sub(startPos).unit()
      const dir = this.k.vec2(this.speed * delta.x, this.speed * delta.y)
      this.gameObject.move(dir)
    })
  }

  /**
   * @param {string} tag
   * @param {(obj: GameObj) => void} callback
   */
  onCollide(tag, callback) {
    this.gameObject.onCollide(tag, callback)
  }
}
