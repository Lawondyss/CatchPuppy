import { GameStore } from '../libs/store.js'
import { Player } from '../entities/player.js'
import { Puppy } from '../entities/puppy.js'
import { Background } from '../libs/background.js'
import { Button } from '../libs/button.js'
import { Bushes } from '../world/bushes.js'

const PUPPY_FLEE_DISTANCE = 200

export function createGameScene(k, SPEED, START_TIMER) {
  const emitParticles = (pos) => k.add([
    k.pos(pos),
    k.particles({
      max: 100,
      speed: [100, 200],
      lifeTime: [2, 3],
      angle: [0, 360],
      opacities: [1.0, 0.0],
    }, {
      direction: 0,
      spread: 360,
    }),
  ]).emit(20)

  k.scene('game', () => {
    GameStore.score = 0
    let difficulty = 0
    let timer = START_TIMER

    const background = new Background(k)
    background.setRandomColor()

    const bushes = new Bushes(k)
    bushes.regenerate()

    const scoreLabel = new Button(k, `Chycen: ${GameStore.score}`, {
      pos: k.vec2(k.width() / 2 - 200, 20),
    })
    const timerLabel = new Button(k, `Zbývající čas: ${timer}`, {
      pos: k.vec2(k.width() / 2, 20),
    })

    const player = new Player(k, SPEED, k.choose(bushes.freePositions))
    const puppy = new Puppy(k, player, SPEED)

    background.setRandomColor()

    player.onCollide('puppy', () => {
      emitParticles(player.pos)

      const minSpawnDistance = PUPPY_FLEE_DISTANCE * 1.2
      const maxSpawnDistance = PUPPY_FLEE_DISTANCE * 2.0

      let spawnPos = null
      let attempts = 0
      while (!spawnPos && attempts < 50) {
        attempts++
        const candidatePos = k.rand(
          k.vec2(puppy.width, puppy.height),
          k.vec2(k.width() - puppy.width, k.height() - puppy.height)
        )

        const distToPlayer = candidatePos.dist(player.pos)

        if (distToPlayer < minSpawnDistance || distToPlayer > maxSpawnDistance) {
          continue
        }

        if (!bushes.isFreePosition(candidatePos)) {
          continue
        }

        spawnPos = candidatePos
      }

      puppy.respawn(spawnPos)

      GameStore.score++
      scoreLabel.labelText = `Chycen: ${GameStore.score}`

      if (GameStore.score > 0 && GameStore.score % 5 === 0) {
        difficulty++
      }

      timer = Math.max(1, START_TIMER - difficulty)
      background.setRandomColor()
      bushes.regenerate(difficulty, player.pos)
    })

    k.onUpdate(() => {
      timer -= k.dt()
      timerLabel.labelText = `Zbývající čas: ${Math.round(timer)}`
      if (timer <= 0) {
        k.go('lose')
      }
    })
  })
}
