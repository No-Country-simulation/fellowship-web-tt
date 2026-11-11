import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Existing TypeScript + node:test. Server modules run only in an allowlisted VM with doubles.
// No Next server, env loader, network calls or additional test framework are involved.
const require = createRequire(import.meta.url);
const appDir = fileURLToPath(new URL("../", import.meta.url));
const outputDir = mkdtempSync(join(tmpdir(), "testimonios-form-i18n-"));

try {
  const testFiles = [
    "form-i18n/infrastructure.test.ts",
    "testimonials/form-errors.test.ts",
    "testimonials/server-errors.test.ts",
  ];
  const configPath = join(outputDir, "tsconfig.json");
  const compiledDir = join(outputDir, "compiled");
  writeFileSync(configPath, JSON.stringify({
    extends: join(appDir, "tsconfig.json"),
    compilerOptions: {
      target: "ES2020", lib: ["ES2020", "DOM"], module: "commonjs",
      moduleResolution: "node", noEmit: false, noEmitOnError: true,
      incremental: false, allowJs: false, types: ["node"], plugins: [],
      typeRoots: [join(appDir, "node_modules/@types")],
      baseUrl: appDir, paths: { "@/*": ["./*"] },
      rootDir: join(appDir, "lib"), outDir: compiledDir,
    },
    files: testFiles.map(file => join(appDir, "lib", file)),
    include: [],
  }));
  execFileSync(process.execPath, [
    require.resolve("typescript/bin/tsc"), "--project", configPath,
  ], { cwd: appDir, stdio: "inherit" });

  execFileSync(process.execPath, [
    "--test", ...testFiles.map(file => join(compiledDir, file.replace(/\.ts$/, ".js"))),
  ], { cwd: appDir, stdio: "inherit" });
} finally {
  // Verify the resolved temporary target before recursive cleanup, including on Windows.
  if (dirname(resolve(outputDir)) !== resolve(tmpdir()) || !basename(outputDir).startsWith("testimonios-form-i18n-")) {
    throw new Error("Unexpected test output directory; cleanup refused.");
  }
  rmSync(outputDir, { recursive: true, force: true });
}
