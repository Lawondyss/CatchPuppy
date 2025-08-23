/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('../entities/player.js').Player} Player
 * @typedef {import('../entities/puppy.js').Puppy} Puppy
 * @typedef {import('../world/bushes.js').Bushes} Bushes
 */

import { GameStore } from '../libs/store.js'
import { Player } from '../entities/player.js'
import { Puppy } from '../entities/puppy.js'
import { Background } from '../libs/background.js'
import { Button } from '../libs/button.js'
import { Bushes } from '../world/bushes.js'
import { Powerups } from '../entities/powerups.js'
import { createAnimations } from '../libs/animations.js'

const PUPPY_FLEE_DISTANCE = 200

/**
 * @param {KaplayCtx} k
 * @param {Player} player
 * @param {Puppy} puppy
 * @param {Bushes} bushes
 */
function respawnPuppy(k, player, puppy, bushes) {
  const minSpawnDistance = PUPPY_FLEE_DISTANCE * 1.2
  const maxSpawnDistance = PUPPY_FLEE_DISTANCE * 2.0

  const validSpawnPositions = bushes.freePositions.filter((p) => {
    const dist = p.dist(player.pos)
    return dist > minSpawnDistance && dist < maxSpawnDistance
  })

  const spawnPos = k.choose(
    validSpawnPositions.length > 0 ? validSpawnPositions : bushes.freePositions
  )
  puppy.respawn(spawnPos)
}

/**
 * @param {KaplayCtx} k
 * @param {number} SPEED
 * @param {number} START_TIMER
 */
export function createGameScene(k, SPEED, START_TIMER) {
  k.scene('game', () => {
    GameStore.score = 0
    let difficulty = 0
    let timer = START_TIMER

    const animations = createAnimations(k)

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
    const powerups = new Powerups(k, player, puppy, bushes)

    k.loop(k.rand(10, 15), () => powerups.spawn())
    respawnPuppy(k, player, puppy, bushes)

    player.onCollide('puppy', () => {
      animations.emitParticles(player.pos)

      GameStore.score++
      scoreLabel.labelText = `Chycen: ${GameStore.score}`

      if (GameStore.score > 0 && GameStore.score % 5 === 0) {
        difficulty++
      }

      timer = Math.max(1, START_TIMER - difficulty)
      background.setRandomColor()
      bushes.regenerate(difficulty, player.pos)
      respawnPuppy(k, player, puppy, bushes)
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
