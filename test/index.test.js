// import { waitFor, screen } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import {
  queryByAttribute,
  queryByTestId,
  getByText,
  queryByText,
  getByTestId,
} from "./dom";
import { screen, waitFor } from "./shadowSupport";

let mockTodos = [];
let mockMethods = {
  addTodo: jest.fn((text) => {
    text;
    return new Promise((resolve) => {
      mockTodos.push({
        id: mockTodos.length,
        description: text,
        checked: false,
      });
      resolve();
    });
  }),
  getTodos: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(mockTodos);
    });
  }),
  clearCompleted: jest.fn(() => {
    return new Promise((resolve) => {
      mockTodos = mockTodos.filter((todo) => !todo.checked);
      resolve();
    });
  }),
  completeTodo: jest.fn((num) => {
    return new Promise((resolve) => {
      const foundTodo = mockTodos.find((todo) => todo.id === num);
      foundTodo.completed = true;
      resolve();
    });
  }),
};

jest.mock("ic:canisters/simple_to_do", () => {
  return mockMethods;
});

require("../src/frontend/todoList.js");
function exampleDOM() {
  const div = document.createElement("div");
  div.id = "app";
  const todolist = document.createElement("todo-list");
  div.appendChild(todolist);
  document.body.appendChild(div);
  return div;
}

afterEach(() => {
  mockTodos = [];
  for (const method in mockMethods) {
    if (Object.hasOwnProperty.call(mockMethods, method)) {
      mockMethods[method].mockClear();
    }
  }
  // document.body.innerHTML = "";
});

test("Add a Todo", async () => {
  const container = exampleDOM();

  const input = queryByAttribute("name", container, "todo"); //?
  input.value = "Testing a todo";

  const form = queryByTestId(container, "todo-form");
  form.submit();

  expect(mockMethods.addTodo).toBeCalledTimes(1);

  await waitFor(() => screen.getByText("Testing a todo"), {
    timeout: 4000,
  });
  expect(screen.getByText("Testing a todo")).toBeTruthy();
});

test("Complete a Todo", async () => {
  mockTodos = [{ id: 5, description: "todo to complete", completed: false }];
  const container = exampleDOM();
  const todo = await waitFor(() => getByText(container, "todo to complete"));
  const checkbox = todo.parentElement.querySelector("#todo-5");
  checkbox.click();
  expect(mockMethods.completeTodo).toBeCalledTimes(1);

  waitFor(() => expect(checkbox.checked).toBe(true));
});

test("Clear completed todos", async () => {
  mockTodos = [{ id: 5, description: "todo to complete", completed: false }];
  const container = exampleDOM();
  const todo = await waitFor(() => getByText(container, "todo to complete"));
  const checkbox = todo.parentElement.querySelector("#todo-5");
  checkbox.click();
  expect(mockMethods.completeTodo).toBeCalledTimes(1);

  waitFor(() => expect(checkbox.checked).toBe(true));

  const clearButton = queryByText(container, "Clear Completed Todos");
  clearButton.click();

  const list = getByTestId(container, "list-container");
  waitFor(() => expect(list.children.length).toBe(0));
});
