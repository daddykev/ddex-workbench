# Contributing to DDEX Workbench

First off, thank you for considering contributing to DDEX Workbench! It's people like you that make DDEX Workbench such a great tool for the music industry.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details** (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing code style
6. Issue that pull request!

## Development Process

### Setting Up Your Development Environment

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

### Project Structure
```
ddex-workbench/
├── src/               # Vue 3 application
├── functions/         # Firebase Cloud Functions
├── docs/              # Documentation
└── tests/             # Test files
```

### Coding Standards

#### JavaScript/Vue
- Use Vue 3 Composition API
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep components small and focused

#### CSS
- Follow the existing CSS architecture (see blueprint.md)
- Use CSS custom properties from themes.css
- Prefer utility classes from components.css
- Mobile-first responsive design
- Maintain light/dark theme support

#### Commits
- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation changes
  - `style:` Code style changes (formatting, etc)
  - `refactor:` Code refactoring
  - `test:` Adding or updating tests
  - `chore:` Maintenance tasks

Example: `feat: add ERN 4.3 validation support`

### Testing

- Write unit tests for validation logic
- Add integration tests for API endpoints
- Test UI components with different screen sizes
- Verify light/dark theme compatibility

### Documentation

- Update README.md if adding new features
- Add JSDoc comments to new functions
- Update API.md for new endpoints
- Include inline comments for complex logic

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: [Join our community](https://discord.gg/ddex-workbench)
- **GitHub Discussions**: General discussions and questions

### Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our website (coming soon)

## Release Process

1. Features are developed in feature branches
2. Pull requests are reviewed by maintainers
3. Approved changes are merged to `main`
4. Releases are tagged following semantic versioning

## Questions?

Don't hesitate to ask questions! You can:
- Open an issue with the `question` label
- Ask in our Discord server
- Start a GitHub Discussion

Thank you for contributing! 🎵