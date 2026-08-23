/**
 * src/scripts/dashboard.ts
 * Lógica principal interactiva del Dashboard en el cliente
 */

import { getAllTasks, createTask, updateTask, deleteTask, type TaskItem } from '../services/api';
import { formatDate, escapeHtml, showToast } from './utils';

// --- ESTADO DE LA APLICACIÓN ---
let allTasks: TaskItem[] = [];
let currentFilter: 'all' | 'pending' | 'completed' = 'all';
let searchQuery: string = '';
let editingTask: TaskItem | null = null;

// --- INICIALIZACIÓN DE COMPONENTES DOM ---
export function initDashboard() {
  const btnOpenModal    = document.getElementById('btn-open-create-modal') as HTMLButtonElement;
  const modalOverlay    = document.getElementById('task-modal') as HTMLElement;
  const modalTitle      = document.getElementById('modal-title') as HTMLElement;
  const modalForm       = document.getElementById('modal-form') as HTMLFormElement;
  const modalAlert      = document.getElementById('modal-alert') as HTMLElement;
  const inputModalId    = document.getElementById('modal-task-id') as HTMLInputElement;
  const inputModalTitle = document.getElementById('modal-task-title') as HTMLInputElement;
  const inputModalDesc  = document.getElementById('modal-task-desc') as HTMLTextAreaElement;
  const btnModalClose   = document.getElementById('btn-modal-close') as HTMLButtonElement;
  const btnModalCancel  = document.getElementById('btn-modal-cancel') as HTMLButtonElement;
  const btnModalSubmit  = document.getElementById('btn-modal-submit') as HTMLButtonElement;

  const searchInput     = document.getElementById('search-input') as HTMLInputElement;
  const btnClearSearch  = document.getElementById('btn-clear-search') as HTMLButtonElement;
  const filterTabs      = document.querySelectorAll('.tab-btn');

  const tasksLoading    = document.getElementById('tasks-loading') as HTMLElement;
  const tasksGrid       = document.getElementById('tasks-grid') as HTMLElement;
  const tasksEmpty      = document.getElementById('tasks-empty') as HTMLElement;
  const emptyTitle      = document.getElementById('empty-title') as HTMLElement;
  const emptySubtitle   = document.getElementById('empty-subtitle') as HTMLElement;
  const btnEmptyCreate  = document.getElementById('btn-empty-create') as HTMLButtonElement;

  const statTotal       = document.getElementById('stat-total') as HTMLElement;
  const statPending     = document.getElementById('stat-pending') as HTMLElement;
  const statCompleted   = document.getElementById('stat-completed') as HTMLElement;
  const statPercent     = document.getElementById('stat-percent') as HTMLElement;
  const statProgressBar = document.getElementById('stat-progress-bar') as HTMLElement;

  const countTabAll       = document.getElementById('count-tab-all') as HTMLElement;
  const countTabPending   = document.getElementById('count-tab-pending') as HTMLElement;
  const countTabCompleted = document.getElementById('count-tab-completed') as HTMLElement;

  // --- CARGA DE TAREAS ---
  async function loadTasks() {
    tasksLoading?.classList.remove('hidden');
    tasksGrid?.classList.add('hidden');
    tasksEmpty?.classList.add('hidden');

    const result = await getAllTasks();

    tasksLoading?.classList.add('hidden');

    if (result.error) {
      showToast(result.error, 'error');
      renderEmptyState('Error de Conexión', 'Asegúrate de que el backend .NET esté corriendo en http://localhost:5000');
      return;
    }

    allTasks = result.data || [];
    updateMetrics();
    renderTasks();
  }

  // --- ACTUALIZAR MÉTRICAS ---
  function updateMetrics() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.isCompleted).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (statTotal) statTotal.textContent = String(total);
    if (statPending) statPending.textContent = String(pending);
    if (statCompleted) statCompleted.textContent = String(completed);
    if (statPercent) statPercent.textContent = `${percent}%`;
    if (statProgressBar) statProgressBar.style.width = `${percent}%`;

    if (countTabAll) countTabAll.textContent = String(total);
    if (countTabPending) countTabPending.textContent = String(pending);
    if (countTabCompleted) countTabCompleted.textContent = String(completed);
  }

  // --- RENDERIZAR TAREAS ---
  function renderTasks() {
    let filtered = allTasks.filter(task => {
      if (currentFilter === 'pending') return !task.isCompleted;
      if (currentFilter === 'completed') return task.isCompleted;
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(q) || 
        (task.description && task.description.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      tasksGrid?.classList.add('hidden');
      if (searchQuery) {
        renderEmptyState('Sin resultados', `No encontramos tareas que coincidan con "${searchQuery}".`);
      } else if (currentFilter === 'pending') {
        renderEmptyState('¡Todo al día! 🎉', 'No tienes tareas pendientes por realizar.');
      } else if (currentFilter === 'completed') {
        renderEmptyState('Sin completadas', 'Aún no has completado ninguna tarea.');
      } else {
        renderEmptyState('Sin tareas aún', 'Comienza agregando tu primera tarea con el botón "+ Nueva Tarea".');
      }
      return;
    }

    tasksEmpty?.classList.add('hidden');
    tasksGrid?.classList.remove('hidden');
    if (tasksGrid) tasksGrid.innerHTML = '';

    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card ${task.isCompleted ? 'completed' : ''}`;
      card.setAttribute('data-id', String(task.id));

      card.innerHTML = `
        <div class="task-card-header">
          <label class="card-checkbox-label" title="${task.isCompleted ? 'Marcar pendiente' : 'Marcar completada'}">
            <input type="checkbox" class="card-checkbox" ${task.isCompleted ? 'checked' : ''} />
            <span class="checkbox-box-custom">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          
          <div class="task-badges">
            <span class="id-badge">#${task.id}</span>
            <span class="status-badge ${task.isCompleted ? 'status-done' : 'status-wait'}">
              ${task.isCompleted ? '✓ Completada' : '⏳ Pendiente'}
            </span>
          </div>
        </div>

        <div class="task-card-body">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        </div>

        <div class="task-card-footer">
          <span class="task-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${formatDate(task.createdAt)}
          </span>

          <div class="task-actions">
            <button class="btn-icon btn-edit" title="Editar tarea">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-delete" title="Eliminar tarea">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      const checkbox = card.querySelector('.card-checkbox') as HTMLInputElement;
      checkbox?.addEventListener('change', () => toggleTaskStatus(task));

      const btnEdit = card.querySelector('.btn-edit') as HTMLButtonElement;
      btnEdit?.addEventListener('click', () => openModal(task));

      const btnDelete = card.querySelector('.btn-delete') as HTMLButtonElement;
      btnDelete?.addEventListener('click', () => handleDeleteTask(task));

      tasksGrid?.appendChild(card);
    });
  }

  function renderEmptyState(title: string, subtitle: string) {
    tasksEmpty?.classList.remove('hidden');
    if (emptyTitle) emptyTitle.textContent = title;
    if (emptySubtitle) emptySubtitle.textContent = subtitle;
  }

  // --- TOGGLE ESTADO 1-CLIC ---
  async function toggleTaskStatus(task: TaskItem) {
    const updatedPayload = {
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: !task.isCompleted
    };

    const res = await updateTask(updatedPayload);
    if (res.error) {
      showToast(res.error, 'error');
      loadTasks();
      return;
    }

    task.isCompleted = !task.isCompleted;
    updateMetrics();
    renderTasks();
    showToast(task.isCompleted ? '✓ Tarea completada' : '⏳ Tarea marcada como pendiente', 'success');
  }

  // --- ELIMINAR TAREA ---
  async function handleDeleteTask(task: TaskItem) {
    const confirmed = window.confirm(`¿Deseas eliminar la tarea "${task.title}"?`);
    if (!confirmed) return;

    const res = await deleteTask(task.id);
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    allTasks = allTasks.filter(t => t.id !== task.id);
    updateMetrics();
    renderTasks();
    showToast('✓ Tarea eliminada correctamente', 'success');
  }

  // --- MANEJO DEL MODAL ---
  function openModal(task?: TaskItem) {
    modalAlert?.classList.add('hidden');
    modalForm?.reset();
    editingTask = task || null;

    if (task) {
      if (inputModalId) inputModalId.value = String(task.id);
      if (inputModalTitle) inputModalTitle.value = task.title;
      if (inputModalDesc) inputModalDesc.value = task.description || '';
      if (modalTitle) modalTitle.textContent = `Editar Tarea #${task.id}`;
      const btnText = btnModalSubmit?.querySelector('.btn-text') as HTMLElement;
      if (btnText) btnText.textContent = 'Actualizar Tarea';
    } else {
      if (inputModalId) inputModalId.value = '';
      if (modalTitle) modalTitle.textContent = 'Nueva Tarea';
      const btnText = btnModalSubmit?.querySelector('.btn-text') as HTMLElement;
      if (btnText) btnText.textContent = 'Guardar Tarea';
    }

    modalOverlay?.classList.remove('hidden');
    setTimeout(() => inputModalTitle?.focus(), 50);
  }

  function closeModal() {
    modalOverlay?.classList.add('hidden');
    editingTask = null;
  }

  btnOpenModal?.addEventListener('click', () => openModal());
  btnEmptyCreate?.addEventListener('click', () => openModal());
  btnModalClose?.addEventListener('click', closeModal);
  btnModalCancel?.addEventListener('click', closeModal);

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalAlert?.classList.add('hidden');

    const title = inputModalTitle?.value.trim();
    if (!title) return;

    const isEdit = inputModalId?.value !== '';
    const spinner = btnModalSubmit?.querySelector('.spinner') as HTMLElement;
    if (btnModalSubmit) btnModalSubmit.disabled = true;
    spinner?.classList.remove('hidden');

    try {
      if (isEdit && editingTask) {
        const payload = {
          id: Number(inputModalId.value),
          title,
          description: inputModalDesc.value.trim(),
          isCompleted: editingTask.isCompleted
        };
        const res = await updateTask(payload);
        if (res.error) {
          if (modalAlert) {
            modalAlert.textContent = res.error;
            modalAlert.className = 'alert error';
            modalAlert.classList.remove('hidden');
          }
          return;
        }
        showToast('✓ Tarea actualizada con éxito', 'success');
      } else {
        const payload = {
          title,
          description: inputModalDesc.value.trim(),
          isCompleted: false
        };
        const res = await createTask(payload);
        if (res.error) {
          if (modalAlert) {
            modalAlert.textContent = res.error;
            modalAlert.className = 'alert error';
            modalAlert.classList.remove('hidden');
          }
          return;
        }
        showToast('✓ Tarea creada correctamente', 'success');
      }

      closeModal();
      loadTasks();

    } finally {
      if (btnModalSubmit) btnModalSubmit.disabled = false;
      spinner?.classList.add('hidden');
    }
  });

  // --- EVENTOS BÚSQUEDA Y FILTROS ---
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value.trim();
    btnClearSearch?.classList.toggle('hidden', !searchQuery);
    renderTasks();
  });

  btnClearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderTasks();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') as any;
      renderTasks();
    });
  });

  // CARGA INICIAL
  loadTasks();
}
