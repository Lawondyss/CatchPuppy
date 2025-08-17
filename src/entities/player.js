export class Player {
  constructor(k, speed) {
    this.k = k
    this.speed = speed
    this.gameObject = k.add([
      k.sprite('bean'),
      k.pos(k.width() / 2, k.height() / 2),
      k.area(),
      k.body(),
      'player',
    ])

    this.setupMovement()
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
  }

  onCollide(tag, callback) {
    this.gameObject.onCollide(tag, callback)
  }

  get pos() {
    return this.gameObject.pos
  }
}
