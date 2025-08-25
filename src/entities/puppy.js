/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('./player.js').Player} Player
 * @typedef {import('../world/bushes.js').Bushes} Bushes
 */

import { Config } from '../config.js'
import { Pathfinding } from '../world/pathfinding.js'

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
   * @param {Bushes} bushes
   */
  constructor(k, player, playerSpeed, bushes) {
    this.k = k
    this.player = player
    this.bushes = bushes
    this.speed = {
      wander: playerSpeed / 2,
      flee: playerSpeed * (3 / 4),
      attract: playerSpeed,
    }
    this.state = Puppy.States.Wander
    this.wanderTimer = 0
    this.direction = null

    /** @type {Vec2[] | null} */
    this.path = null
    this.pathUpdateTimer = 0

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

  /**
   * @param {Bushes} bushes
   */
  updateMap(bushes) {
    this.path = null
  }

  attract() {
    if (this.state === Puppy.States.Attract) return

    this.path = null
    this.state = Puppy.States.Attract
  }

  sleep() {
    if (this.state === Puppy.States.Sleep) return

    this.path = null
    this.state = Puppy.States.Sleep
  }

  /**
   * @param {{pos: Vec2, x: number, y: number}} position
   */
  respawn(position) {
    this.wanderTimer = 0
    this.state = Puppy.States.Wander
    this.path = null
    this.gameObject.moveTo(position.pos)
  }

  _update() {
    const dirToPlayer = this.player.pos.sub(this.gameObject.pos)
    let speed

    const oldState = this.state
    // State transition logic
    if (this.state !== Puppy.States.Attract && this.state !== Puppy.States.Sleep) {
      if (this.gameObject.pos.dist(this.player.pos) < Config.PuppyFleeDistance) {
        this.state = Puppy.States.Flee
      } else {
        this.state = Puppy.States.Wander
      }
    }
    // Clear path if state has changed
    if (this.state !== oldState) {
      this.path = null
    }

    switch (this.state) {
      case Puppy.States.Sleep:
        this.direction = null
        speed = 0
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
        break
      case Puppy.States.Attract:
        this.pathUpdateTimer -= this.k.dt()
        if (this.pathUpdateTimer <= 0) {
          this.pathUpdateTimer = 0.5 // Recalculate path every 0.5s
          const newPath = new Pathfinding(this.bushes).findPath(this.pos, this.player.pos)

          // If a new valid path is found, use it.
          if (newPath && newPath.length > 1) {
            newPath.shift()
            this.path = newPath
          } else {
            this.path = null // No valid path found
          }
        }

        if (this.path && this.path.length > 0) {
          const nextPoint = this.path[0]
          this.direction = nextPoint.sub(this.pos).unit()
          speed = this.speed.attract

          // If close to the next point in the path, move to the next one
          if (this.pos.dist(nextPoint) < 10) {
            this.path.shift()
          }
        } else {
          // Fallback: if no path, move directly towards player
          this.direction = dirToPlayer.unit()
          speed = this.speed.attract
        }
        break
    }

    if (this.direction && speed) {
      this.gameObject.move(this.direction.scale(speed))
    }
  }
}
