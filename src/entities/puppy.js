const FLEE_DISTANCE = 300

export class Puppy {
  constructor(k, player, playerSpeed) {
    this.k = k
    this.player = player
    this.wanderSpeed = playerSpeed / 2
    this.fleeSpeed = playerSpeed * (3 / 4)
    this.direction = this.k.vec2(0, 0)
    this.wanderTimer = 0
    this.isAttracted = false
    this.isAsleep = false

    this.gameObject = k.add([
      k.sprite('puppy'),
      k.anchor('center'),
      k.pos(0, 0),
      k.area(),
      k.body(),
      'puppy',
    ])

    this.gameObject.onUpdate(() => this.update())
  }

  get pos() {
    return this.gameObject.pos
  }

  get width() {
    return this.gameObject.width
  }

  get height() {
    return this.gameObject.height
  }

  attract() {
    this.isAttracted = true
    this.isAsleep = false
  }

  sleep() {
    this.isAsleep = true
  }

  respawn(position) {
    this.wanderTimer = 0
    this.isAttracted = false
    this.isAsleep = false

    this.gameObject.pos = position
  }

  update() {
    if (this.isAsleep) return

    const dirToPlayer = this.player.pos.sub(this.gameObject.pos)
    const dist = dirToPlayer.len()
    let currentSpeed = this.wanderSpeed

    if (this.isAttracted) {
      this.direction = dirToPlayer.unit()
      currentSpeed = this.fleeSpeed // Use fleeSpeed to run towards player
    } else if (dist < FLEE_DISTANCE) {
      this.direction = dirToPlayer.scale(-1).unit()
      currentSpeed = this.fleeSpeed
    } else {
      this.wanderTimer -= this.k.dt()
      if (this.wanderTimer <= 0) {
        this.direction = this.k.vec2(this.k.rand(-1, 1), this.k.rand(-1, 1)).unit()
        this.wanderTimer = this.k.rand(1, 3)
      }
    }

    this.gameObject.move(this.direction.scale(currentSpeed))
  }
}
