const SAFE_DISTANCE = 50
const START_COVERAGE = 0.25

class Grid {
  constructor(k, bushWidth, bushHeight) {
    this.k = k
    this.bushWidth = bushWidth
    this.bushHeight = bushHeight
    this.playableWidth = k.width()
    this.playableHeight = k.height()
    this.cellWidth = Math.max(8, bushWidth * 0.8)
    this.cellHeight = Math.max(8, bushHeight * 0.8)

    this.cols = Math.ceil(this.playableWidth / this.cellWidth)
    this.rows = Math.ceil(this.playableHeight / this.cellHeight)

    this._optimizeSize()
    this._ensureOddDimensions()
  }

  _optimizeSize() {
    while (this.cellWidth > 8 && this.cellHeight > 8 && (this.cols < 5 || this.rows < 5)) {
      this.cellWidth *= 0.9
      this.cellHeight *= 0.9
      this.cols = Math.ceil(this.playableWidth / this.cellWidth)
      this.rows = Math.ceil(this.playableHeight / this.cellHeight)
    }
  }

  _ensureOddDimensions() {
    if ((this.cols % 2) === 0) this.cols++
    if ((this.rows % 2) === 0) this.rows++
  }

  get offsetX() {
    const visualWidth = (this.cols - 1) * this.cellWidth + this.bushWidth
    const levelPosX = (this.playableWidth - visualWidth) / 2 + this.bushWidth / 2
    return Math.floor(levelPosX)
  }

  get offsetY() {
    const visualHeight = (this.rows - 1) * this.cellHeight + this.bushHeight
    const levelPosY = (this.playableHeight - visualHeight) / 2 + this.bushHeight / 2
    return Math.floor(levelPosY)
  }
}

class MazeMap {
  constructor(k, grid) {
    this.k = k
    this.grid = grid
    this.initialLevelMap = this._createMazeLevelMap(grid.cols, grid.rows)
    this.finalLevelMap = []
    this.freePositions = []
  }

  finalize(difficulty, avoidPosition, visualBushArea) {
    const allFencePositions = []
    const newMap = []

    for (let r = 0; r < this.grid.rows; r++) {
      newMap.push(this.initialLevelMap[r].split(''))
      for (let c = 0; c < this.grid.cols; c++) {
        const pos = this.k.vec2(
          this.grid.offsetX + c * this.grid.cellWidth + this.grid.cellWidth / 2,
          this.grid.offsetY + r * this.grid.cellHeight + this.grid.cellHeight / 2
        )
        if (this.initialLevelMap[r][c] === '#') {
          allFencePositions.push({ pos, r, c })
        } else {
          this.freePositions.push(pos)
        }
      }
    }

    const interiorFence = []
    const borderFence = []
    allFencePositions.forEach(item => {
      if (item.r === 0 || item.r === this.grid.rows - 1 || item.c === 0 || item.c === this.grid.cols - 1) {
        borderFence.push(item)
      } else {
        interiorFence.push(item)
      }
    })

    let availableInterior = interiorFence
    if (avoidPosition) {
      availableInterior = interiorFence.filter(item => item.pos.dist(avoidPosition) > SAFE_DISTANCE)
    }

    const playableArea = this.grid.playableWidth * this.grid.playableHeight
    const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
    const coverageNum = Math.floor(targetCoverageArea / visualBushArea)
    const numBushesToPlace = Math.min(Math.floor(coverageNum), availableInterior.length)

    const chosenInterior = this._shuffle(availableInterior).slice(0, numBushesToPlace)

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (newMap[r][c] === '#') {
          newMap[r][c] = ' '
        }
      }
    }

    borderFence.forEach(item => newMap[item.r][item.c] = '#')
    chosenInterior.forEach(item => newMap[item.r][item.c] = '#')

    this.finalLevelMap = newMap.map(row => row.join(''))
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

export class Bushes {
  constructor(k) {
    this.k = k
    this.level = null
    this.mazeMap = null

    const spriteData = this.k.getSprite('bush').data
    this.bushWidth = spriteData.width
    this.bushHeight = spriteData.height
    this.visualBushArea = this.bushWidth * this.bushHeight
  }

  get freePositions() {
    return this.mazeMap?.freePositions ?? []
  }

  isFreePosition(checkPos) {
    // Tato metoda se zdá být zastaralá, protože freePositions by již měly být spolehlivé.
    // Zvážit odstranění nebo refaktoring v budoucnu.
    return this.freePositions.some(pos => pos.dist(checkPos) < SAFE_DISTANCE)
  }

  regenerate(difficulty = 0, avoidPosition = null) {
    this._resetState()
    if (this.visualBushArea === 0) return

    const grid = new Grid(this.k, this.bushWidth, this.bushHeight)
    this.mazeMap = new MazeMap(this.k, grid)

    this.mazeMap.finalize(difficulty, avoidPosition, this.visualBushArea)

    this.level = this.k.addLevel(this.mazeMap.finalLevelMap, {
      tileWidth: grid.cellWidth,
      tileHeight: grid.cellHeight,
      tiles: {
        '#': () => [
          this.k.sprite('bush'),
          this.k.anchor('center'),
          this.k.area({ scale: 0.8 }),
          this.k.body({ isStatic: true }),
          this.k.tile({ isObstacle: true }),
          'bush',
        ],
      },
      pos: this.k.vec2(grid.offsetX, grid.offsetY),
    })
  }

  _resetState() {
    this.level?.destroy()
    this.level = null
    this.mazeMap = null
  }
}
