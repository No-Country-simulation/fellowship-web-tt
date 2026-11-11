// QA only: run the current local panel's Canvas renderer without changing/importing it in the app.
// Generated originals are ignored. No uploads, admin client or actions are loaded.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { appDir, browserQA, require } from "./qa-carousel-browser.mjs";

const ts = require("typescript");
const panel = join(appDir, "../panel-admin/features/testimonials/infrastructure");
const canvasSource = await readFile(join(panel, "ig-card-canvas.ts"), "utf8");
const constants = await readFile(join(panel, "ig-card.ts"), "utf8");
const width = Number(constants.match(/IG_CARD_WIDTH = (\d+)/)[1]);
const height = Number(constants.match(/IG_CARD_HEIGHT = (\d+)/)[1]);
assert.equal(width, 1080); assert.equal(height, 1350);
const code = ts.transpileModule(canvasSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const quoteCode = ts.transpileModule(await readFile(join(appDir, "lib/testimonials/quote.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const qa = await browserQA();
try {
  await qa.load("es");
  await qa.ev((code, quoteCode, width, height) => {
    const quote = { exports: {} }; new Function("module", "exports", quoteCode)(quote, quote.exports);
    const renderer = { exports: {} };
    new Function("require", "module", "exports", code)(name => {
      if (name === "./ig-card") return { IG_CARD_WIDTH: width, IG_CARD_HEIGHT: height, IG_PHOTO_HEIGHT: Math.round(width * 9 / 16) };
      if (name === "./quote") return quote.exports;
      throw Error("Unapproved QA import");
    }, renderer, renderer.exports);
    window.__drawQaCard = renderer.exports.drawIgCard;
  }, code, quoteCode, width, height);
  const output = join(appDir, "docs/ui/assets/carousel-optimized/generated");
  await mkdir(output, { recursive: true });
  for (const design of ["photo", "quote", "portrait", "offer", "journey", "shift", "profile"]) {
    const image = await qa.ev(async design => {
      document.body.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
      const canvas = document.createElement("canvas");
      await window.__drawQaCard(canvas, { design, type: ["offer", "journey"].includes(design) ? "first_job" : ["shift", "profile"].includes(design) ? "career_change" : "simulation",
        quote: "Trabajar en equipo me ayudó a desarrollar mis habilidades.", fullName: "Persona QA", country: "Argentina", avatarUrl: "", captureUrl: null,
        role: "Desarrollo QA", company: "Empresa QA", previousRole: "Docencia" });
      return canvas.toDataURL("image/png").split(",")[1];
    }, design);
    await writeFile(join(output, design + ".png"), Buffer.from(image, "base64"));
  }
  assert.equal(qa.stats().blockedPosts, 0); assert.equal(qa.stats().blockedExternal, 0); assert.equal(qa.stats().browserExceptions, 0);
  console.log(JSON.stringify({ result: "PASS", designs: 7, width, height, actualPanelRenderer: true, originalFiles: "ignored", ...qa.stats() }));
} finally { await qa.close(); }
