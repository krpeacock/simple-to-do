const puppeteer = require("puppeteer");
import canisterIds from "../../canister_ids.json";

describe("Integration tests", () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    await page.goto(
      "http://localhost:8000?canisterId=" +
        canisterIds.simple_to_do_assets.local
    );
    console.log(canisterIds.simple_to_do_assets.local);
    await page.screenshot({ path: __dirname + "/screenshots/initial.png" });
  });
  it("should load our custom todo-list", async () => {
    await page.waitForSelector("todo-list");
    const todoList = await page.evaluate(() => {
      return document.querySelector("todo-list");
    });
    await page.screenshot({ path: __dirname + "/screenshots/loaded.png" });
    expect(todoList).toBeTruthy();
  });
  it("should handle submitting a todo", async () => {
    await page.waitForSelector("todo-list");
    const todoList = await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      const form = list.shadowRoot.querySelector("form");
      form.querySelector("input").value = "Test value";
      form.querySelector(`button[type="submit"]`).click();
      return document.querySelector("todo-list");
    });

    await page.waitForTimeout(4000);
    await page.screenshot({ path: __dirname + "/screenshots/after-add.png" });
    const itemTest = await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      const item = list?.shadowRoot?.querySelector("li");
      return new Promise((resolve) =>
        resolve(item?.querySelector("label")?.innerText)
      );
    });
    expect(await itemTest).toBe("Test value");
  });
  it("should handle completing a todo", async () => {
    await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      // In case environment wasn't clean, and there were extra todos
      const checkboxes = list.shadowRoot.querySelectorAll(
        `input[type="checkbox"]`
      );
      checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) checkbox.click();
      });
    });

    await page.waitForTimeout(4000);
    await page.screenshot({
      path: __dirname + "/screenshots/after-checked.png",
    });
    const isChecked = await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      const items = list?.shadowRoot?.querySelectorAll("li");

      const checkbox = items[items.length - 1].querySelector("input");
      // resolve with whether the last node is checked
      return new Promise((resolve) => resolve(checkbox.checked));
    });
    expect(isChecked).toBe(true);
  });
  it("should clear completed todos", async () => {
    await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      const clearButton = list.shadowRoot.querySelector(`button[type="reset"]`);
      clearButton.click();
    });

    await page.waitForTimeout(4000);

    const remainingTodos = await page.evaluate(() => {
      const list = document.querySelector("todo-list");
      const items = list?.shadowRoot?.querySelectorAll("li");
      return new Promise((resolve) => resolve(items.length));
    });

    expect(remainingTodos).toBe(0);
  });
});
