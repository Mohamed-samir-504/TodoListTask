
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    getDocs,
    query,
    orderBy,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAHfTgwgSamL-iR3PT4lqZZ219aqWZ-PZE",
    authDomain: "todolist-dd189.firebaseapp.com",
    projectId: "todolist-dd189",
    storageBucket: "todolist-dd189.firebasestorage.app",
    messagingSenderId: "324313137657",
    appId: "1:324313137657:web:772e9493deb8253d883d28",
    measurementId: "G-S2HD0VJNKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const searchInput = document.getElementById('searchInput');
const addBtn = document.querySelector('.add-btn');
const todoList = document.querySelector('.todo-list');
const tabs = document.querySelectorAll('.tab');
const searchForm = document.querySelector('.search-form');



function createTodoItem(id, title, description, status) {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.setAttribute('data-status', status);
    todoItem.setAttribute('Id', id);
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
            if(todo.getAttribute('data-status') === "completed")markCompleted(todo);
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


async function fetchTasks() {
    todoList.innerHTML = '';

    const q = query(collection(db, "todo-items"), orderBy("priority", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
        const item = doc.data();
        const todoItem = createTodoItem(doc.id, item.title, item.description, item.status);
        todoList.appendChild(todoItem);
    });

    filterTodos();
    reorderTodos();

}


//-------------------------------------------EventListeners----------------------------------------------------

addBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) return;

    try {
        await addDoc(collection(db, "todo-items"), {
            title,
            description,
            status: 'todo',
            priority: 1,
            timestamp: serverTimestamp()
        });
        titleInput.value = '';
        descInput.value = '';
    } catch (error) {
        console.error("Error adding task:", error);
    }


    const todoItem = createTodoItem(title, description);
    todoList.appendChild(todoItem);
    titleInput.value = '';
    descInput.value = '';
    fetchTasks();
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
        console.log(todoItem.getAttribute('Id'));
        await deleteDoc(doc(db, "todo-items", todoItem.getAttribute('Id')));
        todoItem.remove();
    }

    //if completed icon is presses
    else if (item.classList.contains('fa-check')) {

        markCompleted(todoItem);
        await updateDoc(doc(db, "todo-items", todoItem.getAttribute('Id')), {
            status: "completed"
        });
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

    document.addEventListener("DOMContentLoaded", fetchTasks);
});