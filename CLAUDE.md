# CLAUDE.md - AI Assistant Instructions

Version: 2.1.1

## Project Overview

This is the Direct Home Service Knowledge Base - a hybrid React/Static HTML documentation system with full internationalization support.

## Important Architecture Notes

### Hybrid Approach
- **React App**: Main knowledge base interface at root (`/`)
- **Static HTML**: Getting started panels preserved in `/public/en/` and `/public/es/`
- **DO NOT** convert static HTML panels to React components unless explicitly requested
- **PRESERVE** direct URL access to all `.html` files

### Key Directories
- `/src/` - React application source code
- `/public/en/` - English static HTML panels (DO NOT DELETE)
- `/public/es/` - Spanish static HTML panels (DO NOT DELETE)
- `/public/brand/` - Brand assets including logo-12.png
- `/dist/` - Production build output

## Development Guidelines

### When Making Changes

1. **Version Management**
   - Update version in `/README.md`, `/src/README.md`, and `/CLAUDE.md`
   - Use semantic versioning (MAJOR.MINOR.PATCH)

2. **Language Support**
   - Always provide both English and Spanish translations
   - Update both `/src/i18n/locales/en.json` and `/src/i18n/locales/es.json`
   - Maintain language switcher functionality

3. **Component Development**
   - Use functional components with hooks
   - Include PropTypes validation
   - Use CSS modules for styling
   - Maintain responsive design

4. **Static HTML Files**
   - NEVER delete or move files from `/public/en/` or `/public/es/`
   - These must remain accessible via direct URLs
   - Example: `/es/dashboard.html` must always work

## Build and Deployment

### Commands
```bash
npm start          # Development server
npm run build      # Production build
npm run build:azure # Azure-specific build with asset copying
```

### GitHub Actions
- Workflow file: `.github/workflows/azure-static-web-apps-icy-ground-0f4431f0f.yml`
- Automatically builds React app and deploys to Azure
- Preserves static HTML file structure

## Routing Configuration

### Azure Static Web Apps
- Config file: `/public/staticwebapp.config.json`
- Direct access to `/en/*.html` and `/es/*.html`
- React app handles all other routes
- Fallback to index.html for client-side routing

### URL Structure
```
/                    # React app (auto language detection)
/en                  # English knowledge base
/es                  # Spanish knowledge base
/en/dashboard.html   # Static HTML (direct access)
/es/dashboard.html   # Static HTML (direct access)
```

## Design Requirements

### Branding
- Logo: `/public/brand/logo-12.png` (always use in headers)
- Primary Color: #2E3192
- Font: Poppins
- Language Switcher: Floating bottom tab (25% from left)

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader compatible

## Testing Checklist

Before committing changes:
- [ ] React app builds without errors
- [ ] Static HTML files remain accessible
- [ ] Language switching works
- [ ] Search functionality operates
- [ ] Mobile responsive design intact
- [ ] Version numbers updated

## Common Tasks

### Adding a New Component
1. Create in `/src/components/ComponentName/`
2. Add `ComponentName.jsx` and `ComponentName.module.css`
3. Export from `/src/components/index.js`
4. Add translations to locale files

### Adding a Static Page
1. Create HTML in `/public/en/pagename.html`
2. Create Spanish version in `/public/es/pagename.html`
3. Include language switcher script
4. No build process needed - directly accessible

### Updating Translations
1. Edit `/src/i18n/locales/en.json`
2. Edit `/src/i18n/locales/es.json`
3. Use translation keys in components with `useTranslation()` hook

## Translation System

The application uses a dual-layer translation system to provide complete English/Spanish support:

### UI Translations
- Located in `/src/App.js` in the `translations` object
- Covers all UI elements (buttons, labels, messages, navigation)
- Automatically switches based on selected language
- Example structure:
  ```javascript
  const translations = {
    en: {
      title: "Knowledge Base",
      searchPlaceholder: "Search articles..."
    },
    es: {
      title: "Base de Conocimiento",
      searchPlaceholder: "Buscar artículos..."
    }
  }
  ```

### Content Translations
- Located in `/src/data/spanish-translations.json`
- Maps article IDs to Spanish translations
- Includes titles, categories, and content sections
- Search functionality works in both languages simultaneously
- Structure:
  ```json
  {
    "articles": {
      "460823": {
        "title": "Gestión de Usuarios",
        "category": "Operaciones Principales",
        "content": { /* translated content */ }
      }
    }
  }
  ```

### How Translation Works
1. **Language Selection**: User selects language via the floating language switcher
2. **Cookie Storage**: Language preference saved in cookie for 1 year
3. **Dynamic Translation**: Content automatically translates based on selection
4. **Search Integration**: Search queries match content in the selected language
5. **Autocomplete**: Suggestions appear in the current language

### Adding New Translations
To add a new article translation:
1. Add the article ID to `/src/data/spanish-translations.json`
2. Provide Spanish translations for title, category, and all content sections
3. Test search functionality in both languages
4. Verify autocomplete shows translated results

### Cookie Implementation
- Cookie name: `selectedLanguage`
- Expiration: 365 days
- Path: `/` (site-wide)
- Values: `en` or `es`

## Important Warnings

⚠️ **DO NOT**:
- Delete or move static HTML files from `/public/en/` or `/public/es/`
- Remove the hybrid architecture
- Change the routing structure without updating `staticwebapp.config.json`
- Modify language switcher position without user request

✅ **ALWAYS**:
- Maintain backwards compatibility with static HTML panels
- Test both React and static HTML functionality
- Preserve direct URL access to HTML files
- Update version numbers when making changes

## Support and Documentation

- Main README: `/README.md`
- React App README: `/src/README.md`
- Component Documentation: `/src/components/README.md`
- Azure Configuration: `/public/staticwebapp.config.json`

## Contact

For questions about this codebase, contact: support@directhomeservice.com