import { expect, test } from "@playwright/test";

test("the contour probe moves from the plot's tab stop and respects its coordinate limits", async ({ page }) => {
  await page.goto("/?ea&screens=1");
  const probe = page.getByRole("application", { name: "Contour probe", exact: true });
  const x = page.getByRole("slider", { name: "Probe x", exact: true });
  const y = page.getByRole("slider", { name: "Probe y", exact: true });

  await x.press("End");
  await probe.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(probe).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(x).toHaveAttribute("aria-valuenow", "2.3");
  await page.keyboard.press("Shift+ArrowLeft");
  await page.keyboard.press("ArrowDown");
  await expect(x).toHaveAttribute("aria-valuenow", "2.29");
  await expect(y).toHaveAttribute("aria-valuenow", "0.95");
  await expect(probe).toBeFocused();
});

test("keyboard focus can enter the Simulation preferences panel", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto("/?ea&screens=1");
  await page.getByRole("button", { name: "Preferences", exact: true }).press("Enter");
  const dialog = page.getByRole("dialog", { name: "Preferences" });
  await dialog.getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
  const tab = dialog.getByRole("tab", { name: "Simulation", exact: true });
  await expect(tab).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(tab).not.toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(tab).toBeFocused();
  expect(errors).toEqual([]);
});
