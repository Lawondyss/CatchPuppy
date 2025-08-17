import { GameStore } from '../libs/store.js'
import { Player } from '../entities/player.js'
import { Puppy } from '../entities/puppy.js'
import { Walls } from '../world/walls.js'
import { Background } from '../libs/background.js'
import { Text } from '../libs/text.js'
import { Bushes } from '../world/bushes.js'

const PUPPY_FLEE_DISTANCE = 200;
const BUSH_SAFE_DISTANCE = 30;


export function createGameScene(k, SPEED, WALL_THICKNESS, START_TIMER) {
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
    let timeLimit = START_TIMER
    let timer = timeLimit

    const background = new Background(k)
    const bushes = new Bushes(k, WALL_THICKNESS)

    new Walls(k, WALL_THICKNESS)

    const scoreLabel = new Text(k, 'Chycen: ' + GameStore.score, {
      pos: k.vec2(k.width() / 2 - 200, 20),
    })

    const timerLabel = new Text(k, 'Zbývající čas: ' + timer, {
      pos: k.vec2(k.width() / 2, 20),
    })

    const player = new Player(k, SPEED)
    const puppy = new Puppy(k, WALL_THICKNESS, player, SPEED)

    background.setRandomColor()
    bushes.regenerate(player, puppy)

    player.onCollide('puppy', () => {
      emitParticles(player.pos)
      
      // Define the new spawn range based on flee distance
      const minSpawnDistance = PUPPY_FLEE_DISTANCE * 1.2;
      const maxSpawnDistance = PUPPY_FLEE_DISTANCE * 2.0;

      let spawnPos = null;
      let attempts = 0;
      while (!spawnPos && attempts < 50) {
          attempts++;
          const candidatePos = k.rand(
              k.vec2(
                  WALL_THICKNESS + puppy.width,
                  WALL_THICKNESS + puppy.height
              ),
              k.vec2(
                  k.width() - WALL_THICKNESS - puppy.width,
                  k.height() - WALL_THICKNESS - puppy.height
              )
          );

          const distToPlayer = candidatePos.dist(player.pos);

          // Check if the position is within the desired range
          if (distToPlayer < minSpawnDistance || distToPlayer > maxSpawnDistance) {
              continue;
          }

          // Check if the position is inside a bush
          const isInsideBush = bushes.pool.some(bush => 
              bush.pos.x > 0 && // only check active bushes
              candidatePos.dist(bush.pos) < BUSH_SAFE_DISTANCE
          );

          if (!isInsideBush) {
              spawnPos = candidatePos;
          }
      }

      puppy.respawn(spawnPos) // Pass the calculated position (or null as fallback)
      
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
      timerLabel.text = 'Zbývající čas: ' + Math.round(timer)
      if (timer <= 0) {
        k.go('lose')
      }
    })
  })
}
