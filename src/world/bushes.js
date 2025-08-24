/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 * @typedef {import('kaplay').Vec2} Vec2
 * @typedef {import('kaplay').LevelComp} LevelComp
 */

import { Config } from '../config.js'

class Grid {
  /**
   * @param {KaplayCtx} k
   * @param {number} bushWidth
   * @param {number} bushHeight
   */
  constructor(k, bushWidth, bushHeight) {
    this.bushWidth = bushWidth
    this.bushHeight = bushHeight
    this.playableWidth = k.width()
    this.playableHeight = k.height()

    let cellWidth = Math.max(8, bushWidth * Config.BushHitboxScale)
    let cellHeight = Math.max(8, bushHeight * Config.BushHitboxScale)
    let cols = Math.ceil(this.playableWidth / cellWidth)
    let rows = Math.ceil(this.playableHeight / cellHeight)

    while (cellWidth > 8 && cellHeight > 8 && (cols < 5 || rows < 5)) {
      cellWidth *= 0.9
      cellHeight *= 0.9
      cols = Math.ceil(this.playableWidth / cellWidth)
      rows = Math.ceil(this.playableHeight / cellHeight)
    }

    this.cellWidth = cellWidth
    this.cellHeight = cellHeight
    this.cols = cols + (cols % 2 === 0)
    this.rows = rows + (rows % 2 === 0)
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
  static SymbolSpace = ' '
  static SymbolFence = '#'

  /**
   * @param {KaplayCtx} k
   * @param {Grid} grid
   */
  constructor(k, grid) {
    this.k = k
    this.grid = grid
    /** @type {[]|{pos: Vec2, x: number, y: number}[]} */
    this.freePositions = []
    this.initialLevelMap = this._createMazeLevelMap(this.grid.cols, this.grid.rows)
  }

  /**
   * @param {number} difficulty
   * @param {number} visualBushArea
   * @param {(pos: Vec2) => boolean} isPositionBlockedCheck
   */
  finalize(difficulty, visualBushArea, isPositionBlockedCheck) {
    const interiorFence = []
    const borderFence = []

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (this.initialLevelMap[r][c] === MazeMap.SymbolSpace) continue

        const pos = this.k.vec2(
          this.grid.offsetX + c * this.grid.cellWidth + this.grid.cellWidth / 2,
          this.grid.offsetY + r * this.grid.cellHeight + this.grid.cellHeight / 2,
        )

        ;(r === 0 || r === this.grid.rows - 1 || c === 0 || c === this.grid.cols - 1)
          ? borderFence.push({pos, r, c})
          : interiorFence.push({pos, r, c})
      }
    }

    const availableInterior = interiorFence.filter(item => !isPositionBlockedCheck(item.pos))

    const playableArea = this.grid.playableWidth * this.grid.playableHeight
    const targetCoverageArea = playableArea * (Config.BushStartCoverage + difficulty * 0.05)
    const coverageNum = Math.floor(targetCoverageArea / visualBushArea)
    const numBushesToPlace = Math.min(Math.floor(coverageNum), availableInterior.length)

    const chosenInterior = this.k.shuffle(availableInterior).slice(0, numBushesToPlace)
    const finalLevelMap = Array.from(
      {length: this.grid.rows},
      () => new Array(this.grid.cols).fill(MazeMap.SymbolSpace)
    )
    borderFence.forEach(item => finalLevelMap[item.r][item.c] = MazeMap.SymbolFence)
    chosenInterior.forEach(item => finalLevelMap[item.r][item.c] = MazeMap.SymbolFence)

    this.freePositions = []
    finalLevelMap.forEach((row, r) => {
      row.forEach((cell, c) => {
        cell === MazeMap.SymbolSpace && this.freePositions.push({
          pos: this.k.vec2(
            this.grid.offsetX + c * this.grid.cellWidth,
            this.grid.offsetY + r * this.grid.cellHeight,
          ),
          x: c,
          y: r,
        })
      })
    })

    return finalLevelMap.map(row => row.join(''))
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

  /**
   * @param {number} width
   * @param {number} height
   * @returns {number[]}
   */
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

  /**
   * @param {number[]} map
   * @param {number} index
   * @param {number} size
   * @param {number} width
   * @returns {number[]}
   */
  _getUnvisitedNeighbours(map, index, size, width) {
    const n = []
    const x = index % width

    // Left
    if (x > 1 && map[index - 2] === 2) {
      n.push(index - 2)
    }

    // Right
    if (x < width - 2 && map[index + 2] === 2) {
      n.push(index + 2)
    }

    // Top
    if (index >= 2 * width && map[index - 2 * width] === 2) {
      n.push(index - 2 * width)
    }

    // Bottom
    if (index < size - 2 * width && map[index + 2 * width] === 2) {
      n.push(index + 2 * width)
    }

    return n
  }
}

export class Bushes {
  /**
   * @param {KaplayCtx} k
   */
  constructor(k) {
    this.k = k
    /** @type {LevelComp | null} */
    this.level = null

    const spriteData = this.k.getSprite('bush').data
    this.bushWidth = spriteData.width
    this.bushHeight = spriteData.height
    this.visualBushArea = this.bushWidth * this.bushHeight

    this.grid = new Grid(this.k, this.bushWidth, this.bushHeight)
    this.mazeMap = new MazeMap(this.k, this.grid)
  }

  /**
   * @readonly
   * @returns {[]|{pos: Vec2, x: number, y: number}[]}
   */
  get freePositions() {
    return this.mazeMap?.freePositions ?? []
  }

  /**
   * @param {number} [difficulty]
   * @param {Vec2 | null} [avoidPosition]
   */
  regenerate(difficulty = 0, avoidPosition = null) {
    this._resetState()

    if (this.visualBushArea === 0) throw Error('visualBushArea is 0')

    const isPositionBlockedCheck = (bushPos) => {
      return avoidPosition ? this._isPointInCell(avoidPosition, bushPos) : false
    }

    const levelMap = this.mazeMap.finalize(difficulty, this.visualBushArea, isPositionBlockedCheck)

    this.level = this.k.addLevel(levelMap, {
      tileWidth: this.grid.cellWidth,
      tileHeight: this.grid.cellHeight,
      tiles: {
        '#': () => [
          this.k.sprite('bush'),
          this.k.anchor('center'),
          this.k.area({scale: this.grid.cellWidth / this.bushWidth}),
          this.k.body({isStatic: true}),
          this.k.tile({
            isObstacle: true,
          }),
          'bush',
        ],
      },
      pos: this.k.vec2(this.grid.offsetX, this.grid.offsetY),
    })
  }

  _resetState() {
    this.level?.destroy()
    this.level = null
  }

  /**
   * @param {Vec2} point
   * @param {Vec2} pos
   * @returns {boolean}
   */
  _isPointInCell(point, pos) {
    return (
      point.x >= pos.x &&
      point.x <= pos.x + this.grid.cellWidth &&
      point.y >= pos.y &&
      point.y <= pos.y + this.grid.cellHeight
    )
  }
}
