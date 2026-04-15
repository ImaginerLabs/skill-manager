#!/usr/bin/env node
/**
 * smart-push.mjs
 * 智能推送脚本：自动检测 Conventional Commits，发版后推送
 * 用法：npm run push
 */

import { execSync } from "child_process";

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

// 获取当前分支
const branch = runCapture(
  'git symbolic-ref --short HEAD 2>/dev/null || echo ""',
);
const remote = runCapture("git remote 2>/dev/null | head -1") || "origin";

// 非主分支直接 push
if (branch !== "main" && branch !== "master") {
  console.log(`ℹ️  非主分支（${branch}），跳过自动发版，直接推送...`);
  run(`git push ${remote} HEAD:${branch} --follow-tags`);
  process.exit(0);
}

// 获取上一个 tag 以来的 commits
let commits = "";
try {
  const lastTag = runCapture(
    "git describe --tags --abbrev=0 HEAD^ 2>/dev/null",
  );
  commits = runCapture(`git log "${lastTag}"..HEAD --pretty=format:"%s"`);
} catch {
  commits = runCapture('git log --pretty=format:"%s"');
}

if (!commits) {
  console.log("ℹ️  无新 commit，跳过自动发版，直接推送...");
  run(`git push ${remote} HEAD:${branch} --follow-tags`);
  process.exit(0);
}

// 语义分析
const hasBreaking = /BREAKING CHANGE|^[a-z]+(\(.*\))?!:/m.test(commits);
const hasFeat = /^feat(\(.*\))?:/m.test(commits);
const hasFix = /^(fix|perf)(\(.*\))?:/m.test(commits);

if (hasBreaking) {
  console.log("🚀 检测到 BREAKING CHANGE，执行 minor 发版...");
  run("npm run release:minor");
} else if (hasFeat || hasFix) {
  console.log("🚀 检测到 feat/fix commit，执行 patch 发版...");
  run("npm run release:patch");
} else {
  console.log(
    "ℹ️  无 feat/fix/BREAKING commit（docs/chore/refactor 等），跳过自动发版",
  );
}

// 推送（含版本 commit 和 tags）
console.log("📦 推送版本 commit + tags...");
run(
  `HUSKY_RELEASE=1 git push --no-verify ${remote} HEAD:${branch} --follow-tags`,
);

const version = runCapture("node -p \"require('./package.json').version\"");
console.log(`✅ 推送成功（v${version}）`);
