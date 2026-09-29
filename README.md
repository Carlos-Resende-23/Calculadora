# Calculadora

Uma calculadora feita com HTML, CSS e JavaScript, com histórico de operações e consulta da cotação do dólar.

## Funcionalidades

- Operações de soma, subtração, multiplicação e divisão
- Entrada por botões ou pelo teclado
- Histórico de cálculos salvo no navegador, com opção para limpar
- Cotação atual do dólar em reais e conversão de BRL para USD

## Tecnologias

- HTML
- CSS
- JavaScript
- [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas) para consultar a cotação USD/BRL

## Como executar

1. Abra `index.html` em um navegador. Não é necessário instalar dependências.
2. Para desenvolvimento, também é possível abrir a pasta no VS Code e iniciar um servidor local, por exemplo, com a extensão Live Server.

É necessária uma conexão com a internet para carregar e atualizar a cotação do dólar. A calculadora e o histórico funcionam no navegador; o histórico fica salvo no `localStorage` desse navegador.

## Por que `node script.js` não funciona?

Este projeto é executado no navegador. O arquivo `script.js` acessa recursos do navegador, como `document` e `localStorage`, que não existem no ambiente Node.js. Por isso, execute o `index.html` no navegador em vez de rodar o script diretamente com Node.
