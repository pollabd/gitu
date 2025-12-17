#!/usr/bin/env node
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
  } catch {
    console.error("Corrupted ~/.gitu.json - resetting...");
    return { current: null, identities: {} };
  }
}

function save(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
  } catch {
    console.error(`Failed: ${cmd}`);
    process.exit(1);
  }
}

function esc(str) {
  return str.replace(/"/g, '\\"');
}

const args = process.argv.slice(2);
const cmd = args[0] || "";

if (cmd === "" || cmd === "--help" || cmd === "-h") {
  console.log(`
gitu - Dead simple Git identity switcher

Usage:
  gitu p / gitu w        → switch identity
  gitu who              → show current
  gitu list             → list all
  gitu add <id> "Name" email [ssh-key]
  gitu rm <id>          → remove identity
`);
  process.exit(0);
}

if (cmd === "--version" || cmd === "-v") {
  console.log("gitu v1.2.4");
  process.exit(0);
}

if (cmd === "who") {
  const c = load();
  const i = c.identities[c.current || ""];
  console.log(i ? `Current → ${c.current} (${i.email})` : "No identity set");
  process.exit(0);
}

if (cmd === "list") {
  const c = load();
  console.log("Identities:");
  Object.keys(c.identities).forEach((k) => {
    const marker = k === c.current ? "→ " : "  ";
    console.log(`${marker}${k.padEnd(12)} ${c.identities[k].email}`);
  });
  process.exit(0);
}

if (cmd === "add") {
  const [id, name, email, ssh = null] = args.slice(1);

  if (!id || !name || !email) {
    console.log('Usage: gitu add <id> "Full Name" email [ssh-key]');
    process.exit(1);
  }

  const c = load();
  c.identities[id] = { name, email, ssh };
  if (!c.current) c.current = id;

  save(c);
  console.log(`Added → ${id} (${email})`);
  process.exit(0);
}

if (cmd === "rm") {
  const id = args[1];
  const c = load();

  if (!c.identities[id]) {
    console.log(`Identity "${id}" not found`);
    process.exit(1);
  }

  delete c.identities[id];
  if (c.current === id) c.current = null;

  save(c);
  console.log(`Removed → ${id}`);
  process.exit(0);
}

const config = load();
const identity = config.identities[cmd];

if (!identity) {
  console.log(`Identity "${cmd}" not found. Use 'gitu list'`);
  process.exit(1);
}

run(`git config --global user.name "${esc(identity.name)}"`);
run(`git config --global user.email "${esc(identity.email)}"`);

if (identity.ssh) {
  const keyPath = identity.ssh.replace(/^~/, os.homedir());
  run(`git config --global core.sshCommand "ssh -i \\"${keyPath}\\" -o IdentitiesOnly=yes"`);
} else {
  run(`git config --global --unset core.sshCommand`);
}

config.current = cmd;
save(config);

console.log(`Switched to ${cmd} → ${identity.email}`);
