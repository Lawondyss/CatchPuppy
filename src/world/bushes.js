const SAFE_DISTANCE = 50
const START_COVERAGE = 0.25

export class Bushes {
  constructor(k) {
    this.k = k
    this.pool = []
    this.borderEntities = []
    this._freePositions = []

    // Získáme rozměry z již načteného spritu, abychom nemuseli vytvářet vzorový objekt
    const spriteData = this.k.getSprite('bush').data
    this.bushWidth = spriteData.width
    this.bushHeight = spriteData.height
    this.visualBushArea = this.bushWidth * this.bushHeight
  }

  get freePositions() {
    return this._freePositions
  }

  isFreePosition(checkPos) {
    return this._freePositions.some(pos => pos.dist(checkPos) < SAFE_DISTANCE)
  }

  regenerate(difficulty = 0, avoidPosition = null) {
    this._resetState()
    if (this.visualBushArea === 0) return

    const grid = this._calculateGrid()
    const { fencePositions, freePositions, offsetX, offsetY } = this._generatePositions(grid)
    this._freePositions = freePositions

    this._calculateAndCreateBorders(grid, offsetX, offsetY)
    this._placeInteriorBushes(difficulty, avoidPosition, fencePositions, grid, offsetX, offsetY)
  }

  _resetState() {
    this.pool.forEach(bush => {
      bush.pos = this.k.vec2(-200, -200)
    })
    this._freePositions = []
  }

  _calculateGrid() {
    const playableWidth = this.k.width()
    const playableHeight = this.k.height()

    let cellWidth = Math.max(8, this.bushWidth * 0.8)
    let cellHeight = Math.max(8, this.bushHeight * 0.8)

    let cols = Math.ceil(playableWidth / cellWidth)
    let rows = Math.ceil(playableHeight / cellHeight)
    while (cellWidth > 8 && cellHeight > 8 && (cols < 5 || rows < 5)) {
      cellWidth *= 0.9
      cellHeight *= 0.9
      cols = Math.ceil(playableWidth / cellWidth)
      rows = Math.ceil(playableHeight / cellHeight)
    }

    if ((cols % 2) === 0) cols++
    if ((rows % 2) === 0) rows++

    return { playableWidth, playableHeight, cellWidth, cellHeight, cols, rows }
  }

  _generatePositions(grid) {
    const { playableWidth, playableHeight, cellWidth, cellHeight, cols, rows } = grid
    const levelMap = this._createMazeLevelMap(cols, rows)

    const offsetX = Math.floor((playableWidth - cols * cellWidth) / 2)
    const offsetY = Math.floor((playableHeight - rows * cellHeight) / 2)

    const fencePositions = []
    const freePositions = []
    for (let r = 0; r < rows; r++) {
      const line = levelMap[r]
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellWidth + cellWidth / 2
        const y = offsetY + r * cellHeight + cellHeight / 2
        const pos = this.k.vec2(x, y)
        if (line[c] === '#') {
          fencePositions.push(pos)
        } else {
          freePositions.push(pos)
        }
      }
    }
    return { fencePositions, freePositions, offsetX, offsetY }
  }

  _calculateAndCreateBorders(grid, offsetX, offsetY) {
    const { cellWidth, cellHeight, cols, rows } = grid

    const topY = offsetY + cellHeight / 2
    const bottomY = offsetY + (rows - 1) * cellHeight + cellHeight / 2
    const leftX = offsetX + cellWidth / 2
    const rightX = offsetX + (cols - 1) * cellWidth + cellWidth / 2

    const perimeter = []
    // top & bottom rows
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cellWidth + cellWidth / 2
      perimeter.push(this.k.vec2(x, topY))
      perimeter.push(this.k.vec2(x, bottomY))
    }
    // left & right columns (avoid doubling corners)
    for (let r = 1; r < rows - 1; r++) {
      const y = offsetY + r * cellHeight + cellHeight / 2
      perimeter.push(this.k.vec2(leftX, y))
      perimeter.push(this.k.vec2(rightX, y))
    }

    this._createBorders(perimeter)
  }

  _placeInteriorBushes(difficulty, avoidPosition, fencePositions, grid, offsetX, offsetY) {
    const { playableWidth, playableHeight, cellWidth, cellHeight, cols, rows } = grid

    const playableArea = playableWidth * playableHeight
    const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
    const coverageNum = Math.floor(targetCoverageArea / this.visualBushArea)

    let interiorFence = fencePositions.filter(p => {
      const c = Math.round((p.x - offsetX - cellWidth / 2) / cellWidth)
      const r = Math.round((p.y - offsetY - cellHeight / 2) / cellHeight)
      // exclude border cells
      return !(r === 0 || r === rows - 1 || c === 0 || c === cols - 1)
    })

    if (avoidPosition) {
      interiorFence = interiorFence.filter(p => p.dist(avoidPosition) > SAFE_DISTANCE)
    }

    const interiorCount = interiorFence.length
    const numBushesToPlace = Math.min(Math.floor(coverageNum), interiorCount)

    // Dynamicky zvětšíme pool, pokud je potřeba více keřů
    while (this.pool.length < numBushesToPlace) {
      this.pool.push(this._createBush())
    }

    const chosenInterior = this._shuffle(interiorFence).slice(0, numBushesToPlace)
    for (let i = 0; i < chosenInterior.length; i++) {
      const bush = this.pool[i]
      bush.pos = chosenInterior[i]
    }
  }

  _createBush() {
    return this.k.add([
      this.k.sprite('bush'),
      this.k.anchor('center'),
      this.k.pos(-200, -200),
      this.k.area({ scale: 0.8 }),
      this.k.body({ isStatic: true }),
      'bush',
    ])
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
