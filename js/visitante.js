document.addEventListener('DOMContentLoaded', () => {

    const userRole = sessionStorage.getItem('userRole');

    if (userRole !== 'visitante' && userRole !== 'admin') {
        alert('Acceso denegado. Serás redirigido a la página de inicio de sesión.');
        window.location.href = 'login.html';
    }

    const navButtons = document.querySelectorAll('.content-sidebar button');
    const views = {
        inicio: document.getElementById('view-inicio'),
        Estadisticas: document.getElementById('view-Estadisticas')
    };

    function showView(viewName) {
        Object.values(views).forEach(view => {
            if (view) view.style.display = 'none';
        });
        if (views[viewName]) {
            views[viewName].style.display = 'block';
        }
        if (viewName === 'Estadisticas') {
            updateSummaryStats();
            initCharts();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

    let lotes = JSON.parse(localStorage.getItem('lotes')) || [];
    let produccion = JSON.parse(localStorage.getItem('produccion')) || [];
    let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    let stock = JSON.parse(localStorage.getItem('stock')) || [];

    let produccionChart;
    let ventasChart;

    function initCharts() {
        const latestProduccion = JSON.parse(localStorage.getItem('produccion')) || [];
        const latestVentas = JSON.parse(localStorage.getItem('ventas')) || [];

        const produccionCtx = document.getElementById('produccionChart').getContext('2d');
        if (produccionChart) produccionChart.destroy();
        produccionChart = new Chart(produccionCtx, {
            type: 'line',
            data: {
                labels: latestProduccion.map(item => item.fechaProduccion),
                datasets: [{
                    label: 'Cantidad de Huevos',
                    data: latestProduccion.map(item => item.cantidadHuevos),
                    backgroundColor: 'rgba(0, 155, 58, 0.5)',
                    borderColor: 'rgba(0, 155, 58, 1)',
                    borderWidth: 2
                }]
            },
        });

        const ventasCtx = document.getElementById('ventasChart').getContext('2d');
        if (ventasChart) ventasChart.destroy();
        ventasChart = new Chart(ventasCtx, {
            type: 'bar',
            data: {
                labels: latestVentas.map(item => item.fechaVenta),
                datasets: [{
                    label: 'Ventas (Docenas)',
                    data: latestVentas.map(item => item.cantidadVenta),
                    backgroundColor: 'rgba(0, 100, 200, 0.7)'
                }]
            },
        });
    }

    function updateSummaryStats() {
        const latestLotes = JSON.parse(localStorage.getItem('lotes')) || [];
        const latestProduccion = JSON.parse(localStorage.getItem('produccion')) || [];
        const latestVentas = JSON.parse(localStorage.getItem('ventas')) || [];

        const totalGallinas = latestLotes.reduce((sum, lote) => sum + parseInt(lote.numeroGallinas), 0);
        const totalHuevos = latestProduccion.reduce((sum, prod) => sum + parseInt(prod.cantidadHuevos), 0);
        const totalVentas = latestVentas.reduce((sum, venta) => sum + parseInt(venta.cantidadVenta), 0);

        document.getElementById('totalGallinas').textContent = totalGallinas;
        document.getElementById('totalVentas').textContent = totalVentas;

        const promedioProduccion = totalGallinas > 0 ? (totalHuevos / totalGallinas).toFixed(2) : 0;
        document.getElementById('promedioProduccion').textContent = promedioProduccion;

        const eficiencia = totalHuevos > 0 ? ((totalVentas * 12) / totalHuevos * 100).toFixed(2) : 0;
        document.getElementById('eficiencia').textContent = `${eficiencia}%`;
    }

    // --- Toggle sidebar ---
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        hamburger.classList.toggle('open');
    });

    window.addEventListener('load', () => {
        showView('inicio');
    });

    window.logout = function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    };
});