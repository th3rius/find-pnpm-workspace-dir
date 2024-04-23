"use strict";

const path = require("path");
const fs = require("fs");
const { findWorkspaceDir } = require(".");
const mockFs = require("mock-fs");

const NPM_CONFIG_WORKSPACE_DIR_ENV_VAR = "NPM_CONFIG_WORKSPACE_DIR";
const FAKE_PATH = "cat-finder";

beforeEach(() => {
  mockFs({
    "cat-finder/pnpm-workspace.yaml": "",
    "cat-finder/packages/paw-size-detector": {},
  });
});

afterEach(mockFs.restore);

function isFileSystemCaseSensitive() {
  try {
    fs.realpathSync.native(process.cwd().toUpperCase());
    return false;
  } catch (_) {
    return true;
  }
}

// We don't need to validate case-sensitive systems
// because it is not possible to reach process.cwd() with wrong case there.
const testOnCaseInSensitiveSystems = isFileSystemCaseSensitive()
  ? test.skip
  : test;

test("finds actual workspace dir", async () => {
  const workspaceDir = await findWorkspaceDir(
    "./cat-finder/packages/paw-size-detector"
  );

  expect(workspaceDir).toBe(path.resolve("./cat-finder"));
});

testOnCaseInSensitiveSystems(
  "finds workspace dir with wrong case from cwd",
  async () => {
    const workspaceDir = await findWorkspaceDir(
      "./cat-finder/packages/paw-size-detector".toUpperCase()
    );

    expect(workspaceDir).toBe(path.resolve("./cat-finder"));
  }
);

test("finds overridden workspace dir", async () => {
  const oldValue = process.env[NPM_CONFIG_WORKSPACE_DIR_ENV_VAR];
  process.env[NPM_CONFIG_WORKSPACE_DIR_ENV_VAR] = FAKE_PATH;
  const workspaceDir = await findWorkspaceDir(
    "./cat-finder/packages/paw-size-detector"
  );
  process.env[NPM_CONFIG_WORKSPACE_DIR_ENV_VAR] = oldValue;

  expect(workspaceDir).toBe(FAKE_PATH);
});
