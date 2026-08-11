const calcBtn = document.getElementById("calcBtn");
const currencySelect = document.getElementById("currency");
const currencySymbols = document.querySelectorAll(".currency-symbol");
const itemsTableBody = document.getElementById("itemsTableBody");
const grandTotalEl = document.getElementById("grandTotal");

const marketplaceSelect = document.getElementById("marketplace");
const platformFeeInput = document.getElementById("platformFee");
const platformFlatFeeInput = document.getElementById("platformFlatFee");

const marketplacePresets = {
  depop: { fee: 3.3, flat: 0.45 },
  ebay: { fee: 13.6, flat: 0.40 },
  vinted: { fee: 0, flat: 0 },
  facebook: { fee: 10, flat: 0 }
};

marketplaceSelect.addEventListener("change", function () {
  const choice = marketplaceSelect.value;

  if (choice === "custom") {
    platformFeeInput.disabled = false;
    platformFlatFeeInput.disabled = false;
  } else {
    const preset = marketplacePresets[choice];
    platformFeeInput.value = preset.fee;
    platformFlatFeeInput.value = preset.flat;
    platformFeeInput.disabled = true;
    platformFlatFeeInput.disabled = true;
  }
});

const editBar = document.getElementById("editBar");
const editBtn = document.getElementById("editBtn");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const newItemBtn = document.getElementById("newItemBtn");

const formFields = ["marketplace", "itemName", "currency", "cost", "sell", "qty", "weight", "rate", "platformFee", "platformFlatFee", "customs"];

let items = [];
let itemCounter = 0;
let editingItemId = null;

currencySelect.addEventListener("change", function () {
  const symbol = currencySelect.value === "CNY" ? "¥" : "$";
  currencySymbols.forEach(function (el) {
    el.textContent = symbol;
  });
});

async function calculateProfit() {
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
      return null;
    }
  }

  const shippingCost = weight * rate;
  const totalRevenue = sell * qty;
  const platformFeeAmount = totalRevenue * (platformFeePercent / 100);
  const totalCost = cost + shippingCost + customs + platformFeeAmount + platformFlatFee;
  const profit = totalRevenue - totalCost;

  resultText.textContent = "> profit: $" + profit.toFixed(2);
  resultText.style.color = profit < 0 ? "#E2574C" : "#A855F7";

  return profit;
}

function getRawFormValues() {
  return {
    marketplace: marketplaceSelect.value,
    name: document.getElementById("itemName").value || "Untitled Item",
    currency: currencySelect.value,
    cost: document.getElementById("cost").value,
    sell: document.getElementById("sell").value,
    qty: document.getElementById("qty").value,
    weight: document.getElementById("weight").value,
    rate: document.getElementById("rate").value,
    platformFee: document.getElementById("platformFee").value,
    platformFlatFee: document.getElementById("platformFlatFee").value,
    customs: document.getElementById("customs").value
  };
}

function loadValuesIntoForm(values) {
  marketplaceSelect.value = values.marketplace;
  document.getElementById("itemName").value = values.name;
  currencySelect.value = values.currency;
  document.getElementById("cost").value = values.cost;
  document.getElementById("sell").value = values.sell;
  document.getElementById("qty").value = values.qty;
  document.getElementById("weight").value = values.weight;
  document.getElementById("rate").value = values.rate;
  document.getElementById("platformFee").value = values.platformFee;
  document.getElementById("platformFlatFee").value = values.platformFlatFee;
  document.getElementById("customs").value = values.customs;

  const symbol = values.currency === "CNY" ? "¥" : "$";
  currencySymbols.forEach(function (el) {
    el.textContent = symbol;
  });
}

function setFieldsDisabled(disabled) {
  formFields.forEach(function (id) {
    document.getElementById(id).disabled = disabled;
  });
}

function clearForm() {
  formFields.forEach(function (id) {
    const el = document.getElementById(id);
    if (id === "marketplace") {
      el.value = "custom";
      platformFeeInput.disabled = false;
      platformFlatFeeInput.disabled = false;
    } else if (el.tagName === "SELECT") {
      el.value = "USD";
    } else if (id === "platformFlatFee") {
      el.value = "0.45";
    } else {
      el.value = "";
    }
  });
}

async function loadUserItems() {
  const loaded = await window.firestoreLoadItems();
  if (loaded.length > 0) {
    items = loaded;
    itemCounter = Math.max.apply(null, items.map(function (i) { return i.number; }));
    renderItemsTable();
  }
}
window.loadUserItems = loadUserItems;

function syncToCloud() {
  if (window.firestoreSaveItems) {
    window.firestoreSaveItems(items);
  }
}

function validateForm() {
  const errors = [];

  const sell = parseFloat(document.getElementById("sell").value);
  const qty = parseFloat(document.getElementById("qty").value);
  const cost = parseFloat(document.getElementById("cost").value);
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;
  const platformFee = parseFloat(document.getElementById("platformFee").value) || 0;
  const customs = parseFloat(document.getElementById("customs").value) || 0;

  if (!sell || sell <= 0) errors.push("Selling price must be greater than $0.");
  if (!qty || qty <= 0) errors.push("Quantity must be at least 1.");
  if (isNaN(cost) || cost < 0) errors.push("Base cost can't be negative.");
  if (weight < 0) errors.push("Weight can't be negative.");
  if (rate < 0) errors.push("Shipping rate can't be negative.");
  if (customs < 0) errors.push("Customs/import tax can't be negative.");
  if (platformFee < 0 || platformFee > 100) errors.push("Platform fee must be between 0–100%.");

  return errors;
}

function showErrors(errors) {
  const errorBox = document.getElementById("errorBox");
  if (errors.length === 0) {
    errorBox.classList.remove("visible");
    errorBox.innerHTML = "";
    return;
  }
  errorBox.innerHTML = "<ul>" + errors.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ul>";
  errorBox.classList.add("visible");
}

calcBtn.addEventListener("click", async function () {
  const errors = validateForm();
  showErrors(errors);
  if (errors.length > 0) return;
  const profit = await calculateProfit();
  if (profit === null) return;

  itemCounter++;
  const raw = getRawFormValues();
  raw.id = Date.now();
  raw.number = itemCounter;
  raw.profit = profit;
  items.push(raw);
  syncToCloud();

  clearForm();
  renderItemsTable();
});

itemsTableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("item-link")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    const item = items.find(function (i) { return i.id === id; });
    if (!item) return;

    editingItemId = id;
    loadValuesIntoForm(item);
    setFieldsDisabled(true);
    calcBtn.style.display = "none";
    editBar.style.display = "flex";
    editBtn.style.display = "block";
    saveChangesBtn.style.display = "none";
    cancelEditBtn.style.display = "none";
    newItemBtn.style.display = "block";
  }

  if (e.target.classList.contains("remove-btn")) {
    const idToRemove = parseInt(e.target.getAttribute("data-id"));
    items = items.filter(function (item) { return item.id !== idToRemove; });
    syncToCloud();
    renderItemsTable();
  }
});

document.querySelector(".card").addEventListener("click", function (e) {
  if (e.target.classList.contains("clear-field-btn")) {
    const targetId = e.target.getAttribute("data-target");
    document.getElementById(targetId).value = "";
  }
});

const clearFormBtn = document.getElementById("clearFormBtn");
clearFormBtn.addEventListener("click", function () {
  clearForm();
  showErrors([]);
});

const clearAllBtn = document.getElementById("clearAllBtn");
clearAllBtn.addEventListener("click", function () {
  const confirmed = confirm("Remove all saved items? This can't be undone.");
  if (!confirmed) return;

  items = [];
  itemCounter = 0;
  syncToCloud();
  renderItemsTable();
});

editBtn.addEventListener("click", function () {
  setFieldsDisabled(false);
  editBtn.style.display = "none";
  saveChangesBtn.style.display = "block";
  cancelEditBtn.style.display = "block";
  newItemBtn.style.display = "none";
});

saveChangesBtn.addEventListener("click", async function () {
  const errors = validateForm();
  showErrors(errors);
  if (errors.length > 0) return;
  const profit = await calculateProfit();
  if (profit === null) return;

  const raw = getRawFormValues();
  const index = items.findIndex(function (i) { return i.id === editingItemId; });
  if (index !== -1) {
    raw.id = editingItemId;
    raw.number = items[index].number;
    raw.profit = profit;
    items[index] = raw;
  }
  syncToCloud();

  exitEditMode();
  renderItemsTable();
});

cancelEditBtn.addEventListener("click", function () {
  const item = items.find(function (i) { return i.id === editingItemId; });
  if (item) loadValuesIntoForm(item);
  setFieldsDisabled(true);
  editBtn.style.display = "block";
  saveChangesBtn.style.display = "none";
  cancelEditBtn.style.display = "none";
  newItemBtn.style.display = "block";
});

newItemBtn.addEventListener("click", function () {
  exitEditMode();
});

function exitEditMode() {
  editingItemId = null;
  setFieldsDisabled(false);
  clearForm();
  calcBtn.style.display = "block";
  editBar.style.display = "none";
}

function renderItemsTable() {
  itemsTableBody.innerHTML = "";

  items.forEach(function (item) {
    const row = document.createElement("tr");
    row.innerHTML =
      '<td><span class="item-link" data-id="' + item.id + '">#' + item.number + " — " + item.name + "</span></td>" +
      "<td>" + item.qty + "</td>" +
      "<td>$" + item.profit.toFixed(2) + "</td>" +
      '<td><button class="remove-btn" data-id="' + item.id + '">✕</button></td>';
    itemsTableBody.appendChild(row);
  });

  const grandTotal = items.reduce(function (sum, item) {
    return sum + item.profit;
  }, 0);
  grandTotalEl.textContent = "$" + grandTotal.toFixed(2);
}