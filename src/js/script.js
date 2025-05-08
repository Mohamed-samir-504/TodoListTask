import {
    db,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
} from '../firebase/firebase.js';


//----------------------------------------------DOM elements--------------------------------------------------

const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const searchInput = document.getElementById('searchInput');
const addBtn = document.querySelector('.add-btn');
const todoList = document.querySelector('.todo-list');
const tabs = document.querySelectorAll('.tab');
const searchForm = document.querySelector('.search-form');


//------------------------------------------------Functions---------------------------------------------------

function createTodoItem(id, title, description, status, priority) {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.setAttribute('data-status', status);
    todoItem.setAttribute('Id', id);
    if (priority) {
        todoItem.classList.add('priority');
    }
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
            if (todo.getAttribute('data-status') === "completed") markCompleted(todo);
            todo.style.display = status === 'completed' ? 'flex' : 'none';
        }
    });
}

function markCompleted(todoItem) {
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
}

function markPrioritized(todoItem) {
    todoItem.classList.add('priority');
    const priorityIcon = todoItem.querySelector('.fa-circle-up');
    priorityIcon.classList.add('active');
}

function markUnPrioritized(todoItem) {
    todoItem.classList.remove('priority');
    const priorityIcon = todoItem.querySelector('.fa-circle-up');
    priorityIcon.classList.remove('active');
}




async function fetchTodos() {
    todoList.innerHTML = '';

    try {
        const q = query(collection(db, "todo-items"), orderBy("priority", "desc"));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            const item = doc.data();
            const todoItem = createTodoItem(doc.id, item.title, item.description, item.status, item.priority);
            todoList.appendChild(todoItem);

            if (item.priority) markPrioritized(todoItem);
        });
    }
    catch (error) {
        console.error("Failed to fetch tasks:", error);
        alert("Error loading tasks. Please refresh the page.");
    }

    filterTodos();
    reorderTodos();
}




//-------------------------------------------EventListeners----------------------------------------------------

//Get request to fetch all todos
document.addEventListener("DOMContentLoaded", fetchTodos);


addBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) return;

    try {
        await addDoc(collection(db, "todo-items"), {
            title,
            description,
            status: 'todo',
            priority: 0,
            timestamp: serverTimestamp()
        });
        titleInput.value = '';
        descInput.value = '';
    } catch (error) {
        console.error("Error adding task:", error);
        alert("Error: could not add your task. Please try again.");
    }

    const todoItem = createTodoItem(title, description);
    todoList.appendChild(todoItem);
    titleInput.value = '';
    descInput.value = '';
    fetchTodos();
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


todoList.addEventListener('click', async (e) => {
    const item = e.target;
    const todoItem = item.closest('.todo-item');

    //if trash icon is presses
    if (item.classList.contains('fa-trash')) {
        try {
            await deleteDoc(doc(db, "todo-items", todoItem.getAttribute('Id')));
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task.");
        }
        todoItem.remove();
    }

    //if completed icon is presses
    else if (item.classList.contains('fa-check')) {

        try {
            await updateDoc(doc(db, "todo-items", todoItem.getAttribute('Id')), {
                status: "completed"
            });
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Could not update task.");
        }

        markCompleted(todoItem);

        //re-filter to remove completed todos into completed tab
        filterTodos();
    }

    //if priority icon is pressed
    else if (item.classList.contains('fa-circle-up')) {

        if (item.classList.contains('active')) {
            try {
                await updateDoc(doc(db, "todo-items", todoItem.getAttribute('Id')), {
                    priority: 0
                });

                markUnPrioritized(todoItem)
            } catch (error) {
                console.error("Failed to update task:", error);
                alert("Could not update task.");
            }

        }
        else {
            try {
                await updateDoc(doc(db, "todo-items", todoItem.getAttribute('Id')), {
                    priority: 1
                });

                markPrioritized(todoItem)
            } catch (error) {
                console.error("Failed to update task:", error);
                alert("Could not update task.");
            }
        }

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