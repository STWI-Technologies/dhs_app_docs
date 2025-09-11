# React Knowledge Base Application

Version: 2.0.0

## Overview

This is the React application that powers the Direct Home Service Knowledge Base main interface. It provides dynamic search, navigation, and multilingual support while coexisting with static HTML panels.

## Architecture

The React app uses:
- **React 18** with functional components and hooks
- **React Router v6** for client-side routing
- **i18next** for internationalization
- **CSS Modules** for component styling
- **Webpack 5** for bundling

## Components

### Core Components

- **Header** - Logo display and navigation
- **LanguageSwitcher** - Floating language selector
- **SearchBar** - Real-time search with suggestions
- **CategoryGrid** - Knowledge base category display
- **ArticleCard** - Article preview cards

### Pages

- **KnowledgeBase** - Main landing page
- **Search** - Search results page
- **CategoryPage** - Category-specific articles
- **ArticlePage** - Individual article view
- **NotFound** - 404 error page

## Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Building
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Azure deployment build
npm run build:azure
```

## File Structure

```
src/
├── components/          # Reusable components
│   ├── Header/
│   ├── LanguageSwitcher/
│   ├── SearchBar/
│   ├── CategoryGrid/
│   └── ArticleCard/
├── pages/              # Page components
│   ├── KnowledgeBase.jsx
│   ├── Search.jsx
│   ├── CategoryPage.jsx
│   ├── ArticlePage.jsx
│   └── NotFound.jsx
├── i18n/               # Internationalization
│   ├── config.js
│   └── locales/
│       ├── en.json
│       └── es.json
├── contexts/           # React contexts
│   └── LanguageContext.js
├── routes/             # Routing configuration
│   └── AppRoutes.jsx
├── utils/              # Utility functions
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

## Styling Guidelines

### CSS Modules
Each component has its own CSS module file:
```javascript
import styles from './Component.module.css';
```

### Design Tokens
- Primary Color: `#2E3192`
- Font Family: `'Poppins', sans-serif`
- Border Radius: `8px` (standard), `15px` (cards)
- Box Shadow: `0 5px 20px rgba(0,0,0,0.08)`

### Responsive Breakpoints
- Mobile: `< 480px`
- Tablet: `< 768px`
- Desktop: `>= 768px`

## Internationalization

### Adding Translations

1. Edit locale files:
   - `/src/i18n/locales/en.json` (English)
   - `/src/i18n/locales/es.json` (Spanish)

2. Use in components:
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('header.title')}</h1>;
}
```

### Language Detection
Priority order:
1. URL path (`/en/` or `/es/`)
2. localStorage (`preferredLanguage`)
3. Browser language
4. Default to English

## State Management

### Language Context
Global language state using React Context:
```javascript
import { useLanguage } from '../contexts/LanguageContext';

function Component() {
  const { language, setLanguage } = useLanguage();
}
```

## Routing

### Route Structure
```
/              → Auto-detect language
/:lang         → Knowledge base
/:lang/search  → Search results
/:lang/category/:id → Category page
/:lang/article/:id  → Article page
```

### Protected Routes
Static HTML files (`/en/*.html`, `/es/*.html`) are served directly, not through React Router.

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Performance Optimization

- Code splitting with React.lazy()
- Image lazy loading
- Debounced search input
- Memoized expensive computations
- CSS animations with transform/opacity

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Skip to content links
- Color contrast compliance

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome)

## Troubleshooting

### Common Issues

1. **Build fails**: Clear node_modules and reinstall
2. **Language not switching**: Check localStorage for conflicts
3. **Routes not working**: Ensure webpack dev server is configured
4. **Styles not applying**: Check CSS module imports

### Debug Mode

Enable debug mode in development:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Create feature branch
2. Follow component structure
3. Add translations for new text
4. Test on mobile and desktop
5. Update this README if needed

## Version History

- **2.0.0** - React app with full i18n support and hybrid architecture
- **1.0.0** - Initial React setup

## License

© 2025 Direct Home Service. All rights reserved.