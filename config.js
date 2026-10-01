window.VZETA_CONFIG = {
  stockCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1vZVbxlWSaEZKYB8JePHELdOAQ0rEyW56GgldDNZPgzinF0DeqsMYQLopg0Xcww/pub?gid=861582725&single=true&output=csv"
};

setTimeout(() => {
  // El stock deja de bloquear el catálogo.
  document.querySelectorAll('.stock-status').forEach(el => {
    el.style.display = 'none';
  });

  document.querySelectorAll('.add').forEach(btn => {
    btn.disabled = false;
  });

  window.updateStockForProduct = function(id) {
    const btn = document.getElementById('add-' + id);
    if (btn) btn.disabled = false;
  };

  window.addToCart = function(id) {
    const p = products.find(x => x.id === id);
    const select = document.getElementById('aroma-' + id);
    const aroma = select.value;

    if (!aroma) {
      select.focus();
      alert('Seleccioná un aroma para continuar.');
      return;
    }

    const existing = cart.find(x => x.id === id && x.aroma === aroma);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id: p.id,
        name: p.name,
        size: p.size,
        price: p.price,
        aroma,
        qty: 1
      });
    }

    persist();
    showToast();
  };

  // Crear sección separada para entrega inmediata.
  if (!document.getElementById('stock-inmediato')) {
    const productos = document.getElementById('productos');

    if (productos) {
      const section = document.createElement('section');
      section.className = 'section';
      section.id = 'stock-inmediato';

      section.innerHTML = `
        <div class="shell">
          <div class="section-head">
            <div>
              <div class="kicker">Entrega inmediata</div>
              <h2>Stock disponible</h2>
            </div>
            <p>
              Estos productos están listos para entrega inmediata.
              Si no encontrás lo que buscás, podés pedirlo igualmente desde el catálogo.
            </p>
          </div>

          <div
            id="stockImmediateGrid"
            style="
              display:grid;
              grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
              gap:14px;
            "
          ></div>
        </div>
      `;

const comoPedir = document.getElementById('como-pedir');

if (comoPedir) {
  comoPedir.insertAdjacentElement('beforebegin', section);
}

      const nav = document.querySelector('.navlinks');

      if (nav && !nav.querySelector('a[href="#stock-inmediato"]')) {
        const a = document.createElement('a');
        a.href = '#stock-inmediato';
        a.textContent = 'Stock inmediato';

        const mayorista = nav.querySelector('a[href="#mayorista"]');
        nav.insertBefore(a, mayorista);
      }
    }
  }

  function renderImmediateStock() {
    const holder = document.getElementById('stockImmediateGrid');
    if (!holder) return;

    if (typeof stockRows === 'undefined' || !stockRows.length) {
      holder.innerHTML = `
        <div style="color:#756b61">
          Cargando stock disponible…
        </div>
      `;
      return;
    }

    const rows = stockRows.filter(r =>
      Number(r['Stock'] || 0) > 0 &&
      norm(r['Activo'] || 'sí') !== 'no'
    );

    if (!rows.length) {
  const section = document.getElementById('stock-inmediato');
  if (section) section.style.display = 'none';
  return;
}

const section = document.getElementById('stock-inmediato');
if (section) section.style.display = '';

    const groups = {};

    rows.forEach(r => {
      const key = `${r['Producto']}|${r['Presentación']}`;

      if (!groups[key]) {
        groups[key] = {
          producto: r['Producto'],
          presentacion: r['Presentación'],
          aromas: []
        };
      }

      groups[key].aromas.push(r['Aroma']);
    });

    holder.innerHTML = Object.values(groups).map(g => `
      <div
        style="
          background:#fff;
          border:1px solid #eadfd5;
          border-radius:18px;
          padding:20px;
          box-shadow:0 8px 24px rgba(80,55,30,.04);
        "
      >
        <div
          style="
            font-family:'Wide Hope',Arial,sans-serif;
            font-size:21px;
            margin-bottom:4px;
          "
        >
          ${g.producto}
        </div>

        <div
          style="
            font-size:13px;
            color:#756b61;
            margin-bottom:14px;
          "
        >
          ${g.presentacion}
        </div>

        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:7px;
          "
        >
          ${g.aromas.map(a => `
            <span
              style="
                background:#fbe28a;
                color:#4a3d31;
                padding:7px 10px;
                border-radius:999px;
                font-size:12px;
                font-weight:700;
              "
            >
              ${a}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  renderImmediateStock();

  const timer = setInterval(() => {
    renderImmediateStock();

    if (
      typeof stockRows !== 'undefined' &&
      stockRows.length
    ) {
      clearInterval(timer);
    }
  }, 700);

}, 0);
