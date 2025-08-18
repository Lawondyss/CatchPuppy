const FLEE_DISTANCE = 300

export class Puppy {
  constructor(k, WALL_THICKNESS, player, playerSpeed) {
    this.k = k
    this.WALL_THICKNESS = WALL_THICKNESS
    this.player = player
    this.wanderSpeed = playerSpeed / 2
    this.fleeSpeed = playerSpeed * (3 / 4)
    this.direction = this.k.vec2(0, 0)
    this.wanderTimer = 0

    this.gameObject = k.add([
      k.sprite('puppy'),
      k.anchor('center'),
      k.pos(0, 0),
      k.area(),
      k.body(),
      'puppy',
    ])

    this.respawn()
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

  respawn(position) {
    if (position) {
      this.gameObject.pos = position
    } else {
      // Fallback to random position if no specific one is given
      this.gameObject.pos = this.k.rand(
        this.k.vec2(this.WALL_THICKNESS, this.WALL_THICKNESS),
        this.k.vec2(
          this.k.width() - this.WALL_THICKNESS - this.gameObject.width,
          this.k.height() - this.WALL_THICKNESS - this.gameObject.height
        )
      )
    }
  }

  update() {
    const dirToPlayer = this.player.pos.sub(this.gameObject.pos)
    const dist = dirToPlayer.len()
    let currentSpeed = this.wanderSpeed

    if (dist < FLEE_DISTANCE) {
      this.direction = dirToPlayer.scale(-1).unit()
      currentSpeed = this.fleeSpeed;
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
