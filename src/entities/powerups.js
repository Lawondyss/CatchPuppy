/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('./player.js').Player} Player
 * @typedef {import('./puppy.js').Puppy} Puppy
 * @typedef {import('../world/bushes.js').Bushes} Bushes
 */

import { Biscuit } from './biscuit.js'
import { Pillow } from './pillow.js'

export class Powerups {
  /**
   * @param {KaplayCtx} k
   * @param {Player} player
   * @param {Puppy} puppy
   * @param {Bushes} bushes
   */
  constructor(k, player, puppy, bushes) {
    this.k = k
    this.player = player
    this.puppy = puppy
    this.bushes = bushes
    this.availablePowerups = [Biscuit, Pillow]
  }

  spawn() {
    const PowerupToSpawn = this.k.choose(this.availablePowerups)

    if (this.k.get('powerup').length >= 5) return

    const spawnPos = this.k.choose(this.bushes.freePositions)

    if (spawnPos) {
      new PowerupToSpawn(this.k, this.player, this.puppy, spawnPos)
    }
  }
}
