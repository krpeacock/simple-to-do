import register from "./register";
import { TodoList } from "./todoList";

const root = document.getElementById("app");

function component() {
  return document.createElement("todo-list");
}
let todoList = component();

root.appendChild(todoList);
