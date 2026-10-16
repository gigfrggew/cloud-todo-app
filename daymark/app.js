const STORAGE_KEY = "daymark.tasks.v1";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const taskCount = document.querySelector("#task-count");
const listCaption = document.querySelector("#list-caption");
const progressLabel = document.querySelector("#progress-label");
const footerSummary = document.querySelector("#footer-summary");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = [...document.querySelectorAll(".filter-button")];
let filter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean") : [];
  } catch { return []; }
}

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function makeTask(text) {
  return { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, text: text.trim(), completed: false, createdAt: Date.now() };
}

function render() {
  const visibleTasks = tasks.filter((task) => filter === "all" || (filter === "active" ? !task.completed : task.completed));
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  taskCount.textContent = String(remaining);
  progressLabel.textContent = `${percent}% complete`;
  footerSummary.textContent = tasks.length ? `${completed} of ${tasks.length} done` : "Ready when you are";
  listCaption.textContent = tasks.length ? remaining === 0 ? "Look at you, getting it done." : `${remaining} ${remaining === 1 ? "thing" : "things"} left to focus on.` : "A fresh start is a good place to be.";
  clearCompletedButton.hidden = completed === 0;
  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "task-toggle";
    toggle.checked = task.completed;
    toggle.setAttribute("aria-label", `${task.completed ? "Mark as in progress" : "Mark as completed"}: ${task.text}`);
    toggle.addEventListener("change", () => {
      task.completed = toggle.checked;
      saveTasks();
      render();
    });
    const label = document.createElement("span");
    label.className = "task-text";
    label.textContent = task.text;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove task: ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      render();
    });
    item.append(toggle, label, remove);
    taskList.append(item);
  });

  const showEmpty = visibleTasks.length === 0;
  emptyState.hidden = !showEmpty;
  if (filter === "active" && showEmpty && tasks.length) {
    emptyTitle.textContent = "All caught up";
    emptyCopy.textContent = "Everything is checked off. Enjoy the breathing room.";
  } else if (filter === "completed" && showEmpty) {
    emptyTitle.textContent = "No completed tasks yet";
    emptyCopy.textContent = "When you finish a task, it’ll show up here.";
  } else {
    emptyTitle.textContent = "Nothing on your list yet";
    emptyCopy.textContent = "Add a task above and take the first small step.";
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift(makeTask(text));
  saveTasks();
  filter = "all";
  updateFilters();
  render();
  taskForm.reset();
  taskInput.focus();
});

function updateFilters() {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

filterButtons.forEach((button) => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  updateFilters();
  render();
}));

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

const today = new Date();
document.querySelector("#date-day").textContent = String(today.getDate()).padStart(2, "0");
document.querySelector("#date-month").textContent = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
render();
