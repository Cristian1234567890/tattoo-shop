import { requireAuth } from './_lib/security.js';

export default async function handler(req, res) {
  // Proteger con autenticación: NO exponer OpenAPI sin haber hecho login
  const caller = await requireAuth(req, res);
  if (!caller) return;

  const currentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL 
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
    : 'https://tattoo-hub-ops.vercel.app';

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Tattoo Hub Ops API • Agentes & Operaciones",
      version: "2.1.0",
      description: "API de operaciones para creación de tareas en Jira, despacho de notificaciones a Discord y telemetría de Sentry. Requiere autenticación mediante API Key, Bearer JWT y Header de Usuario."
    },
    servers: [
      {
        url: currentHost,
        description: "Servidor de Producción Serverless (Vercel)"
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Clave de API provista por el Administrador (ej: th_agent_... o th_admin_...)"
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT firmado y emitido por el sistema de autenticación"
        },
        UsernameHeader: {
          type: "apiKey",
          in: "header",
          name: "X-Username",
          description: "Nombre de usuario o agente que emite la petición (ej: giovanni, antigravity_agent)"
        }
      },
      schemas: {
        TaskCreateRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              example: "Optimizar índice de búsqueda de tatuadores cercanos"
            },
            description: {
              type: "string",
              example: "Se requiere agregar filtro geoespacial en la consulta de estudios."
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              default: "HIGH",
              example: "HIGH"
            },
            type: {
              type: "string",
              enum: ["FEATURE", "BUG", "TASK"],
              default: "TASK",
              example: "FEATURE"
            },
            jiraProject: {
              type: "string",
              default: "TH",
              example: "TH"
            }
          }
        },
        DiscordSendRequest: {
          type: "object",
          required: ["message"],
          properties: {
            channel: {
              type: "string",
              enum: ["alertas", "errores", "soporte", "general"],
              default: "alertas",
              example: "alertas"
            },
            title: {
              type: "string",
              example: "Notificación de Nuevo Sprint"
            },
            message: {
              type: "string",
              example: "Se ha desplegado la nueva versión de seguridad en Staging."
            },
            mentionEveryone: {
              type: "boolean",
              default: false,
              example: false
            },
            color: {
              type: "string",
              example: "#f59e0b"
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: [],
        BearerAuth: [],
        UsernameHeader: []
      }
    ],
    paths: {
      "/api/tasks": {
        get: {
          summary: "Consultar cola de tareas activas",
          description: "Retorna el listado de tareas encoladas para el agente y sincronización con Jira.",
          operationId: "getTasks",
          responses: {
            "200": {
              description: "Listado de tareas recuperado exitosamente"
            },
            "401": {
              description: "No autorizado (Faltan credenciales válidas)"
            }
          }
        },
        post: {
          summary: "Crear tarea en cola para Jira / Agente",
          description: "Encola una nueva tarea técnica o historia de usuario y notifica en Discord.",
          operationId: "createTask",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TaskCreateRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Tarea registrada en Firestore y encolada con éxito"
            },
            "400": {
              description: "Parámetros inválidos o incompletos"
            },
            "401": {
              description: "No autorizado"
            },
            "403": {
              description: "Permisos insuficientes (Rol Viewer)"
            }
          }
        }
      },
      "/api/discord/send": {
        post: {
          summary: "Despachar comunicado a canales de Discord",
          description: "Envía un mensaje o anuncio con formato enriquecido (Embed) a los canales oficiales.",
          operationId: "sendDiscordMessage",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DiscordSendRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Mensaje entregado exitosamente al Webhook de Discord"
            },
            "400": {
              description: "Mensaje vacío o payload inválido"
            },
            "401": {
              description: "No autorizado"
            }
          }
        }
      },
      "/api/data": {
        get: {
          summary: "Obtener telemetría y estado de servicios",
          description: "Consulta incidentes de Sentry, historial de comandos del Bot y estado de la cola.",
          operationId: "getTelemetryData",
          responses: {
            "200": {
              description: "Métricas del sistema"
            },
            "401": {
              description: "No autorizado"
            }
          }
        }
      },
      "/api/sentry-webhook": {
        post: {
          summary: "Gateway de ingesta de eventos de Sentry",
          description: "Recibe webhooks de Sentry para persistir en Firestore y alertar a Discord #errores.",
          operationId: "sentryWebhook",
          responses: {
            "200": {
              description: "Incidente recibido y despachado"
            }
          }
        }
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(spec);
}
