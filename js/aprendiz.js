document.addEventListener('DOMContentLoaded', () => {

    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'aprendiz' && userRole !== 'admin') {
        alert('Acceso denegado. Serás redirigido a la página de inicio de sesión.');
        window.location.href = 'login.html';
    }

    const navButtons = document.querySelectorAll('.content-sidebar button');
    const views = {
        inicio: document.getElementById('view-inicio'),
        Clasificacion: document.getElementById('view-Clasificacion'),
        Muertes: document.getElementById('view-Muertes'),
        Stock: document.getElementById('view-Stock'),
        Vacunas: document.getElementById('view-Vacunas'),
        Ventas: document.getElementById('view-Ventas')
    };

    function showView(viewName) {
        Object.values(views).forEach(view => {
            if (view) view.style.display = 'none';
        });
        if (views[viewName]) {
            views[viewName].style.display = 'block';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showView('inicio');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            if (view) showView(view);
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const hamburger = document.getElementById('hamburger');
                sidebar.classList.remove('open');
                hamburger.classList.remove('open');
            }
        });
    });

    // --- Toggle sidebar ---
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        hamburger.classList.toggle('open');
    });

    window.addEventListener('load', () => {
        updateTable('tableClasificacion', clasificacion);
        updateTable('tableMuertes', muertes);
        updateTable('tableStock', stock);
        updateTable('tableVacunas', vacunas);
        updateTable('tableVentas', ventas);
    });

    let clasificacion = JSON.parse(localStorage.getItem('clasificacion')) || [];
    let muertes = JSON.parse(localStorage.getItem('muertes')) || [];
    let stock = JSON.parse(localStorage.getItem('stock')) || [];
    let vacunas = JSON.parse(localStorage.getItem('vacunas')) || [];
    let ventas = JSON.parse(localStorage.getItem('ventas')) || [];

    const dataArrays = { clasificacion, muertes, stock, vacunas, ventas };

    let rowToEdit = null;

    function handleFormSubmission(event, formId, tableId, dataArray) {
        event.preventDefault();
        const form = document.getElementById(formId);
        const formElements = form.querySelectorAll('input, select');
        const newData = {};

        formElements.forEach(element => {
            if (element.type !== 'submit' && element.type !== 'reset') {
                newData[element.id] = element.value;
            }
        });

        if (rowToEdit) {
            const originalData = JSON.parse(rowToEdit.dataset.original);
            const index = dataArray.findIndex(item => JSON.stringify(item) === JSON.stringify(originalData));
            if (index !== -1) {
                dataArray[index] = newData;
            }
            localStorage.setItem(tableId.replace('table', '').toLowerCase(), JSON.stringify(dataArray));
            updateTable(tableId, dataArray);
            rowToEdit = null;
        } else {
            dataArray.push(newData);
            localStorage.setItem(tableId.replace('table', '').toLowerCase(), JSON.stringify(dataArray));
            updateTable(tableId, dataArray);
        }
        form.reset();
    }

    function createRow(data, tableId, index) {
        const newRow = document.createElement('tr');
        newRow.dataset.index = index;
        newRow.dataset.original = JSON.stringify(data);

        for (const key in data) {
            const newCell = newRow.insertCell();
            newCell.textContent = data[key];
        }

        const actionsCell = newRow.insertCell();
        actionsCell.innerHTML = `
            <button onclick="editRow(this, '${tableId}')" class="btn-edit">Editar</button>
            <button onclick="deleteRow(this, '${tableId}')" class="btn-delete">Eliminar</button>
        `;
        // Para la tabla de clasificación, no hay un botón de editar, por lo que lo eliminamos si es el caso
        if (tableId === 'tableClasificacion') {
             actionsCell.innerHTML = `
                <button onclick="deleteRow(this, '${tableId}')" class="btn-delete">Eliminar</button>
            `;
        }
        return newRow;
    }

    function updateTable(tableId, dataArray) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        tableBody.innerHTML = '';
        dataArray.forEach((data, index) => {
            tableBody.appendChild(createRow(data, tableId, index));
        });
    }

    window.editRow = function(button, tableId) {
        rowToEdit = button.parentNode.parentNode;
        const formId = `form${tableId.replace('table', '')}`;
        const form = document.getElementById(formId);
        const originalData = JSON.parse(rowToEdit.dataset.original);

        for (const key in originalData) {
            const input = document.getElementById(key);
            if (input) {
                input.value = originalData[key];
            }
        }
    };

    window.deleteRow = function(button, tableId) {
        const row = button.parentNode.parentNode;
        const originalData = JSON.parse(row.dataset.original);
        const dataArrayName = tableId.replace('table', '').toLowerCase();
        let dataArray = dataArrays[dataArrayName];

        const index = dataArray.findIndex(item => JSON.stringify(item) === JSON.stringify(originalData));
        if (index !== -1) {
            dataArray.splice(index, 1);
            localStorage.setItem(dataArrayName, JSON.stringify(dataArray));
            updateTable(tableId, dataArray);
        }
    };

    document.getElementById('formMuertes').addEventListener('submit', (e) => handleFormSubmission(e, 'formMuertes', 'tableMuertes', muertes));
    document.getElementById('formStock').addEventListener('submit', (e) => handleFormSubmission(e, 'formStock', 'tableStock', stock));
    document.getElementById('formVacunas').addEventListener('submit', (e) => handleFormSubmission(e, 'formVacunas', 'tableVacunas', vacunas));
    document.getElementById('formVentas').addEventListener('submit', (e) => handleFormSubmission(e, 'formVentas', 'tableVentas', ventas));

    const formClasificacion = document.getElementById('formClasificacion');
    const resultadoClasificacion = document.getElementById('resultadoClasificacion');

    formClasificacion.addEventListener('submit', (e) => {
        e.preventDefault();
        const peso = parseFloat(document.getElementById('pesoHuevo').value);
        let categoria = '';

        if (isNaN(peso)) {
            resultadoClasificacion.textContent = 'Por favor, ingrese un peso válido.';
            return;
        }

        if (peso > 78) {
            categoria = 'JUMBO';
        } else if (peso > 67) {
            categoria = 'AAA';
        } else if (peso > 60) {
            categoria = 'AA';
        } else if (peso > 53) {
            categoria = 'A';
        } else if (peso > 46) {
            categoria = 'B';
        } else {
            categoria = 'C';
        }

        resultadoClasificacion.textContent = `El huevo ha sido clasificado como: ${categoria}`;

        const newClassification = {
            fecha: new Date().toLocaleDateString(),
            peso: peso,
            categoria: categoria
        };

        const dataArrayName = 'clasificacion';
        let dataArray = clasificacion;

        if (rowToEdit) {
            const originalData = JSON.parse(rowToEdit.dataset.original);
            const index = dataArray.findIndex(item => JSON.stringify(item) === JSON.stringify(originalData));
            if (index !== -1) {
                dataArray[index] = newClassification;
            }
            localStorage.setItem(dataArrayName, JSON.stringify(dataArray));
            updateTable('tableClasificacion', dataArray);
            rowToEdit = null;
        } else {
            dataArray.push(newClassification);
            localStorage.setItem(dataArrayName, JSON.stringify(dataArray));
            updateTable('tableClasificacion', dataArray);
        }

        formClasificacion.reset();
    });

    window.logout = function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    };
});