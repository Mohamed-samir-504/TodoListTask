document.addEventListener("DOMContentLoaded", () => {
    const titleInput = document.getElementById('titleInput');
    const descInput = document.getElementById('descInput');
    const searchInput = document.getElementById('searchInput');
    const addBtn = document.querySelector('.add-btn');
    const todoList = document.querySelector('.todo-list');
    const tabs = document.querySelectorAll('.tab');
    const searchForm = document.querySelector('.search-form');

    function createTodoItem(title, description) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.setAttribute('data-status', 'todo');
        todoItem.innerHTML = `
        <div>
          <h3 class="todo-title">${title}</h3>
          <p class="todo-desc">${description}</p>
        </div>
        <div class="icons">
          <i class="fa-solid fa-check"></i>
          <i class="fa-solid fa-trash"></i>
          <i class="fa-solid fa-circle-up priority-icon" title="Mark as priority"></i>
        </div>
      `;
        return todoItem;
    }

    //based on priority
    function reorderTodos() {
        const items = Array.from(document.querySelectorAll('.todo-item'));

        const sorted = items.sort((a, b) => {
            const aPriority = a.classList.contains('priority') ? 1 : 0;
            const bPriority = b.classList.contains('priority') ? 1 : 0;
            return bPriority - aPriority;
        });

        todoList.innerHTML = '';
        sorted.forEach(item => todoList.appendChild(item));
    }

    //based on completed or not (todo)  
    function filterTodos() {
        const activeTab = document.querySelector('.tab.active').textContent;
        const todos = document.querySelectorAll('.todo-item');

        todos.forEach(todo => {
            const status = todo.getAttribute('data-status');
            if (activeTab === 'To Do') {
                todo.style.display = status === 'todo' ? 'flex' : 'none';
            } else if (activeTab === 'Completed') {
                todo.style.display = status === 'completed' ? 'flex' : 'none';
            }
        });
    }


    //-------------------------------------------EventListeners----------------------------------------------------

    addBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!title || !description) return;

        const todoItem = createTodoItem(title, description);
        todoList.appendChild(todoItem);
        titleInput.value = '';
        descInput.value = '';
        filterTodos();
    });


    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const todoItems = document.querySelectorAll('.todo-item');

        todoItems.forEach(item => {
            if (item.getAttribute('data-status') === 'todo') {
                const title = item.querySelector('.todo-title').textContent.toLowerCase();

                if (title.includes(filter)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }

        });
    });


    todoList.addEventListener('click', (e) => {
        const item = e.target;
        const todoItem = item.closest('.todo-item');

        //if trash icon is presses
        if (item.classList.contains('fa-trash')) {
            todoItem.remove();
        }

        //if completed icon is presses
        else if (item.classList.contains('fa-check')) {
            todoItem.setAttribute('data-status', 'completed');
            todoItem.classList.remove('.priority');
            todoItem.querySelector('.todo-title').style.textDecoration = 'line-through';
            todoItem.querySelector('.todo-desc').style.textDecoration = 'line-through';

            //remove priority icon
            const priorityIcon = todoItem.querySelector('.priority-icon');
            if (priorityIcon) priorityIcon.remove();

            //remove completed icon
            const checkIcon = todoItem.querySelector('.fa-check');
            if (checkIcon) checkIcon.remove();

            //re-filter to remove completed todos into completed tab
            filterTodos();
        }

        //if priority icon is pressed
        else if (item.classList.contains('fa-circle-up')) {
            todoItem.classList.toggle('priority');
            item.classList.toggle('active');
            reorderTodos();
        }
    });


    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            const addForm = document.querySelector('.form:has(.add-btn)');

            //add active class to pressed tab (make it active)
            tab.classList.add('active');
            if (tab.textContent === "Completed") {
                searchForm.style.display = "none";
                addForm.style.display = 'none';
            } else {
                searchForm.style.display = "flex";
                addForm.style.display = 'flex';
            }
            filterTodos();
        });
    });

});