const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const rubros = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'rubros.json'), 'utf8'));

// Cache-busting: assets/* is served with a 1-year immutable Cache-Control
// (see netlify.toml), so the query string must change whenever the CSS/JS
// content changes or browsers/CDN will keep serving the stale file.
function hashFile(relPath) {
  const buf = fs.readFileSync(path.join(ROOT, relPath));
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
}
const ASSET_VERSION = hashFile('assets/css/style.css');

const EMPRESA = {
  nombreLegal: 'Procesadora de Alimentos Tierra Santa, C.A.',
  email: 'procesadoradealimentostierrasa@gmail.com',
  telefonos: ['0424-7284475', '0424-7017223'],
  rif: '504109843',
  direccion: 'Carretera Principal, Sector La Grita, Estado Táchira. Zona postal 5038',
};

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Cormorant+Garamond:wght@400;500;600&family=Great+Vibes&display=swap" rel="stylesheet">';

function brandMark(size, root) {
  return (
    '<img src="' + root + 'assets/img/logo.png" alt="Logo Tierra Santa" class="' +
    (size === 'hero' ? 'hero-mark' : 'brand-mark') +
    '" data-mono="TS" data-color="#211d18" data-fallback-class="' +
    (size === 'hero' ? 'hero-mark-fallback' : 'brand-mark-fallback') +
    '" onerror="fruitImgFallback(this)">'
  );
}

function header(root) {
  return `
<header class="site-header">
  <div class="container">
    <a class="brand" href="${root}index.html">
      ${brandMark('nav', root)}
      <span class="brand-text">
        <span class="brand-name">Tierra Santa</span>
        <span class="brand-tagline">Procesadora de Alimentos</span>
      </span>
    </a>
    <nav class="main-nav">
      <a class="nav-link" href="${root}index.html">Portada</a>
    </nav>
  </div>
</header>`;
}

function footer(root) {
  const links = rubros
    .map((r) => '<a href="' + root + 'rubros/' + r.slug + '.html">' + r.nombre + '</a>')
    .join('');
  const telefonos = EMPRESA.telefonos
    .map((t) => '<a href="tel:+58' + t.replace(/[^0-9]/g, '').slice(1) + '">' + t + '</a>')
    .join(' · ');
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <span class="brand-name">Tierra Santa</span><br>
        <span class="brand-tagline">${EMPRESA.nombreLegal}</span>
      </div>
      <div class="footer-contact">
        <div class="footer-heading">Contacto</div>
        <p><a href="mailto:${EMPRESA.email}">${EMPRESA.email}</a></p>
        <p>${telefonos}</p>
        <p>RIF: ${EMPRESA.rif}</p>
        <p>${EMPRESA.direccion}</p>
      </div>
      <div>
        <div class="footer-heading">Rubros</div>
        <div class="footer-links">${links}</div>
      </div>
    </div>
    <div class="footer-note">
      Ficha técnica de referencia. La tabla nutricional corresponde a la etiqueta oficial del producto
      cuando está disponible; los valores de vida útil y rendimiento son aproximados y deben validarse
      antes de su uso comercial o regulatorio.
      &copy; ${new Date().getFullYear()} ${EMPRESA.nombreLegal}
    </div>
  </div>
</footer>`;
}

const FALLBACK_SCRIPT = `<script>
  // Falls back to a colored monogram card whenever a product/logo photo is missing.
  function fruitImgFallback(img) {
    img.onerror = null;
    var ph = document.createElement('div');
    ph.className = img.dataset.fallbackClass || 'ph-placeholder';
    ph.dataset.label = img.dataset.mono || '';
    ph.style.background = img.dataset.color || '#c9973b';
    img.replaceWith(ph);
  }
</script>`;

function page({ root, title, description, bodyContent, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
${FONTS}
<link rel="stylesheet" href="${root}assets/css/style.css?v=${ASSET_VERSION}">
${FALLBACK_SCRIPT}
${extraHead}
</head>
<body>
${bodyContent}
</body>
</html>`;
}

const NUTRIENT_LABELS = {
  calorias: 'Calorías',
  proteinas: 'Proteínas',
  grasas: 'Grasas',
  carbohidratos: 'Carbohidratos',
  fibras: 'Fibras',
  calcio: 'Calcio',
  fosforo: 'Fósforo',
  hierro: 'Hierro',
  vitaminaA: 'Vitamina A',
  tiamina: 'Tiamina',
  riboflavina: 'Riboflavina',
  niacina: 'Niacina',
  acidoAscorbico: 'Ácido Ascórbico',
};

function nutritionCard(r) {
  if (!r.tablaNutricional) {
    return `
      <div class="data-card full nutrition-card nutrition-pending">
        <h3>Tabla Nutricional</h3>
        <p class="nutrition-pending-note">Pendiente — se actualizará con la tabla nutricional oficial de la etiqueta de este producto.</p>
      </div>`;
  }
  const rows = Object.keys(NUTRIENT_LABELS)
    .map((key) => {
      const value = r.tablaNutricional[key];
      return (
        '<div class="nutrition-row"><span>' + NUTRIENT_LABELS[key] + '</span><strong>' +
        (value || '—') + '</strong></div>'
      );
    })
    .join('');
  return `
    <div class="data-card full nutrition-card">
      <h3>Tabla Nutricional</h3>
      <div class="nutrition-subtitle">Contenido en 100 g</div>
      <div class="nutrition-grid">${rows}</div>
      <div class="nutrition-source">Fuente: Tabla de Composición de Alimentos según INN, revisión 1999.</div>
    </div>`;
}

function photoBlock(r, root, cssClass) {
  const ext = r.ext || 'jpg';
  return (
    '<img src="' + root + 'assets/img/pulpas/' + r.slug + '.' + ext + '" alt="Pulpa de ' + r.nombre +
    '" class="' + cssClass + '" data-mono="' + r.mono + '" data-color="' + r.color +
    '" onerror="fruitImgFallback(this)">'
  );
}

// ---------- Portada ----------
function buildIndex() {
  const root = '';
  const cards = rubros
    .map(
      (r) => `
    <a class="rubro-card" href="rubros/${r.slug}.html">
      ${photoBlock(r, root, 'rubro-card-photo')}
      <div class="rubro-card-body">
        <h3>${r.nombre}</h3>
        <div class="sci">${r.nombreCientifico}</div>
        <div class="rubro-card-cta">Ver ficha técnica →</div>
      </div>
    </a>`
    )
    .join('');

  const body = `
${header(root)}
<section class="hero">
  <div class="container">
    ${brandMark('hero', root)}
    <h1 class="sr-only">${EMPRESA.nombreLegal}</h1>
    <div class="brand-tagline">${EMPRESA.nombreLegal}</div>
    <p class="hero-sub">Pulpa de fruta 100% natural, congelada y sin aditivos. Del campo a tu producto, con la calidad que exige cada rubro.</p>
    <span class="hero-title-doc">Ficha Técnica de Producto</span>
  </div>
</section>
<section class="section">
  <div class="container">
    <h2 class="section-title">Nuestros Rubros</h2>
    <p class="section-lead">Conoce la ficha técnica de cada una de nuestras ${rubros.length} pulpas de fruta: descripción, tabla nutricional, vida útil y rendimiento aproximado.</p>
    <div class="rubros-grid">${cards}</div>
  </div>
</section>
${footer(root)}`;

  return page({
    root,
    title: EMPRESA.nombreLegal + ' — Ficha Técnica de Pulpa de Fruta',
    description: 'Ficha técnica de las pulpas de fruta procesadas por ' + EMPRESA.nombreLegal + ': tabla nutricional, vida útil y rendimiento por rubro.',
    bodyContent: body,
  });
}

// ---------- Página de rubro ----------
function buildRubroPage(r, index) {
  const root = '../';
  const prev = rubros[(index - 1 + rubros.length) % rubros.length];
  const next = rubros[(index + 1) % rubros.length];

  const body = `
${header(root)}
<section class="section rubro-hero">
  <div class="container">
    <div class="rubro-hero-photo">
      ${photoBlock(r, root, '')}
    </div>
    <div>
      <div class="eyebrow">Ficha Técnica — Rubro</div>
      <h1>${r.nombre}</h1>
      <span class="sci">${r.nombreCientifico}</span>
      <p>${r.descripcion}</p>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="data-grid">
      ${nutritionCard(r)}
      <div class="data-card">
        <h3>Vida Útil</h3>
        <dl>
          <dt>Congelada</dt><dd>${r.vidaUtil.congelada}</dd>
          <dt>Refrigerada (post-descongelado)</dt><dd>${r.vidaUtil.refrigerada}</dd>
        </dl>
      </div>
      <div class="data-card">
        <h3>Rendimiento Aproximado</h3>
        <dl>
          <dt>Litros de pulpa</dt><dd class="yield-number">${r.rendimiento}</dd>
        </dl>
      </div>
    </div>
    <div class="pager">
      <a href="${prev.slug}.html">← ${prev.nombre}</a>
      <a href="../index.html">Todos los rubros</a>
      <a href="${next.slug}.html">${next.nombre} →</a>
    </div>
  </div>
</section>
${footer(root)}`;

  return page({
    root,
    title: r.nombre + ' — Ficha Técnica | Tierra Santa',
    description: 'Ficha técnica de pulpa de ' + r.nombre + ': descripción, tabla nutricional, vida útil y rendimiento aproximado.',
    bodyContent: body,
  });
}

// ---------- Escritura de archivos ----------
fs.writeFileSync(path.join(ROOT, 'index.html'), buildIndex());

const rubrosDir = path.join(ROOT, 'rubros');
if (!fs.existsSync(rubrosDir)) fs.mkdirSync(rubrosDir, { recursive: true });

rubros.forEach((r, i) => {
  fs.writeFileSync(path.join(rubrosDir, r.slug + '.html'), buildRubroPage(r, i));
});

console.log('Generadas ' + (rubros.length + 1) + ' páginas (1 portada + ' + rubros.length + ' rubros).');
