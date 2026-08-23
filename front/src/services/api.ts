// =============================================================
// src/services/api.ts
// -------------------------------------------------------------
// Capa de servicio: centraliza TODAS las peticiones HTTP hacia
// el backend .NET Core que corre en http://localhost:5000.
//
// Principio: ningún otro archivo del frontend hace fetch()
// directamente; siempre pasa por aquí. Así, si la URL base
// o la lógica de manejo de errores cambia, se actualiza en
// un solo lugar.
//
// Endpoints disponibles en el backend:
//   POST   /api/tasks          → Crear tarea
//   GET    /api/tasks/{id}     → Obtener tarea por ID
//   PUT    /api/tasks/{id}     → Actualizar tarea
//   DELETE /api/tasks/{id}     → Eliminar tarea
//
// ⚠️  NO existe GET /api/tasks (listar todas las tareas).
//     Esa funcionalidad queda pendiente hasta que el backend
//     la implemente. Ver comentario en la parte inferior.
// =============================================================

// URL base del backend. Cambiar aquí si el puerto varía.
const BASE_URL = 'http://localhost:5000';

// -------------------------------------------------------------
// TIPOS / INTERFACES
// -------------------------------------------------------------

/**
 * Representa una tarea tal como la devuelve el backend.
 * Los nombres de las propiedades deben coincidir EXACTAMENTE
 * con los del modelo C# (TaskItem.cs).
 */
export interface TaskItem {
  id: number;          // Clave primaria generada por el backend
  title: string;       // Título de la tarea (obligatorio)
  description: string; // Descripción opcional de la tarea
  isCompleted: boolean;// Estado: true = completada, false = pendiente
  createdAt: string;   // Fecha de creación en formato ISO 8601 (la asigna el backend)
}

/**
 * Payload para CREAR una tarea.
 * NO incluye `id` ni `createdAt` porque esos los genera el backend.
 */
export interface CreateTaskPayload {
  title: string;
  description: string;
  isCompleted: boolean;
}

/**
 * Payload para ACTUALIZAR una tarea.
 * SÍ incluye `id` porque el backend lo necesita en el cuerpo
 * además de en la URL (PUT /api/tasks/{id}).
 */
export interface UpdateTaskPayload {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

/**
 * Resultado genérico de cada función del servicio.
 * - Si la petición fue exitosa → `data` contiene la respuesta.
 * - Si hubo error            → `error` contiene el mensaje legible.
 * Usar discriminación: if (result.error) { ... } else { result.data }
 */
export interface ApiResult<T> {
  data?: T;
  error?: string;
}

// -------------------------------------------------------------
// FUNCIONES DE API
// -------------------------------------------------------------

/**
 * Crea una tarea nueva.
 *
 * Endpoint: POST /api/tasks
 * Body enviado: { title, description, isCompleted }
 * Respuesta esperada: el objeto TaskItem recién creado con su id y createdAt.
 */
export async function createTask(
  payload: CreateTaskPayload
): Promise<ApiResult<TaskItem>> {
  try {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // indicamos que enviamos JSON
      body: JSON.stringify(payload),                    // convertimos el objeto a string JSON
    });

    // Si el servidor respondió con un código de error (4xx, 5xx)
    if (!res.ok) {
      const msg = await res.text(); // intentamos leer el mensaje de error del backend
      return { error: `Error ${res.status}: ${msg || res.statusText}` };
    }

    // Parseamos la respuesta JSON y la devolvemos
    const data: TaskItem = await res.json();
    return { data };
  } catch {
    // Error de red: el servidor no responde o hay un problema de conexión
    return { error: 'No se pudo conectar con el servidor.' };
  }
}

/**
 * Obtiene una sola tarea por su ID numérico.
 *
 * Endpoint: GET /api/tasks/{id}
 * No se envía body.
 * Respuesta esperada: el objeto TaskItem correspondiente al ID.
 */
export async function getTaskById(
  id: number
): Promise<ApiResult<TaskItem>> {
  try {
    const res = await fetch(`${BASE_URL}/api/tasks/${id}`); // GET implícito

    if (!res.ok) {
      // 404 → la tarea no existe; damos un mensaje específico
      if (res.status === 404) {
        return { error: `Tarea con ID ${id} no encontrada.` };
      }
      const msg = await res.text();
      return { error: `Error ${res.status}: ${msg || res.statusText}` };
    }

    const data: TaskItem = await res.json();
    return { data };
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }
}

/**
 * Actualiza los datos de una tarea existente.
 *
 * Endpoint: PUT /api/tasks/{id}
 * Body enviado: { id, title, description, isCompleted }
 * Respuesta: el objeto actualizado, o 204 sin cuerpo (según el backend).
 *
 * Nota: algunos backends .NET devuelven 204 No Content en PUT exitoso.
 *       Por eso manejamos ese caso retornando `data: undefined`.
 */
export async function updateTask(
  payload: UpdateTaskPayload
): Promise<ApiResult<TaskItem | undefined>> {
  try {
    const res = await fetch(`${BASE_URL}/api/tasks/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // incluye el id dentro del body también
    });

    if (!res.ok) {
      const msg = await res.text();
      return { error: `Error ${res.status}: ${msg || res.statusText}` };
    }

    // 204 No Content → actualización exitosa pero sin cuerpo de respuesta
    if (res.status === 204) return { data: undefined };

    const data: TaskItem = await res.json();
    return { data };
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }
}

/**
 * Elimina permanentemente una tarea por su ID.
 *
 * Endpoint: DELETE /api/tasks/{id}
 * No se envía body.
 * Respuesta exitosa: normalmente 200 o 204 sin contenido relevante.
 */
export async function deleteTask(id: number): Promise<ApiResult<void>> {
  try {
    const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE', // sin body
    });

    if (!res.ok) {
      const msg = await res.text();
      return { error: `Error ${res.status}: ${msg || res.statusText}` };
    }

    // Eliminación exitosa → devolvemos un objeto vacío (sin error)
    return {};
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }
}

/**
 * Obtiene todas las tareas registradas en el backend.
 *
 * Endpoint: GET /api/tasks
 * No se envía body.
 * Respuesta esperada: Arreglo de objetos TaskItem.
 */
export async function getAllTasks(): Promise<ApiResult<TaskItem[]>> {
  try {
    const res = await fetch(`${BASE_URL}/api/tasks`);

    if (!res.ok) {
      const msg = await res.text();
      return { error: `Error ${res.status}: ${msg || res.statusText}` };
    }

    const data: TaskItem[] = await res.json();
    return { data };
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }
}
