"use strict";
import simple_to_do from "ic:canisters/simple_to_do";

(function () {
  class TodoList extends HTMLElement {
    constructor() {
      // establish prototype chain
      super();

      // attaches shadow tree and returns shadow root reference
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
      const shadow = this.attachShadow({ mode: "open" });

      // creating a container for the editable-list component
      const editableListContainer = document.createElement("div");

      // get attribute values from getters
      const listItems = this.items;
      this.isPending = false;

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
          <h1>Submit a todo</h1>
          <formgroup>
              <label for="todo">Add a todo</label>
              <input type="text" name="todo" required />
          </formgroup>
          <button type="submit">submit</button>
        </form>
        <ul class="item-list"></ul>
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
      this.isPending = true;
      const todos = await simple_to_do.getTodos();
      this.isPending = false;
      this.setListItems(todos.reverse());
    }

    // add items to the list
    setListItems(items) {
      this.itemList.innerHTML = "";
      items.forEach((todo) => {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        label.textContent = todo.description;
        label.setAttribute("for", `todo-${todo.id}`);
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", `todo-${todo.id}`);
        checkbox.id; //?
        todo.completed; //?
        checkbox.checked = todo.completed;
        checkbox.checked; //?
        li.append(label);
        li.append(checkbox);
        this.itemList.appendChild(li);
        this.itemList.innerHTML; //?
        this.handleToggleListeners([checkbox]);
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
        simple_to_do.addTodo(todo).then((result) => {
          this.getListItems();
        });
        return false;
      });
      clearButton.addEventListener("click", () => {
        simple_to_do.clearCompleted().then(() => {
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
        await simple_to_do.completeTodo(Number(target.id.split("todo-")[1]));
        this.getListItems();
      }
    }
  }

  // let the browser know about the custom element
  customElements.define("todo-list", TodoList);
})();
