let runningTotal = 0
let buffer = "0"
let previousOperator = null

const HISTORY_STORAGE_KEY = "calculator-history"

const screen = document.querySelector(".screen")
const historyList = document.querySelector("#history")
const clearHistoryButton = document.querySelector("#clear-history")

function ButtonClick(value) {
  if (isNaN(value)) {
    handleSymbol(value)
  } else {
    handleNumber(value)
  }
  screen.innerText = buffer
}

function addHistoryEntry(expression) {
  const history = getHistory()
  history.unshift(expression)
  saveHistory(history)
  renderHistory(history)
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

function renderHistory(history) {
  historyList.innerHTML = ""

  if (history.length === 0) {
    const emptyItem = document.createElement("li")
    emptyItem.className = "history-empty"
    emptyItem.textContent = "Nenhum cálculo ainda."
    historyList.append(emptyItem)
    return
  }

  history.forEach((expression) => {
    const item = document.createElement("li")
    item.className = "history-item"
    item.textContent = expression
    historyList.append(item)
  })
}

function clearHistory() {
  localStorage.removeItem(HISTORY_STORAGE_KEY)
  renderHistory([])
}

function handleSymbol(symbol) {
  switch (symbol) {
    case "C":
      buffer = "0"
      runningTotal = 0
      previousOperator = null
      break
    case "=":
      if (previousOperator === null) {
        return
      }

      const leftValue = runningTotal
      const rightValue = parseInt(buffer, 10)
      const operator = previousOperator
      flushOperation(rightValue)
      const result = runningTotal

      addHistoryEntry(`${leftValue} ${operator} ${rightValue} = ${result}`)

      previousOperator = null
      buffer = String(result)
      runningTotal = 0
      break
    case "←":
      if (buffer.length === 1) {
        buffer = "0"
      } else {
        buffer = buffer.substring(0, buffer.length - 1)
      }
      break
    case "+":
    case "−":
    case "×":
    case "÷":
      handleMatch(symbol)
      break
  }
}

function handleMatch(symbol) {
  if (buffer === "0") {
    return
  }

  const intBuffer = parseInt(buffer, 10)

  if (runningTotal === 0) {
    runningTotal = intBuffer
  } else {
    flushOperation(intBuffer)
  }

  previousOperator = symbol
  buffer = "0"
}

function flushOperation(intBuffer) {
  if (previousOperator === "+") {
    runningTotal += intBuffer
  } else if (previousOperator === "−") {
    runningTotal -= intBuffer
  } else if (previousOperator === "×") {
    runningTotal *= intBuffer
  } else if (previousOperator === "÷") {
    runningTotal /= intBuffer
  }
}

function handleNumber(numberString) {
  if (buffer === "0") {
    buffer = numberString
  } else {
    buffer += numberString
  }
}

function init() {
  renderHistory(getHistory())

  document
    .querySelector(".calc-buttons")
    .addEventListener("click", function (event) {
      const button = event.target.closest("button")

      if (!button) {
        return
      }

      ButtonClick(button.innerText)
    })

  clearHistoryButton.addEventListener("click", clearHistory)
}

init()
