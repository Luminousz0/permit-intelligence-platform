# Contributing to Permit Intelligence

Thank you for your interest in contributing! This document outlines guidelines and processes for contributions.

---

## Reporting Issues

Found a bug or have a feature request?

1. **Search existing issues** first to avoid duplicates
2. **Be specific**: Include:
   - What you were doing when the issue occurred
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Browser & OS version
   - Steps to reproduce

---

## Pull Request Process

### Before You Start
1. Fork the repository
2. Create a branch: `git checkout -b feature/descriptive-name`
3. Make your changes
4. Test thoroughly (all pages, light & dark modes)

### Submitting a PR
1. Push to your fork
2. Open a Pull Request with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues (#123)
3. Ensure all checks pass
4. Wait for review

### Code Style

#### JavaScript/JSX
- Use meaningful variable names
- Keep functions focused and small
- Use const by default, let when needed
- Comment complex logic
- Follow existing patterns in the codebase

Example:
```jsx
// Good: descriptive name, clear purpose
function calculateMunicipalityRequirements(projectType, municipality) {
  // Implementation
}

// Avoid: vague names
function calc(a, b) {
  // Implementation
}
```

#### CSS
- Use CSS custom properties (variables) when appropriate
- Use OKLCH color space (not hex/RGB)
- Follow existing selector patterns
- Group related styles together
- Add comments for non-obvious rules

Example:
```css
/* Good: using variables and clear selectors */
.proof {
  background: var(--bg-deep);
  color: oklch(0.85 0.005 250);
  padding: clamp(64px, 9vw, 120px) 0;
}

/* Avoid: hardcoded colors, unclear intent */
.something {
  background: #1a1a1a;
  color: #fff;
}
```

---

## Testing Checklist

Before submitting, test your changes:

- [ ] **Light mode**: All pages render correctly
- [ ] **Dark mode**: All text is readable, no contrast issues
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Accessibility**: Can navigate with keyboard, screen reader friendly
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge
- [ ] **Performance**: No console errors, reasonable load times
- [ ] **Links**: All internal and external links work
- [ ] **Forms**: Input fields, buttons, validation work

---

## Commit Messages

Write clear, concise commit messages:

```
Add dark mode support for proof section

- Changed text colors from semantic var(--bg) to hardcoded oklch values
- Added dark mode CSS overrides for .proof .eyebrow and .proof .section-title
- Fixes unreadable text in validation section in dark mode

Fixes #42
```

**Format:**
```
[Type] Short description (max 50 chars)

Detailed explanation of what and why (if needed)
- Use bullet points for clarity
- Reference issues with "Fixes #123"
```

**Types:**
- `Add` — New feature
- `Fix` — Bug fix
- `Refactor` — Code reorganization without behavior change
- `Docs` — Documentation
- `Style` — CSS/visual changes
- `Perf` — Performance improvements

---

## Areas for Contribution

### High Priority
- [ ] Improve mobile experience
- [ ] Add more municipalities to database
- [ ] Expand English translations
- [ ] Performance optimizations

### Medium Priority
- [ ] Additional color themes
- [ ] Offline mode
- [ ] Enhanced accessibility
- [ ] PDF export templates

### Good for Beginners
- [ ] Documentation improvements
- [ ] Bug fixes
- [ ] CSS refinements
- [ ] Copy editing

---

## Development Tips

### Running Locally
```bash
npm install
npm start
```

### Testing Dark Mode
- Use browser DevTools to toggle `data-theme="dark"` on `<body>`
- Or use the theme toggle button in the top navigation

### Accessing the Tweaks Panel
- Visible only on the homepage
- Use to test different accent colors, fonts, backgrounds
- Settings persist in localStorage

### Debugging
- Open browser console (F12) for error messages
- Check Network tab for API calls to PDOK, Overheid.nl
- Use React DevTools for component inspection

---

## Questions?

- Open an issue with the `question` label
- Check existing issues for similar questions
- Message [@Luminousz0](https://github.com/Luminousz0) on GitHub

---

## Code of Conduct

By contributing, you agree to:
- Be respectful and constructive
- Provide quality, thoughtful contributions
- Follow this project's style guidelines
- Test your changes thoroughly

---

Thank you for helping improve Permit Intelligence! 🚀
