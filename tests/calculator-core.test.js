const test = require("node:test")
const assert = require("node:assert/strict")

const { calculate, formatResult } = require("../calculator-core")

test("calcula soma", () => {
  assert.equal(calculate(10, 5, "+"), 15)
})

test("calcula subtração", () => {
  assert.equal(calculate(-5, 2, "−"), -7)
})

test("calcula multiplicação", () => {
  assert.equal(calculate(3.5, 2, "×"), 7)
})

test("calcula divisão", () => {
  assert.equal(calculate(10, 4, "÷"), 2.5)
})

test("lança erro ao dividir por zero", () => {
  assert.throws(() => calculate(10, 0, "÷"), /Divisão por zero/)
})

test("lança erro para operador inválido", () => {
  assert.throws(() => calculate(10, 2, "%"), /Operador inválido/)
})

test("formata resultado arredondado", () => {
  assert.equal(formatResult(1 / 3), "0.3333333333")
})

test("converte zero negativo em zero", () => {
  assert.equal(formatResult(-0), "0")
})

test("retorna Erro para valor não finito", () => {
  assert.equal(formatResult(Infinity), "Erro")
})
