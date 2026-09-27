const HISTORY_STORAGE_KEY = "calculator-history"
const API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL"

const screen = document.querySelector(".screen")
const historyList = document.querySelector("#history")
const clearHistoryButton = document.querySelector("#clear-history")
const cotacaoElement = document.querySelector("#cotacao-dolar")
const valorCotacaoElement = document.querySelector("#valor-cotacao")
const variacaoCotacaoElement = document.querySelector("#variacao-cotacao")
const atualizacaoCotacaoElement = document.querySelector("#atualizacao-cotacao")
const atualizarCotacaoButton = document.querySelector("#atualizar-cotacao")
const btnConverter = document.getElementById("btn-converter")

const calculatorState = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForNextValue: false,
}

function updateScreen() {
  if (!screen) return

  screen.textContent = calculatorState.displayValue
  screen.setAttribute(
    "aria-label",
    `Visor da calculadora com valor ${calculatorState.displayValue}`,
  )
}

function resetCalculator() {
  calculatorState.displayValue = "0"
  calculatorState.firstOperand = null
  calculatorState.operator = null
  calculatorState.waitingForNextValue = false
  updateScreen()
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return "Erro"
  }

  const rounded = Number(value.toFixed(10))
  return String(rounded)
}

function applyNumber(value) {
  if (calculatorState.waitingForNextValue) {
    calculatorState.displayValue = "0"
    calculatorState.waitingForNextValue = false
  }

  if (value === ".") {
    if (calculatorState.displayValue.includes(".")) {
      return
    }

    calculatorState.displayValue =
      calculatorState.displayValue === "0"
        ? "0."
        : `${calculatorState.displayValue}.`
    updateScreen()
    return
  }

  calculatorState.displayValue =
    calculatorState.displayValue === "0"
      ? value
      : `${calculatorState.displayValue}${value}`
  updateScreen()
}

function handleOperator(nextOperator) {
  const currentValue = Number.parseFloat(calculatorState.displayValue)

  if (!Number.isFinite(currentValue)) {
    return
  }

  if (calculatorState.operator && calculatorState.waitingForNextValue) {
    calculatorState.operator = nextOperator
    return
  }

  if (calculatorState.firstOperand === null) {
    calculatorState.firstOperand = currentValue
  } else if (calculatorState.operator) {
    const result = calculate(
      calculatorState.firstOperand,
      currentValue,
      calculatorState.operator,
    )

    calculatorState.displayValue = formatResult(result)
    calculatorState.firstOperand = result
  }

  calculatorState.operator = nextOperator
  calculatorState.waitingForNextValue = true
  updateScreen()
}

function calculate(leftValue, rightValue, operator) {
  switch (operator) {
    case "+":
      return leftValue + rightValue
    case "−":
      return leftValue - rightValue
    case "×":
      return leftValue * rightValue
    case "÷":
      if (rightValue === 0) {
        throw new Error("Divisão por zero")
      }
      return leftValue / rightValue
    default:
      return rightValue
  }
}

function evaluateExpression() {
  if (
    calculatorState.operator === null ||
    calculatorState.firstOperand === null ||
    !Number.isFinite(Number.parseFloat(calculatorState.displayValue))
  ) {
    return
  }

  try {
    const currentValue = Number.parseFloat(calculatorState.displayValue)
    const result = calculate(
      calculatorState.firstOperand,
      currentValue,
      calculatorState.operator,
    )
    const formattedResult = formatResult(result)

    addHistoryEntry(
      `${calculatorState.firstOperand} ${calculatorState.operator} ${currentValue} = ${formattedResult}`,
    )

    calculatorState.displayValue = formattedResult
    calculatorState.firstOperand = null
    calculatorState.operator = null
    calculatorState.waitingForNextValue = true
    updateScreen()
  } catch (error) {
    calculatorState.displayValue = "Erro"
    calculatorState.firstOperand = null
    calculatorState.operator = null
    calculatorState.waitingForNextValue = true
    updateScreen()
    console.error(error)
  }
}

function applyBackspace() {
  if (calculatorState.waitingForNextValue) {
    return
  }

  if (calculatorState.displayValue.length <= 1) {
    calculatorState.displayValue = "0"
  } else {
    calculatorState.displayValue = calculatorState.displayValue.slice(0, -1)
  }

  updateScreen()
}

function handleCalculatorAction(value) {
  if (/[0-9]/.test(value)) {
    applyNumber(value)
    return
  }

  if (value === ".") {
    applyNumber(value)
    return
  }

  switch (value) {
    case "C":
      resetCalculator()
      break
    case "←":
      applyBackspace()
      break
    case "+":
    case "−":
    case "×":
    case "÷":
      handleOperator(value)
      break
    case "=":
      evaluateExpression()
      break
    default:
      break
  }
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
  if (!historyList) return

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

function bindCalculatorEvents() {
  const calculatorButtons = document.querySelector(".calc-buttons")

  if (calculatorButtons) {
    calculatorButtons.addEventListener("click", (event) => {
      const button = event.target.closest("button")
      if (!button) return

      const buttonValue = button.textContent.trim()
      handleCalculatorAction(buttonValue)
    })
  }

  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", clearHistory)
  }

  if (atualizarCotacaoButton) {
    atualizarCotacaoButton.addEventListener("click", atualizarCotacaoNaTela)
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key

    if (/^[0-9]$/.test(key)) {
      event.preventDefault()
      applyNumber(key)
      return
    }

    if (key === ".") {
      event.preventDefault()
      applyNumber(".")
      return
    }

    if (["+", "-", "*", "/"].includes(key)) {
      event.preventDefault()
      const mappedOperator =
        key === "/" ? "÷" : key === "*" ? "×" : key === "-" ? "−" : "+"
      handleOperator(mappedOperator)
      return
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault()
      evaluateExpression()
      return
    }

    if (key === "Backspace") {
      event.preventDefault()
      applyBackspace()
      return
    }

    if (key === "Escape") {
      event.preventDefault()
      resetCalculator()
    }
  })
}

async function buscarDadosCotacao() {
  const resposta = await fetch(API_URL, { cache: "no-store" })

  if (!resposta.ok) {
    throw new Error("Falha ao consultar a cotação.")
  }

  const dados = await resposta.json()
  const quote = dados?.USDBRL

  if (!quote || !quote.bid) {
    throw new Error("Resposta da cotação incompleta.")
  }

  return quote
}

async function buscarCotacaoDolar() {
  try {
    const dados = await buscarDadosCotacao()
    return Number.parseFloat(dados.bid)
  } catch (erro) {
    console.error("❌ Erro ao buscar cotação:", erro)
    return null
  }
}

async function atualizarCotacaoNaTela() {
  if (
    !cotacaoElement ||
    !valorCotacaoElement ||
    !variacaoCotacaoElement ||
    !atualizacaoCotacaoElement
  ) {
    return
  }

  cotacaoElement.classList.add("is-loading")
  cotacaoElement.classList.remove("has-error")
  valorCotacaoElement.textContent = "--"
  variacaoCotacaoElement.textContent = "Buscando dados do mercado..."
  atualizacaoCotacaoElement.textContent = "Atualizando agora"

  try {
    const dados = await buscarDadosCotacao()
    const cotacao = Number.parseFloat(dados.bid)
    const variacao = Number.parseFloat(dados.pctChange)

    if (!Number.isFinite(cotacao)) {
      throw new Error("Cotação inválida.")
    }

    const variacaoFormatada = Number.isNaN(variacao)
      ? "Variação indisponível"
      : `${variacao >= 0 ? "▲" : "▼"} ${Math.abs(variacao).toFixed(2).replace(".", ",")}% hoje`

    valorCotacaoElement.textContent = `R$ ${cotacao.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
    variacaoCotacaoElement.textContent = variacaoFormatada
    variacaoCotacaoElement.classList.toggle("is-positive", variacao >= 0)
    variacaoCotacaoElement.classList.toggle("is-negative", variacao < 0)
    atualizacaoCotacaoElement.textContent = `Atualizado às ${new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`
    cotacaoElement.classList.remove("is-loading", "has-error")
  } catch (erro) {
    console.error("❌ Erro ao atualizar cotação:", erro)
    valorCotacaoElement.textContent = "Indisponível"
    variacaoCotacaoElement.textContent =
      "Não foi possível consultar o mercado agora."
    atualizacaoCotacaoElement.textContent = "Tente novamente em instantes"
    cotacaoElement.classList.remove("is-loading")
    cotacaoElement.classList.add("has-error")
  }
}

async function converterParaDolar() {
  if (!btnConverter) return

  const valorTexto = screen ? screen.textContent.trim() : "0"
  const valorEmReais = Number.parseFloat(
    valorTexto.replace(/\./g, "").replace(",", "."),
  )

  if (!Number.isFinite(valorEmReais)) {
    alert("Digite um valor válido antes de converter.")
    return
  }

  const cotacao = await buscarCotacaoDolar()

  if (!cotacao) {
    alert("Não foi possível buscar a cotação do dólar no momento.")
    return
  }

  const valorEmDolar = valorEmReais / cotacao
  alert(
    `💵 ${valorEmReais.toFixed(2).replace(".", ",")} BRL = $${valorEmDolar.toFixed(2).replace(".", ",")} USD\n💰 Cotação: R$ ${cotacao.toFixed(2).replace(".", ",")}`,
  )
}

function init() {
  renderHistory(getHistory())
  updateScreen()
  bindCalculatorEvents()

  if (btnConverter) {
    btnConverter.addEventListener("click", converterParaDolar)
  }

  atualizarCotacaoNaTela()
  setInterval(atualizarCotacaoNaTela, 300000)
}

init()
