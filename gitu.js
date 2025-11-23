#!/usr/bin/env node

/**
 * gitu - The world's simplest Git identity switcher
 * One command. No init. No pain.
 *
 * Usage:
 *   gitu work                → switch to work
 *   gitu personal            → switch to personal
 *   gitu who                 → show current identity
 *   gitu list                → list all identities
 *   gitu add work "John" john@company.com ~/.ssh/id_work
 *   gitu rm work             → delete identity
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const CONFIG_FILE = path.join(os.homedir(), ".gitu.json");

function load() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { current: null, identities: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch (e) {
    console.error("Corrupted ~/.gitu.json - resetting...");
    return { current: null, identities: {} };
  }
}

function save(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log("Saved config → ~/.gitu.json");
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
  } catch (err) {
    console.error(`Failed: ${cmd}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const cmd = args[0];

// ————————————————————————
// Help / No args
// ————————————————————————
if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(`
gitu - Dead simple Git identity switcher

Commands:
  gitu personal            Switch to "personal"
  gitu work                Switch to "work"
  gitu who                 Show current identity
  gitu list                List all identities
  gitu add <name> <full-name> <email> [ssh-key-path]
  gitu rm <name>           Remove identity
  gitu --version           Show version

Example:
  gitu add work "John Doe" john@company.com ~/.ssh/id_ed25519_work
  gitu work                Now using work account
  `);
  process.exit(0);
}

// ————————————————————————
// Version
// ————————————————————————
if (cmd === "--version" || cmd === "-v") {
  const pkg = require(path.join(__dirname, "package.json"));
  console.log(`gitu v${pkg.version}`);
  process.exit(0);
}

// ————————————————————————
// gitu who
// ————————————————————————
if (cmd === "who") {
  const config = load();
  if (config.current && config.identities[config.current]) {
    const i = config.identities[config.current];
    console.log(`Current: ${config.current} → ${i.name} <${i.email}>`);
  } else {
    console.log("No identity set. Use: gitu personal");
  }
  process.exit(0);
}

// ————————————————————————
// gitu list
// ————————————————————————
if (cmd === "list") {
  const config = load();
  const identities = Object.keys(config.identities);
  if (identities.length === 0) {
    console.log("No identities yet. Add one with: gitu add ...");
  } else {
    console.log("Your identities:");
    identities.forEach((key) => {
      const i = config.identities[key];
      const marker = key === config.current ? "→ " : "  ";
      console.log(`${marker}${key.padEnd(12)} ${i.email}`);
    });
  }
  process.exit(0);
}

// ————————————————————————
// gitu add <name> "Full Name" email@domain.com [~/.ssh/key]
// ————————————————————————
if (cmd === "add") {
  const [name, fullName, email, sshPath = null] = args.slice(1);
  if (!name || !fullName || !email) {
    console.log('Usage: gitu add <name> "Full Name" you@company.com [~/.ssh/key]');
    process.exit(1);
  }
  const config = load();
  config.identities[name] = {
    name: fullName,
    email: email,
    ssh: sshPath,
  };
  if (!config.current) config.current = name;
  save(config);
  console.log(`Added identity: ${name} → ${email}`);
  process.exit(0);
}

// ————————————————————————
// gitu rm <name>
// ————————————————————————
if (cmd === "rm" || cmd === "remove") {
  const name = args[1];
  if (!name) {
    console.log("Usage: gitu rm <name>");
    process.exit(1);
  }
  const config = load();
  if (!config.identities[name]) {
    console.log(`Identity "${name}" not found.`);
    process.exit(1);
  }
  delete config.identities[name];
  if (config.current === name) config.current = Object.keys(config.identities)[0] || null;
  save(config);
  console.log(`Removed identity: ${name}`);
  process.exit(0);
}

// ————————————————————————
// Main: Switch identity (e.g. gitu work)
// ————————————————————————
const config = load();
const identity = config.identities[cmd];

if (!identity) {
  console.log(`Identity "${cmd}" not found.`);
  console.log("Available:");
  Object.keys(config.identities).forEach((k) => console.log(`  • ${k}`));
  console.log('\nAdd one with: gitu add work "John" john@company.com');
  process.exit(1);
}

// Apply git config (local only — safe!)
run(`git config user.name "${identity.name.replace(/"/g, '\\"')}"`);
run(`git config user.email "${identity.email}"`);

// Optional SSH key
if (identity.ssh) {
  const key = identity.ssh.replace(/^~/, os.homedir());
  run(`git config core.sshCommand "ssh -i '${key}' -F /dev/null"`);
} else {
  run(`git config --unset core.sshCommand || true`);
}

// Save as current
config.current = cmd;
save(config);

console.log(`Switched to ${cmd} → ${identity.email}`);
