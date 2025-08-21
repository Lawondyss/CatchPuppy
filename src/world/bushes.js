const START_COVERAGE = 0.25
const BUSH_HITBOX_SCALE = 0.75

class Grid {
  constructor(k, bushWidth, bushHeight) {
    this.k = k
    this.bushWidth = bushWidth
    this.bushHeight = bushHeight
    this.playableWidth = k.width()
    this.playableHeight = k.height()
    this.cellWidth = Math.max(8, bushWidth * BUSH_HITBOX_SCALE)
    this.cellHeight = Math.max(8, bushHeight * BUSH_HITBOX_SCALE)

    this.cols = Math.ceil(this.playableWidth / this.cellWidth)
    this.rows = Math.ceil(this.playableHeight / this.cellHeight)

    this._optimizeSize()
    this._ensureOddDimensions()
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
}

class MazeMap {
  constructor(k, grid) {
    this.k = k
    this.grid = grid
    this.levelMap = []
    this.freePositions = []
    this.initialLevelMap = this._createMazeLevelMap(this.grid.cols, this.grid.rows)
  }

  finalize(difficulty, visualBushArea, isPositionBlockedCheck) {
    const interiorFence = []
    const borderFence = []

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (this.initialLevelMap[r][c] === ' ') continue

        const pos = this.k.vec2(
          this.grid.offsetX + c * this.grid.cellWidth + this.grid.cellWidth / 2,
          this.grid.offsetY + r * this.grid.cellHeight + this.grid.cellHeight / 2
        )

        if (r === 0 || r === this.grid.rows - 1 || c === 0 || c === this.grid.cols - 1) {
          borderFence.push({ pos, r, c })
        } else {
          interiorFence.push({ pos, r, c })
        }
      }
    }
    const availableInterior = interiorFence.filter(item => !isPositionBlockedCheck(item.pos))

    const playableArea = this.grid.playableWidth * this.grid.playableHeight
    const targetCoverageArea = playableArea * (START_COVERAGE + difficulty * 0.05)
    const coverageNum = Math.floor(targetCoverageArea / visualBushArea)
    const numBushesToPlace = Math.min(Math.floor(coverageNum), availableInterior.length)

    const chosenInterior = this._shuffle(availableInterior).slice(0, numBushesToPlace)
    const finalLevelMap = Array.from(
      { length: this.grid.rows },
      () => new Array(this.grid.cols).fill(' ')
    )
    borderFence.forEach(item => finalLevelMap[item.r][item.c] = '#')
    chosenInterior.forEach(item => finalLevelMap[item.r][item.c] = '#')

    this.levelMap = finalLevelMap.map(row => row.join(''))

    finalLevelMap.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === '#') return;
        this.freePositions.push(this.k.vec2(
          this.grid.offsetX + c * this.grid.cellWidth,
          this.grid.offsetY + r * this.grid.cellHeight,
        ))
      })
    })
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
      levelMap.push(symbolMap.slice(i * width, i * width + width))
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
    this.grid = null
    this.mazeMap = null
    this.level = null

    const spriteData = this.k.getSprite('bush').data
    this.bushWidth = spriteData.width
    this.bushHeight = spriteData.height
    this.visualBushArea = this.bushWidth * this.bushHeight
  }

  get freePositions() {
    return this.mazeMap?.freePositions ?? []
  }

  isFreePosition(checkPos) {
    return this.freePositions.some(freePos => this._isPointInCell(checkPos, freePos))
  }

  regenerate(difficulty = 0, avoidPosition = null) {
    this._resetState()
    if (this.visualBushArea === 0) return

    this.grid = new Grid(this.k, this.bushWidth, this.bushHeight)
    this.mazeMap = new MazeMap(this.k, this.grid)

    const isPositionBlockedCheck = (bushPos) => {
      return avoidPosition ? this._isPointInCell(avoidPosition, bushPos) : false
    }

    this.mazeMap.finalize(difficulty, this.visualBushArea, isPositionBlockedCheck)

    this.level = this.k.addLevel(this.mazeMap.levelMap, {
      tileWidth: this.grid.cellWidth,
      tileHeight: this.grid.cellHeight,
      tiles: {
        '#': () => [
          this.k.sprite('bush'),
          this.k.anchor('center'),
          this.k.area({ scale: BUSH_HITBOX_SCALE }),
          this.k.body({ isStatic: true }),
          this.k.tile({ isObstacle: true }),
          'bush',
        ],
      },
      pos: this.k.vec2(this.grid.offsetX, this.grid.offsetY),
    })
  }

  _resetState() {
    this.level?.destroy()
    this.level = null
    this.mazeMap = null
    this.grid = null
  }

  _isPointInCell(point, pos) {
    return (
      point.x >= pos.x &&
      point.x <= pos.x + this.grid.offsetX &&
      point.y >= pos.y &&
      point.y <= pos.y + this.grid.offsetY
    )
  }
}
