# Contributing to Hunchy Launcher

Thank you for your interest in contributing to the Hunchy Launcher! This launcher is intentionally kept simple and small (~200 lines) so it's easy to verify and audit.

## Philosophy

The launcher has a very specific, narrow scope:
1. Download runtime from a trusted URL
2. Verify the download with checksums
3. Execute the runtime

**We will reject changes that:**
- Add features beyond this scope
- Make the code harder to audit
- Increase complexity unnecessarily
- Add dependencies (the launcher should have zero runtime dependencies)

**We welcome changes that:**
- Fix bugs
- Improve security
- Make the code clearer
- Improve error messages
- Fix platform-specific issues

## Development Setup

```bash
# Clone the repository
git clone https://github.com/hunchy-hq/hunchy-launcher.git
cd hunchy-launcher

# Install dependencies
npm install

# Build
npm run build

# Test locally
node dist/index.js --help
```

## Making Changes

1. **Fork the repository**
2. **Create a branch**: `git checkout -b fix-something`
3. **Make your changes**
4. **Test thoroughly**:
   ```bash
   npm run build
   node dist/index.js --help
   ```
5. **Commit**: Use clear, descriptive commit messages
6. **Push**: `git push origin fix-something`
7. **Create a Pull Request**

## Code Style

- Keep it simple and readable
- Add comments for non-obvious logic
- Use TypeScript strict mode
- No external runtime dependencies
- Follow the existing code style

## Testing

Before submitting a PR:

1. **Build**: `npm run build`
2. **Type check**: `npm run typecheck`
3. **Test locally**: Try different scenarios
   - First run (no cache)
   - Subsequent runs (with cache)
   - Update scenario (change version)
   - Error scenarios (network failure, bad checksum)

## Security

Security is critical for the launcher. When making changes:

- Always verify checksums
- Always use HTTPS
- Never skip verification
- Keep file permissions restrictive (0600)
- Be careful with user input

If you find a security issue, please email security@hunchy.dev instead of opening a public issue.

## Release Process

Releases are handled by the maintainers:

1. Update version in `package.json`
2. Create a git tag: `git tag v1.0.0`
3. Push tag: `git push --tags`
4. GitHub Actions builds binaries for all platforms
5. Creates GitHub Release with binaries and manifest

## Questions?

- Open an issue for bugs or feature requests
- Email support@hunchy.ai for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
