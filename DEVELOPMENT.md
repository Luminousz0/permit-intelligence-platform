# Development Guide

Complete setup and development instructions for Permit Intelligence Platform.

---

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Running Locally](#running-locally)
3. [Architecture Overview](#architecture-overview)
4. [Key Technologies](#key-technologies)
5. [Development Workflow](#development-workflow)
6. [Debugging](#debugging)
7. [Performance Tips](#performance-tips)

---

## Environment Setup

### System Requirements
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Browser**: Modern (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Luminousz0/permit-intelligence-platform.git
   cd permit-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   node --version  # Should be v16+
   npm --version   # Should be 8+
   ```

---

## Running Locally

### Development Server

```bash
npm start
```

This will:
- Start a local development server (typically `http://localhost:3000`)
- Watch for file changes and hot-reload
- Show build errors in console

### Building for Production

```bash
npm run build
```

Generates optimized files in the `build/` directory ready for deployment.

### Development Server Options

If you need to specify a port:
```bash
PORT=3001 npm start
```

---

## Architecture Overview

### Project Layout

```
permit-intelligence-platform/
├── public/
│   ├── index.html              # Entry point
│   ├── *.html                  # All page files
│   ├── *.jsx                   # React components & apps
│   ├── styles.css              # Global styles
│   ├── styles-pages.css        # Page-specific styles
│   ├── theme-manager.js        # Theme system (light/dark mode)
│   ├── config.js               # API endpoints, tracking IDs
│   ├── analytics.js            # Google Analytics
│   └── fonts/                  # Self-hosted fonts
├── README.md
├── DEVELOPMENT.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── .gitignore
```

### File Structure by Page

Each HTML page follows this pattern:

```html
<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page Title — Permit Intelligence</title>
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/..." rel="stylesheet" />
  
  <!-- Styles -->
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="styles-pages.css" />
  
  <!-- Theme system -->
  <script src="theme-manager.js"></script>
</head>
<body data-aesthetic="hybrid">
  <div id="root"></div>
  
  <!-- React & Babel -->
  <script src="https://unpkg.com/react@18.3.1/..."></script>
  <script src="https://unpkg.com/react-dom@18.3.1/..."></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/..."></script>
  
  <!-- Copy (translations) & Shared components -->
  <script type="text/babel" src="copy.jsx"></script>
  <script type="text/babel" src="shared.jsx"></script>
  
  <!-- Page-specific app -->
  <script type="text/babel">
    // App code here
  </script>
</body>
</html>
```

---

## Key Technologies

### Frontend Stack

#### React 18
- Browser compilation (Babel) — no build step needed
- State management via `useState`, `useEffect`
- Component-based architecture

#### Styling
- **OKLCH color space** for perceptual color consistency
- **CSS custom properties** for theming
- **CSS Grid & Flexbox** for layouts
- **No preprocessor** (pure CSS)

#### Libraries
- **Leaflet.js** — Interactive maps
- **CartoDB** — Basemap tiles
- **Google Analytics** — Usage tracking

### API Integrations

#### PDOK Locatieserver
Used for address search and geocoding:
```javascript
// Example: Get municipality from address
const response = await fetch(
  `https://api.pdok.nl/bzk/locatieserver/search/free?q=${address}`
);
const data = await response.json();
```

#### Overheid.nl
Municipal data source for:
- Official municipality names
- Government entity information

#### Analytics
- Google Analytics (GA4)
- Event tracking for user behavior
- Conversion monitoring

---

## Development Workflow

### Making Changes

1. **Identify the file to modify**
   - `.jsx` files: React components & logic
   - `.css` files: Styling
   - `.html` files: Page structure

2. **Edit the file**
   ```bash
   # Example: Edit the homepage
   vim public/app.jsx
   ```

3. **Test your changes**
   - Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
   - Check console for errors
   - Test light & dark modes
   - Test on mobile

4. **Commit your changes**
   ```bash
   git add public/app.jsx
   git commit -m "Fix: improve hero section layout"
   git push origin feature/your-feature
   ```

### Viewing Changes

- **Live reload**: Browser automatically refreshes when files change
- **Hard refresh**: Use Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux) to clear cache
- **DevTools**: Open with F12 or Cmd+Option+I (Mac)

### Testing Light & Dark Mode

#### Using DevTools
1. Open browser DevTools (F12)
2. Go to Console
3. Run: `document.body.dataset.theme = 'dark'` (or 'light')

#### Using the Theme Toggle
- Click the "Light/Dark" button in top navigation
- Preference is saved to localStorage

### Testing Responsive Design

1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M)
3. Test at breakpoints: 375px, 768px, 1024px, 1440px

---

## Debugging

### Console Logging

```javascript
// In JSX files:
console.log('Debug info:', variable);
console.warn('Warning:', issue);
console.error('Error:', problem);
```

### React DevTools

Install the [React DevTools extension](https://react.dev/learn/react-developer-tools):
- Inspect component hierarchy
- View props and state
- Profile performance
- Check re-renders

### API Debugging

Check network requests:
1. Open DevTools → Network tab
2. Perform an action (e.g., search)
3. Look for requests to pdok, overheid, etc.
4. Inspect response in the Response tab

### Dark Mode Debugging

The theme system uses `body[data-theme]`:
```javascript
// Check current theme
console.log(document.body.dataset.theme);

// Check CSS variable values
const style = getComputedStyle(document.body);
console.log(style.getPropertyValue('--bg'));  // Current background color
console.log(style.getPropertyValue('--ink')); // Current text color
```

### Performance Profiling

1. Open DevTools → Performance tab
2. Click record
3. Perform actions
4. Stop recording
5. Analyze the flame chart

---

## Performance Tips

### Optimizing Renders

#### Use keys in lists
```jsx
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

#### Memoize expensive components
```jsx
const MemoizedComponent = React.memo(MyComponent);
```

#### Lazy load if needed
```javascript
const LazyComponent = React.lazy(() => import('./Heavy'));
```

### CSS Optimization

#### Use CSS variables
Instead of hardcoding colors:
```css
/* Good: uses variables */
.button { background: var(--accent); }

/* Avoid: hardcoded */
.button { background: oklch(0.68 0.16 50); }
```

#### Group related styles
```css
/* Good: related styles grouped */
.proof {
  padding: 1rem;
  background: var(--bg-deep);
  color: var(--ink);
}

/* Avoid: scattered properties */
.proof { padding: 1rem; }
.proof { background: var(--bg-deep); }
.proof { color: var(--ink); }
```

### API Optimization

#### Cache API responses
```javascript
const cache = {};
async function getMunicipalities() {
  if (cache.municipalities) return cache.municipalities;
  const data = await fetch('/api/municipalities');
  cache.municipalities = await data.json();
  return cache.municipalities;
}
```

#### Batch API calls
```javascript
// Avoid: Multiple sequential calls
const m1 = await fetch('/api/m/Amsterdam');
const m2 = await fetch('/api/m/Rotterdam');

// Better: Parallel calls
const [m1, m2] = await Promise.all([
  fetch('/api/m/Amsterdam'),
  fetch('/api/m/Rotterdam')
]);
```

---

## Common Issues & Solutions

### Issue: Changes not showing up
**Solution**: Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: Dark mode colors look wrong
**Solution**: Check that hardcoded light colors are used for dark sections:
```css
/* Dark section needs light text */
.dark-section { color: oklch(0.85 0.005 250); } /* Light */
```

### Issue: API calls failing
**Solution**: Check:
1. CORS headers in config.js
2. API endpoint is correct
3. Browser console for specific error message
4. Network tab to see response

### Issue: Slow performance
**Solution**: 
1. Check Network tab for slow API calls
2. Use React DevTools Profiler to find slow components
3. Optimize images and assets
4. Enable gzip compression on server

---

## Best Practices

### Code Style
- Use meaningful variable names
- Keep functions focused and small (<20 lines)
- Add comments for complex logic
- Follow existing patterns in the codebase

### Git Workflow
- Create feature branches: `git checkout -b feature/name`
- Write clear commit messages
- Keep commits focused on one change
- Push regularly: `git push origin feature/name`

### Testing
- Test all pages (light & dark mode)
- Test on mobile devices (physical or emulator)
- Test cross-browser (Chrome, Firefox, Safari, Edge)
- Use browser DevTools to verify no errors

---

## Resources

- [React Documentation](https://react.dev)
- [MDN Web Docs](https://developer.mozilla.org)
- [OKLCH Color Space](https://oklch.evilmartians.io)
- [Leaflet.js Docs](https://leafletjs.com)
- [PDOK API](https://www.pdok.nl)

---

## Getting Help

- Check existing GitHub issues
- Ask in PRs or discussions
- Contact: ashwinramcharan21@gmail.com

---

Happy coding! 🚀
