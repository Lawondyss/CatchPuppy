import { GameStore } from '../libs/store.js'
import { Player } from '../entities/player.js'
import { Puppy } from '../entities/puppy.js'
import { Walls } from '../world/walls.js'
import { Background } from '../libs/background.js'
import { Text } from '../libs/text.js'
import { Bushes } from '../world/bushes.js'

export function createGameScene(k, SPEED, WALL_THICKNESS, START_TIMER) {
  k.scene('game', () => {
    GameStore.score = 0
    let timeLimit = START_TIMER
    let timer = timeLimit

    const background = new Background(k)
    const bushes = new Bushes(k, WALL_THICKNESS)

    new Walls(k, WALL_THICKNESS)

    const scoreLabel = new Text(k, 'Chycen: ' + GameStore.score, {
      pos: k.vec2(24, 24),
    })

    const timerLabel = new Text(k, 'Čas: ' + timer, {
      pos: k.vec2(24, 60),
    })

    const player = new Player(k, SPEED)
    const puppy = new Puppy(k, WALL_THICKNESS, player, SPEED)

    background.setRandomColor()
    bushes.regenerate(player, puppy)

    player.onCollide('puppy', () => {
      k.addKaboom(player.pos)
      
      // Simple respawn - puppy handles its own random position
      puppy.respawn()
      
      GameStore.score++
      scoreLabel.text = 'Chycen: ' + GameStore.score

      if (GameStore.score > 0 && GameStore.score % 5 === 0) {
        timeLimit = Math.max(1, timeLimit - 1)
      }

      timer = timeLimit
      background.setRandomColor()
      bushes.regenerate(player, puppy)
    })

    k.onUpdate(() => {
      timer -= k.dt()
      timerLabel.text = 'Čas: ' + Math.round(timer)
      if (timer <= 0) {
        k.go('lose')
      }
    })
  })
}
