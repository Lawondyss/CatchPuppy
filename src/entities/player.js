export class Player {
  constructor(k, speed, pos) {
    this.k = k
    this.speed = speed
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

    let startPos = null
    let movePos = null

    this.k.onTouchStart((pos, t) => {
      startPos = pos
    })

    this.k.onTouchMove((pos, t) => {
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

  onCollide(tag, callback) {
    this.gameObject.onCollide(tag, callback)
  }
}
