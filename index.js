"use strict";

const fs = require("fs");
const path = require("path");
const findUp = require("find-up");

const WORKSPACE_DIR_ENV_VAR = "NPM_CONFIG_WORKSPACE_DIR";
const WORKSPACE_MANIFEST_FILENAME = "pnpm-workspace.yaml";

function findWorkspaceDir(cwd) {
  const workspaceManifestDirEnvVar =
    process.env[WORKSPACE_DIR_ENV_VAR] ??
    process.env[WORKSPACE_DIR_ENV_VAR.toLowerCase()];
  const workspaceManifestLocation = workspaceManifestDirEnvVar
    ? path.join(workspaceManifestDirEnvVar, "pnpm-workspace.yaml")
    : findUp.sync([WORKSPACE_MANIFEST_FILENAME, "pnpm-workspace.yml"], {
        cwd: getRealPath(cwd),
      });
  if (workspaceManifestLocation?.endsWith(".yml")) {
    throw new Error(
      `The workspace manifest file should be named "pnpm-workspace.yaml". File found: ${workspaceManifestLocation}`
    );
  }
  return workspaceManifestLocation && path.dirname(workspaceManifestLocation);
}

function getRealPath(path) {
  try {
    // We need to resolve the real native path for case-insensitive file systems.
    // For example, we can access file as C:\Code\Project as well as c:\code\projects
    // Without this we can face a problem when try to install packages with -w flag,
    // when root dir is using c:\code\projects but packages were found by C:\Code\Project
    return fs.realpathSync.native(path);
  } catch (err) {
    return path;
  }
}

module.exports = { findWorkspaceDir };
