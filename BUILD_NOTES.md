# Azure Static Web Apps Build Configuration

## Overview
This React application is configured to work seamlessly with Azure Static Web Apps while maintaining access to existing static HTML files.

## Build Configuration

### staticwebapp.config.json
Located at `/Users/stwi-steve/dhs_app_docs/public/staticwebapp.config.json`

**Key Features:**
- Direct access to static HTML files in `/en/*.html` and `/es/*.html`
- React Router fallback for SPA routes
- Proper MIME types for all assets
- CORS headers for API endpoints

### Build Scripts
- `npm run build:azure` - Production build for Azure deployment
- `npm run postbuild` - Copies static assets to dist folder
- Individual copy commands for each asset type

### Build Output Structure
```
/dist/
├── index.html (React app entry)
├── static/
│   ├── css/ (React CSS bundles)
│   └── js/ (React JS bundles)
├── en/ (copied from public/en/)
├── es/ (copied from public/es/)
├── brand/ (copied from public/brand/)
├── data/ (copied from public/data/)
├── js/ (copied from public/js/)
├── images/ (copied from public/images/)
└── staticwebapp.config.json
```

## Routing Strategy

1. **Static HTML files**: Direct access via `/en/*.html` and `/es/*.html`
2. **React app**: Handles all other routes via `/*` fallback
3. **Asset files**: Direct access to `/brand/*`, `/data/*`, `/js/*`, `/images/*`

## Development vs Production

- **Development**: `npm start` - Webpack dev server with hot reload
- **Production**: `npm run build:azure` - Optimized build with asset copying

## Compatibility

- Static HTML files remain fully functional and directly accessible
- React app provides enhanced knowledge base landing page
- No conflicts between React routing and static file access
- Fallback HTML content for users without JavaScript