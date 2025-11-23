# @pollabd/gitu

The simplest way to switch between multiple Git accounts.

No config files. No includeIf magic. Just one word.
A tiny, zero‑config tool for instantly switching Git identities.

Gitu lets you swap between named identities (email, name, SSH key) with a single word — no global config edits, no conditional includes, no ceremony. Define identities once, then switch freely per repository or session.

Why use gitu?
- Instant: switch identities with a single command (e.g., gitu work).
- Minimal: no extra config files or environment hacks.
- Safe: stores pointers to your SSH keys and identity metadata.
- Portable: works across projects and machines where you install it.

Quick usage
- Add identities:
    ```bash
    gitu add personal "Your Name" you@gmail.com ~/.ssh/id_personal
    gitu add work     "Your Name" you@company.com ~/.ssh/id_work
    ```
- Switch:
    ```bash
    gitu personal   # switch to personal identity
    gitu work       # switch to work identity
    gitu who        # show current identity
    gitu list       # list all configured identities
    ```

How it works (brief)
- gitu registers named identities (name, email, SSH key path).
- When you switch, it updates your Git user.name/user.email and adjusts SSH settings so pushes/pulls use the chosen key.
- No global config juggling or repo-level overrides required.

Tips
- Use descriptive identity names (work, personal, open-source).
- Keep your SSH keys protected and referenced by absolute paths.
- Combine gitu with your terminal aliases for even faster workflow.

Next: install and configure
- See the Install section below for npm install and example commands.
gitu work       # → instantly using work account
gitu personal   # → back to personal
gitu who        # → shows current identity
'''

## Install

npm install -g @pollabd/gitu
gitu add personal "Your Name" you@gmail.com ~/.ssh/id_personal
gitu add work "Your Name" you@company.com ~/.ssh/id_work
gitu personal     # one word and done
gitu work
gitu who          # Current: work → you@company.com
gitu list         # see all identities