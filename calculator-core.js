(function (root, factory) {
  const calculatorCore = factory()

  if (typeof module === "object" && module.exports) {
    module.exports = calculatorCore
  }

  if (root) {
    root.CalculatorCore = calculatorCore
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  function formatResult(value) {
    if (!Number.isFinite(value)) {
      return "Erro"
    }

    const rounded = Number(value.toFixed(10))
    return String(Object.is(rounded, -0) ? 0 : rounded)
  }

  function calculate(leftValue, rightValue, operator) {
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
      throw new Error("Operação inválida")
    }

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
        throw new Error("Operador inválido")
    }
  }

  return { calculate, formatResult }
})
