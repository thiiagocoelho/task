document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // DOM Elements
    const appContainer = document.getElementById('appContainer');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const taskList = document.getElementById('taskList');
    const taskFormContainer = document.getElementById('taskFormContainer');
    const taskForm = document.getElementById('taskForm');
    const taskIdInput = document.getElementById('taskId');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskProjectSelect = document.getElementById('taskProject');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskSidebarBtn = document.getElementById('addTaskSidebarBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const todayDateEl = document.getElementById('todayDate');
    const todayTaskCountSidebar = document.getElementById('todayTaskCountSidebar');
    const todayTaskCountMain = document.getElementById('todayTaskCountMain');
    
    const projectList = document.getElementById('projectList');
    const showAddProjectFormBtn = document.getElementById('showAddProjectFormBtn');
    const addProjectForm = document.getElementById('addProjectForm');
    const newProjectNameInput = document.getElementById('newProjectName');
    const cancelAddProjectBtn = document.getElementById('cancelAddProjectBtn');

    // --- App State ---
    let projects = [
        { id: 1, name: 'Entrada' },
        { id: 2, name: 'Casa' },
        { id: 3, name: 'Trabalho' },
    ];

    let tasks = [];

    // --- Functions ---

    const renderProjects = () => {
        projectList.innerHTML = '';
        taskProjectSelect.innerHTML = '';

        projects.forEach(project => {
            // Render sidebar list item
            const li = document.createElement('li');
            li.className = 'mb-2';
            const taskCount = tasks.filter(t => t.project === project.name && !t.completed).length;
            li.innerHTML = `
                <a href="#" class="flex items-center justify-between text-gray-600 py-1 px-2 rounded-md hover:bg-gray-100">
                    <div class="flex items-center gap-2">
                        <i data-lucide="hash" class="w-4 h-4 text-gray-400"></i>
                        <span>${project.name}</span>
                    </div>
                    <span class="text-sm text-gray-400">${taskCount > 0 ? taskCount : ''}</span>
                </a>
            `;
            projectList.appendChild(li);

            // Render select option in task form
            const option = document.createElement('option');
            option.value = project.name;
            option.textContent = project.name;
            taskProjectSelect.appendChild(option);
        });
        lucide.createIcons();
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `<p class="text-gray-500 text-center py-4">Ótimo trabalho! Nenhuma tarefa para hoje.</p>`;
        } else {
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item flex items-start p-2 border-b border-gray-200 group';
                taskElement.dataset.id = task.id;

                taskElement.innerHTML = `
                    <div class="flex-shrink-0 pt-1">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox h-4 w-4 border-gray-400 rounded-full text-green-600 focus:ring-green-500 cursor-pointer">
                    </div>
                    <div class="flex-grow ml-3">
                        <p class="task-title ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p>
                        <p class="task-description text-sm text-gray-500 ${task.completed ? 'line-through' : ''}">${task.description}</p>
                        <div class="flex items-center gap-4 mt-2 text-xs">
                            ${task.dueDate ? `
                                <span class="flex items-center gap-1 text-green-700">
                                    <i data-lucide="calendar" class="w-3 h-3"></i>
                                    ${new Date(task.dueDate.replace(/-/g, '\/')).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                                </span>` : ''
                            }
                            ${task.project && task.project !== 'Entrada' ? `
                                <span class="flex items-center gap-1 text-gray-500">
                                    <span>${task.project}</span>
                                    <i data-lucide="hash" class="w-3 h-3 text-gray-400"></i>
                                </span>` : ''
                            }
                        </div>
                    </div>
                    <div class="actions flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="edit-btn text-gray-400 hover:text-gray-700">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button class="delete-btn text-gray-400 hover:text-red-600">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(taskElement);
            });
        }
        lucide.createIcons(); // Re-render icons for new elements
        updateTaskCounts();
        renderProjects(); // Update project counts whenever tasks are re-rendered
    };
    
    const updateTaskCounts = () => {
        const activeTasks = tasks.filter(t => !t.completed).length;
        todayTaskCountSidebar.textContent = activeTasks > 0 ? activeTasks : '';
        todayTaskCountMain.textContent = `${tasks.length} tarefas`;
    };

    const showForm = (task = null) => {
        taskForm.reset();
        const today = new Date().toISOString().split('T')[0];
        
        if (task) {
            // Edit mode
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;
            taskDueDateInput.value = task.dueDate || today;
            taskProjectSelect.value = task.project || 'Entrada';
            submitBtn.textContent = 'Salvar alterações';
        } else {
            // Add mode
            taskIdInput.value = '';
            taskDueDateInput.value = today;
            taskProjectSelect.value = 'Entrada';
            submitBtn.textContent = 'Adicionar tarefa';
        }
        taskFormContainer.classList.remove('hidden');
        addTaskBtn.classList.add('hidden');
        taskTitleInput.focus();
    };

    const hideForm = () => {
        taskFormContainer.classList.add('hidden');
        addTaskBtn.classList.remove('hidden');
        taskForm.reset();
    };
    
    const formatDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date();
        todayDateEl.textContent = today.toLocaleDateString('pt-BR', options);
    };

    // --- Event Handlers ---

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const project = taskProjectSelect.value;

        if (!title) return;

        if (id) {
            // Update existing task
            tasks = tasks.map(task => 
                task.id === parseInt(id) ? { ...task, title, description, dueDate, project } : task
            );
        } else {
            // Add new task
            const newTask = {
                id: Date.now(),
                title,
                description,
                completed: false,
                dueDate,
                project
            };
            tasks.unshift(newTask);
        }

        hideForm();
        renderTasks();
    };
    
    const handleProjectFormSubmit = (e) => {
        e.preventDefault();
        const projectName = newProjectNameInput.value.trim();
        if (projectName && !projects.some(p => p.name.toLowerCase() === projectName.toLowerCase())) {
            const newProject = {
                id: Date.now(),
                name: projectName
            };
            projects.push(newProject);
            renderProjects();
            addProjectForm.reset();
            addProjectForm.classList.add('hidden');
            showAddProjectFormBtn.classList.remove('hidden');
        }
    };

    const handleTaskListClick = (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;
        
        const taskId = parseInt(taskElement.dataset.id);

        // Toggle complete
        if (e.target.classList.contains('task-checkbox')) {
            tasks = tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            renderTasks();
        }
        
        // Delete task
        if (e.target.closest('.delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                tasks = tasks.filter(task => task.id !== taskId);
                renderTasks();
            }
        }
        
        // Edit task
        if (e.target.closest('.edit-btn')) {
            const taskToEdit = tasks.find(task => task.id === taskId);
            showForm(taskToEdit);
        }
    };
    

    // --- Initial Setup ---

    toggleSidebarBtn.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
    });

    addTaskBtn.addEventListener('click', () => showForm());
    addTaskSidebarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showForm();
    });
    cancelBtn.addEventListener('click', hideForm);
    taskForm.addEventListener('submit', handleFormSubmit);
    taskList.addEventListener('click', handleTaskListClick);
    
    showAddProjectFormBtn.addEventListener('click', () => {
        addProjectForm.classList.remove('hidden');
        showAddProjectFormBtn.classList.add('hidden');
        newProjectNameInput.focus();
    });

    cancelAddProjectBtn.addEventListener('click', () => {
        addProjectForm.classList.add('hidden');
        showAddProjectFormBtn.classList.remove('hidden');
        addProjectForm.reset();
    });

    addProjectForm.addEventListener('submit', handleProjectFormSubmit);
    
    formatDate();
    renderTasks();
});
