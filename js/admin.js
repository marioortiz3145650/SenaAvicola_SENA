document.addEventListener('DOMContentLoaded', () => {
  // --- Selectores ---
  const navButtons = document.querySelectorAll('.content-sidebar button');
  const dashboard = document.getElementById('view-inicio');
  const views = {
    inicio: dashboard,
    lotes: document.getElementById('view-lotes'),
    produccion: document.getElementById('view-produccion'),
    muertes: document.getElementById('view-muertes'),
    stock: document.getElementById('view-stock'),
    vacunas: document.getElementById('view-vacunas'),
    ventas: document.getElementById('view-ventas'),
    usuarios: document.getElementById('view-usuarios')
  };

  // --- Datos iniciales ---
  let lotes = JSON.parse(localStorage.getItem('lotes')) || [];
  let produccion = JSON.parse(localStorage.getItem('produccion')) || [];
  let muertes = JSON.parse(localStorage.getItem('muertes')) || [];
  let stock = JSON.parse(localStorage.getItem('stock')) || [];
  let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { usuario: 'admin', contrasena: '123', rol: 'Administrador' }
  ];
  let vacunas = JSON.parse(localStorage.getItem('vacunas')) || [];

  let rowToEdit = null;
  let charts = {};

  // --- Mostrar vista ---
  function showView(viewName) {
    Object.values(views).forEach(view => {
      if (view) view.style.display = 'none';
    });
    if (views[viewName]) {
      views[viewName].style.display = viewName === 'inicio' ? 'grid' : 'block';
    }
    if (viewName === 'inicio') {
      updateSummaryStats();
      initCharts();
    }
    updateAllTables();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Inicial ---
  showView('inicio');

  // --- Navegación ---
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      showView(view);
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  });

  // --- Guardar en localStorage ---
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Manejo de formularios ---
  function handleFormSubmit(event, formId, dataArray, storageKey) {
    event.preventDefault();
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, select');
    const data = {};
    inputs.forEach(input => {
      if (input.type === 'submit' || input.type === 'reset') return;
      data[input.name] = input.type === 'number' 
        ? (input.value === '' ? 0 : Number(input.value)) 
        : input.value;
    });

    if (rowToEdit !== null) {
      dataArray[rowToEdit] = data;
      rowToEdit = null;
    } else {
      dataArray.push(data);
    }

    saveData(storageKey, dataArray);
    form.reset();
    updateTableForKey(storageKey);
    if (dashboard.style.display === 'grid') {
      updateSummaryStats();
      initCharts();
    }
  }

  // --- Tablas ---
  function createRow(data, storageKey, index) {
    const tr = document.createElement('tr');
    const keysOrder = {
      lotes: ['idLote', 'nombreLote', 'numeroGallinas', 'tipoGallinas'],
      produccion: ['fechaProduccion', 'cantidadHuevos', 'tipoHuevos'],
      muertes: ['fechaMuerte', 'cantidadMuertes', 'causaMuerte'],
      stock: ['itemInventario', 'cantidadInventario', 'unidadInventario'],
      ventas: ['fechaVenta', 'cantidadVenta', 'precioVenta'],
      usuarios: ['usuario', 'contrasena', 'rol'],
      vacunas: ['fechaVacuna', 'tipoVacuna', 'cantidadVacuna']
    };
    const keys = keysOrder[storageKey] || Object.keys(data);
    keys.forEach(key => {
      const td = document.createElement('td');
      if (storageKey === 'usuarios' && key === 'contrasena') {
        td.textContent = '••••';
      } else {
        td.textContent = data[key] ?? '';
      }
      tr.appendChild(td);
    });
    const actions = document.createElement('td');
    actions.innerHTML = `<button class="btn-edit">Editar</button> <button class="btn-delete">Eliminar</button>`;
    actions.querySelector('.btn-edit').addEventListener('click', () => editRow(storageKey, index));
    actions.querySelector('.btn-delete').addEventListener('click', () => deleteRow(storageKey, index));
    tr.appendChild(actions);
    return tr;
  }

  function updateTableForKey(storageKey) {
    const map = {
      lotes: { arr: lotes, id: 'tableLotes' },
      produccion: { arr: produccion, id: 'tableProduccion' },
      muertes: { arr: muertes, id: 'tableMuertes' },
      stock: { arr: stock, id: 'tableStock' },
      ventas: { arr: ventas, id: 'tableVentas' },
      usuarios: { arr: usuarios, id: 'tableUsuarios' },
      vacunas: { arr: vacunas, id: 'tableVacunas' }
    };
    const info = map[storageKey];
    if (!info) return;
    const tbody = document.querySelector(`#${info.id} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';
    info.arr.forEach((item, i) => {
      tbody.appendChild(createRow(item, storageKey, i));
    });
  }

  function updateAllTables() {
    Object.keys(views).forEach(key => {
      if (key !== 'inicio') updateTableForKey(key);
    });
  }

  // --- Editar/Eliminar ---
  function editRow(storageKey, index) {
    const map = {
      lotes: { arr: lotes, form: 'formLotes' },
      produccion: { arr: produccion, form: 'formProduccion' },
      muertes: { arr: muertes, form: 'formMuertes' },
      stock: { arr: stock, form: 'formStock' },
      ventas: { arr: ventas, form: 'formVentas' },
      usuarios: { arr: usuarios, form: 'formUsuarios' },
      vacunas: { arr: vacunas, form: 'formVacunas' }
    };
    const cfg = map[storageKey];
    if (!cfg || !cfg.arr[index]) return;
    const item = cfg.arr[index];
    const form = document.getElementById(cfg.form);
    Object.keys(item).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = item[key];
    });
    rowToEdit = index;
    showView(storageKey);
  }

  function deleteRow(storageKey, index) {
    const arrMap = { lotes, produccion, muertes, stock, ventas, usuarios, vacunas };
    const arr = arrMap[storageKey];
    if (!arr) return;
    arr.splice(index, 1);
    saveData(storageKey, arr);
    updateTableForKey(storageKey);
    if (dashboard.style.display === 'grid') {
      updateSummaryStats();
      initCharts();
    }
  }

  // --- Estadísticas ---
  function updateSummaryStats() {
    const totalGallinas = lotes.reduce((s, l) => s + (Number(l.numeroGallinas) || 0), 0);
    const totalHuevos = produccion.reduce((s, p) => s + (Number(p.cantidadHuevos) || 0), 0);
    const totalVentasDoc = ventas.reduce((s, v) => s + (Number(v.cantidadVenta) || 0), 0);
    const promedio = totalGallinas > 0 ? (totalHuevos / totalGallinas).toFixed(2) : '0.00';
    const eficiencia = totalHuevos > 0 ? (((totalVentasDoc * 12) / totalHuevos) * 100).toFixed(2) : '0.00';

    document.getElementById('totalGallinas').textContent = totalGallinas;
    document.getElementById('promedioProduccion').textContent = promedio;
    document.getElementById('totalVentas').textContent = totalVentasDoc;
    document.getElementById('eficiencia').textContent = `${eficiencia}%`;
  }

  // --- Gráficas ---
  // --- Gráficas ---
function initCharts() {
  // Destruir gráficas anteriores
  Object.values(charts).forEach(chart => chart.destroy());
  charts = {};

  // Producción diaria (line) - Graphic1
  const ctx1 = document.getElementById('produccionChart')?.getContext('2d');
  if (ctx1) {
    charts.produccion = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: produccion.map(p => p.fechaProduccion || ''),
        datasets: [{
          label: 'Huevos',
          data: produccion.map(p => Number(p.cantidadHuevos) || 0),
          borderColor: '#13872f',
          backgroundColor: 'rgba(19, 135, 47, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: true }, y: { beginAtZero: true } }
      }
    });
  }

  // Indicador Circular Completo (Eficiencia de Ventas) - Graphic2
  const totalHuevos = produccion.reduce((s, p) => s + (Number(p.cantidadHuevos) || 0), 0);
  const totalVentasDoc = ventas.reduce((s, v) => s + (Number(v.cantidadVenta) || 0), 0);
  const eficiencia = totalHuevos > 0 ? (((totalVentasDoc * 12) / totalHuevos) * 100).toFixed(0) : 0;

  const percentageValue = document.getElementById('percentageValue');
  const progressCircle = document.getElementById('progressCircle');

  if (percentageValue && progressCircle) {
    percentageValue.textContent = `${eficiencia}%`;

    // Calcular stroke-dasharray para el círculo completo
    const circumference = 2 * Math.PI * 70; // radio = 70
    const dashArray = (eficiencia / 100) * circumference;
    progressCircle.style.strokeDasharray = `${dashArray} ${circumference}`;

    // Colorear el arco según el porcentaje
    let color = '#FF9800';
    if (eficiencia >= 80) color = '#4CAF50'; // verde
    else if (eficiencia >= 50) color = '#FFC107'; // amarillo
    else color = '#FF5722'; // rojo
    progressCircle.style.stroke = color;
  }

  // Productividad por lote (bar) - No se usa en graphic3, pero se mantiene si lo necesitas
  // (Actualmente graphic3 es el gráfico de pastel)

  // Estado de Huevos (doughnut) - Graphic3
  const ctx3 = document.getElementById('estadoHuevosChart')?.getContext('2d');
  if (ctx3) {
    const totalHuevosProducidos = produccion.reduce((sum, p) => sum + (Number(p.cantidadHuevos) || 0), 0);
    const totalHuevosVendidos = ventas.reduce((sum, v) => sum + (Number(v.cantidadVenta) || 0) * 12, 0);
    const huevosDisponibles = Math.max(0, totalHuevosProducidos - totalHuevosVendidos);

    const disponibles = huevosDisponibles;
    const vendidos = totalHuevosVendidos > totalHuevosProducidos 
      ? totalHuevosProducidos 
      : totalHuevosVendidos;

    charts.estadoHuevos = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Vendidos'],
        datasets: [{
          data: [disponibles, vendidos],
          backgroundColor: ['#4CAF50', '#FF5722'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${Math.round(context.raw)} huevos`
            }
          }
        }
      }
    });
  }
}

  // --- Eventos de formularios ---
  const forms = [
    { id: 'formLotes', arr: lotes, key: 'lotes' },
    { id: 'formProduccion', arr: produccion, key: 'produccion' },
    { id: 'formMuertes', arr: muertes, key: 'muertes' },
    { id: 'formStock', arr: stock, key: 'stock' },
    { id: 'formVentas', arr: ventas, key: 'ventas' },
    { id: 'formUsuarios', arr: usuarios, key: 'usuarios' },
    { id: 'formVacunas', arr: vacunas, key: 'vacunas' }
  ];

  forms.forEach(f => {
    const form = document.getElementById(f.id);
    if (form) {
      form.addEventListener('submit', (e) => handleFormSubmit(e, f.id, f.arr, f.key));
    }
  });

  // --- Inicializar ---
  updateAllTables();
  updateSummaryStats();
  initCharts();

  // --- Toggle sidebar ---
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  window.logout = function() {
      sessionStorage.clear();
      window.location.href = 'login.html';
  };
});