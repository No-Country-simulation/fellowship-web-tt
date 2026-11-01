import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Compile only the pure infrastructure and its tests with the existing TypeScript dependency.
// No Next server, env loader, network calls or additional test framework are involved.
const require = createRequire(import.meta.url);
const appDir = fileURLToPath(new URL("../", import.meta.url));
const outputDir = mkdtempSync(join(tmpdir(), "testimonios-form-i18n-"));

try {
  execFileSync(process.execPath, [
    require.resolve("typescript/bin/tsc"),
    "lib/form-i18n/infrastructure.test.ts",
    "--target", "ES2020",
    "--lib", "ES2020,DOM",
    "--module", "commonjs",
    "--moduleResolution", "node",
    "--strict",
    "--esModuleInterop",
    "--skipLibCheck",
    "--noEmitOnError",
    "--types", "node",
    "--rootDir", "lib",
    "--outDir", outputDir,
  ], { cwd: appDir, stdio: "inherit" });

  execFileSync(process.execPath, [
    "--test", join(outputDir, "form-i18n/infrastructure.test.js"),
  ], { cwd: appDir, stdio: "inherit" });
} finally {
  // Verify the resolved temporary target before recursive cleanup, including on Windows.
  if (dirname(resolve(outputDir)) !== resolve(tmpdir()) || !basename(outputDir).startsWith("testimonios-form-i18n-")) {
    throw new Error("Unexpected test output directory; cleanup refused.");
  }
  rmSync(outputDir, { recursive: true, force: true });
}
