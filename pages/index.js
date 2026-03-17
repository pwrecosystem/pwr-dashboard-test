<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vencimientos - PWR Club</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #ec0101; --dark: #222222; --gray: #333; --white: #fff; --light-gray: #f5f5f5; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: var(--light-gray); min-height: 100vh; }
    header { background: var(--dark); padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; }
    header img { height: 50px; }
    header h1 { color: var(--white); font-size: 1.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
    header h1 span { color: var(--primary); }
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: var(--white); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-left: 5px solid var(--primary); }
    .stat-card h3 { color: var(--gray); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
    .stat-card .number { font-size: 2.5rem; font-weight: 800; color: var(--dark); }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-sinplan { background: #fee2e2; color: #991b1b; }
    .badge-sede { background: #e0e7ff; color: #3730a3; }
    .loading { text-align: center; padding: 3rem; color: var(--gray); }
    .info-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; color: #92400e; }
    table { width: 100%; background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    th { background: var(--dark); color: var(--white); padding: 1rem; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    tr:hover { background: #fafafa; }
    .contact-info { font-size: 0.8rem; color: var(--gray); }
    @media (max-width: 768px) { .container { padding: 1rem; } .stats { grid-template-columns: 1fr; } table { display: block; overflow-x: auto; } }
  </style>
</head>
<body>
  <header>
    <img src="https://powerclub.com.co/cdn/shop/files/Logo_PWR_redes_sociales.jpg?v=1722338689" alt="PWR Club">
    <h1>PWR <span>Club</span> - Clientes Sin Plan Activo</h1>
  </header>
  <div class="container">
    <div class="info-box"><strong>📊 Mostrando:</strong> Clientes con facturas vencidas en marzo 2026 que NO tienen otro plan activo después de su fecha de vencimiento.</div>
    <div class="stats">
      <div class="stat-card"><h3>Total Clientes</h3><div class="number" id="total-count">-</div></div>
      <div class="stat-card"><h3>Total Valor Facturas</h3><div class="number" id="total-amount">-</div></div>
    </div>
    <div id="table-container"><div class="loading">Cargando datos...</div></div>
  </div>
  <script>
    function formatCurrency(amount) { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount); }
    async function loadData() {
      document.getElementById('table-container').innerHTML = '<div class="loading">Cargando datos...</div>';
      try {
        const res = await fetch('/api/vencimientos?fechai=2026-03-01&fechaf=2026-03-31&sinplan=true');
        const data = await res.json();
        if (data.error) { document.getElementById('table-container').innerHTML = '<div class="loading">Error: ' + data.error + '</div>'; return; }
        const { totales, detalle } = data;
        document.getElementById('total-count').textContent = totales.cantidad;
        document.getElementById('total-amount').textContent = formatCurrency(totales.valor);
        const tableHtml = '<table><thead><tr><th>Fecha Venc.</th><th>Cliente</th><th>ID</th><th>Teléfono</th><th>Correo</th><th>Sede</th><th>Valor</th></tr></thead><tbody>' + 
          detalle.map(f => '<tr><td><span class="badge badge-sinplan">' + f.fecha_vencimiento + '</span></td><td>' + (f.nombre_cliente || 'N/A') + '</td><td>' + f.identificacion_cliente + '</td><td>' + (f.celular || '-') + '</td><td class="contact-info">' + (f.correo ? '<a href="mailto:' + f.correo + '">' + f.correo + '</a>' : '-') + '</td><td><span class="badge badge-sede">' + f.sucursal_codigo + '</span></td><td><strong>' + formatCurrency(f.total) + '</strong></td></tr>').join('') + 
          '</tbody></table>';
        document.getElementById('table-container').innerHTML = tableHtml;
      } catch (err) { document.getElementById('table-container').innerHTML = '<div class="loading">Error: ' + err.message + '</div>'; }
    }
    loadData();
  </script>
</body>
</html>
// rebuild Tue Mar 17 21:34:32 UTC 2026
<!-- deploy Tue Mar 17 21:49:49 UTC 2026 -->
