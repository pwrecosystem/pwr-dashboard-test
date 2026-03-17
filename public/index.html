<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vencimientos - PWR Club</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #ec0101;
      --dark: #222222;
      --gray: #333333;
      --white: #ffffff;
      --light-gray: #f5f5f5;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Montserrat', sans-serif;
      background: var(--light-gray);
      min-height: 100vh;
    }
    
    header {
      background: var(--dark);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    header img {
      height: 50px;
    }
    
    header h1 {
      color: var(--white);
      font-size: 1.5rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    header h1 span {
      color: var(--primary);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .filters input, .filters button {
      padding: 0.75rem 1rem;
      border: 2px solid var(--gray);
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9rem;
    }
    
    .filters button {
      background: var(--primary);
      color: var(--white);
      border: none;
      cursor: pointer;
      font-weight: 600;
      text-transform: uppercase;
      transition: transform 0.2s;
    }
    
    .filters button:hover {
      transform: scale(1.02);
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: var(--white);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-left: 5px solid var(--primary);
    }
    
    .stat-card h3 {
      color: var(--gray);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    
    .stat-card .number {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--dark);
    }
    
    .stat-card .amount {
      font-size: 1.2rem;
      color: var(--gray);
      margin-top: 0.5rem;
    }
    
    .section-title {
      color: var(--dark);
      font-size: 1.5rem;
      font-weight: 700;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid var(--primary);
      display: inline-block;
    }
    
    table {
      width: 100%;
      background: var(--white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    th {
      background: var(--dark);
      color: var(--white);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    
    td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    tr:hover {
      background: #fafafa;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge-march { background: #fff3cd; color: #856404; }
    .badge-april { background: #d4edda; color: #155724; }
    
    .loading {
      text-align: center;
      padding: 3rem;
      color: var(--gray);
    }
    
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .stats { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <header>
    <img src="https://powerclub.com.co/cdn/shop/files/Logo_PWR_redes_sociales.jpg?v=1722338689" alt="PWR Club">
    <h1>PWR <span>Club</span></h1>
  </header>
  
  <div class="container">
    <div class="filters">
      <input type="date" id="fechai" value="2026-03-01">
      <input type="date" id="fechaf" value="2026-04-30">
      <button onclick="loadData()">Actualizar</button>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <h3>Marzo 2026</h3>
        <div class="number" id="marzo-count">-</div>
        <div class="amount" id="marzo-amount">-</div>
      </div>
      <div class="stat-card">
        <h3>Abril 2026</h3>
        <div class="number" id="abril-count">-</div>
        <div class="amount" id="abril-amount">-</div>
      </div>
      <div class="stat-card">
        <h3>Total Vencimientos</h3>
        <div class="number" id="total-count">-</div>
        <div class="amount" id="total-amount">-</div>
      </div>
    </div>
    
    <h2 class="section-title">Detalle de Vencimientos</h2>
    <div id="table-container">
      <div class="loading">Cargando datos...</div>
    </div>
  </div>
  
  <script>
    function formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount)
    }
    
    async function loadData() {
      const fechai = document.getElementById('fechai').value
      const fechaf = document.getElementById('fechaf').value
      
      document.getElementById('table-container').innerHTML = '<div class="loading">Cargando datos...</div>'
      
      try {
        const res = await fetch(`/api/vencimientos?fechai=${fechai}&fechaf=${fechaf}`)
        const data = await res.json()
        
        if (data.error) {
          document.getElementById('table-container').innerHTML = `<div class="loading">Error: ${data.error}</div>`
          return
        }
        
        const { totales, detalle } = data
        
        document.getElementById('marzo-count').textContent = totales.marzo.cantidad
        document.getElementById('marzo-amount').textContent = formatCurrency(totales.marzo.valor)
        document.getElementById('abril-count').textContent = totales.abril.cantidad
        document.getElementById('abril-amount').textContent = formatCurrency(totales.abril.valor)
        
        const totalCant = totales.marzo.cantidad + totales.abril.cantidad
        const totalVal = totales.marzo.valor + totales.abril.valor
        document.getElementById('total-count').textContent = totalCant
        document.getElementById('total-amount').textContent = formatCurrency(totalVal)
        
        const allItems = [...detalle.marzo, ...detalle.abril].slice(0, 100)
        
        const tableHtml = `
          <table>
            <thead>
              <tr>
                <th>Fecha Venc.</th>
                <th>Cliente</th>
                <th>Identificación</th>
                <th>Sede</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${allItems.map(f => `
                <tr>
                  <td>
                    <span class="badge ${f.fecha_vencimiento.startsWith('2026-03') ? 'badge-march' : 'badge-april'}">
                      ${f.fecha_vencimiento}
                    </span>
                  </td>
                  <td>${f.nombre_cliente}</td>
                  <td>${f.identificacion_cliente}</td>
                  <td>${f.sucursal_codigo}</td>
                  <td>${formatCurrency(f.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top:1rem;color:var(--gray);font-size:0.9rem">Mostrando primeros 100 registros</p>
        `
        
        document.getElementById('table-container').innerHTML = tableHtml
        
      } catch (err) {
        document.getElementById('table-container').innerHTML = `<div class="loading">Error: ${err.message}</div>`
      }
    }
    
    loadData()
  </script>
</body>
</html>
