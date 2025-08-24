/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('./player.js').Player} Player
 */

const FLEE_DISTANCE = 300

export class Puppy {
  static States = {
    Wander: Symbol('wander'),
    Flee: Symbol('flee'),
    Attract: Symbol('attract'),
    Sleep: Symbol('sleep'),
  }

  /**
   * @param {KaplayCtx} k
   * @param {Player} player
   * @param {number} playerSpeed
   */
  constructor(k, player, playerSpeed) {
    this.k = k
    this.player = player
    this.speed = {
      wander: playerSpeed / 2,
      flee: playerSpeed * (3 / 4),
      attract: playerSpeed,
    }
    this.state = Puppy.States.Wander
    this.wanderTimer = 0
    this.direction = null

    this.gameObject = k.add([
      k.sprite('puppy'),
      k.anchor('center'),
      k.pos(0, 0),
      k.area(),
      k.body(),
      'puppy',
    ])

    this.gameObject.onUpdate(() => this._update())
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
    this.state = Puppy.States.Attract
  }

  sleep() {
    this.state = Puppy.States.Sleep
  }

  /**
   * @param {{pos: Vec2, x: number, y: number}} position
   */
  respawn(position) {
    this.wanderTimer = 0
    this.state = Puppy.States.Wander

    this.gameObject.moveTo(position.pos)
  }

  _update() {
    const dirToPlayer = this.player.pos.sub(this.gameObject.pos)
    let speed

    if ([
      Puppy.States.Attract,
      Puppy.States.Sleep,
    ].includes(this.state)) {
      // Nothing changes
    } else if (this.gameObject.pos.dist(this.player.pos) < FLEE_DISTANCE) {
      this.state = Puppy.States.Flee
    } else {
      this.state = Puppy.States.Wander
    }

    switch (this.state) {
      case Puppy.States.Sleep:
        this.direction = speed = null
        break
      case Puppy.States.Attract:
        this.direction = dirToPlayer.unit()
        speed = this.speed.attract
        break
      case Puppy.States.Flee:
        this.direction = dirToPlayer.scale(-1).unit()
        speed = this.speed.flee
        break
      case Puppy.States.Wander:
        this.wanderTimer -= this.k.dt()
        speed = this.speed.wander

        if (this.wanderTimer <= 0) {
          this.wanderTimer = this.k.rand(1, 4)
          this.direction = this.k.vec2(this.k.rand(-1, 1), this.k.rand(-1, 1)).unit()
        }
    }

    this.direction && speed && this.gameObject.move(this.direction.scale(speed))
  }
}
