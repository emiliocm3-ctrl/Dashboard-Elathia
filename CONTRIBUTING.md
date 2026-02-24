# Contributing to Agricultural Dashboard

Thank you for considering contributing to the Agricultural Dashboard! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and professional in all interactions.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/dashboard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 💻 Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
```

## 🔧 How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/yourusername/dashboard/issues)
- If not, create a new issue with:
  - Clear title and description
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots if applicable
  - Your environment (OS, browser, Node version)

### Suggesting Enhancements

- Check existing issues and pull requests first
- Create an issue describing:
  - The problem you're solving
  - Your proposed solution
  - Any alternatives considered
  - Implementation details if applicable

### Code Contributions

1. **Pick an Issue**
   - Look for issues labeled `good first issue` or `help wanted`
   - Comment on the issue to let others know you're working on it

2. **Write Code**
   - Follow the coding standards below
   - Keep changes focused and atomic
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Submit Pull Request**
   - Fill out the PR template
   - Reference related issues
   - Wait for review

## 📝 Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Keep components small and focused (under 200 lines)
- Avoid deep nesting (max 3 levels)

### Code Style

```javascript
// Good
function MetricCard({ sectorName, metrics, onViewSector }) {
  return (
    <div className="card">
      <h3>{sectorName}</h3>
      {metrics.map(metric => (
        <MetricRow key={metric.label} {...metric} />
      ))}
    </div>
  );
}

// Avoid
function MetricCard(props) {
  return <div className="card"><h3>{props.sectorName}</h3>{props.metrics.map((metric) => { return <MetricRow label={metric.label} value={metric.value} status={metric.status} /> })}</div>
}
```

### File Organization

- One component per file
- Place reusable components in `src/components/`
- Configuration in `src/config/`
- Utilities in `src/utils/`
- Co-locate tests with components: `Component.jsx` + `Component.test.js`

### Naming Conventions

- **Components:** PascalCase (`MetricCard.jsx`)
- **Functions:** camelCase (`handleViewSector`)
- **Constants:** UPPER_SNAKE_CASE (`SECTORS`, `METRICS`)
- **Files:** PascalCase for components, camelCase for utilities

### Props

- Always define PropTypes or use TypeScript
- Destructure props in function signature
- Provide default values when applicable

```javascript
function SummaryBlock({
  metricType,
  value,
  unit,
  statusText = '¡Bien! Estado óptimo.',
  status = 'ok'
}) {
  // Component logic
}
```

### Hooks

- Follow Rules of Hooks
- Extract complex logic into custom hooks
- Name custom hooks with `use` prefix

```javascript
function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, semicolons, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```bash
feat(dashboard): add real-time data refresh

Implement automatic data refresh every 30 seconds
Add loading indicator during refresh
Cache previous data to prevent flickering

Closes #123

fix(metrics): correct humidity calculation

The humidity percentage was incorrectly calculated due to
incorrect unit conversion. Fixed by updating the formula
in MetricCard component.

Fixes #456

docs(readme): update installation instructions

Add missing step for environment configuration
Clarify Node.js version requirements
```

### Rules

- Use imperative mood ("add" not "added")
- Keep subject line under 50 characters
- Capitalize subject line
- No period at the end of subject
- Separate subject from body with blank line
- Wrap body at 72 characters
- Explain what and why, not how

## 🔍 Pull Request Process

### Before Submitting

1. **Update documentation**
   - README.md if adding features
   - Code comments for complex logic
   - CHANGELOG.md with your changes

2. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run format:check
   ```

3. **Test manually**
   - Test your changes in the browser
   - Check different screen sizes
   - Verify no console errors

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests
- [ ] Tested manually in browser

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline must pass
   - No linting errors
   - All tests pass
   - Build succeeds

2. **Code Review**
   - At least one maintainer approval required
   - Address all feedback
   - Keep discussion professional

3. **Merge**
   - Squash and merge for clean history
   - Delete branch after merge

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

## ❓ Questions?

- 💬 Open a [Discussion](https://github.com/yourusername/dashboard/discussions)
- 📧 Email: support@example.com
- 📖 Check [Documentation](./docs)

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Git Best Practices](https://git-scm.com/book/en/v2)

---

Thank you for contributing! 🎉
