const FLEE_DISTANCE = 300

export class Puppy {
  constructor(k, player, playerSpeed) {
    this.k = k
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

    this.gameObject.pos = position ?? this._findPosition()
  }

  update() {
    const dirToPlayer = this.player.pos.sub(this.gameObject.pos)
    const dist = dirToPlayer.len()
    let currentSpeed = this.wanderSpeed

    if (dist < FLEE_DISTANCE) {
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

  _findPosition() {
    const angle = this.k.rand(0, 2 * Math.PI)
    const distance = this.k.rand(FLEE_DISTANCE * 1.2, FLEE_DISTANCE * 2)
    const offset = this.k.vec2(Math.cos(angle), Math.sin(angle)).scale(distance)
    let positon = this.player.pos.add(offset)

    // Ensure the puppy spawns within the game boundaries
    positon.x = this.k.clamp(
      positon.x,
      this.width,
      this.k.width() - this.width
    )
    positon.y = this.k.clamp(
      positon.y,
      this.height,
      this.k.height() - this.height
    )

    return positon
  }
}
