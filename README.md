# Hunchy

Hunchy is an agentic AI coding assistant and development platform, featuring a CLI, VSCode extension, and a web interface.

## Project Structure

This is a monorepo managed with `pnpm` and `turbo`:

- `apps/cli`: The Hunchy command-line interface.
- `apps/vscode-extension`: VSCode extension for Hunchy.
- `apps/web`: Web-based dashboard and interface.
- `functions`: Firebase Cloud Functions for backend logic.
- `packages/firebase-config`: Shared Firebase configuration and service initialization.

## Environment Setup

To get started, copy the environment template:

```bash
cp .env.example .env
```

Fill in your Firebase project credentials in the `.env` file. For local development, you can use the Firebase Emulators.

## Installation

```bash
pnpm install
pnpm build
```

## Running Locally

To start the development environment with emulators:

```bash
pnpm dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
