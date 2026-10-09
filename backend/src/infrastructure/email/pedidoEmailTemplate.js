function formatoDinero(valor) {
  return Number(valor).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
}

function obtenerNombreProducto(item) {
  return (
    item.producto_nombre ||
    item.nombre ||
    `Producto #${item.producto_id}`
  );
}

export function plantillaCliente({
  pedido,
  usuario,
  instruccionesPago
}) {
  const productos = (pedido.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #ddd;">
            ${obtenerNombreProducto(item)}
          </td>

          <td style="padding:10px;text-align:center;border-bottom:1px solid #ddd;">
            ${item.cantidad}
          </td>

          <td style="padding:10px;text-align:right;border-bottom:1px solid #ddd;">
            ${formatoDinero(item.precio_unitario)}
          </td>

          <td style="padding:10px;text-align:right;border-bottom:1px solid #ddd;">
            ${formatoDinero(item.subtotal)}
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <div style="
      max-width:700px;
      margin:auto;
      font-family:Arial,sans-serif;
      color:#1e293b;
    ">

      <div style="
        background:#2864e8;
        color:white;
        padding:25px;
        text-align:center;
        border-radius:12px 12px 0 0;
      ">
        <h1>🐾 Huellitas E-Commerce</h1>
        <p>Confirmación de pedido</p>
      </div>

      <div style="
        padding:25px;
        border:1px solid #e2e8f0;
      ">

        <h2>Hola, ${usuario.nombre}</h2>

        <p>
          Tu pedido fue registrado correctamente.
        </p>

        <p>
          <strong>Número de pedido:</strong> #${pedido.id}
          <br>
          <strong>Estado:</strong> Pendiente de Pago
        </p>

        <table style="
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        ">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px;text-align:left;">
                Producto
              </th>

              <th style="padding:10px;">
                Cantidad
              </th>

              <th style="padding:10px;text-align:right;">
                Precio
              </th>

              <th style="padding:10px;text-align:right;">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            ${productos}
          </tbody>
        </table>

        <h2 style="text-align:right;color:#16a34a;">
          Total: ${formatoDinero(pedido.total)}
        </h2>

        <div style="
          margin-top:25px;
          background:#eff6ff;
          padding:20px;
          border-radius:10px;
        ">
          <h3>💳 Instrucciones de pago</h3>

          <p style="white-space:pre-line;">
            ${instruccionesPago}
          </p>
        </div>

        <p style="
          color:#64748b;
          margin-top:25px;
        ">
          Conserva tu comprobante de pago.
          Tu pedido permanecerá pendiente hasta
          que el pago sea confirmado.
        </p>

      </div>
    </div>
  `;
}

export function plantillaAdministrador({
  pedido,
  usuario
}) {
  const productos = (pedido.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #ddd;">
            ${obtenerNombreProducto(item)}
          </td>

          <td style="padding:10px;text-align:center;border-bottom:1px solid #ddd;">
            ${item.cantidad}
          </td>

          <td style="padding:10px;text-align:right;border-bottom:1px solid #ddd;">
            ${formatoDinero(item.subtotal)}
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <div style="
      max-width:700px;
      margin:auto;
      font-family:Arial,sans-serif;
      color:#1e293b;
    ">

      <h1>🐾 Nuevo pedido en Huellitas</h1>

      <p>
        Se registró un nuevo pedido
        pendiente de pago.
      </p>

      <div style="
        background:#f8fafc;
        padding:18px;
        border-radius:10px;
      ">
        <strong>Pedido:</strong> #${pedido.id}
        <br>

        <strong>Cliente:</strong>
        ${usuario.nombre}
        <br>

        <strong>Correo:</strong>
        ${usuario.email}
        <br>

        <strong>Estado:</strong>
        Pendiente de Pago
      </div>

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
      ">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px;text-align:left;">
              Producto
            </th>

            <th style="padding:10px;">
              Cantidad
            </th>

            <th style="padding:10px;text-align:right;">
              Subtotal
            </th>
          </tr>
        </thead>

        <tbody>
          ${productos}
        </tbody>
      </table>

      <h2 style="text-align:right;">
        Total: ${formatoDinero(pedido.total)}
      </h2>

    </div>
  `;
}
