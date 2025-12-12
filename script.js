
// Referencias
const form = document.getElementById('formRegistro');
const tbody = document.querySelector('#tablaDatos tbody');
const exportCsvBtn = document.getElementById('exportCsv');
const printBtn = document.getElementById('printPdf');
const clearAllBtn = document.getElementById('clearAll');

// Campos del formulario
const fields = ['codigo', 'bultos', 'unidades', 'fecha', 'pasillo'];

// --- Utilidades ---
function pad(n) { return String(n).padStart(2, '0'); }
function formatoTimestamp(d = new Date()) {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day} ${hh}:${mm}`;
}
function val(id) {
    const el = document.getElementById(id);
    return (el && el.value) ? el.value.trim() : '';
}

// Persistencia local
const STORAGE_KEY = 'frescura_rows_v3';
function cargarLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; } catch { return []; }
}
function guardarLocal(rows) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

// Reconstruir tabla desde localStorage (manteniendo timestamp original)
function reconstruirTabla() {
    const rows = cargarLocal() || [];
    tbody.innerHTML = '';
    rows.forEach(r => agregarFila(r, false)); // r ya incluye timestamp
}

// Agregar fila (desde formulario o desde storage)
function agregarFila(values, persist = true) {
    const tr = document.createElement('tr');

    // Si values ya incluye timestamp (6 columnas), úsalo tal cual
    const incluyeTimestamp = Array.isArray(values) && values.length === 6;
    const celdas = incluyeTimestamp ? values : [formatoTimestamp(), ...values];

    celdas.forEach(texto => {
        const td = document.createElement('td');
        td.textContent = texto;
        tr.appendChild(td);
    });

    // Acción borrar
    const tdAccion = document.createElement('td');
    const del = document.createElement('span');
    del.textContent = 'Borrar';
    del.className = 'delete';
    del.onclick = () => {
        tr.remove();
        if (persist) syncDesdeTabla();
    };
    tdAccion.appendChild(del);
    tr.appendChild(tdAccion);

    tbody.appendChild(tr);

    if (persist) {
        const rows = cargarLocal();
        rows.push(celdas); // Guardamos con timestamp
        guardarLocal(rows);
    }
}

// Validar obligatorios
function validarObligatorios(values) {
    const [codigo, bultos, , fecha, pasillo] = values;
    return !!(codigo && bultos && fecha && pasillo);
}

// Sincronizar almacenamiento desde tabla actual
function syncDesdeTabla() {
    const rows = [];
    for (const tr of tbody.querySelectorAll('tr')) {
        const cells = [...tr.querySelectorAll('td')].slice(0, 6).map(td => td.textContent);
        rows.push(cells);
    }
    guardarLocal(rows);
}

// Init
reconstruirTabla();

// Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = fields.map(val);
    if (!validarObligatorios(values)) {
        alert('CÓDIGO, Bultos, Fecha y Pasillo son obligatorios.');
        return;
    }
    agregarFila(values, true);
    // Limpiar campos (fecha y pasillo se mantienen)
    ['codigo', 'bultos', 'unidades'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
});

// Exportar CSV
function tablaComoArray() {
    const rows = [];
    for (const tr of tbody.querySelectorAll('tr')) {
        const cells = [...tr.querySelectorAll('td')].slice(0, 6).map(td => td.textContent);
        rows.push(cells);
    }
    return rows;
}
function aCSV(data) {
    const header = ['Timestamp', 'CÓDIGO', 'Bultos', 'Unidades', 'Fecha', 'Pasillo'];
    const all = [header, ...data];
    return all.map(row =>
        row.map(val => {
            const v = (val ?? '').toString().replace(/\"/g, '\"\"');
            return /[\",\n]/.test(v) ? `"${v}"` : v;
        }).join(',')
    ).join('\n');
}
function descargar(nombre, contenido, mime) {
    const blob = new Blob([contenido], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
exportCsvBtn.addEventListener('click', () => {
    const data = tablaComoArray();
    if (!data.length) { alert('No hay filas para exportar.'); return; }
    const csv = aCSV(data);
    descargar('frescura_stock.csv', csv, 'text/csv');
});

// Imprimir / Guardar PDF
printBtn.addEventListener('click', () => window.print());

// Borrar todas las filas
clearAllBtn.addEventListener('click', () => {
    if (confirm('¿Borrar todas las filas?')) {
        tbody.innerHTML = '';
        guardarLocal([]); // vaciar storage
    }
});
