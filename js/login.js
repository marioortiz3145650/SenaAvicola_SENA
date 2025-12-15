document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
        { usuario: 'admin', contrasena: '123', rol: 'admin' },
        { usuario: 'aprendiz', contrasena: '456', rol: 'aprendiz' },
        { usuario: 'visitante', contrasena: '789', rol: 'visitante' }
    ];

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        
        const usuarioEncontrado = usuarios.find(user => user.usuario === username && user.contrasena === password);

        if (usuarioEncontrado) {
            sessionStorage.setItem('userRole', usuarioEncontrado.rol);
            errorMessage.textContent = ''; 
            errorMessage.style.display = 'none';

            
            switch (usuarioEncontrado.rol) {
                case 'admin':
                    window.location.href = 'admin.html';
                    break;
                case 'aprendiz':
                    window.location.href = 'aprendiz.html';
                    break;
                case 'visitante':
                    window.location.href = 'visitante.html';
                    break;
            }
        } else {
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            errorMessage.style.display = 'block';
        }
    });
});