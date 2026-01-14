class CardGameScorer {
  constructor() {
    this.players = ["Người 1", "Người 2", "Người 3", "Người 4"]
    this.scores = [0, 0, 0, 0]
    this.gameHistory = []
    this.editingGameIndex = -1
    this.pointX = 10
    this.pointY = 5
    this.isSetupComplete = false

    this.loadData()
    this.initializeUI()
    this.bindEvents()
    this.initVoice()

  }

  initVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ giọng nói")
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = "vi-VN"
    this.recognition.continuous = false
    this.recognition.interimResults = false

    this.recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase()
      console.log("🎤 Nghe được:", text)
      this.handleVoiceCommand(text)
    }

    this.recognition.onerror = (e) => {
      console.error("Voice error:", e)
      alert("Không nhận diện được giọng nói")
    }
  }

  handleVoiceCommand(text) {
  const rankMap = {
    "nhất": 1,
    "nhì": 2,
    "nhi": 2,
    "ba": 3,
    "bét": 4,
    "bet": 4
  }

  this.resetForm()

  const assignedRanks = new Set()

  this.players.forEach((player, index) => {
    const name = player.toLowerCase()
    if (!text.includes(name)) return

    for (const key in rankMap) {
      if (text.includes(key)) {
        const rank = rankMap[key]
        if (assignedRanks.has(rank)) return

        document.getElementById(`rank_${index}`).value = rank
        assignedRanks.add(rank)
        break
      }
    }
  })

  // tự gán hạng còn thiếu
  const missing = [1,2,3,4].filter(r => !assignedRanks.has(r))
  let missIndex = 0

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`rank_${i}`)
    if (!el.value) el.value = missing[missIndex++]
  }

  this.showConfirmModal()
}
showConfirmModal() {
  const list = document.getElementById("confirmList")
  list.innerHTML = ""

  this.players.forEach((player, index) => {
    const rank = document.getElementById(`rank_${index}`).value
    const li = document.createElement("li")
    li.textContent = `${player}: hạng ${rank}`
    list.appendChild(li)
  })

  document.getElementById("confirmModal").classList.remove("hidden")
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
    this.renderRankingInputs() // có cả option Giết / Bị Giết
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

  // ==== RANKING + GIẾT / BỊ GIẾT TRONG OPTION ====
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
            <option value="kill">Giết</option>
            <option value="victim">Bị Giết</option>
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

  // ==== LỊCH SỬ ====
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

      const labelMap = { "1": "Nhất", "2": "Nhì", "3": "Ba", "4": "Bét", "kill": "Giết", "victim": "Bị Giết" }
      const rankingText = game.rankings
        .map((rv, playerIndex) => `${this.players[playerIndex]}: ${labelMap[String(rv)] || rv}`)
        .join(", ")

      const pointsText = game.finalPoints
        .map((points, playerIndex) => {
          const color = points > 0 ? "text-success" : points < 0 ? "text-danger" : "text-gray-600"
          return `<span class="${color}">${this.players[playerIndex]}: ${points > 0 ? "+" : ""}${points}</span>`
        })
        .join(", ")

      const killText = game.mode === "kill" && game.kill && game.kill.killerIndex >= 0 && game.kill.victimIndices?.length
        ? `<div class="text-xs text-gray-600 mb-1">
             Giết: <span class="font-medium">${this.players[game.kill.killerIndex]}</span>
             → ${game.kill.victimIndices.map(v => `<span class="font-medium">${this.players[v]}</span>`).join(", ")}
             (+2×${game.pointX} mỗi nạn nhân)
           </div>`
        : ""

      gameDiv.innerHTML = `
        <div class="text-sm text-gray-600 mb-1">Ván ${index + 1}</div>
        <div class="text-sm mb-1">${rankingText}</div>
        ${killText}
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

  // ==== GHI VÁN ====
  recordGame() {
    const pointX = this.pointX
    const pointY = this.pointY

    // Đọc lựa chọn hạng / giết / bị giết
    const rankingsRaw = []
    for (let i = 0; i < 4; i++) {
      rankingsRaw[i] = (document.getElementById(`rank_${i}`).value || "1")
    }

    // Bonus
    const bonusPoints = []
    for (let i = 0; i < 4; i++) {
      bonusPoints[i] = Number.parseInt(document.getElementById(`bonus_${i}`).value) || 0
    }

    // Kiểm tra kill-mode
    const killerIndices = rankingsRaw.map((v, i) => (v === "kill" ? i : -1)).filter(i => i >= 0)
    const victimIndices = rankingsRaw.map((v, i) => (v === "victim" ? i : -1)).filter(i => i >= 0)
    const killMode = victimIndices.length > 0

    // Validate kill-mode
    if (killMode) {
      if (killerIndices.length !== 1) {
        alert("Trong ván có 'Bị Giết' thì phải chọn đúng 1 người 'Giết'.")
        return
      }
      if (victimIndices.includes(killerIndices[0])) {
        alert("Một người không thể vừa 'Giết' vừa 'Bị Giết'.")
        return
      }
    } else {
      // Không có ai bị giết -> kiểm tra không trùng hạng 1..4
      const numericRanks = rankingsRaw.map(v => parseInt(v, 10))
      if (numericRanks.some(isNaN)) {
        alert("Khi không có 'Bị Giết', tất cả phải chọn hạng 1/2/3/4.")
        return
      }
      const unique = new Set(numericRanks)
      if (unique.size !== 4) {
        alert("Vui lòng chọn thứ hạng khác nhau (Nhất/Nhì/Ba/Bét) khi không có 'Bị Giết'.")
        return
      }
    }

    // Tính điểm
    const gamePoints = [0, 0, 0, 0]

    if (killMode) {
      // CASE XỬ LÝ RIÊNG: chỉ áp dụng chuyển tiền giết (không áp dụng điểm X/Y theo hạng)
      const killer = killerIndices[0]

      victimIndices.forEach(v => {
        if (v === killer) return
        gamePoints[killer] += 2 * pointX
        gamePoints[v] -= 2 * pointX
      })

      // Cộng bonus
      for (let i = 0; i < 4; i++) gamePoints[i] += bonusPoints[i]

      // Không enforce tổng = 0 trong kill-mode
    } else {
      // MODE THƯỜNG: áp dụng điểm theo hạng 1/2/3/4 + bonus
      const ranks = rankingsRaw.map(v => parseInt(v, 10))
      ranks.forEach((rank, playerIndex) => {
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

      const total = gamePoints.reduce((s, p) => s + p, 0)
      if (total !== 0) {
        alert(
          `Lỗi: Tổng điểm phải bằng 0! Hiện tại tổng là: ${total > 0 ? "+" : ""}${total}. Vui lòng kiểm tra lại điểm thắng thêm/thua thêm.`,
        )
        return
      }
    }

    // Ghi ván
    const game = {
      mode: killMode ? "kill" : "normal",
      pointX,
      pointY,
      rankings: [...rankingsRaw], // lưu đúng lựa chọn '1'|'2'|'3'|'4'|'kill'|'victim'
      bonusPoints: [...bonusPoints],
      finalPoints: [...gamePoints],
      kill: killMode
        ? { killerIndex: killerIndices[0], victimIndices: [...victimIndices] }
        : { killerIndex: -1, victimIndices: [] },
    }

    if (this.editingGameIndex >= 0) {
      const oldGame = this.gameHistory[this.editingGameIndex]
      // Trừ điểm cũ
      oldGame.finalPoints.forEach((points, index) => {
        this.scores[index] -= points
      })
      // Cộng điểm mới
      game.finalPoints.forEach((points, index) => {
        this.scores[index] += points
      })
      this.gameHistory[this.editingGameIndex] = game
      this.editingGameIndex = -1
    } else {
      game.finalPoints.forEach((points, index) => {
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

  // ==== EDIT MODAL ====
  editGame(index) {
    this.editingGameIndex = index
    const game = this.gameHistory[index]

    const modalContent = document.getElementById("editModalContent")
    const labelMap = { "1": "Nhất", "2": "Nhì", "3": "Ba", "4": "Bét", "kill": "Giết", "victim": "Bị Giết" }

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
        <label class="block text-sm font-medium text-gray-700 mb-2">Thứ Hạng / Giết</label>
        <div class="space-y-2">
          ${this.players.map((player, i) => `
            <div class="flex items-center gap-3">
              <span class="w-16 text-sm font-medium">${player}:</span>
              <select id="editRank_${i}" class="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                ${["1","2","3","4","kill","victim"].map(v => `
                  <option value="${v}" ${String(game.rankings[i]) === v ? "selected" : ""}>${labelMap[v]}</option>
                `).join("")}
              </select>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Thắng Thêm / Thua Thêm</label>
        <div class="space-y-2">
          ${this.players.map((player, i) => `
            <div class="flex items-center gap-3">
              <span class="w-16 text-sm font-medium">${player}:</span>
              <input type="number" id="editBonus_${i}" value="${game.bonusPoints[i] || 0}" 
                     class="flex-1 px-3 py-2 border border-gray-300 rounded-md">
            </div>
          `).join("")}
        </div>
      </div>
    `

    document.getElementById("editModal").classList.remove("hidden")
    document.getElementById("editModal").classList.add("flex")
  }

  saveEdit() {
    // Cập nhật X/Y
    this.pointX = Number.parseInt(document.getElementById("editPointX").value) || this.pointX
    this.pointY = Number.parseInt(document.getElementById("editPointY").value) || this.pointY

    // Copy chọn hạng/giết từ modal về form chính
    for (let i = 0; i < 4; i++) {
      const val = document.getElementById(`editRank_${i}`).value
      document.getElementById(`rank_${i}`).value = val
      document.getElementById(`bonus_${i}`).value = document.getElementById(`editBonus_${i}`).value
    }

    this.recordGame()
  }

  deleteGame() {
    if (this.editingGameIndex >= 0) {
      const game = this.gameHistory[this.editingGameIndex]
      // Trừ điểm cũ
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
    // Reset về 1..4 mặc định
    for (let i = 0; i < 4; i++) {
      const sel = document.getElementById(`rank_${i}`)
      if (sel) sel.value = String(i + 1)
      const bonus = document.getElementById(`bonus_${i}`)
      if (bonus) bonus.value = 0
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
    document.getElementById("voiceBtn").addEventListener("click", () => {
      this.recognition.start()
    })

  }

  confirmRecord() {
    document.getElementById("confirmModal").classList.add("hidden")
    this.recordGame()
  }


  closeModal() {
    document.getElementById("confirmModal").classList.add("hidden")
  }
}

// Initialize the app
const gameScorer = new CardGameScorer()
