# solana-skills

The CLI for the Solana Agent Skills ecosystem.

Supports **Claude Code**, **Cursor**, **Codex**, **OpenCode**, **Windsurf**, and [10+ more agents](#supported-agents).

## Install a Skill

```bash
npx solana-skills add
```

This will install skills from [sendaifun/skills](https://github.com/sendaifun/skills) - the official Solana skills repository.

### Source Formats

```bash
# Default repository (sendaifun/skills)
npx solana-skills add

# GitHub shorthand (owner/repo)
npx solana-skills add sendaifun/skills

# Full GitHub URL
npx solana-skills add https://github.com/sendaifun/skills

# Direct path to a skill in a repo
npx solana-skills add https://github.com/sendaifun/skills/tree/main/skills/drift

# Skill name shorthand (uses default repo)
npx solana-skills add drift

# GitLab URL
npx solana-skills add https://gitlab.com/org/repo

# Local path
npx solana-skills add ./my-local-skills
```

### Options

| Option | Description |
|--------|-------------|
| `-g, --global` | Install to user directory instead of project |
| `-a, --agent <agents...>` | Target specific agents (e.g., `claude-code`, `cursor`) |
| `-s, --skill <skills...>` | Install specific skills by name |
| `-l, --list` | List available skills without installing |
| `-y, --yes` | Skip all confirmation prompts |
| `--all` | Install all skills to all agents without prompts |

### Examples

```bash
# List all available skills
npx solana-skills add --list

# Install specific skills
npx solana-skills add --skill solana-agent-kit --skill drift

# Install to specific agents
npx solana-skills add -a claude-code -a cursor

# Non-interactive installation (CI/CD friendly)
npx solana-skills add --skill drift -g -a claude-code -y

# Install all skills to all agents
npx solana-skills add --all
```

### Installation Scope

| Scope | Flag | Location | Use Case |
|-------|------|----------|----------|
| **Project** | (default) | `./<agent>/skills/` | Committed with your project |
| **Global** | `-g` | `~/<agent>/skills/` | Available across all projects |

## Other Commands

| Command | Description |
|---------|-------------|
| `npx solana-skills find [query]` | Search for skills interactively or by keyword |
| `npx solana-skills init [name]` | Create a new SKILL.md template |
| `npx solana-skills list` | List installed skills |

### `solana-skills find`

Search for skills interactively or by keyword.

```bash
# Interactive search
npx solana-skills find

# Search by keyword
npx solana-skills find defi
npx solana-skills find trading
```

### `solana-skills init`

Create a new skill template.

```bash
# Create SKILL.md in current directory
npx solana-skills init

# Create a new skill in a subdirectory
npx solana-skills init my-new-skill
```

### `solana-skills list`

List installed skills across all agents.

```bash
# List all installed skills
npx solana-skills list

# List global installations only
npx solana-skills list -g

# List skills for specific agents
npx solana-skills list -a claude-code -a cursor
```

## Supported Agents

Skills can be installed to any of these agents:

| Agent | `--agent` flag | Project Path | Global Path |
|-------|----------------|--------------|-------------|
| Claude Code | `claude-code` | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| OpenCode | `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| Codex | `codex` | `.codex/skills/` | `~/.codex/skills/` |
| Cline | `cline` | `.cline/skills/` | `~/.cline/skills/` |
| Windsurf | `windsurf` | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |
| GitHub Copilot | `github-copilot` | `.github/skills/` | `~/.copilot/skills/` |
| Goose | `goose` | `.goose/skills/` | `~/.config/goose/skills/` |
| Continue | `continue` | `.continue/skills/` | `~/.continue/skills/` |
| Roo Code | `roo` | `.roo/skills/` | `~/.roo/skills/` |
| Amp | `amp` | `.agents/skills/` | `~/.config/agents/skills/` |
| Gemini CLI | `gemini-cli` | `.gemini/skills/` | `~/.gemini/skills/` |
| Kilo Code | `kilo` | `.kilocode/skills/` | `~/.kilocode/skills/` |
| Trae | `trae` | `.trae/skills/` | `~/.trae/skills/` |
| Zencoder | `zencoder` | `.zencoder/skills/` | `~/.zencoder/skills/` |

The CLI automatically detects which agents you have installed.

## Available Skills

Visit [solanaskills.com](https://solanaskills.com) or browse the [skills directory](https://github.com/sendaifun/skills/tree/main/skills) to see all available Solana skills.

### Categories

- **DeFi** - Drift, Meteora, Orca, Raydium, Kamino, Sanctum, Lulo
- **Infrastructure** - Helius, Light Protocol, MagicBlock, Squads
- **Oracles** - Pyth, Switchboard
- **Trading** - DFlow, Ranger Finance, PumpFun
- **Program Development** - Pinocchio, Solana Kit
- **Security** - VulnHunter, Code Recon
- **AI Agents** - Solana Agent Kit
- **Cross-Chain** - deBridge

## Creating Skills

Skills are directories containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
description: What this skill does and when to use it
category: DeFi
---

# My Skill

Instructions for the agent to follow when this skill is activated.

## Overview

Describe what this skill helps accomplish.

## Instructions

1. First, do this
2. Then, do that
```

### Required Fields

- `name`: Unique identifier (lowercase, hyphens allowed)
- `description`: Brief explanation of what the skill does

### Optional Fields

- `category`: Skill category (DeFi, Security, etc.)
- `author`: Skill author
- `tags`: Array of tags for discovery

## Contributing

Want to add a new Solana skill? 

1. Fork [sendaifun/skills](https://github.com/sendaifun/skills)
2. Create your skill using `npx solana-skills init my-skill`
3. Submit a PR!

See the [Contributing Guide](https://github.com/sendaifun/skills/blob/main/CONTRIBUTING.md) for more details.

## Telemetry

This CLI does not collect any telemetry data.

## Related Links

- [Solana Skills Repository](https://github.com/sendaifun/skills)
- [Solana Skills Website](https://solanaskills.com)
- [Agent Skills Specification](https://agentskills.io)
- [SendAI](https://sendai.fun)

## License

Apache-2.0
