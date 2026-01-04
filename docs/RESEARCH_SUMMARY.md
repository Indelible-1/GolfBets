# Research Summary: CLAUDE.md and SKILLS.md Patterns

## Sources Analyzed

I researched patterns from the following high-quality sources:

### Official Anthropic Sources
- **Anthropic Engineering Blog**: "Claude Code: Best practices for agentic coding"
- **Claude.com Blog**: "Using CLAUDE.md files: Customizing Claude Code for your codebase"
- **Claude Code Docs**: Agent Skills documentation, Settings documentation
- **Claude Help Center**: API Key Best Practices
- **GitHub anthropics/skills**: Official skills repository and templates

### High-Quality Community Examples
- **Sabrina Ramonov** (`SabrinaRamonov/ai-coding-rules`): Comprehensive CLAUDE.md with MUST/SHOULD rules, skeptical review phases, and TDD workflow
- **HumanLayer Blog**: "Writing a good CLAUDE.md" — WHY/WHAT/HOW framework, progressive disclosure
- **Harper Reed**: TDD as counter to hallucination, practical workflow patterns
- **Ben Newton**: ROADMAP.md management patterns for project tracking
- **Backslash Security**: Claude Code security best practices
- **GitGuardian Blog**: Secrets management best practices
- **DevProblems**: Protecting sensitive files in Claude Code

---

## Key Patterns Observed

### 1. Structure: WHY / WHAT / HOW

The most effective CLAUDE.md files follow a three-part structure:

| Section | Purpose |
|---------|---------|
| **WHY** | Project purpose, goals, constraints |
| **WHAT** | Tech stack, key files, architecture |
| **HOW** | Commands, workflows, verification steps |

### 2. Security Best Practices (Critical Addition)

From Anthropic's Help Center and security-focused blogs:

- **Always use `.gitignore`** for `.env`, secrets, and credential files
- **Use `permissions.deny`** in `.claude/settings.json` to block sensitive file access
- **Never hardcode secrets** — use environment variables
- **Rotate API keys** regularly (every 90 days recommended)
- **Enable secret scanning** via GitHub or tools like Gitleaks

### 3. Code Hygiene / Anti-Bloat (Critical Addition)

Consistent patterns from refactoring guides:

- **Search before creating** — check if functionality exists
- **Update existing files** instead of creating new ones
- **Refactor immediately** when seeing duplication
- **Incremental changes** — small diffs, run tests after each
- **Delete dead code** — unused imports, functions, files

### 4. Documentation Maintenance (Critical Addition)

From project management patterns:

- **ROADMAP.md** — Track plans with `[ ]`, `[-]`, `[x]` checkboxes
- **CHANGELOG.md** — Keep Versions format (Added/Changed/Fixed)
- **Self-updating docs** — Update after every feature completion
- **docs/ folder structure** — Architecture, data model, legal, changelog

### 5. MUST vs SHOULD Classification

From Sabrina Ramonov's patterns:
- **MUST** rules are enforced by CI or are absolute
- **SHOULD** rules are strongly recommended but flexible

### 6. Anti-Hallucination Rules

Consistent across all strong examples:
1. **Ask clarifying questions** before coding complex features
2. **Draft and confirm approach** before implementation
3. **Never invent** APIs, packages, pricing, or legal claims
4. **State uncertainty explicitly** — "I don't know" is valid

### 7. TDD as Hallucination Counter

From Harper Reed's blog:
> "TDD is the most effective counter to hallucination and LLM scope drift I have found."

### 8. Verification Before Completion

Every strong file includes a verification phase:
- Run linter
- Run type checker
- Run tests
- Update documentation
- Confirm no regressions

---

## Synthesis Approach

The CLAUDE.md and SKILLS.md files I created combine:

1. **HumanLayer's WHY/WHAT/HOW structure** — Clear organization
2. **Sabrina Ramonov's MUST/SHOULD rules** — Prioritization clarity
3. **Harper Reed's TDD emphasis** — Hallucination prevention
4. **Anthropic's verification patterns** — Quality gates
5. **Backslash Security patterns** — Claude Code security settings
6. **GitGuardian best practices** — .gitignore and secret management
7. **Ben Newton's ROADMAP.md** — Project progress tracking
8. **Solo builder constraints** — Your specific operating context
9. **Golf betting legal guardrails** — From your project docs
10. **Firebase + Next.js patterns** — Stack-specific guidance

---

## New Sections Added (Second Iteration)

### CLAUDE.md Additions:

1. **🛡️ SECURITY** — Non-negotiable security practices
   - Secrets management (.gitignore patterns)
   - Pre-commit security checks
   - Firestore security requirements
   - Input validation rules
   - Claude Code settings.json deny rules

2. **📁 CODE HYGIENE** — Avoid bloat and tech debt
   - Search before creating new files
   - Update existing files first
   - Refactoring triggers
   - Anti-bloat rules
   - Incremental change patterns

3. **📚 DOCUMENTATION** — Keep it current
   - docs/ folder structure
   - ROADMAP.md format and workflow
   - CHANGELOG.md format
   - Self-maintaining documentation rules

### SKILLS.md Additions:

1. **🛡️ SECURITY SKILLS**
   - Pre-commit security checklist
   - Sensitive file patterns for .gitignore
   - Code patterns for secrets (good vs bad)
   - Firestore security rules checklist

2. **🧹 CODE HYGIENE SKILLS**
   - Pre-file-creation checklist
   - Refactoring checklist
   - Code consolidation patterns
   - File organization rules

3. **📚 DOCUMENTATION SKILLS**
   - When to update which doc
   - ROADMAP.md management
   - CHANGELOG.md management
   - Self-documentation workflow

---

## Files Produced

All files are **copy-paste ready**:

1. **CLAUDE.md** — Project-level AI instruction file with security, code hygiene, and documentation rules
2. **SKILLS.md** — Coding permissions, constraints, and domain-specific skills
3. **RESEARCH_SUMMARY.md** — This document (methodology and sources)
