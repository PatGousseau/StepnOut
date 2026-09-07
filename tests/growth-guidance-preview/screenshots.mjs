// Actual components with synthetic data. Run alongside preview.mjs.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const { chromium } = createRequire(import.meta.url)(process.argv[2] || "playwright");
const output = process.argv[3] || "docs/growth-guidance-ux/polished";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const open = async (query = "") => {
    await page.goto("http://127.0.0.1:4173" + query);
    await page.getByRole("tab", { name: /^(Step|Passo)$/ }).waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const capture = async name => {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: horizontal overflow`);
    assert.deepEqual(await page.locator('[dir="auto"],textarea').evaluateAll(elements => elements.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(element => element.textContent.slice(0, 80))), [], `${name}: text outside viewport`);
    await page.screenshot({ path: `${output}/${name}.png` });
  };
  await open("?voice");
  await capture("step");
  await page.getByRole("tab", { name: "Journal", exact: true }).click();
  await capture("journal");
  await page.getByRole("button", { name: "Write an entry", exact: true }).click();
  await capture("write");
  await page.getByRole("textbox").fill("I waved to my neighbour today. It felt easier this time.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).waitFor();
  await capture("response");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Record a voice entry", exact: true }).click();
  await page.getByRole("button", { name: "Start recording", exact: true }).waitFor();
  await capture("voice");
  await open("?voice");
  await page.getByRole("tab", { name: "Goal", exact: true }).click();
  await capture("goal");
  await page.getByRole("tab", { name: "Step", exact: true }).click();
  await page.getByRole("button", { name: "How did it go?", exact: true }).click();
  await page.getByRole("button", { name: "Partly", exact: true }).click();
  await capture("report");
  await open("?event");
  await page.getByRole("button", { name: "Use this for my step", exact: true }).scrollIntoViewIfNeeded();
  await capture("event");
  await open("?empty");
  await capture("empty");
  await page.goto("http://127.0.0.1:4173?intake");
  await page.getByRole("button", { name: "Start the conversation", exact: true }).waitFor();
  await capture("onboarding");
  await page.getByRole("button", { name: "Start the conversation", exact: true }).click();
  await page.getByRole("textbox").first().waitFor();
  await capture("onboarding-questions");
  await page.setViewportSize({ width: 320, height: 740 });
  await open("?lang=it&voice");
  await capture("step-italian-320");
  await page.getByRole("tab", { name: "Diario", exact: true }).click();
  await capture("journal-italian-320");
  await page.getByRole("tab", { name: "Obiettivo", exact: true }).click();
  await capture("goal-italian-320");
  await open("?event&lang=it");
  const eventHeading = page.getByText("Un posto dove provare", { exact: true });
  await eventHeading.waitFor();
  // Stress wrapping without claiming this replaces native Dynamic Type coverage.
  await page.locator('[dir="auto"]').evaluateAll(elements => elements.forEach(element => {
    const computed = getComputedStyle(element);
    if (computed.fontFamily.includes("MaterialCommunityIcons")) return;
    const size = parseFloat(computed.fontSize);
    const line = parseFloat(computed.lineHeight);
    element.style.fontSize = `${size * 1.5}px`;
    if (Number.isFinite(line)) element.style.lineHeight = `${line * 1.5}px`;
  }));
  await eventHeading.scrollIntoViewIfNeeded();
  assert.equal(await eventHeading.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.right <= element.parentElement.getBoundingClientRect().right + 1;
  }), true, "Enlarged event heading stays inside its row");
  await capture("event-italian-large-text");
  await page.setViewportSize({ width: 1100, height: 900 });
  await open();
  await capture("step-wide");
  assert.deepEqual(errors, []);
  console.log(`PASS: screenshots and viewport checks saved in ${output}`);
} finally { await browser.close(); }
