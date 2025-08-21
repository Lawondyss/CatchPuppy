import { Biscuit } from './biscuit.js'
import { Pillow } from './pillow.js'

export class Powerups {
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
