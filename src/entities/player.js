/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('kaplay').GameObj} GameObj
 */

export class Player {
  /**
   * @param {KaplayCtx} k
   * @param {number} speed
   * @param {{pos: Vec2, x: number, y: number}} position
   */
  constructor(k, speed, position) {
    this.k = k
    this.speed = speed
    this.gameObject = k.add([
      k.sprite('girl'),
      k.anchor('center'),
      k.pos(position.pos),
      k.area({ scale: 0.9 }),
      k.body(),
      'player',
    ])

    this._setupMovement()
  }

  /**
   * @readonly
   * @returns {Vec2}
   */
  get pos() {
    return this.gameObject.pos
  }

  /**
   * @param {string} tag
   * @param {(obj: GameObj) => void} callback
   */
  onCollide(tag, callback) {
    this.gameObject.onCollide(tag, callback)
  }

  _setupMovement() {
    this._setupKeyboard()
    this._setupTouch()
    this._setupDeviceOrientation()
  }

  _setupKeyboard() {
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
  }

  _setupTouch() {
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

    this.k.onUpdate(() => startPos && movePos && this.gameObject.move(
        movePos.sub(startPos).unit().scale(this.speed)
    ))
  }

  _setupDeviceOrientation() {
    let tiltVec = this.k.vec2(0, 0)

    const onDeviceMove = (evt) => {
      tiltVec = (evt.gamma == null || evt.beta == null)
        ? this.k.vec2(0, 0)
        : this.k.vec2(evt.gamma, evt.beta)
    }

    window.addEventListener('deviceorientation', onDeviceMove)

    this.k.onCleanup(() => window.removeEventListener('deviceorientation', onDeviceMove))

    this.k.onUpdate(() => {
      const threshold = 10

      tiltVec.len() > threshold && this.gameObject.move(tiltVec.unit().scale(this.speed))
    })
  }
}
