# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
- `pnpm dev` - Start development mode with hot reload for all packages
- `pnpm dev:firefox` - Start development mode for Firefox extension

### Building
- `pnpm build` - Build the new-tab page only
- `pnpm zip` - Build all packages and create Chrome extension zip
- `pnpm zip:firefox` - Build for Firefox and create zip

### Code Quality
- `pnpm lint` - Run ESLint with auto-fix across all packages
- `pnpm type-check` - Run TypeScript type checking across all packages  
- `pnpm prettier` - Format code with Prettier

### Maintenance
- `pnpm clean` - Clean all build outputs and node_modules
- `pnpm update-version <new_version>` - Update version in all package.json files

## Architecture Overview

This is a Chrome extension built using a monorepo structure with multiple packages and pages. The project uses:

- **Build System**: Turbo + Vite with custom configurations
- **Package Manager**: pnpm with workspaces
- **Framework**: React with TypeScript
- **UI Libraries**: Chakra UI, TailwindCSS
- **Chrome Extension**: Manifest V3 with multiple entry points

### Core Structure

**Main Extension Entry Points:**
- `pages/new-tab/` - Primary application (stand-up report generator)
- `pages/popup/` - Extension popup interface
- `pages/options/` - Extension options page
- `pages/devtools/` & `pages/devtools-panel/` - Developer tools integration
- `chrome-extension/` - Extension manifest and background scripts

**Shared Packages:**
- `packages/shared/` - Common React components and utilities
- `packages/storage/` - Chrome storage abstractions
- `packages/ui/` - UI component library
- `packages/vite-config/` - Shared Vite configurations
- `packages/hmr/` - Hot module reload for development

### Data Integration Architecture

The extension integrates with three main data sources:

1. **Jira Integration** (`fetch-jira-items.ts`):
   - Fetches tickets using Jira REST API
   - Supports custom status filtering and date ranges
   - Requires Jira URL and API token configuration

2. **GitHub Integration** (`fetch-github-items.ts`):  
   - Uses Octokit to fetch PRs and issues
   - Supports repository filtering
   - Requires GitHub personal access token

3. **Google Calendar Integration** (`fetch-gcal-items.ts`):
   - Fetches calendar events using Chrome identity API
   - OAuth2 integration with Google APIs
   - Filters events by date ranges

### AI Report Generation

The extension uses AI to generate stand-up reports via `ask-assistant/`:
- Supports both OpenAI and Groq API backends
- Streaming responses with abort capability
- Falls back to Groq if no OpenAI token is configured
- Includes Google Cloud Function for additional AI services (`packages/gcf-auth-groq/`)

### Settings Architecture

Settings are managed through a modal interface with tabs:
- **General Settings**: Basic configuration options
- **GitHub Settings**: Repository selection and token management  
- **Jira Settings**: Server URL, token, and status mappings
- **Google Calendar Settings**: OAuth and calendar selection
- **Model Settings**: AI provider and model configuration

All settings are stored using Chrome's storage API with type-safe abstractions.

### Development Notes

- The project uses Turbo for build orchestration with dependency graphs
- Each package has its own Vite configuration extending shared base configs
- TypeScript configurations are shared via `packages/tsconfig/`
- Hot reload is custom-implemented for Chrome extension development
- The manifest is generated dynamically from `chrome-extension/manifest.js`
- Extension supports both Chrome and Firefox builds via environment flags