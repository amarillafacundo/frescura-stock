// =============================
// 📦 ESTADO INICIAL
// =============================

let productos = JSON.parse(localStorage.getItem("fallasProductos"));

if (!productos) {
    productos = productosBase.map(p => ({
        ...p,
        fallas: 0
    }));
    localStorage.setItem("fallasProductos", JSON.stringify(productos));
}

// =============================
// 💾 GUARDAR EN LOCALSTORAGE
// =============================

function guardarDatos() {
    localStorage.setItem("fallasProductos", JSON.stringify(productos));
}

// =============================
// 🧱 RENDERIZAR PRODUCTOS
// =============================

function renderProductos(filtro = "") {

    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.codigo.toLowerCase().includes(filtro.toLowerCase())
    );

    if (productosFiltrados.length === 0) {
        lista.innerHTML = "<p>No hay productos.</p>";
        return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla-fallas";

tabla.innerHTML = `
    <thead>
        <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Peso (g)</th>
            <th>-</th>
            <th>Cantidad</th>
            <th>+</th>
            <th>Manual</th>
            <th>OK</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
`;

    const tbody = tabla.querySelector("tbody");

    
    productosFiltrados.forEach((producto, index) => {

        const row = document.createElement("tr");
        if (producto.fallas > 0) {
            row.classList.add("con-fallas");
}


        row.innerHTML = `
    <td>${producto.codigo}</td>
    <td>${producto.nombre}</td>
    <td>${producto.peso}</td>

    <td>
        <button onclick="restar(${index})" class="btn-touch">-</button>
    </td>

    <td class="cantidad">${producto.fallas}</td>

    <td>
        <button onclick="sumar(${index})" class="btn-touch">+</button>
    </td>

    <td>
        <input 
            type="number" 
            min="1" 
            inputmode="numeric"
            placeholder="0"
            id="input-${index}"
            class="input-touch"
            onkeydown="if(event.key==='Enter'){sumarCantidad(${index})}"
        >
    </td>

    <td>
        <button onclick="sumarCantidad(${index})" class="btn-add">OK</button>
    </td>
`;



        tbody.appendChild(row);
    });

   const wrapper = document.createElement("div");
wrapper.style.overflowX = "auto";
wrapper.appendChild(tabla);
lista.appendChild(wrapper);
}


// =============================
// ➕ SUMAR FALLA
// =============================

function sumar(index) {
    productos[index].fallas++;
    guardarDatos();
    renderProductos();
    animarFila(index);
}

// =============================
// ➕ SUMAR CANTIDAD
// =============================
function sumarCantidad(index) {

    const input = document.getElementById(`input-${index}`);
    const cantidad = parseInt(input.value);

    if (!cantidad || cantidad <= 0) return;

    productos[index].fallas += cantidad;

    guardarDatos();
    renderProductos();

    // Espera a que se renderice y vuelve a enfocar
    setTimeout(() => {
        const nuevoInput = document.getElementById(`input-${index}`);
        if (nuevoInput) {
            nuevoInput.focus();
        }
    }, 50);
}


// =============================
// ➖ RESTAR FALLA
// =============================

function restar(index) {
    if (productos[index].fallas > 0) {
        productos[index].fallas--;
        guardarDatos();
        renderProductos();
        animarFila(index);
    }
}

function animarFila(index) {
    setTimeout(() => {
        const filas = document.querySelectorAll(".tabla-fallas tr");
        if (filas[index]) {
            filas[index].classList.add("animar");
            setTimeout(() => {
                filas[index].classList.remove("animar");
            }, 200);
        }
    }, 50);
}



// =============================
// 🆕 AGREGAR PRODUCTO
// =============================

document.getElementById("agregarProducto").addEventListener("click", () => {

    const codigo = document.getElementById("nuevoCodigo").value.trim();
    const nombre = document.getElementById("nuevoNombre").value.trim();
    const peso = document.getElementById("nuevoPeso").value.trim();

    if (!codigo || !nombre || !peso) {
        alert("Completa todos los campos");
        return;
    }

    productos.push({
        codigo,
        nombre,
        peso,
        fallas: 0
    });

    guardarDatos();
    renderProductos();

    document.getElementById("nuevoCodigo").value = "";
    document.getElementById("nuevoNombre").value = "";
    document.getElementById("nuevoPeso").value = "";
});

// =============================
// 🔍 BUSCADOR
// =============================

document.getElementById("buscarProducto").addEventListener("input", (e) => {
    renderProductos(e.target.value);
});

// =============================
// 🔄 RESET FALLAS
// =============================

document.getElementById("resetFallas").addEventListener("click", () => {

    if (confirm("¿Seguro que querés resetear todas las fallas?")) {
        productos.forEach(p => p.fallas = 0);
        guardarDatos();
        renderProductos();
    }
});

// =============================
// 📤 EXPORTAR A EXCEL
// =============================

document.getElementById("exportFallas").addEventListener("click", () => {

    const data = productos
        .filter(p => p.fallas > 0)
        .map(p => ({
            Codigo: p.codigo,
            Producto: p.nombre,
            Peso: p.peso,
            Total_Fallas: p.fallas
        }));

    if (data.length === 0) {
        alert("No hay fallas para exportar");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fallas");

    XLSX.writeFile(wb, "Fallas_PEPSICO.xlsx");
});



// =============================
// 🚀 INICIALIZAR
// =============================

renderProductos();
