class CardGameScorer {
  constructor() {
    this.players = ["Người 1", "Người 2", "Người 3", "Người 4"]
    this.scores = [0, 0, 0, 0]
    this.gameHistory = []
    this.editingGameIndex = -1
    this.pointX = 3
    this.pointY = 1
    this.isSetupComplete = false

    this.loadData()
    this.initializeUI()
    this.bindEvents()
  }

  loadData() {
    const savedData = localStorage.getItem("cardGameData")
    if (savedData) {
      const data = JSON.parse(savedData)
      this.players = data.players || this.players
      this.scores = data.scores || this.scores
      this.gameHistory = data.gameHistory || this.gameHistory
      this.pointX = data.pointX || this.pointX
      this.pointY = data.pointY || this.pointY
      this.isSetupComplete = data.isSetupComplete || false
    }
  }

  saveData() {
    const data = {
      players: this.players,
      scores: this.scores,
      gameHistory: this.gameHistory,
      pointX: this.pointX,
      pointY: this.pointY,
      isSetupComplete: this.isSetupComplete,
    }
    localStorage.setItem("cardGameData", JSON.stringify(data))
  }

  initializeUI() {
    this.renderPlayerSetup()
    if (this.isSetupComplete) {
      this.showGameInterface()
    } else {
      this.showSetupInterface()
    }
  }

  showSetupInterface() {
    document.getElementById("setupSection").classList.remove("hidden")
    document.getElementById("gameInterface").classList.add("hidden")
    this.updateSetupForm()
  }

  showGameInterface() {
    document.getElementById("setupSection").classList.add("hidden")
    document.getElementById("gameInterface").classList.remove("hidden")
    this.renderCurrentScores()
    this.renderRankingInputs()
    this.renderBonusInputs()
    this.renderGameHistory()
    this.updateCurrentPointsDisplay()
  }

  updateSetupForm() {
    document.getElementById("setupPointX").value = this.pointX
    document.getElementById("setupPointY").value = this.pointY
  }

  updateCurrentPointsDisplay() {
    document.getElementById("currentPointX").textContent = this.pointX
    document.getElementById("currentPointY").textContent = this.pointY
  }

  startGame() {
    for (let i = 0; i < 4; i++) {
        const input = document.getElementById(`playerName_${i}`)
        this.players[i] = (input?.value.trim()) || `Người ${i + 1}`
    }

    this.pointX = Number.parseInt(document.getElementById("setupPointX").value) || 3
    this.pointY = Number.parseInt(document.getElementById("setupPointY").value) || 1

    this.isSetupComplete = true
    this.saveData()
    this.showGameInterface()
    }

  backToSetup() {
    this.isSetupComplete = false
    this.saveData()
    this.showSetupInterface()
  }

  renderPlayerSetup() {
  const container = document.getElementById("playerSetup")
  container.innerHTML = this.players
    .map((player, index) => `
      <div class="flex items-center gap-3">
        <label for="playerName_${index}" class="w-20 text-sm font-medium text-gray-700">
          Người ${index + 1}:
        </label>
        <input id="playerName_${index}" type="text" value="${player}"
               placeholder="Nhập tên người chơi ${index + 1}"
               class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm">
      </div>
    `)
    .join("")
}


  renderCurrentScores() {
    const container = document.getElementById("currentScores")
    container.innerHTML = ""

    this.players.forEach((player, index) => {
      const score = this.scores[index]
      const scoreColor = score > 0 ? "text-success" : score < 0 ? "text-danger" : "text-gray-600"
      const bgColor = score > 0 ? "bg-green-50" : score < 0 ? "bg-red-50" : "bg-gray-50"

      container.innerHTML += `
        <div class="p-3 rounded-lg border ${bgColor}">
          <div class="text-sm font-medium text-gray-700 mb-1">${player}</div>
          <div class="text-xl font-bold ${scoreColor}">${score > 0 ? "+" : ""}${score}</div>
        </div>
      `
    })
  }

  renderRankingInputs() {
    const container = document.getElementById("rankingInputs")
    container.innerHTML = ""

    this.players.forEach((player, index) => {
      container.innerHTML += `
        <div class="flex items-center gap-3">
            <span class="w-16 text-sm font-medium">${player}:</span>
            <select id="rank_${index}" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="1">Nhất</option>
                <option value="2">Nhì</option>
                <option value="3">Ba</option>
                <option value="4">Bét</option>
            </select>
        </div>
      `
    })
  }

  renderBonusInputs() {
    const container = document.getElementById("bonusInputs")
    container.innerHTML = ""

    this.players.forEach((player, index) => {
      container.innerHTML += `
        <div class="flex items-center gap-3">
            <span class="w-16 text-sm font-medium">${player}:</span>
            <input type="number" id="bonus_${index}" value="0" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        </div>
      `
    })
  }

  renderGameHistory() {
    const container = document.getElementById("gameHistory")

    if (this.gameHistory.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center">Chưa có ván nào</p>'
      return
    }

    container.innerHTML = ""
    this.gameHistory.forEach((game, index) => {
      const gameDiv = document.createElement("div")
      gameDiv.className = "border border-gray-200 rounded-lg p-3"

      const rankings = ["Nhất", "Nhì", "Ba", "Bét"]
      const rankingText = game.rankings
        .map((rank, playerIndex) => `${this.players[playerIndex]}: ${rankings[rank - 1]}`)
        .join(", ")

      const pointsText = game.finalPoints
        .map((points, playerIndex) => {
          const color = points > 0 ? "text-success" : points < 0 ? "text-danger" : "text-gray-600"
          return `<span class="${color}">${this.players[playerIndex]}: ${points > 0 ? "+" : ""}${points}</span>`
        })
        .join(", ")

      gameDiv.innerHTML = `
        <div class="text-sm text-gray-600 mb-1">Ván ${index + 1}</div>
        <div class="text-sm mb-1">${rankingText}</div>
        <div class="text-sm mb-2">${pointsText}</div>
        <button onclick="gameScorer.editGame(${index})" 
                class="bg-warning text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors">
            Sửa
        </button>
      `

      container.appendChild(gameDiv)
    })
  }

  updatePlayerName(index, newName) {
    this.players[index] = newName || `Người ${index + 1}`
    this.saveData()
    this.renderPlayerSetup()
    this.renderCurrentScores()
    this.renderRankingInputs()
    this.renderBonusInputs()
    this.renderGameHistory()
  }

  recordGame() {
    const pointX = this.pointX
    const pointY = this.pointY

    // Get rankings
    const rankings = []
    for (let i = 0; i < 4; i++) {
      rankings[i] = Number.parseInt(document.getElementById(`rank_${i}`).value)
    }

    // Check if rankings are valid (no duplicates)
    const uniqueRanks = new Set(rankings)
    if (uniqueRanks.size !== 4) {
      alert("Vui lòng chọn thứ hạng khác nhau cho từng người!")
      return
    }

    // Get bonus points
    const bonusPoints = []
    for (let i = 0; i < 4; i++) {
      bonusPoints[i] = Number.parseInt(document.getElementById(`bonus_${i}`).value) || 0
    }

    // Calculate points based on rankings
    const gamePoints = [0, 0, 0, 0]
    rankings.forEach((rank, playerIndex) => {
      switch (rank) {
        case 1:
          gamePoints[playerIndex] = pointX
          break
        case 2:
          gamePoints[playerIndex] = pointY
          break
        case 3:
          gamePoints[playerIndex] = -pointY
          break
        case 4:
          gamePoints[playerIndex] = -pointX
          break
      }
      gamePoints[playerIndex] += bonusPoints[playerIndex]
    })

    const total = gamePoints.reduce((sum, points) => sum + points, 0)
    if (total !== 0) {
      alert(
        `Lỗi: Tổng điểm phải bằng 0! Hiện tại tổng là: ${total > 0 ? "+" : ""}${total}. Vui lòng kiểm tra lại điểm thắng thêm/thua thêm.`,
      )
      return
    }

    // Record the game
    const game = {
      pointX,
      pointY,
      rankings: [...rankings],
      bonusPoints: [...bonusPoints],
      finalPoints: [...gamePoints],
    }

    if (this.editingGameIndex >= 0) {
      // Update existing game
      const oldGame = this.gameHistory[this.editingGameIndex]
      // Subtract old points
      oldGame.finalPoints.forEach((points, index) => {
        this.scores[index] -= points
      })
      // Add new points
      gamePoints.forEach((points, index) => {
        this.scores[index] += points
      })
      this.gameHistory[this.editingGameIndex] = game
      this.editingGameIndex = -1
    } else {
      // Add new game
      gamePoints.forEach((points, index) => {
        this.scores[index] += points
      })
      this.gameHistory.push(game)
    }

    // Reset form
    this.resetForm()

    // Update UI
    this.renderCurrentScores()
    this.renderGameHistory()
    this.saveData()

    // Hide modal if editing
    document.getElementById("editModal").classList.add("hidden")
  }

  editGame(index) {
    this.editingGameIndex = index
    const game = this.gameHistory[index]

    // Populate edit modal
    const modalContent = document.getElementById("editModalContent")
    modalContent.innerHTML = `
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Điểm X</label>
                    <input type="number" id="editPointX" value="${game.pointX}" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Điểm Y</label>
                    <input type="number" id="editPointY" value="${game.pointY}" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Thứ Hạng</label>
                <div class="space-y-2">
                    ${this.players
                      .map(
                        (player, playerIndex) => `
                        <div class="flex items-center gap-3">
                            <span class="w-16 text-sm font-medium">${player}:</span>
                            <select id="editRank_${playerIndex}" class="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option value="1" ${game.rankings[playerIndex] === 1 ? "selected" : ""}>Nhất</option>
                                <option value="2" ${game.rankings[playerIndex] === 2 ? "selected" : ""}>Nhì</option>
                                <option value="3" ${game.rankings[playerIndex] === 3 ? "selected" : ""}>Ba</option>
                                <option value="4" ${game.rankings[playerIndex] === 4 ? "selected" : ""}>Bét</option>
                            </select>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Thắng Thêm / Thua Thêm</label>
                <div class="space-y-2">
                    ${this.players
                      .map(
                        (player, playerIndex) => `
                        <div class="flex items-center gap-3">
                            <span class="w-16 text-sm font-medium">${player}:</span>
                            <input type="number" id="editBonus_${playerIndex}" value="${game.bonusPoints[playerIndex]}" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `

    document.getElementById("editModal").classList.remove("hidden")
    document.getElementById("editModal").classList.add("flex")
  }

  saveEdit() {
    // Update form values from edit modal
    this.pointX = Number.parseInt(document.getElementById("editPointX").value) || this.pointX
    this.pointY = Number.parseInt(document.getElementById("editPointY").value) || this.pointY

    for (let i = 0; i < 4; i++) {
      document.getElementById(`rank_${i}`).value = document.getElementById(`editRank_${i}`).value
      document.getElementById(`bonus_${i}`).value = document.getElementById(`editBonus_${i}`).value
    }

    this.recordGame()
  }

  deleteGame() {
    if (this.editingGameIndex >= 0) {
      const game = this.gameHistory[this.editingGameIndex]
      // Subtract points from total
      game.finalPoints.forEach((points, index) => {
        this.scores[index] -= points
      })

      this.gameHistory.splice(this.editingGameIndex, 1)
      this.editingGameIndex = -1

      this.renderCurrentScores()
      this.renderGameHistory()
      this.saveData()

      document.getElementById("editModal").classList.add("hidden")
    }
  }

  resetForm() {
    // Reset rankings to default
    for (let i = 0; i < 4; i++) {
      document.getElementById(`rank_${i}`).value = i + 1
      document.getElementById(`bonus_${i}`).value = 0
    }
  }

  resetAll() {
    if (confirm("Bạn có chắc muốn reset toàn bộ dữ liệu?")) {
      this.scores = [0, 0, 0, 0]
      this.gameHistory = []
      this.isSetupComplete = false
      this.saveData()
      this.showSetupInterface()
    }
  }

  bindEvents() {
    document.getElementById("recordGameBtn").addEventListener("click", () => this.recordGame())
    document.getElementById("resetBtn").addEventListener("click", () => this.resetAll())

    // Modal events
    document.getElementById("saveEditBtn").addEventListener("click", () => this.saveEdit())
    document.getElementById("cancelEditBtn").addEventListener("click", () => {
      this.editingGameIndex = -1
      document.getElementById("editModal").classList.add("hidden")
    })
    document.getElementById("deleteGameBtn").addEventListener("click", () => this.deleteGame())

    // Close modal when clicking outside
    document.getElementById("editModal").addEventListener("click", (e) => {
      if (e.target.id === "editModal") {
        this.editingGameIndex = -1
        document.getElementById("editModal").classList.add("hidden")
      }
    })

    document.getElementById("startGameBtn").addEventListener("click", () => this.startGame())
    document.getElementById("backToSetupBtn").addEventListener("click", () => this.backToSetup())
  }
}

// Initialize the app
const gameScorer = new CardGameScorer()
