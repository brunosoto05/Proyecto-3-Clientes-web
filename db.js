let db;

const request = indexedDB.open("finanzasDB", 1);

request.onerror = () => {
  console.error("Error al abrir IndexedDB");
};

request.onsuccess = () => {
  db = request.result;
  loadTransactions();
  loadComparison();
  loadCategorySuggestions();
};

request.onupgradeneeded = (e) => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("transacciones")) {
    db.createObjectStore("transacciones", { keyPath: "id", autoIncrement: true });
  }

  if (!db.objectStoreNames.contains("estimados")) {
    db.createObjectStore("estimados", { keyPath: "id", autoIncrement: true });
  }
};

function addData(storeName, data, callback) {
  const tx = db.transaction([storeName], "readwrite");
  const store = tx.objectStore(storeName);
  store.add(data);
  tx.oncomplete = callback;
}

function getAllData(storeName, callback) {
  const tx = db.transaction([storeName], "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  request.onsuccess = () => callback(request.result);
}

function deleteData(storeName, id, callback) {
  const tx = db.transaction([storeName], "readwrite");
  const store = tx.objectStore(storeName);
  store.delete(id);
  tx.oncomplete = callback;
}
