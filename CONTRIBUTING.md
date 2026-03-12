# Contributing to Enticeable Verification

## Git Workflow

### Branch Strategy

- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add user verification endpoint

Implement POST /api/verify endpoint with IDology integration

Closes #123
```

```
fix(db): resolve connection pool timeout

Update connection pool configuration to prevent timeouts
under high load
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes with clear, atomic commits
3. Write/update tests as needed
4. Update documentation
5. Submit PR to `develop`
6. Ensure CI passes
7. Request review from team members
8. Address feedback
9. Squash and merge when approved

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` - use proper types or `unknown`
- Document complex types with JSDoc comments

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use meaningful test descriptions
- Test edge cases and error scenarios

### Code Review

All code must be reviewed before merging:
- Review for correctness
- Check for security issues
- Verify test coverage
- Ensure documentation is updated
- Validate performance implications

## Development Setup

See [README.md](./README.md) for installation instructions.

## Questions?

Open an issue or contact the team leads.
