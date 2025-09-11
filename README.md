# DHS App Docs - Knowledge Base

Version: 2.0.0

## Overview

Direct Home Service Knowledge Base - A hybrid React/Static HTML documentation system with full internationalization support (English/Spanish).

## Architecture

This repository uses a **hybrid architecture**:
- **React App**: Powers the main knowledge base interface with dynamic search and navigation
- **Static HTML**: Getting started panels remain as standalone HTML files for direct access
- **Full i18n**: Complete English/Spanish support with persistent language preferences

## Features

- 🌐 **Bilingual Support** - Full English and Spanish translations
- 🔍 **Advanced Search** - Local and external search capabilities
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Fast Performance** - Static HTML for panels, React for dynamic content
- 🎨 **Consistent Branding** - Unified design across all pages
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🚀 **Azure Ready** - Configured for Azure Static Web Apps

## Project Structure

```
/
├── src/                    # React application source
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── i18n/              # Internationalization config
│   └── contexts/          # React contexts
├── public/                # Static assets
│   ├── en/                # English HTML panels
│   ├── es/                # Spanish HTML panels
│   ├── brand/             # Brand assets (logos)
│   └── data/              # Knowledge base content
├── dist/                  # Production build output
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/STWI-Technologies/dhs_app_docs.git

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start

# Access at http://localhost:3000
```

### Production Build

```bash
# Build for Azure Static Web Apps
npm run build:azure

# Output will be in /dist directory
```

## Deployment

This repository is configured for automatic deployment to Azure Static Web Apps via GitHub Actions.

### Manual Deployment

1. Build the application: `npm run build:azure`
2. Deploy the `/dist` folder to Azure Static Web Apps
3. The `staticwebapp.config.json` handles routing configuration

## URL Structure

### React App Routes
- `/` - Main knowledge base (language detection)
- `/en` - English knowledge base
- `/es` - Spanish knowledge base
- `/en/search` - English search
- `/es/search` - Spanish search

### Static HTML Panels (Direct Access)
- `/en/dashboard.html` - English dashboard
- `/es/dashboard.html` - Spanish dashboard
- `/en/jobs.html` - Jobs management
- `/es/trabajos.html` - Gestión de trabajos
- And more...

## Development Guidelines

### Adding New Components

1. Create component in `/src/components/`
2. Use CSS modules for styling
3. Include PropTypes validation
4. Add translations to `/src/i18n/locales/`

### Adding Static Pages

1. Create HTML file in `/public/en/` (English)
2. Create translated version in `/public/es/` (Spanish)
3. Include language switcher script
4. Maintain consistent styling

## Version History

- **2.0.0** - Major update: React app integration, complete i18n support, hybrid architecture
- **1.1.2** - Remove LiveAgent redirect from public staticwebapp config
- **1.1.1** - Remove directhomeservice.com redirect from staticwebapp config
- **1.1.0** - Transform index page to comprehensive knowledge base landing page

## Contributing

1. Create a feature branch
2. Make your changes
3. Test both React app and static pages
4. Submit a pull request

## License

© 2025 Direct Home Service. All rights reserved.

## Support

For support, contact: support@directhomeservice.com