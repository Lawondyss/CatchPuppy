const SAFE_DISTANCE = 50
const MAX_BUSHES = 40 // Keep pool size high for denser layouts
const START_COVERAGE = 0.25

export class Bushes {
  constructor(k, WALL_THICKNESS) {
    this.k = k
    this.WALL_THICKNESS = WALL_THICKNESS
    this.pool = []
    this.bushWidth = 0
    this.bushHeight = 0
    this.visualBushArea = 0

    for (let i = 0; i < MAX_BUSHES; i++) {
      const bush = k.add([
        k.sprite('bush'),
        k.anchor('center'),
        k.pos(-200, -200),
        k.area({ scale: 0.8 }),
        k.body({ isStatic: true }),
        'bush',
      ])
      this.pool.push(bush)
    }

    if (this.pool.length > 0) {
      const sampleBush = this.pool[0]
      this.bushWidth = sampleBush.width
      this.bushHeight = sampleBush.height
      this.visualBushArea = sampleBush.width * sampleBush.height
    }
  }

  _shuffle(array) {
    let currentIndex = array.length, randomIndex
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ]
    }
    return array
  }

  regenerate(player, puppy, difficulty = 0) {
    this.pool.forEach(bush => {
      bush.pos = this.k.vec2(-200, -200)
    })

    if (this.visualBushArea === 0) return

    // 1. Define a smaller grid cell size to allow for overlapping, creating a maze-like effect.
    const gridCellWidth = this.bushWidth * 0.8
    const gridCellHeight = this.bushHeight * 0.8
    const playableWidth = this.k.width() - this.WALL_THICKNESS * 2
    const playableHeight = this.k.height() - this.WALL_THICKNESS * 2

    // 2. Create a list of all possible grid positions
    const gridPositions = []
    for (let x = this.WALL_THICKNESS; x < playableWidth - gridCellWidth; x += gridCellWidth) {
      for (let y = this.WALL_THICKNESS; y < playableHeight - gridCellHeight; y += gridCellHeight) {
        const pos = this.k.vec2(x + this.bushWidth / 2, y + this.bushHeight / 2)
        if (pos.dist(player.pos) > SAFE_DISTANCE && pos.dist(puppy.pos) > SAFE_DISTANCE) {
          gridPositions.push(pos)
        }
      }
    }

    // 3. Shuffle the list of valid positions
    const shuffledPositions = this._shuffle(gridPositions)

    // 4. Calculate how many bushes to place. This is now more of a density metric.
    const playableArea = playableWidth * playableHeight
    const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
    let numBushesToPlace = Math.floor(targetCoverageArea / this.visualBushArea)
    numBushesToPlace = Math.min(numBushesToPlace, this.pool.length, shuffledPositions.length)

    // 5. Place the bushes on the selected grid spots
    for (let i = 0; i < numBushesToPlace; i++) {
      const bush = this.pool[i]
      bush.pos = shuffledPositions[i]
    }
  }
}
