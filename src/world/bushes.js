const SAFE_DISTANCE = 50
const MAX_BUSHES = 40 // Keep pool size high for denser layouts
const START_COVERAGE = 0.25

export class Bushes {
  constructor(k, WALL_THICKNESS) {
    this.k = k
    this.WALL_THICKNESS = WALL_THICKNESS
    this.pool = []
    this.borderEntities = []
    this.bushWidth = 0
    this.bushHeight = 0
    this.visualBushArea = 0

    this._initPool()

    const sampleBush = this.pool[0]
    this.bushWidth = sampleBush.width
    this.bushHeight = sampleBush.height
    this.visualBushArea = sampleBush.width * sampleBush.height
  }


  regenerate(player, puppy, difficulty = 0) {
    this.pool.forEach(bush => {
      bush.pos = this.k.vec2(-200, -200)
    })

    if (this.visualBushArea === 0) return

    // Compute playable area: include walls so bushes can reach edges (some may be partially off-screen)
    const playableWidth = this.k.width()
    const playableHeight = this.k.height()

    // Use separate cell width/height based on bush dimensions. Keep original smaller multiplier
    // (0.8) so bushes can slightly overlap and avoid gaps; do not increase padding.
    const cellWidth = Math.max(8, this.bushWidth * 0.8)
    const cellHeight = Math.max(8, this.bushHeight * 0.8)

    // Compute number of cells that fit vertically and horizontally to cover full area
    let cols = Math.ceil(playableWidth / cellWidth)
    let rows = Math.ceil(playableHeight / cellHeight)
    if (cols < 3 || rows < 3) {
      // Fallback to original loose grid when playable area too small for maze
      const gridCellWidth = this.bushWidth * 0.8
      const gridCellHeight = this.bushHeight * 0.8
      const gridPositions = []
      // start at 0 so bushes can be placed up to the very edge (may overlap walls)
      for (let x = 0; x < playableWidth - gridCellWidth; x += gridCellWidth) {
        for (let y = 0; y < playableHeight - gridCellHeight; y += gridCellHeight) {
          const pos = this.k.vec2(x + this.bushWidth / 2, y + this.bushHeight / 2)
          if (pos.dist(player.pos) > SAFE_DISTANCE && pos.dist(puppy.pos) > SAFE_DISTANCE) {
            gridPositions.push(pos)
          }
        }
      }
      const shuffledPositions = this._shuffle(gridPositions)
      const playableArea = playableWidth * playableHeight
      const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
      let numBushesToPlace = Math.floor(targetCoverageArea / this.visualBushArea)
      numBushesToPlace = Math.min(numBushesToPlace, this.pool.length, shuffledPositions.length)
      for (let i = 0; i < numBushesToPlace; i++) {
        const bush = this.pool[i]
        bush.pos = shuffledPositions[i]
      }
      return
    }

    // Ensure odd dimensions for the maze algorithm; prefer expanding to fill edges
    if ((cols % 2) === 0) cols++
    if ((rows % 2) === 0) rows++

    // Generate maze map and turn into level map where '#' are fence cells
    const levelMap = this._createMazeLevelMap(cols, rows)

    // Center maze so clipping at opposite edges is symmetric; allow negative offsets when
    // the maze is slightly larger than the canvas so both sides show the same partial bush.
    const offsetX = Math.floor((playableWidth - cols * cellWidth) / 2)
    const offsetY = Math.floor((playableHeight - rows * cellHeight) / 2)

    // Collect fence cell positions
    const fencePositions = []
    for (let r = 0; r < rows; r++) {
      const line = levelMap[r]
      for (let c = 0; c < cols; c++) {
        if (line[c] === '#') {
          const x = offsetX + c * cellWidth + cellWidth / 2
          const y = offsetY + r * cellHeight + cellHeight / 2
          const pos = this.k.vec2(x, y)
          if (pos.dist(player.pos) > SAFE_DISTANCE && pos.dist(puppy.pos) > SAFE_DISTANCE) {
            fencePositions.push(pos)
          }
        }
      }
    }

    // Determine target number of bushes by coverage
    const playableArea = playableWidth * playableHeight
    const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
    let coverageNum = Math.floor(targetCoverageArea / this.visualBushArea)

    // Build perimeter positions (always consider full border of maze grid)
    const topY = offsetY + cellHeight / 2
    const bottomY = offsetY + (rows - 1) * cellHeight + cellHeight / 2
    const leftX = offsetX + cellWidth / 2
    const rightX = offsetX + (cols - 1) * cellWidth + cellWidth / 2

    const perimeterPositions = []
    // top & bottom rows
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cellWidth + cellWidth / 2
      perimeterPositions.push(this.k.vec2(x, topY))
      perimeterPositions.push(this.k.vec2(x, bottomY))
    }
    // left & right columns (avoid doubling corners)
    for (let r = 1; r < rows - 1; r++) {
      const y = offsetY + r * cellHeight + cellHeight / 2
      perimeterPositions.push(this.k.vec2(leftX, y))
      perimeterPositions.push(this.k.vec2(rightX, y))
    }

    // Filter perimeter for SAFE_DISTANCE
    const validPerimeter = perimeterPositions.filter(p => p.dist(player.pos) > SAFE_DISTANCE && p.dist(puppy.pos) > SAFE_DISTANCE)
    const perimeter = []
    const seen = new Set()
    for (const p of validPerimeter) {
      const kcoord = `${p.x.toFixed(2)}:${p.y.toFixed(2)}`
      if (!seen.has(kcoord)) {
        seen.add(kcoord)
        perimeter.push(p)
      }
    }

    // Create persistent border entities (once) from uniquePerimeter
    this._createBorders(perimeter)

    // Now place interior bushes from pool according to coverage
    const interiorFence = fencePositions.filter(p => {
      const c = Math.round((p.x - offsetX - cellWidth / 2) / cellWidth)
      const r = Math.round((p.y - offsetY - cellHeight / 2) / cellHeight)
      // exclude border cells
      return !(r === 0 || r === rows - 1 || c === 0 || c === cols - 1)
    })

    const interiorCount = interiorFence.length
    const numBushesToPlace = Math.min(this.pool.length, Math.floor(coverageNum), interiorCount)
    const chosenInterior = this._shuffle(interiorFence).slice(0, numBushesToPlace)
    for (let i = 0; i < chosenInterior.length; i++) {
      const bush = this.pool[i]
      bush.pos = chosenInterior[i]
    }
  }

  _initPool() {
    for (let i = 0; i < MAX_BUSHES; i++) {
      const bush = this.k.add([
        this.k.sprite('bush'),
        this.k.anchor('center'),
        this.k.pos(-200, -200),
        this.k.area({ scale: 0.8 }),
        this.k.body({ isStatic: true }),
        'bush',
      ])
      this.pool.push(bush)
    }
  }

  _createBorders(perimeter) {
    if (this.borderEntities.length > 0) return

    for (let i = 0; i < perimeter.length; i++) {
      const pos = perimeter[i]
      const borderBush = this.k.add([
        this.k.sprite('bush'),
        this.k.anchor('center'),
        this.k.pos(pos),
        this.k.area({ scale: 0.8 }),
        this.k.body({ isStatic: true }),
        'bush',
      ])

      this.borderEntities.push(borderBush)
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

  _createMazeLevelMap(width, height) {
    const map = this._createMazeMap(width, height)
    const space = ' '
    const fence = '#'
    const symbolMap = map.map((s) => s === 1 ? fence : space)

    const levelMap = []
    for (let i = 0; i < height; i++) {
      levelMap.push(symbolMap.slice(i * width, i * width + width).join(''))
    }

    return levelMap
  }

  _createMazeMap(width, height) {
    const size = width * height
    const map = new Array(size).fill(1, 0, size)
    map.forEach((_, index) => {
      const x = Math.floor(index / width)
      const y = Math.floor(index % width)
      if ((x & 1) === 1 && (y & 1) === 1) {
        map[index] = 2
      }
    })

    const stack = []
    const startX = Math.floor(Math.random() * (width - 1)) | 1
    const startY = Math.floor(Math.random() * (height - 1)) | 1
    const start = startX + startY * width

    map[start] = 0
    stack.push(start)

    while (stack.length) {
      const index = stack.pop()
      const neighbours = this._getUnvisitedNeighbours(map, index, size, width)

      if (neighbours.length > 0) {
        stack.push(index)
        const neighbour = neighbours[Math.floor(neighbours.length * Math.random())]
        const between = (index + neighbour) / 2
        map[neighbour] = 0
        map[between] = 0
        stack.push(neighbour)
      }
    }

    return map
  }

  _getUnvisitedNeighbours(map, index, size, width) {
    const n = []
    const x = Math.floor(index / width)

    if (x > 1 && map[index - 2] === 2) {
      n.push(index - 2)
    }

    if (x < width - 2 && map[index + 2] === 2) {
      n.push(index + 2)
    }

    if (index >= 2 * width && map[index - 2 * width] === 2) {
      n.push(index - 2 * width)
    }

    if (index < size - 2 * width && map[index + 2 * width] === 2) {
      n.push(index + 2 * width)
    }

    return n
  }
}
