# @pollabd/gitu

**The simplest way to switch Git + GitHub identities — one word, zero config.**

```bash
gitu personal   # → instantly using your personal account
gitu work       # → instantly using your work account
gitu who        # → shows who you are right now
```

No includeIf. No SSH config juggling. No env vars.  
Just `gitu <name>` and you're done.

## Why developers love gitu

- One command switches **name + email + SSH key**
- Perfect for personal + work + freelance + open-source accounts
- Works everywhere: Git Bash, PowerShell, WSL, macOS, Linux
- Zero setup after the initial `gitu add`

## Installation

```bash
npm install -g @pollabd/gitu
```

## One-time setup

```bash
# Personal account
gitu add personal "Sarah Connor" sarah.connor@gmail.com ~/.ssh/id_ed25519_personal

# Work account
gitu add work "Sarah Connor" sarah.connor@skynet.corp ~/.ssh/id_ed25519_work

# Optional: default to personal in every new terminal
gitu default personal
```

## Daily use

```bash
gitu personal          # → personal everything
gitu work              # → work everything
gitu who               # → Current: personal → sarah.connor@gmail.com
gitu list              # → List all identities (→ = active)
gitu                   # → Quick check (same as gitu who)
```

## Proof it works (run anytime)

```bash
gitu personal
ssh -T git@github.com
# → Hi sarahconnor! You've successfully authenticated...

gitu work
ssh -T git@github.com
# → Hi sarah-skynet! ...

git ls-remote git@github.com:sarahconnor/top-secret-project.git
# → Permission denied (publickey). ← YES, work key can't touch personal repos!
```

## All commands

| Command                                       | Description                |
| --------------------------------------------- | -------------------------- |
| `gitu personal` / `gitu work`                 | Switch identity            |
| `gitu who`                                    | Show current identity      |
| `gitu list`                                   | List all identities        |
| `gitu add <name> "<Full Name>" <email> <key>` | Add or update identity     |
| `gitu default <name>`                         | Set default for new shells |
| `gitu rm <name>`                              | Remove identity            |
| `gitu` (no args)                              | Same as `gitu who`         |

## Tips

- Use short names: `p`, `w`, `a`, `b`, `oss`, `client1`
- You can have 20+ identities, no slowdown
- Works perfectly with GitHub CLI, VS Code, npm, etc.

## Uninstall

```bash
npm uninstall -g @pollabd/gitu
rm ~/.gitu.json
git config --global --unset core.sshCommand   # optional
```

---

Made with love by **@pollabd**  
Source & issues → https://github.com/pollabd/gitu

**Never mix personal and work commits again.**
