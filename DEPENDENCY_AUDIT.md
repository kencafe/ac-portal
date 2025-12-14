# Dependency Audit Report
**Date**: 2025-12-14
**Project**: AC Portal
**Node Modules Size**: 562M

## Executive Summary

✅ **Security**: No vulnerabilities detected
⚠️ **Outdated Packages**: 4 packages need updates
🚨 **Bloat Detected**: 5 unused dependencies (~30M+ wasted space)

---

## 1. Security Vulnerabilities

```
✅ NO VULNERABILITIES FOUND
```

All 378 packages scanned - no security issues detected.

---

## 2. Outdated Packages

### High Priority Updates

| Package | Current | Latest | Status | Priority |
|---------|---------|--------|--------|----------|
| **lucide-react** | 0.460.0 | 0.561.0 | 101 versions behind | ⚠️ High (if used) |
| **@types/markdown-it** | 13.0.9 | 14.1.2 | Major version update | ⚠️ Medium |
| **react** | 19.2.1 | 19.2.3 | Patch update | ✅ Low |
| **react-dom** | 19.2.1 | 19.2.3 | Patch update | ✅ Low |

### Update Commands

```bash
# Safe updates (patch versions)
npm update react react-dom

# Requires testing (major/minor updates)
npm install lucide-react@latest
npm install @types/markdown-it@latest
```

---

## 3. Unused Dependencies (BLOAT)

### Critical Findings

Based on source code analysis, the following dependencies are **NOT USED** in the current codebase:

| Package | Size | Status | Recommendation |
|---------|------|--------|----------------|
| **lucide-react** | 29M | ❌ Unused | Remove immediately |
| **clsx** | <1M | ❌ Unused | Remove |
| **gray-matter** | <1M | ❌ Unused | Remove or keep for planned blog |
| **markdown-it** | <1M | ❌ Unused | Remove or keep for planned blog |
| **@types/markdown-it** | <1M | ❌ Unused | Remove or keep for planned blog |

### Evidence

```bash
# Search results show these are only imported in backup files
src/app/page.tsx.backup:5: from "lucide-react"
# No active usage found in current codebase
```

### Impact

- **Immediate savings**: ~30M+ (removing lucide-react alone)
- **Install time**: Reduced by 5-10 seconds
- **Docker image**: Smaller by ~30M
- **CI/CD**: Faster builds

---

## 4. Dependencies Analysis by Category

### Essential Framework Dependencies (Cannot Remove)
- ✅ `next` (138M) - Core framework
- ✅ `@next/*` (263M) - Next.js internals
- ✅ `react` + `react-dom` (7M) - UI framework
- ✅ `typescript` (23M) - Type safety

### Essential Build Tools (Cannot Remove)
- ✅ `tailwindcss` + `@tailwindcss/postcss` (6.2M) - Styling
- ✅ `@tailwindcss/typography` - Typography plugin
- ✅ `babel-plugin-react-compiler` (3.8M) - React compiler
- ✅ `eslint` + `eslint-config-next` - Linting

### Currently Unused (Can Remove)
- ❌ `lucide-react` (29M) - Icon library
- ❌ `clsx` - Conditional classNames utility
- ❌ `gray-matter` - Frontmatter parser
- ❌ `markdown-it` - Markdown parser
- ❌ `@types/markdown-it` - Type definitions

---

## 5. Recommendations

### Immediate Actions (This Week)

1. **Remove unused dependencies** (if not planning blog soon):
   ```bash
   npm uninstall lucide-react clsx gray-matter markdown-it @types/markdown-it
   ```

2. **Update React patch versions**:
   ```bash
   npm update react react-dom
   ```

3. **Clean up backup file**:
   ```bash
   rm src/app/page.tsx.backup
   ```

### Short-term Actions (This Month)

1. **Decision on blog dependencies**:
   - If blog with markdown is coming soon: **Keep** gray-matter, markdown-it
   - If blog is 3+ months away: **Remove** now, reinstall later

2. **Icon strategy decision**:
   - If icons needed: Either use lucide-react OR switch to lighter alternative
   - Consider: react-icons (modular), heroicons, or inline SVGs
   - Current: lucide-react is 29M but provides 1000+ icons

3. **Update lucide-react** (if keeping):
   ```bash
   npm install lucide-react@latest
   ```

### Long-term Monitoring

1. **Monthly dependency audits**:
   ```bash
   npm audit
   npm outdated
   ```

2. **Bundle size monitoring**:
   - Add bundle analyzer: `@next/bundle-analyzer`
   - Track production bundle size in CI/CD

3. **Automated updates**:
   - Consider Dependabot or Renovate Bot
   - Auto-update patch versions
   - Manual review for major/minor

---

## 6. Bundle Size Breakdown (Top 20)

```
263M    @next              (Essential - Next.js internals)
138M    next               (Essential - Framework)
29M     lucide-react       (⚠️ UNUSED - Remove!)
23M     typescript         (Essential - Type safety)
9.1M    lightningcss-*     (Essential - Tailwind build)
7.0M    react-dom          (Essential - React framework)
6.2M    @tailwindcss       (Essential - Styling)
4.4M    @unrs              (Dev dependency)
4.2M    zod                (Transitive dependency)
3.8M    babel-plugin-*     (Essential - React compiler)
3.5M    es-abstract        (Transitive dependency)
3.1M    eslint             (Essential - Linting)
2.9M    axe-core           (Dev - Accessibility testing)
2.9M    @types             (Essential - TypeScript types)
2.4M    caniuse-lite       (Essential - Browser compat)
```

---

## 7. Action Plan

### Option A: Aggressive Cleanup (Recommended if blog is 3+ months away)

```bash
# Remove all unused dependencies
npm uninstall lucide-react clsx gray-matter markdown-it @types/markdown-it

# Update React
npm update react react-dom

# Remove backup file
rm src/app/page.tsx.backup

# Rebuild lock file
npm install

# Verify build still works
npm run build
```

**Savings**: ~30M in node_modules, faster installs, smaller Docker images

### Option B: Conservative Approach (If blog coming soon)

```bash
# Keep markdown dependencies for upcoming blog
npm uninstall lucide-react clsx

# Update React
npm update react react-dom

# Remove backup file
rm src/app/page.tsx.backup

# Update lucide-react if planning to use soon
npm install lucide-react@latest
```

**Savings**: ~29M if removing lucide-react, keep markdown tools for blog

### Option C: Minimal Changes (If uncertain)

```bash
# Just update React patches
npm update react react-dom

# Remove backup file
rm src/app/page.tsx.backup
```

**Savings**: Minimal, but safest approach

---

## 8. Future Considerations

### When to Add Dependencies Back

- **lucide-react**: When implementing icons in UI (currently only in backup file)
- **clsx**: When needing conditional className logic (currently not used)
- **gray-matter + markdown-it**: When implementing blog with .md files

### Alternatives to Consider

If planning to add these features:

1. **Icons**:
   - lucide-react (29M, 1000+ icons) - Current choice
   - react-icons (modular, smaller if using few icons)
   - heroicons (official Tailwind icons, smaller)
   - Inline SVG (zero dependency, max control)

2. **Markdown**:
   - markdown-it (current choice) - Fast, extensible
   - remark/rehype - More features, React ecosystem
   - Next.js MDX - Built-in if using .mdx files

3. **Class utilities**:
   - clsx - Popular, simple
   - classnames - Similar alternative
   - tailwind-merge - Better for Tailwind conflicts
   - None - Use template literals

---

## Conclusion

**Overall Grade**: B+

- ✅ Security: Excellent (A+)
- ⚠️ Updates: Good but needs attention (B)
- 🚨 Bloat: Significant unused dependencies (C)

**Primary Recommendation**: Remove unused dependencies, especially `lucide-react` (29M). This will reduce node_modules size by ~5%, speed up installs, and reduce Docker image size.

**Next Steps**: Review options A/B/C above and execute based on project timeline for blog features.
