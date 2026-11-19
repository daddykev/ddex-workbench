# Contributing to DDEX Workbench

Thank you for considering contributing to DDEX Workbench, an open-source DDEX ERN validator for the music industry, live at [ddex-workbench.org](https://ddex-workbench.org).

## Code of Conduct

By participating in this project, you are expected to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How can I contribute?

### Reporting bugs

Check the existing [issues](https://github.com/daddykev/ddex-workbench/issues) first. When you open a bug report, include:

- A clear, descriptive title
- The exact steps to reproduce the problem, with a sample ERN message if relevant (remove any confidential data)
- What you observed, and what you expected instead
- Screenshots, if they help
- Your environment: OS, browser, Node.js or Python version, and SDK version

### Suggesting enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/daddykev/ddex-workbench/issues). Describe the current behaviour, the behaviour you'd like, and why it would be useful.

### Pull requests

1. Fork the repository and create your branch from `main`.
2. Keep changes focused. If you change behaviour, update the relevant docs.
3. Run the tests for the package you changed (see [Testing](#testing)).
4. Follow the existing code style.
5. Open the pull request.

## Development

### Setting up

See [docs/SETUP.md](docs/SETUP.md). Note that `/validate` needs the validation rule files, which are private and not part of this repository. Without them, `/validate` returns 503, and the rest of the app and API works.

### Project structure

```
ddex-workbench/
├── cloudflare/
│   └── worker.js      # Worker in front of api.ddex-workbench.org
├── docs/              # Blueprint and setup guide
└── ui/
    ├── src/           # Vue 3 application
    ├── functions/     # Firebase Cloud Functions (Express API and validators)
    ├── packages/
    │   ├── sdk/         # JavaScript/TypeScript SDK (@ddex-workbench/sdk)
    │   └── python-sdk/  # Python SDK (ddex-workbench)
    └── public/        # Static assets
```

See [docs/blueprint.md](docs/blueprint.md) for the full tree and architecture.

### Coding standards

**JavaScript/Vue**
- Use the Vue 3 Composition API (`<script setup>`).
- Match the style of the surrounding code. The app and functions have no linter configuration.
- Use meaningful names, and add JSDoc comments to exported functions.
- Keep components small and focused.

**CSS**
- Follow the CSS architecture in [docs/blueprint.md](docs/blueprint.md#css-architecture).
- Use the custom properties from `ui/src/assets/themes.css`, and the classes from `ui/src/assets/components.css`.
- Design mobile-first, and keep both the light and dark themes working.

**Commits**

Use [conventional commits](https://www.conventionalcommits.org/):
- `feat:` a new feature
- `fix:` a bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` refactoring
- `test:` tests
- `chore:` maintenance

Example: `fix: report the line number for XSD parser errors`

### Testing

The test suites live in the SDKs:

**JavaScript SDK** (vitest):
```bash
cd ui/packages/sdk
npm install
npm test
```

**Python SDK** (pytest):
```bash
cd ui/packages/python-sdk
pip install -e ".[dev]"
pytest
```

The Python SDK's integration tests call the live API. They are skipped unless you set `DDEX_INTEGRATION_TEST=true`:
```bash
DDEX_INTEGRATION_TEST=true pytest tests/test_integration.py
```

The web app and the Cloud Functions have no automated test suite. Test those changes by hand:
- Run the app and the emulators (see [docs/SETUP.md](docs/SETUP.md)).
- Validate sample messages for each ERN version you touched.
- Check the UI at several screen sizes, in both the light and dark themes.

### Documentation

- Update `README.md` when you add or change a user-facing feature.
- Document API changes in `ui/src/views/ApiDocsView.vue`, the live reference at [ddex-workbench.org/api](https://ddex-workbench.org/api).
- Update the SDK `README.md` and `CHANGELOG.md` when you change an SDK.
- Add comments for complex logic.

## Questions and discussion

Use [GitHub Issues](https://github.com/daddykev/ddex-workbench/issues) for bug reports, feature requests and questions. Add the `question` label to questions.

## Release process

1. Features are developed on branches and merged to `main` through reviewed pull requests.
2. The app and API are deployed from `main` (see [Deployment](docs/blueprint.md#deployment)).
3. SDK releases follow semantic versioning and are tagged `js-sdk-vX.Y.Z` or `python-sdk-vX.Y.Z` (see [Releasing the SDKs](docs/blueprint.md#releasing-the-sdks)).

Thank you for contributing! 🎵
