# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Permit Intelligence Platform, please **report it responsibly** rather than posting it publicly.

### How to Report

1. **GitHub**: Open a private security advisory on the repository or message [@Luminousz0](https://github.com/Luminousz0)
2. **Subject line**: `[SECURITY] Vulnerability in Permit Intelligence`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### What to Expect

- **Response time**: We aim to acknowledge reports within 48 hours
- **Investigation**: We will investigate and determine severity
- **Timeline**: Critical issues will be patched within 72 hours
- **Credit**: You will be credited (unless you prefer anonymity)

---

## Security Best Practices

### For Users
- **Keep browser updated**: Security patches are released regularly
- **Use HTTPS**: Always access the platform via HTTPS
- **Strong passwords**: Use unique, complex passwords for your account
- **Two-factor authentication**: Enable if available

### For Developers
- **Never commit secrets**: No API keys, passwords, or tokens in code
- **Use environment variables**: Store sensitive data in `.env` files (not committed)
- **Validate input**: Always validate user input before processing
- **Sanitize output**: Prevent XSS by escaping HTML in dynamic content
- **Dependency updates**: Keep npm packages up to date

---

## Security Checklist

- [x] HTTPS enforced on production
- [x] Input validation on all forms
- [x] Output sanitization for dynamic content
- [x] CORS configured appropriately
- [x] API authentication (if applicable)
- [x] Rate limiting on API endpoints
- [x] Security headers implemented (CSP, X-Frame-Options, etc.)

---

## Known Limitations

- This is a **frontend-heavy application** with minimal backend
- **PDOK API** data is public (official government source)
- **No user authentication** on free tier
- **Client-side validation** only (backend validation needed for production)

---

## Compliance

- **GDPR**: Personal data handling practices documented
- **Dutch law**: Complies with applicable Dutch regulations
- **Accessibility**: WCAG 2.1 AA compliance target

---

## Updates

Security updates will be announced:
- GitHub releases
- Email notifications (for newsletter subscribers)
- Twitter/social media

Subscribe to releases on GitHub: Click "Watch" → "Releases only"

---

## Questions?

Message [@Luminousz0](https://github.com/Luminousz0) on GitHub.

Thank you for helping keep Permit Intelligence secure! 🔒
