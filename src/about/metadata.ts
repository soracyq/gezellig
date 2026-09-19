import appPackage from "../../package.json";
import project from "../../desktop/project-info.json";

export const currentVersion = appPackage.version;
export const repositoryURL = project.repository;
export const developerName = project.developer;
export const currentRelease = (
  project.releases as Record<string, { date?: string; summary: string }>
)[currentVersion];
