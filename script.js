let runningTotal = 0
let buffer = "0"
let previousOperator = null

const HISTORY_STORAGE_KEY = "calculator-history"

const screen = document.querySelector(".screen")
const historyList = document.querySelector("#history")
const clearHistoryButton = document.querySelector("#clear-history")
const cotacaoElement = document.querySelector("#cotacao-dolar")
const valorCotacaoElement = document.querySelector("#valor-cotacao")
const variacaoCotacaoElement = document.querySelector("#variacao-cotacao")
const atualizacaoCotacaoElement = document.querySelector("#atualizacao-cotacao")
const atualizarCotacaoButton = document.querySelector("#atualizar-cotacao")
// ==========================================
// ELEMENTOS DO HTML
// ==========================================

// Seu visor usa classe "screen", não ID
const visor = document.querySelector(".screen")

// O botão converter - você precisa criar um no HTML ou usar um existente
// Vou criar um exemplo com um botão que você vai adicionar
const btnConverter = document.getElementById("btn-converter")

// ==========================================
// API - BUSCAR COTAÇÃO
// ==========================================

const API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL"

async function buscarDadosCotacao() {
  try {
    const resposta = await fetch(API_URL)
    return await resposta.json()
  } catch (erro) {
    console.error("❌ Erro ao buscar cotação:", erro)
    return null
  }
}

async function buscarCotacaoDolar() {
  const dados = await buscarDadosCotacao()
  return dados ? Number.parseFloat(dados.USDBRL.bid) : null
}

// ==========================================
// ATUALIZAR COTAÇÃO NA TELA
// ==========================================

async function atualizarCotacaoNaTela() {
  if (!cotacaoElement) {
    return
  }

  const dados = await buscarDadosCotacao()
  const cotacao = dados ? Number.parseFloat(dados.USDBRL.bid) : null

  if (cotacao) {
    const variacao = Number.parseFloat(dados.USDBRL.pctChange)
    const variacaoFormatada = Number.isNaN(variacao)
      ? "Variação indisponível"
      : `${variacao >= 0 ? "▲" : "▼"} ${Math.abs(variacao).toFixed(2).replace(".", ",")}% hoje`

    valorCotacaoElement.textContent = `R$ ${cotacao.toFixed(2).replace(".", ",")}`
    variacaoCotacaoElement.textContent = variacaoFormatada
    variacaoCotacaoElement.classList.toggle("is-positive", variacao >= 0)
    variacaoCotacaoElement.classList.toggle("is-negative", variacao < 0)
    atualizacaoCotacaoElement.textContent = `Atualizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    cotacaoElement.classList.remove("is-loading", "has-error")
  } else {
    valorCotacaoElement.textContent = "Indisponível"
    variacaoCotacaoElement.textContent =
      "Não foi possível consultar o mercado agora."
    atualizacaoCotacaoElement.textContent = "Tente novamente em instantes"
    cotacaoElement.classList.remove("is-loading")
    cotacaoElement.classList.add("has-error")
  }
}

atualizarCotacaoButton?.addEventListener("click", atualizarCotacaoNaTela)

// ==========================================
// BOTÃO CONVERTER
// ==========================================

if (btnConverter) {
  btnConverter.addEventListener("click", async () => {
    // Pega o valor do visor (texto)
    const valorTexto = visor.textContent
    console.log("📝 Valor no visor:", valorTexto)

    // Remove espaços e converte para número
    const valorEmReais = parseFloat(valorTexto.replace(/,/g, ""))

    if (isNaN(valorEmReais) || valorEmReais === 0) {
      alert("⚠️ Digite um número válido primeiro!")
      return
    }

    const cotacao = await buscarCotacaoDolar()
    if (cotacao) {
      const valorEmDolar = (valorEmReais / cotacao).toFixed(2)
      alert(
        `💵 ${valorEmReais} BRL = $${valorEmDolar} USD\n💰 Cotação: R$ ${cotacao.toFixed(2)}`,
      )
    } else {
      alert("❌ Erro ao buscar cotação. Tente novamente.")
    }
  })
} else {
  console.log(
    "ℹ️ Botão converter não encontrado. Adicione <button id='btn-converter'>Converter</button> no HTML",
  )
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Atualizar a cada 5 minutos
setInterval(atualizarCotacaoNaTela, 300000) // 5 minutos

// Carregar ao iniciar
atualizarCotacaoNaTela()

console.log("🚀 Calculadora iniciada!")

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
