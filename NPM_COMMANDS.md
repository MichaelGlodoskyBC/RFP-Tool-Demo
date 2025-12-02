# NPM Commands Reference

## Essential Commands

### Development
```bash
npm run dev
```
Starts the development server with hot reload at http://localhost:3000

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` folder

### Preview
```bash
npm run preview
```
Preview the production build locally before deploying

## First Time Setup

### Install All Dependencies
```bash
npm install
```
This downloads and installs all required packages listed in package.json

### Install Individual Packages
```bash
npm install [package-name]
```
Add a new package to the project

### Update Dependencies
```bash
npm update
```
Update all packages to their latest compatible versions

## Troubleshooting Commands

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```
Removes all dependencies and reinstalls from scratch (Windows: use `rmdir /s /q node_modules` and `del package-lock.json`)

### Clear Cache
```bash
npm cache clean --force
```
Clears npm's cache if you're having installation issues

### Check for Outdated Packages
```bash
npm outdated
```
Lists packages that have newer versions available

## Useful Development Commands

### Type Checking (if you add TypeScript)
```bash
npm run type-check
```

### Linting (if you add ESLint)
```bash
npm run lint
npm run lint:fix
```

### Testing (if you add tests)
```bash
npm test
npm run test:watch
npm run test:coverage
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

## Package Management

### Add Development Dependency
```bash
npm install --save-dev [package-name]
```

### Remove Package
```bash
npm uninstall [package-name]
```

### List Installed Packages
```bash
npm list --depth=0
```

### Check Package Version
```bash
npm list [package-name]
```

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm update` | Update dependencies |
| `npm outdated` | Check for updates |
| `npm cache clean --force` | Clear npm cache |

## Environment Variables

Create a `.env` file in the project root:

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=RFP Command
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

Note: Vite requires environment variables to be prefixed with `VITE_`

## Common Workflows

### Starting Fresh Each Day
```bash
# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install

# Start development
npm run dev
```

### Before Committing Code
```bash
# Make sure build works
npm run build

# Test the build
npm run preview
```

### Updating the Project
```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Test everything still works
npm run dev
```
