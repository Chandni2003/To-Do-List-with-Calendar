// DOM Elements
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');

const calendarForm = document.querySelector('#calendar-form');
const dateInput = document.querySelector('#date-input');
const dateTaskInput = document.querySelector('#date-task-input');
const dateTaskLists = document.querySelector('#date-task-lists');

// LocalStorage Keys
const REGULAR_TASKS_KEY = 'regularTasks';
const CALENDAR_TASKS_KEY = 'calendarTasks';

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRegularTasks();
    loadCalendarTasks();
});

// Regular To-Do List
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addRegularTask(taskText);
        saveRegularTask(taskText);
        taskInput.value = '';
    }
});

// Calendar To-Do List
calendarForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const taskText = dateTaskInput.value.trim();
    if (date && taskText) {
        addCalendarTask(date, taskText);
        saveCalendarTask(date, taskText);
        dateTaskInput.value = '';
    }
});

// Add regular task
function addRegularTask(taskText, completed = false) {
    const li = createTaskElement(taskText, completed);
    li.querySelector('.toggle-btn').addEventListener('click', () => toggleTaskCompletion(li, REGULAR_TASKS_KEY));
    li.querySelector('.delete-btn').addEventListener('click', () => removeRegularTask(li));
    taskList.appendChild(li);
}

// Add calendar task
function addCalendarTask(date, taskText, completed = false) {
    const taskBox = dateTaskLists.querySelector(`[data-date="${date}"]`) || createDateTaskBox(date);
    const li = createTaskElement(taskText, completed);
    li.querySelector('.toggle-btn').addEventListener('click', () => toggleTaskCompletion(li, CALENDAR_TASKS_KEY, date));
    li.querySelector('.delete-btn').addEventListener('click', () => removeCalendarTask(date, li));
    taskBox.querySelector('ul').appendChild(li);
}

// Create a date-specific task box
function createDateTaskBox(date) {
    const taskBox = document.createElement('div');
    taskBox.classList.add('date-task-box');
    taskBox.setAttribute('data-date', date);
    taskBox.innerHTML = `
        <h4>Tasks for ${date}</h4>
        <ul></ul>
    `;
    dateTaskLists.appendChild(taskBox);
    return taskBox;
}

// Create task element
function createTaskElement(taskText, completed = false) {
    const li = document.createElement('li');
    if (completed) li.classList.add('completed');
    li.innerHTML = `
        <span>${taskText}</span>
        <div>
            <button class="toggle-btn">${completed ? '✅' : '✔️'}</button>
            <button class="delete-btn">❌</button>
        </div>`;
    return li;
}

// Toggle task completion
function toggleTaskCompletion(li, storageKey, date = null) {
    li.classList.toggle('completed');
    const toggleBtn = li.querySelector('.toggle-btn');
    toggleBtn.textContent = li.classList.contains('completed') ? '✅' : '✔️';

    // Update storage
    if (storageKey === CALENDAR_TASKS_KEY) {
        const tasks = JSON.parse(localStorage.getItem(CALENDAR_TASKS_KEY)) || {};
        const taskList = Array.from(li.parentNode.children).map((li) => ({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed'),
        }));
        tasks[date] = taskList;
        localStorage.setItem(CALENDAR_TASKS_KEY, JSON.stringify(tasks));
    } else {
        const tasks = JSON.parse(localStorage.getItem(REGULAR_TASKS_KEY)) || [];
        const taskIndex = Array.from(taskList.children).indexOf(li);
        tasks[taskIndex].completed = li.classList.contains('completed');
        localStorage.setItem(REGULAR_TASKS_KEY, JSON.stringify(tasks));
    }
}

// Save and load tasks
function saveRegularTask(taskText) {
    const tasks = JSON.parse(localStorage.getItem(REGULAR_TASKS_KEY)) || [];
    tasks.push({ text: taskText, completed: false });
    localStorage.setItem(REGULAR_TASKS_KEY, JSON.stringify(tasks));
}

function saveCalendarTask(date, taskText) {
    const tasks = JSON.parse(localStorage.getItem(CALENDAR_TASKS_KEY)) || {};
    if (!tasks[date]) tasks[date] = [];
    tasks[date].push({ text: taskText, completed: false });
    localStorage.setItem(CALENDAR_TASKS_KEY, JSON.stringify(tasks));
}

function loadRegularTasks() {
    const tasks = JSON.parse(localStorage.getItem(REGULAR_TASKS_KEY)) || [];
    tasks.forEach(({ text, completed }) => addRegularTask(text, completed));
}

function loadCalendarTasks() {
    const tasks = JSON.parse(localStorage.getItem(CALENDAR_TASKS_KEY)) || {};
    Object.entries(tasks).forEach(([date, taskList]) => {
        taskList.forEach(({ text, completed }) => addCalendarTask(date, text, completed));
    });
}

// Remove tasks
function removeRegularTask(li) {
    taskList.removeChild(li);
    const tasks = Array.from(taskList.children).map((li) => ({
        text: li.querySelector('span').textContent,
        completed: li.classList.contains('completed'),
    }));
    localStorage.setItem(REGULAR_TASKS_KEY, JSON.stringify(tasks));
}

function removeCalendarTask(date, li) {
    const taskBox = dateTaskLists.querySelector(`[data-date="${date}"]`);
    taskBox.querySelector('ul').removeChild(li);

    const tasks = JSON.parse(localStorage.getItem(CALENDAR_TASKS_KEY)) || {};
    tasks[date] = Array.from(taskBox.querySelectorAll('li')).map((li) => ({
        text: li.querySelector('span').textContent,
        completed: li.classList.contains('completed'),
    }));
    if (tasks[date].length === 0) {
        delete tasks[date];
        dateTaskLists.removeChild(taskBox);
    }
    localStorage.setItem(CALENDAR_TASKS_KEY, JSON.stringify(tasks));
}
