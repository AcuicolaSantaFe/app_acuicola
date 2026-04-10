const API_URL = 'http://localhost:3000/api';

// ==========================
// INICIO
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];

    await cargarSitios();
    await cargarMarcas();
    await cargarTiposProducto();

    await cargarSitiosFiltro();

    await cargarRegistros();
});

// ==========================
// CARGAR SITIOS (FORM)
// ==========================
async function cargarSitios() {
    const response = await fetch(`${API_URL}/catalogos/sitios`);
    const sitios = await response.json();

    const select = document.getElementById('sitio_id');
    select.innerHTML = '<option value="">Seleccione un sitio</option>';

    sitios.forEach(sitio => {
        select.innerHTML += `<option value="${sitio.id}">${sitio.nombre}</option>`;
    });

    select.addEventListener('change', async function () {
        document.getElementById('modulo_id').innerHTML = '<option value="">Seleccione un módulo</option>';
        document.getElementById('estanque_id').innerHTML = '<option value="">Seleccione un estanque</option>';
        document.getElementById('hectareas').value = '';

        if (this.value) {
            await cargarModulos(this.value);
        }
    });
}

// ==========================
// CARGAR MODULOS (FORM)
// ==========================
async function cargarModulos(sitioId) {
    const response = await fetch(`${API_URL}/catalogos/modulos/${sitioId}`);
    const modulos = await response.json();

    const select = document.getElementById('modulo_id');
    select.innerHTML = '<option value="">Seleccione un módulo</option>';

    modulos.forEach(modulo => {
        select.innerHTML += `<option value="${modulo.id}">${modulo.nombre}</option>`;
    });

    select.onchange = async function () {
        document.getElementById('estanque_id').innerHTML = '<option value="">Seleccione un estanque</option>';
        document.getElementById('hectareas').value = '';

        if (this.value) {
            await cargarEstanques(this.value);
        }
    };
}

// ==========================
// CARGAR ESTANQUES (FORM)
// ==========================
async function cargarEstanques(moduloId) {
    const response = await fetch(`${API_URL}/catalogos/estanques/${moduloId}`);
    const estanques = await response.json();

    const select = document.getElementById('estanque_id');
    select.innerHTML = '<option value="">Seleccione un estanque</option>';

    estanques.forEach(estanque => {
        select.innerHTML += `
            <option value="${estanque.id}" data-hectareas="${estanque.hectareas}">
                ${estanque.nombre}
            </option>
        `;
    });

    select.onchange = function () {
        const selected = this.options[this.selectedIndex];
        const hectareas = selected.getAttribute('data-hectareas') || '';
        document.getElementById('hectareas').value = hectareas;
    };
}

// ==========================
// CARGAR MARCAS
// ==========================
async function cargarMarcas() {
    const response = await fetch(`${API_URL}/catalogos/marcas`);
    const marcas = await response.json();

    const select = document.getElementById('marca_id');
    select.innerHTML = '<option value="">Seleccione una marca</option>';

    marcas.forEach(marca => {
        select.innerHTML += `<option value="${marca.id}">${marca.nombre}</option>`;
    });
}

// ==========================
// AGREGAR MARCA
// ==========================
async function agregarMarca() {
    const input = document.getElementById('nueva_marca');
    const nombre = input.value.trim();

    if (!nombre) {
        alert('Escribe una nueva marca');
        return;
    }

    const response = await fetch(`${API_URL}/catalogos/marcas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
    });

    const result = await response.json();

    if (result.success) {
        alert('Marca agregada correctamente');
        input.value = '';
        await cargarMarcas();
        document.getElementById('marca_id').value = result.data.id;
    } else {
        alert(result.message || 'Error al agregar marca');
    }
}

// ==========================
// CARGAR TIPOS PRODUCTO
// ==========================
async function cargarTiposProducto() {
    const response = await fetch(`${API_URL}/catalogos/tipos-producto`);
    const tipos = await response.json();

    const select = document.getElementById('tipo_producto_id');
    select.innerHTML = '<option value="">Seleccione tipo de producto</option>';

    tipos.forEach(tipo => {
        select.innerHTML += `<option value="${tipo.id}">${tipo.nombre}</option>`;
    });
}

// ==========================
// AGREGAR TIPO PRODUCTO
// ==========================
async function agregarTipoProducto() {
    const input = document.getElementById('nuevo_tipo_producto');
    const nombre = input.value.trim();

    if (!nombre) {
        alert('Escribe un nuevo tipo de producto');
        return;
    }

    const response = await fetch(`${API_URL}/catalogos/tipos-producto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
    });

    const result = await response.json();

    if (result.success) {
        alert('Tipo de producto agregado correctamente');
        input.value = '';
        await cargarTiposProducto();
        document.getElementById('tipo_producto_id').value = result.data.id;
    } else {
        alert(result.message || 'Error al agregar tipo de producto');
    }
}

// ==========================
// GUARDAR REGISTRO
// ==========================
async function guardarRegistro() {
    const data = {
        fecha: document.getElementById('fecha').value,
        sitio_id: document.getElementById('sitio_id').value,
        modulo_id: document.getElementById('modulo_id').value,
        estanque_id: document.getElementById('estanque_id').value,
        marca_id: document.getElementById('marca_id').value,
        tipo_producto_id: document.getElementById('tipo_producto_id').value,
        kg_dia: parseFloat(document.getElementById('kg_dia').value),
        observaciones: document.getElementById('observaciones').value
    };

    if (!data.fecha || !data.sitio_id || !data.modulo_id || !data.estanque_id || !data.marca_id || !data.tipo_producto_id || isNaN(data.kg_dia)) {
        alert('Completa todos los campos obligatorios');
        return;
    }

    const response = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
        alert('Registro guardado correctamente');

        document.getElementById('registroForm').reset();
        document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('hectareas').value = '';

        await cargarSitios();
        await cargarMarcas();
        await cargarTiposProducto();

        await cargarRegistros();
    } else {
        alert(result.message || 'Error al guardar registro');
    }
}

// ==========================
// CARGAR REGISTROS SIN FILTRO
// ==========================
async function cargarRegistros() {
    const response = await fetch(`${API_URL}/registro`);
    const registros = await response.json();
    renderizarTabla(registros);
}

// ==========================
// RENDER TABLA
// ==========================
function renderizarTabla(registros) {
    const tbody = document.getElementById('tablaRegistros');
    tbody.innerHTML = '';

    if (!registros.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">No hay registros encontrados</td>
            </tr>
        `;
        return;
    }

    registros.forEach(registro => {
        tbody.innerHTML += `
            <tr>
                <td>${registro.fecha}</td>
                <td>${registro.sitio}</td>
                <td>${registro.modulo}</td>
                <td>${registro.estanque}</td>
                <td>${registro.hectareas}</td>
                <td>${registro.marca}</td>
                <td>${registro.tipo_producto}</td>
                <td>${registro.kg_dia}</td>
                <td>${registro.observaciones || ''}</td>
            </tr>
        `;
    });
}

// ==========================
// CARGAR SITIOS FILTRO
// ==========================
async function cargarSitiosFiltro() {
    const response = await fetch(`${API_URL}/catalogos/sitios`);
    const sitios = await response.json();

    const select = document.getElementById('filtro_sitio');
    select.innerHTML = '<option value="">Todos los sitios</option>';

    sitios.forEach(sitio => {
        select.innerHTML += `<option value="${sitio.id}">${sitio.nombre}</option>`;
    });

    select.addEventListener('change', async function () {
        document.getElementById('filtro_modulo').innerHTML = '<option value="">Todos los módulos</option>';
        document.getElementById('filtro_estanque').innerHTML = '<option value="">Todos los estanques</option>';

        if (this.value) {
            await cargarModulosFiltro(this.value);
        }
    });

    document.getElementById('filtro_modulo').addEventListener('change', async function () {
        document.getElementById('filtro_estanque').innerHTML = '<option value="">Todos los estanques</option>';

        if (this.value) {
            await cargarEstanquesFiltro(this.value);
        }
    });
}

// ==========================
// CARGAR MODULOS FILTRO
// ==========================
async function cargarModulosFiltro(sitioId) {
    const response = await fetch(`${API_URL}/catalogos/modulos/${sitioId}`);
    const modulos = await response.json();

    const select = document.getElementById('filtro_modulo');
    select.innerHTML = '<option value="">Todos los módulos</option>';

    modulos.forEach(modulo => {
        select.innerHTML += `<option value="${modulo.id}">${modulo.nombre}</option>`;
    });
}

// ==========================
// CARGAR ESTANQUES FILTRO
// ==========================
async function cargarEstanquesFiltro(moduloId) {
    const response = await fetch(`${API_URL}/catalogos/estanques/${moduloId}`);
    const estanques = await response.json();

    const select = document.getElementById('filtro_estanque');
    select.innerHTML = '<option value="">Todos los estanques</option>';

    estanques.forEach(estanque => {
        select.innerHTML += `<option value="${estanque.id}">${estanque.nombre}</option>`;
    });
}

// ==========================
// BUSCAR REGISTROS CON FILTROS
// ==========================
async function buscarRegistros() {
    const fecha = document.getElementById('filtro_fecha').value;
    const sitio_id = document.getElementById('filtro_sitio').value;
    const modulo_id = document.getElementById('filtro_modulo').value;
    const estanque_id = document.getElementById('filtro_estanque').value;

    const params = new URLSearchParams();

    if (fecha) params.append('fecha', fecha);
    if (sitio_id) params.append('sitio_id', sitio_id);
    if (modulo_id) params.append('modulo_id', modulo_id);
    if (estanque_id) params.append('estanque_id', estanque_id);

    const response = await fetch(`${API_URL}/registro?${params.toString()}`);
    const registros = await response.json();

    renderizarTabla(registros);
}

// ==========================
// LIMPIAR FILTROS
// ==========================
async function limpiarFiltros() {
    document.getElementById('filtro_fecha').value = '';
    document.getElementById('filtro_sitio').value = '';
    document.getElementById('filtro_modulo').innerHTML = '<option value="">Todos los módulos</option>';
    document.getElementById('filtro_estanque').innerHTML = '<option value="">Todos los estanques</option>';

    await cargarRegistros();
}

// ==========================
// EXPORTAR A EXCEL
// ==========================
function exportarExcel() {
    const fecha = document.getElementById('filtro_fecha').value;
    const sitio_id = document.getElementById('filtro_sitio').value;
    const modulo_id = document.getElementById('filtro_modulo').value;
    const estanque_id = document.getElementById('filtro_estanque').value;

    const params = new URLSearchParams();

    if (fecha) params.append('fecha', fecha);
    if (sitio_id) params.append('sitio_id', sitio_id);
    if (modulo_id) params.append('modulo_id', modulo_id);
    if (estanque_id) params.append('estanque_id', estanque_id);

    window.open(`${API_URL}/registro/export/excel?${params.toString()}`, '_blank');
}