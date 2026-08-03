# Ficha Técnica — Tierra Santa

Sitio estático (sin base de datos) con la ficha técnica de cada rubro de pulpa de fruta de **Tierra Santa**. Una página por rubro + portada.

## Estructura

```
index.html              → Portada
rubros/<rubro>.html      → Ficha técnica de cada fruta (generadas)
data/rubros.json         → Contenido editable: descripción, tabla nutricional, vida útil, rendimiento
scripts/generate.js      → Genera index.html y rubros/*.html a partir de data/rubros.json
assets/css/style.css     → Estilos del sitio
assets/img/logo.png      → Logo (agregar, ver abajo)
assets/img/pulpas/*.jpg  → Fotos de cada pulpa (agregar, ver abajo)
```

No hay base de datos ni backend: todo es HTML/CSS/JS estático, ideal para Netlify.

## Cómo agregar las imágenes

Las fotos **no están incluidas** — el sitio ya está preparado para tomarlas automáticamente en cuanto las agregues con el nombre de archivo exacto. Mientras no exista el archivo, esa foto se muestra como un óvalo/tarjeta de color con las iniciales del rubro (no se ve como "imagen rota").

> **Importante — tamaño de archivo:** sube fotos ya comprimidas para web, idealmente **menos de 500 KB cada una** (formato `.jpg`, ancho máximo ~1400px). Una foto de cámara o captura sin comprimir puede pesar 7-8 MB; multiplicado por 12 rubros eso agota rápido el ancho de banda gratuito de Netlify y hace el sitio lentísimo. Si subes una imagen muy pesada, avísame y la comprimo antes de hacer el deploy.

1. **Logo**: guarda tu archivo como `assets/img/logo.png`, idealmente ya con fondo transparente.
2. **Fotos de cada pulpa**: guárdalas en `assets/img/pulpas/` con estos nombres exactos:

| Rubro | Archivo esperado |
|---|---|
| Guanábana | `assets/img/pulpas/guanabana.jpg` |
| Fresa | `assets/img/pulpas/fresa.jpg` |
| Mora | `assets/img/pulpas/mora.jpg` |
| Parchita (Maracuyá) | `assets/img/pulpas/parchita.png` |
| Guayaba | `assets/img/pulpas/guayaba.jpg` |
| Mango | `assets/img/pulpas/mango.jpg` |
| Piña | `assets/img/pulpas/pina.jpg` |
| Tamarindo | `assets/img/pulpas/tamarindo.jpg` |
| Guanábana - Fresa | `assets/img/pulpas/guanabana-fresa.jpg` |
| Durazno | `assets/img/pulpas/durazno.jpg` |
| Lulo | `assets/img/pulpas/lulo.jpg` |
| Tomate de Árbol | `assets/img/pulpas/tomate-de-arbol.jpg` |

También se acepta `.png` o `.webp`: solo cambia la extensión en el `<img>` correspondiente dentro de `rubros/<rubro>.html` (o en `data/rubros.json` si prefieres regenerar).

Sube los archivos al repositorio (misma carpeta) y Netlify los publica en el siguiente deploy — no hace falta tocar código.

## Editar el contenido de un rubro

Todos los textos de cada rubro (descripción, tabla nutricional, vida útil, rendimiento) están en `data/rubros.json`. Edita ese archivo y:

- Si tienes Node instalado localmente, corre `node scripts/generate.js` para regenerar las páginas, o
- Simplemente haz commit y push: Netlify ejecuta ese mismo comando automáticamente en cada deploy (ver `netlify.toml`).

### Tabla Nutricional

El campo `tablaNutricional` de cada rubro (en `data/rubros.json`) se transcribe directo de la etiqueta oficial del producto (contenido por 100 g: calorías, proteínas, grasas, carbohidratos, fibras, calcio, fósforo, hierro, vitamina A, tiamina, riboflavina, niacina y ácido ascórbico). Si un campo va en `null`, la página muestra un guión — así se ve en la etiqueta física. Mientras un rubro no tenga su etiqueta transcrita, deja `"tablaNutricional": null` y la página muestra "Pendiente" en vez de inventar datos.

> Nota: los valores de vida útil y rendimiento siguen siendo de referencia típicos de la industria; deben validarse antes de usarse en un contexto comercial o regulatorio. La tabla nutricional, cuando está presente, proviene de la etiqueta real del producto — igual conviene verificarla contra el empaque físico por si hubo algún error de transcripción.

## Deploy en Netlify

1. Sube este repositorio a GitHub (ya está listo).
2. En Netlify: **Add new site → Import an existing project** y selecciona el repositorio.
3. Build command: `node scripts/generate.js` — Publish directory: `.` (ya configurado en `netlify.toml`, Netlify lo detecta solo).
4. Deploy. Cada vez que hagas push a la rama conectada, el sitio se actualiza solo.

También puedes arrastrar la carpeta del proyecto directamente a Netlify Drop para una prueba rápida sin conectar Git.
