# Agent Tasks & Guidelines

## Directrices del Agente
- **Prioridad**: Mantener el código modular, seguir las buenas prácticas de seguridad (no exponer claves `.env` en commits).
- **Comunicación**: Ser conciso, utilizar archivos markdown para mantener el estado y las tareas (Agent.md, Memory.md, Gemini.md).
- **Ejecución Local**: Antes de proponer comandos, verificar que el entorno tenga instaladas las herramientas (Node, npm, Docker/Podman).

## Plan de Acción Inicial
- [x] Analizar la estructura del proyecto.
- [x] Crear el sistema de memoria y directrices (Memory.md, Gemini.md, Agent.md).
- [ ] Instalar dependencias del backend (`npm install` en `/backend/backend`).
- [ ] Levantar el backend (`npm run dev` o `node app.js`).
- [ ] Levantar el frontend (Live Server, http-server, o Docker).
- [ ] Verificar la conectividad con Supabase y las variables de entorno.
- [ ] Iniciar con el desarrollo de nuevas características o solución de bugs.
