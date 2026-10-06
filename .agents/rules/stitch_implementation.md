---
description: Reglas obligatorias al implementar diseños provenientes de Stitch.
trigger: always
---

# Implementación de Diseños de Stitch

Cuando el usuario solicite implementar un diseño, maqueta o pantalla generada en Stitch:
1. **NO** intentes aproximar el diseño visualmente escribiendo código desde cero basándote en descripciones o capturas de pantalla.
2. **SIEMPRE** utiliza las herramientas del servidor MCP de Stitch (list_projects, list_screens, get_screen) para recuperar el código HTML/Tailwind exacto generado.
3. Extrae la estructura de clases y el HTML proporcionado por Stitch y adáptalo a los componentes de React/Frontend del proyecto, manteniendo una fidelidad "pixel-perfect".
