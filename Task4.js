let tasks = [];
let editingTaskId = null;
let currentFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
  loadTasks();
  setupEventListeners();
  updateStats();
  renderTasks();
});

function setupEventListeners() {
  // Priority buttons
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active', 'low', 'medium', 'high'));
      this.classList.add('active', this.dataset.priority);
    });
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderTasks();
    });
  });

  // Form submission
  document.getElementById('taskTitle').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const priority = document.querySelector('.priority-btn.active').dataset.priority;

  if (!title) {
    alert('Please enter a task title');
    return;
  }

  const task = {
    id: editingTaskId || Date.now(),
    title,
    description,
    date,
    time,
    priority,
    completed: false,
    createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : new Date().toISOString()
  };

  if (editingTaskId) {
    const index = tasks.findIndex(t => t.id === editingTaskId);
    tasks[index] = task;
    editingTaskId = null;
    document.getElementById('addBtnText').textContent = 'Add Task';
  } else {
    tasks.push(task);
  }

  clearForm();
  saveTasks();
  updateStats();
  renderTasks();
}

function clearForm() {
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('taskDate').value = '';
  document.getElementById('taskTime').value = '';

  // Reset priority to medium
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active', 'low', 'medium', 'high'));
  document.querySelector('[data-priority="medium"]').classList.add('active', 'medium');
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description;
  document.getElementById('taskDate').value = task.date;
  document.getElementById('taskTime').value = task.time;

  // Set priority
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active', 'low', 'medium', 'high'));
  document.querySelector(`[data-priority="${task.priority}"]`).classList.add('active', task.priority);

  editingTaskId = id;
  document.getElementById('addBtnText').textContent = 'Update Task';
  document.getElementById('taskTitle').focus();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    updateStats();
    renderTasks();
  }
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    updateStats();
    renderTasks();
  }
}

function isOverdue(task) {
  if (!task.date) return false;
  const taskDateTime = new Date(`${task.date}${task.time ? 'T' + task.time : ''}`);
  return taskDateTime < new Date() && !task.completed;
}

function formatDateTime(date, time) {
  if (!date) return '';
  const taskDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateStr;
  if (taskDate.toDateString() === today.toDateString()) {
    dateStr = 'Today';
  } else if (taskDate.toDateString() === tomorrow.toDateString()) {
    dateStr = 'Tomorrow';
  } else {
    dateStr = taskDate.toLocaleDateString();
  }

  return time ? `${dateStr} at ${time}` : dateStr;
}

function getTaskStatus(task) {
  if (task.completed) return 'completed';
  if (isOverdue(task)) return 'overdue';
  return 'pending';
}

function filterTasks() {
  return tasks.filter(task => {
    switch (currentFilter) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed && !isOverdue(task);
      case 'overdue':
        return isOverdue(task);
      case 'high':
        return task.priority === 'high';
      default:
        return true;
    }
  });
}

function renderTasks() {
  const container = document.getElementById('tasksContainer');
  const filteredTasks = filterTasks();

  if (filteredTasks.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No tasks found</h3>
                        <p>${currentFilter === 'all' ? 'Add your first task to get started!' : `No ${currentFilter} tasks at the moment`}</p>
                    </div>
                `;
    return;
  }

  // Sort tasks: incomplete first, then by priority, then by date
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  container.innerHTML = filteredTasks.map(task => {
    const status = getTaskStatus(task);
    const statusClass = status === 'completed' ? 'status-completed' :
      status === 'overdue' ? 'status-overdue' : 'status-pending';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    return `
                    <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}">
                        <div class="task-priority ${task.priority}"></div>
                        <div class="task-header">
                            <div class="task-title">${task.title}</div>
                            <div class="task-actions">
                                <button class="action-btn complete-btn" onclick="toggleComplete(${task.id})">
                                    ${task.completed ? '↶ Undo' : '✓ Complete'}
                                </button>
                                <button class="action-btn edit-btn" onclick="editTask(${task.id})">✏ Edit</button>
                                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">🗑 Delete</button>
                            </div>
                        </div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        <div class="task-meta">
                            <div class="task-datetime">
                                ${task.date || task.time ? `📅 ${formatDateTime(task.date, task.time)}` : 'No due date'}
                            </div>
                            <div class="task-status ${statusClass}">${statusText}</div>
                        </div>
                    </div>
                `;
  }).join('');
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed && !isOverdue(t)).length;
  const overdue = tasks.filter(t => isOverdue(t)).length;

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;
  document.getElementById('overdueTasks').textContent = overdue;
}

function saveTasks() {
  try {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasks = [];
  }
}