const calcBtn = document.getElementById("calcBtn");
const currencySelect = document.getElementById("currency");
const currencySymbols = document.querySelectorAll(".currency-symbol");

currencySelect.addEventListener("change", function () {
  const symbol = currencySelect.value === "CNY" ? "¥" : "$";
  currencySymbols.forEach(function (el) {
    el.textContent = symbol;
  });
});

calcBtn.addEventListener("click", async function () {
  const resultText = document.getElementById("result");
  resultText.textContent = "> calculating...";

  let cost = parseFloat(document.getElementById("cost").value) || 0;
  const sell = parseFloat(document.getElementById("sell").value) || 0;
  const qty = parseFloat(document.getElementById("qty").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  let rate = parseFloat(document.getElementById("rate").value) || 0;
  const platformFeePercent = parseFloat(document.getElementById("platformFee").value) || 0;
  const platformFlatFee = parseFloat(document.getElementById("platformFlatFee").value) || 0;
  let customs = parseFloat(document.getElementById("customs").value) || 0;
  const currency = currencySelect.value;

  if (currency === "CNY") {
    try {
      const response = await fetch("https://api.frankfurter.dev/v2/rate/CNY/USD");
      const data = await response.json();
      const cnyToUsd = data.rate;

      cost = cost * cnyToUsd;
      rate = rate * cnyToUsd;
      customs = customs * cnyToUsd;
    } catch (error) {
      resultText.textContent = "> error fetching exchange rate";
      return;
    }
  }

  const shippingCost = weight * rate;
  const totalRevenue = sell * qty;
  const platformFeeAmount = totalRevenue * (platformFeePercent / 100);
  const totalCost = cost + shippingCost + customs + platformFeeAmount + platformFlatFee;
  const profit = totalRevenue - totalCost;

  resultText.textContent = "> profit: $" + profit.toFixed(2);
  resultText.style.color = profit < 0 ? "#E2574C" : "#A855F7";
});