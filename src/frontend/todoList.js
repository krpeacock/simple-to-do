"use strict";
import { todo_actor } from "./actor";

// Thanks to Mozilla's web component examples for reference
// https://github.com/mdn/web-components-examples

export class TodoList extends HTMLElement {
  constructor() {
    // establish prototype chain
    super();

    const shadow = this.attachShadow({ mode: "open" });

    // creating a container for the editable-list component
    const editableListContainer = document.createElement("div");

    // adding a class to our container for the sake of clarity
    editableListContainer.classList.add("editable-list");

    // creating the inner HTML of the editable list element
    editableListContainer.innerHTML = `
        <style>
          li, div > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .icon {
            background-color: #fff;
            border: none;
            cursor: pointer;
            float: right;
            font-size: 1.8rem;
          }
          ul {
            width: max-content;
          }
        </style>
        <form data-testid="todo-form">
          <h1>Simple To-do</h1>
          <formgroup>
              <label for="todo">Add a todo</label>
              <input type="text" name="todo" required />
          </formgroup>
          <button type="submit">submit</button>
        </form>
        <ul class="item-list" data-testid="list-container"></ul>
        <hr />
        <button id="clear-todos" type="reset">Clear Completed Todos</button>
      `;

    // binding methods
    this.setListItems = this.setListItems.bind(this);
    this.handleToggleListeners = this.handleToggleListeners.bind(this);
    this.handleToggle = this.handleToggle.bind(this);

    // appending the container to the shadow DOM
    shadow.appendChild(editableListContainer);
    this.getListItems();
  }

  async getListItems() {
    const todos = await todo_actor.getTodos();
    this.setListItems(todos.reverse());
  }

  // add items to the list
  setListItems(items) {
    this.itemList.innerHTML = "";
    items.forEach((todo) => {
      const li = document.createElement("li");

      li.innerHTML = `
          <label for="todo-${todo.id}">${todo.description}</label>
          <input type="checkbox" id="todo-${todo.id}" ${
        todo.completed && "checked"
      } />
        `;

      this.itemList.appendChild(li);
      this.handleToggleListeners([li.querySelector("input")]);
    });
  }

  // fires after the element has been attached to the DOM
  connectedCallback() {
    const checkboxes = [
      ...this.shadowRoot.querySelectorAll('input[type="checkbox"]'),
    ];
    const clearButton = this.shadowRoot.querySelector("#clear-todos");

    this.itemList = this.shadowRoot.querySelector(".item-list");
    this.form = this.shadowRoot.querySelector("form");

    this.handleToggleListeners(checkboxes);
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const todo = e.target.querySelector("input").value;
      if (!todo) throw new Error("Failed to find todo");
      todo_actor.addTodo(todo).then((result) => {
        this.getListItems();
      });
      return false;
    });
    clearButton.addEventListener("click", () => {
      todo_actor.clearCompleted().then(() => {
        this.getListItems();
      });
    });
  }

  handleToggleListeners(arrayOfElements) {
    arrayOfElements.forEach((element) => {
      element.addEventListener("click", this.handleToggle, false);
    });
  }

  async handleToggle(e) {
    e.preventDefault();
    const target = e.target;
    if (!target.getAttribute("checked")) {
      await todo_actor.completeTodo(Number(target.id.split("todo-")[1]));
      this.getListItems();
    }
  }
}

customElements.define("todo-list", TodoList);
