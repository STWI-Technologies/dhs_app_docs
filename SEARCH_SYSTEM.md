# DHS Knowledge Base Search System

A comprehensive, client-side search system for the Direct Home Service Knowledge Base with multilingual support and advanced filtering capabilities.

## Features

### 🔍 **Smart Search Engine**
- **Fuzzy Search**: Handles typos and similar words using Levenshtein distance algorithm
- **Real-time Search**: Instant results with debounced input (300ms delay)
- **Relevance Scoring**: Advanced scoring based on title, content, and keyword matches
- **Search Suggestions**: Auto-complete and "Did you mean?" functionality
- **Search History**: Persistent search history with localStorage

### 🌐 **Multilingual Support**
- **Bilingual Content**: Full support for English and Spanish
- **Language Detection**: Automatic browser language detection
- **Language Persistence**: User language preference stored across sessions
- **Seamless Switching**: Dynamic language switching without page reload
- **Localized UI**: All interface elements translated

### 🎯 **Advanced Filtering**
- **Category Filters**: Filter by content categories (Operations, Customers, Finance, etc.)
- **Language Filters**: Search in specific language or both
- **Sort Options**: Sort by relevance, title, or category
- **Results Pagination**: Configurable results per page (10, 20, 50, 100)
- **Exact Phrase Search**: Use quotes for exact phrase matching
- **Exclude Words**: Use minus prefix to exclude specific terms

### 💻 **User Interface**
- **Modern Design**: Clean, responsive interface matching DHS branding
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Mobile Friendly**: Fully responsive design for all screen sizes
- **Search Modes**: Local search and external LiveAgent search
- **Visual Feedback**: Search highlighting, loading states, animations

## Architecture

### Component Structure
```
public/
├── js/
│   ├── search-engine.js      # Core search functionality
│   ├── search-ui.js          # UI components and interactions
│   └── language-manager.js   # Language switching and persistence
├── data/
│   └── search-index.json     # Search index with all content
├── search.html               # Advanced search page (English)
├── es/
│   ├── search.html           # Advanced search page (Spanish)
│   └── index.html            # Spanish homepage with search
└── index.html                # English homepage with search integration
```

### Search Index Structure
```json
{
  "documents": [
    {
      "id": "unique-id",
      "url": "/path/to/page.html",
      "title": "English Title",
      "titleEs": "Spanish Title", 
      "content": "Searchable content in English",
      "contentEs": "Searchable content in Spanish",
      "category": "category-id",
      "keywords": ["english", "keywords"],
      "keywordsEs": ["spanish", "keywords"],
      "language": "en|es|both"
    }
  ],
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "nameEs": "Nombre de Categoría",
      "description": "Category description"
    }
  ]
}
```

## Usage

### Basic Integration
```html
<!-- Include search components -->
<script src="/js/language-manager.js"></script>
<script src="/js/search-engine.js"></script>
<script src="/js/search-ui.js"></script>

<!-- Create search box -->
<div id="searchContainer"></div>
<div id="searchResults"></div>

<script>
// Initialize search
document.addEventListener('DOMContentLoaded', () => {
  const searchContainer = document.getElementById('searchContainer');
  const resultsContainer = document.getElementById('searchResults');
  
  // Create search box
  window.dhsSearchUI.createSearchBox(searchContainer, {
    showSuggestions: true,
    onSearch: (query, results) => {
      window.dhsSearchUI.displayResults(query, results, resultsContainer);
    }
  });
  
  // Create results container with filters
  window.dhsSearchUI.createResultsContainer(resultsContainer, {
    showFilters: true,
    showResultsCount: true
  });
});
</script>
```

### Advanced Search Options
```javascript
// Search with filters
const results = window.dhsSearch.search('jobs crew', {
  category: 'operations',
  language: 'en',
  minScore: 0.3,
  maxResults: 50
});

// Get suggestions
const suggestions = window.dhsSearch.getSuggestions('job', 5);

// Get "Did you mean?" suggestions
const corrections = window.dhsSearch.getDidYouMeanSuggestions('jobb');
```

### Language Management
```javascript
// Set language
window.dhsLanguage.setLanguage('es');

// Get current language
const lang = window.dhsLanguage.getLanguage();

// Listen for language changes
window.dhsLanguage.onLanguageChange((newLang, oldLang) => {
  console.log(`Language changed from ${oldLang} to ${newLang}`);
});
```

## Search Features

### Query Syntax
- **Basic Search**: `jobs management`
- **Exact Phrase**: `"crew management"`
- **Exclude Words**: `jobs -schedule`
- **Combined**: `jobs "crew management" -reports`

### Keyboard Shortcuts
- **Ctrl/Cmd + K**: Focus search box from anywhere
- **Escape**: Close suggestions dropdown
- **Arrow Keys**: Navigate suggestions
- **Enter**: Select suggestion or perform search

### Search Tips
1. Use multiple keywords to narrow results
2. Try different word forms (manage, management, managing)
3. Use category filters to focus your search
4. Check spelling or try synonyms if no results found
5. Use quotes for exact phrase matching

## Performance

### Optimization Features
- **Client-side Search**: No server requests for search operations
- **Compressed Index**: Optimized JSON structure for fast loading
- **Debounced Input**: Prevents excessive search operations
- **Caching**: Search results and suggestions cached in memory
- **Lazy Loading**: Components loaded on demand

### Performance Metrics
- **Search Speed**: < 100ms for typical queries
- **Index Size**: ~18KB compressed
- **First Load**: < 1 second on good connections
- **Memory Usage**: < 5MB for search index and cache

## Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: 14+
- **Chrome Mobile**: 90+

### Fallbacks
- **No JavaScript**: External search form still works
- **Old Browsers**: Basic search functionality maintained
- **Slow Connections**: Progressive enhancement with loading states

## Accessibility

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: Meets AA contrast requirements
- **Focus Management**: Clear focus indicators
- **Alternative Text**: All icons have text alternatives

### Accessibility Features
- **Skip Links**: Quick navigation to search results
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects prefers-reduced-motion
- **Screen Reader Announcements**: Live regions for search results

## Customization

### Styling
The search components use CSS classes prefixed with `dhs-` for easy customization:

```css
.dhs-search-box {
  /* Customize search input */
}

.dhs-result-item {
  /* Customize result items */
}

.search-highlight {
  /* Customize search term highlighting */
}
```

### Configuration
```javascript
// Customize search engine
window.dhsSearch.maxHistoryItems = 20;
window.dhsSearch.debounceDelay = 500;

// Customize UI
const searchBox = window.dhsSearchUI.createSearchBox(container, {
  placeholder: 'Custom placeholder...',
  showSuggestions: false,
  showFilters: true,
  debounceDelay: 200
});
```

## Maintenance

### Updating Search Index
1. Modify `/public/data/search-index.json`
2. Add new documents to the `documents` array
3. Update categories if needed
4. Increment version number in `meta` section

### Adding New Languages
1. Add language to `supportedLanguages` in language-manager.js
2. Add translations to search-ui.js `translations` object
3. Update search index with new language content
4. Create language-specific pages if needed

### Performance Monitoring
- Monitor search index size
- Track search performance metrics
- Check browser console for errors
- Test on various devices and connections

## Testing

### Test Files
- `test-search.html`: Comprehensive test suite for all components
- Manual testing procedures for search functionality
- Cross-browser testing checklist

### Testing Checklist
- [ ] Basic search functionality
- [ ] Fuzzy search with typos
- [ ] Language switching
- [ ] Category filters
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## Support

### Troubleshooting
1. **Search not working**: Check browser console for JavaScript errors
2. **No results found**: Verify search index is loaded correctly
3. **Language switching issues**: Check localStorage permissions
4. **Mobile issues**: Test responsive design on actual devices

### Common Issues
- **CORS errors**: Ensure files are served from web server, not file://
- **Search index not loading**: Check file paths and permissions
- **Performance issues**: Consider reducing search index size
- **Browser compatibility**: Test fallback functionality

For technical support, contact: support@directhomeservice.com