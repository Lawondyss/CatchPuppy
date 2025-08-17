export class Player {
  constructor(k, speed) {
    this.k = k
    this.speed = speed
    this.gameObject = k.add([
      k.sprite('girl'),
      k.anchor('center'),
      k.pos(k.width() / 2, k.height() / 2),
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

    this.k.onTouchStart((pos, t) => {
      startPos = pos
    })

    this.k.onTouchMove((pos, t) => {
      if (!startPos) return
      //const delta = pos.sub(startPos)
      const delta = pos.sub(startPos).unit()
      const dir = this.k.vec2(this.speed * delta.x, this.speed * delta.y)
      this.gameObject.move(dir)
    })

    this.k.onTouchEnd(() => {
      startPos = null
    })
  }

  onCollide(tag, callback) {
    this.gameObject.onCollide(tag, callback)
  }
}
