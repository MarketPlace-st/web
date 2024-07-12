document.addEventListener('DOMContentLoaded', function() {
    const lista = document.querySelector('#lista-carrito tbody');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const listaProductos = document.getElementById('lista-1');
    const btnPagar = document.querySelector('#btn-pagar');
    const paymentForm = document.querySelector('#payment-form');
    const cancelarPago = document.querySelector('#cancelar-pago');
    const totalPrecio = document.querySelector('#total-precio');
    const pagoForm = document.querySelector('#pago-form');
    const facturaDiv = document.getElementById('factura');
    const detalleFactura = document.getElementById('detalle-factura');
    const imprimirBtn = document.getElementById('imprimir-factura');
    
    const tasaITBIS = 0.18; // 18% ITBIS
    const nombreUsuario = 'Usuario'; // Reemplaza esto con la lógica para obtener el nombre del usuario

    let articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];

    cargarEventListeners();

    function cargarEventListeners() {
        if (listaProductos) {
            listaProductos.addEventListener('click', agregarProducto);
        }

        if (vaciarCarritoBtn) {
            vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
        }

        if (lista) {
            lista.addEventListener('click', eliminarElemento);
        }

        if (btnPagar) {
            btnPagar.addEventListener('click', mostrarFormularioPago);
        }

        if (cancelarPago) {
            cancelarPago.addEventListener('click', ocultarFormularioPago);
        }

        if (pagoForm) {
            pagoForm.addEventListener('submit', procesarPago);
        }

        if (imprimirBtn) {
            imprimirBtn.addEventListener('click', imprimirFactura);
        }

        carritoHTML();
    }

    function agregarProducto(e) {
        if (e.target.classList.contains('agregar-carrito')) {
            e.preventDefault();
            const producto = e.target.closest('.box');
            leerDatosProducto(producto);
        }
    }

    function leerDatosProducto(producto) {
        const precioTexto = producto.querySelector('.precio').textContent.replace('$', '').replace(',', '');
        const precio = parseFloat(precioTexto);

        if (isNaN(precio)) {
            console.error('El precio no es un número válido:', precioTexto);
            return;
        }

        const infoProducto = {
            imagen: producto.querySelector('img').src,
            titulo: producto.querySelector('h3').textContent,
            precio: precio,
            id: producto.querySelector('.agregar-carrito').getAttribute('data-id'),
            cantidad: 1
        }

        const existe = articulosCarrito.some(producto => producto.id === infoProducto.id);
        if (existe) {
            const productos = articulosCarrito.map(producto => {
                if (producto.id === infoProducto.id) {
                    producto.cantidad++;
                    return producto;
                } else {
                    return producto;
                }
            });
            articulosCarrito = [...productos];
        } else {
            articulosCarrito = [...articulosCarrito, infoProducto];
        }

        insertarCarrito();
    }

    function insertarCarrito() {
        vaciarHTML();
        articulosCarrito.forEach(producto => {
            const row = document.createElement('tr');
            const precio = typeof producto.precio === 'number' ? producto.precio.toFixed(2) : '0.00';
            row.innerHTML = `
                <td><img src="${producto.imagen}" width="100" height="150px"></td>
                <td>${producto.titulo}</td>
                <td>$${precio}</td>
                <td>${producto.cantidad}</td>
                <td><a href="#" class="borrar" data-id="${producto.id}">X</a></td>
            `;
            lista.appendChild(row);
        });

        sincronizarStorage();
        calcularTotal();
    }

    function eliminarElemento(e) {
        e.preventDefault();
        if (e.target.classList.contains('borrar')) {
            const productoId = e.target.getAttribute('data-id');
            articulosCarrito = articulosCarrito.filter(producto => producto.id !== productoId);
            insertarCarrito();
        }
    }

    function vaciarCarrito() {
        articulosCarrito = [];
        vaciarHTML();
        sincronizarStorage();
        calcularTotal();
    }

    function vaciarHTML() {
        while (lista.firstChild) {
            lista.removeChild(lista.firstChild);
        }
    }

    function sincronizarStorage() {
        localStorage.setItem('carrito', JSON.stringify(articulosCarrito));
    }

    function carritoHTML() {
        vaciarHTML();
        articulosCarrito.forEach(producto => {
            const row = document.createElement('tr');
            const precio = typeof producto.precio === 'number' ? producto.precio.toFixed(2) : '0.00';
            row.innerHTML = `
                <td><img src="${producto.imagen}" width="100" height="150px"></td>
                <td>${producto.titulo}</td>
                <td>$${precio}</td>
                <td>${producto.cantidad}</td>
                <td><a href="#" class="borrar" data-id="${producto.id}">X</a></td>
            `;
            lista.appendChild(row);
        });

        calcularTotal();
    }

    function calcularTotal() {
        let total = articulosCarrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
        if (totalPrecio) {
            totalPrecio.textContent = `$${total.toFixed(2)}`;
        }
    }

    function mostrarFormularioPago() {
        if (paymentForm) paymentForm.style.display = 'block';
    }

    function ocultarFormularioPago() {
        if (paymentForm) paymentForm.style.display = 'none';
    }

    function procesarPago(e) {
        e.preventDefault();

        const nombreTarjeta = document.querySelector('#nombre-tarjeta').value;
        const numeroTarjeta = document.querySelector('#numero-tarjeta').value;
        const expiracionTarjeta = document.querySelector('#expiracion-tarjeta').value;
        const cvvTarjeta = document.querySelector('#cvv-tarjeta').value;

        if (nombreTarjeta === '' || numeroTarjeta === '' || expiracionTarjeta === '' || cvvTarjeta === '') {
            alert('Por favor, completa todos los campos de la tarjeta.');
            return;
        }

        alert('Pago realizado exitosamente.');

        mostrarFactura(articulosCarrito); // Pasar el carrito antes de vaciarlo
        articulosCarrito = [];
        sincronizarStorage();
        carritoHTML();
        ocultarFormularioPago();
    }

    function mostrarFactura(carrito) {
        facturaDiv.style.display = 'block';

        let facturaHTML = `
            <p>Nombre del Usuario: ${nombreUsuario}</p>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
        `;

        carrito.forEach(producto => {
            const precio = typeof producto.precio === 'number' ? producto.precio.toFixed(2) : '0.00';
            facturaHTML += `<tr><td>${producto.titulo}</td><td>$${precio}</td><td>${producto.cantidad}</td></tr>`;
        });

        const subtotal = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
        const itbis = subtotal * tasaITBIS;
        const total = subtotal + itbis;

        facturaHTML += `
            </tbody>
            </table>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>ITBIS (18%): $${itbis.toFixed(2)}</p>
            <p>Total: $${total.toFixed(2)}</p>
        `;

        detalleFactura.innerHTML = facturaHTML;
    }

    function imprimirFactura() {
        window.print();
    }
});




























