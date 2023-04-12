import { javascript } from "projen";
import { nx_monorepo } from "aws-prototyping-sdk";
const project = new nx_monorepo.NxMonorepoProject({
  authorEmail: "support@arroyodev.com",
  authorName: "arroyoDev",
  authorOrganization: true,
  authorUrl: "https://arroyodev.com",
  defaultReleaseBranch: "main",
  devContainer: true,
  devDeps: ["aws-prototyping-sdk"],
  docgen: true,
  name: "nx-monorepo",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: "8",
  prettier: true,
  projenrcTs: true,
  renovatebot: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
