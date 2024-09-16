export default {
  branches: ["master"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { breaking: true, release: "minor" }, // TODO: v1になったら release: "major" にする
          { type: "feat", section: "Features", release: "minor" },
          { type: "fix", section: "Bug Fixes", release: "patch" },
          { revert: true, release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git",
  ],
};
