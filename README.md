# Solana Skills by SendAI

A collection of skills for Claude Code, following the [Agent Skills](https://agentskills.io) specification.

## Structure

```
skills/
├── skills/           # Skill implementations
│   └── example-skill/
│       └── SKILL.md
├── template/         # Starter template for new skills
│   └── SKILL.md
├── spec/             # Agent Skills specification
│   └── SPECIFICATION.md
├── .gitignore
└── README.md
```

## What is a Skill?

A skill is a self-contained folder that provides Claude with specialized instructions for specific tasks. Each skill requires only one file: `SKILL.md`.

## Creating a New Skill

1. Copy the `template/` folder
2. Rename it to your skill name (lowercase, hyphens for spaces)
3. Edit `SKILL.md` with your skill's instructions

## SKILL.md Format

```yaml
---
name: my-skill-name
description: A clear description of what this skill does
---

# My Skill Name

Instructions for Claude to follow when this skill is active.

## Examples
- Example usage patterns

## Guidelines
- Best practices and constraints
```

## Required Frontmatter

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase, hyphens) |
| `description` | What the skill does and when to use it |

## Usage

Skills are loaded by Claude Code and activated based on context or explicit invocation.
