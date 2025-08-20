import { createAnimations } from '../libs/animations.js'

export class Biscuit {
  constructor(k, player, puppy, position) {
    this.k = k
    this.player = player
    this.puppy = puppy
    this.gameObject = k.add([
      k.sprite('biscuit'),
      k.pos(position),
      k.area(),
      k.anchor('center'),
      'powerup',
      'biscuit',
    ])

    this.animations = createAnimations(k)

    this.gameObject.onCollide('player', () => this.activate())
  }

  activate() {
    this.puppy.attract(5)

    this.animations.showShout('Piškot!', this.player.pos.add(0, -50))

    this.k.destroy(this.gameObject)
  }
}
