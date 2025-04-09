document.getElementById("transaction-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;

  const data = { type, amount, date, category };
  addData("transacciones", data, () => {
    this.reset();
    loadTransactions();
    loadComparison();
    loadCategorySuggestions();
  });
});

document.getElementById("estimate-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const month = document.getElementById("estimate-month").value;
  const category = document.getElementById("estimate-category").value;
  const amount = parseFloat(document.getElementById("estimate-amount").value);

  const data = { month, category, amount };
  addData("estimados", data, () => {
    this.reset();
    loadComparison();
  });
});

function loadTransactions() {
  getAllData("transacciones", (data) => {
    const typeFilter = document.getElementById("filter-type").value;
    const catFilter = document.getElementById("filter-category").value.toLowerCase();

    const list = document.getElementById("transaction-list");
    list.innerHTML = "";

    const filtered = data.filter((item) => {
      const typeMatch = typeFilter === "todos" || item.type === typeFilter;
      const catMatch = item.category.toLowerCase().includes(catFilter);
      return typeMatch && catMatch;
    });

    filtered.forEach((item) => {
      const div = document.createElement("div");
      div.className = "transaction";
      div.innerHTML = `
        <span>${item.date} - ${item.category} (${item.type}): $${item.amount}</span>
        <button onclick="deleteData('transacciones', ${item.id}, () => { loadTransactions(); loadComparison(); })">Eliminar</button>
      `;
      list.appendChild(div);
    });
  });
}


function loadComparison() {
  getAllData("transacciones", (trans) => {
    getAllData("estimados", (estimados) => {
      const result = {};

      trans.forEach((t) => {
        const mes = t.date.slice(0, 7);
        const key = `${mes}-${t.category}`;
        result[key] = result[key] || { mes, categoria: t.category, real: 0, estimado: 0 };
        if (t.type === "egreso") result[key].real += t.amount;
      });

      estimados.forEach((e) => {
        const key = `${e.month}-${e.category}`;
        result[key] = result[key] || { mes: e.month, categoria: e.category, real: 0, estimado: 0 };
        result[key].estimado += e.amount;
      });

      const tbody = document.querySelector("#comparison-table tbody");
      tbody.innerHTML = "";

      Object.values(result).forEach((r) => {
        const tr = document.createElement("tr");
        const diff = r.estimado - r.real;
        tr.innerHTML = `
          <td>${r.mes}</td>
          <td>${r.categoria}</td>
          <td>$${r.estimado.toFixed(2)}</td>
          <td>$${r.real.toFixed(2)}</td>
          <td style="color:${diff < 0 ? 'red' : 'green'};">$${diff.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  });
}

document.getElementById("apply-filters").addEventListener("click", loadTransactions);

function loadCategorySuggestions() {
  getAllData("transacciones", (data) => {
    const categories = [...new Set(data.map(t => t.category.toLowerCase()))];

    const container = document.getElementById("category-suggestions");
    container.innerHTML = "";

    categories.forEach((cat) => {
      const span = document.createElement("span");
      span.textContent = cat;
      span.onclick = () => {
        document.getElementById("category").value = cat;
      };
      container.appendChild(span);
    });
  });
}
