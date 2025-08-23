/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('./player.js').Player} Player
 * @typedef {import('./puppy.js').Puppy} Puppy
 */

import { createAnimations } from '../libs/animations.js'

export class Pillow {
  /**
   * @param {KaplayCtx} k
   * @param {Player} player
   * @param {Puppy} puppy
   * @param {Vec2} position
   */
  constructor(k, player, puppy, position) {
    this.k = k
    this.player = player
    this.puppy = puppy
    this.gameObject = k.add([
      k.sprite('pillow'),
      k.pos(position),
      k.area(),
      k.anchor('center'),
      'powerup',
      'pillow',
    ])

    this.animations = createAnimations(k)

    this.gameObject.onCollide('player', () => this.activate())
  }

  activate() {
    this.puppy.sleep()

    this.animations.showShout('Šlofíček!', this.player.pos.add(0, -50))

    this.k.destroy(this.gameObject)
  }
}
