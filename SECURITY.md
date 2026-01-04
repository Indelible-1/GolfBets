# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in GolfSettled, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Measures

This project implements:

- **Secret scanning** via GitGuardian
- **Dependency scanning** via Dependabot
- **Branch protection** on main branch
- **Required PR reviews** before merge
- **CI checks** (lint, typecheck, tests) must pass

## Best Practices for Contributors

1. Never commit secrets, API keys, or credentials
2. Use environment variables for sensitive configuration
3. Keep dependencies updated
4. Follow the principle of least privilege in Firestore rules
