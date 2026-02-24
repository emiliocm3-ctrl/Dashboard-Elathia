# 📁 Project Structure

Complete overview of the Agricultural Dashboard project organization.

## 🌳 Directory Tree

```
agricultural-dashboard/
│
├── 📄 Root Configuration Files
│   ├── .env                          # Environment variables (DO NOT COMMIT)
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Project metadata & dependencies
│   ├── README.md                     # Main project documentation
│   ├── LICENSE                       # MIT License
│   ├── CONTRIBUTING.md               # Contribution guidelines
│   ├── CHANGELOG.md                  # Version history
│   └── GITHUB_SETUP.md               # GitHub upload guide
│
├── 📂 src/                           # Source code
│   │
│   ├── 📦 components/                # Reusable React components
│   │   ├── Logo.jsx                  # Application logo
│   │   ├── Sidebar.jsx               # Navigation sidebar
│   │   ├── MetricCard.jsx            # Sector metric display
│   │   ├── SummaryBlock.jsx          # Metric summary blocks
│   │   ├── ChartCard.jsx             # Chart visualizations
│   │   ├── Dashboard.jsx             # Main dashboard layout
│   │   └── index.js                  # Component exports
│   │
│   ├── ⚙️  config/                   # Configuration files
│   │   ├── assets.js                 # Centralized asset URLs
│   │   └── constants.js              # Business constants
│   │
│   ├── 🛠️  utils/                    # Utility functions (empty - ready for use)
│   │
│   ├── 🎨 Stylesheets
│   │   ├── DashboardGeneral.css
│   │   ├── DashboardGeneralMobile.css
│   │   ├── LoginScreen.css
│   │   ├── LoginScreenMobile.css
│   │   ├── MenuMovil.css
│   │   └── SensorDropdown.css
│   │
│   └── 📱 Main Components
│       ├── DashboardGeneral.jsx      # Main dashboard (refactored)
│       ├── LoginScreen.jsx           # Desktop login
│       ├── LoginScreenMobile.jsx     # Mobile login
│       ├── MenuMovil.jsx             # Mobile menu
│       ├── SensorDropdown.jsx        # Dropdown selector
│       └── TestRefactoredDashboard.jsx  # Test component
│
├── 📂 public/                        # Static assets
│   └── (place static files here)
│
├── 📂 docs/                          # Documentation
│   ├── QUICK_START.md                # Quick start guide
│   ├── REFACTORING_SUMMARY.md        # Detailed refactoring doc
│   ├── MIGRATION_GUIDE.md            # Migration instructions
│   ├── BEFORE_AFTER_COMPARISON.md    # Code examples
│   ├── COMPLETION_REPORT.md          # Completion report
│   ├── TODO_NEXT.md                  # Development roadmap
│   ├── FILES_SUMMARY.txt             # File listing
│   └── validate-refactoring.js       # Validation script
│
├── 📂 .github/                       # GitHub configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Bug report template
│   │   └── feature_request.md        # Feature request template
│   ├── workflows/                    # GitHub Actions (ready for CI/CD)
│   └── pull_request_template.md      # PR template
│
└── 📂 old-backup-20260119/           # Backup of old files (can delete)
    └── (12 old dashboard files)
```

## 📊 File Count & Size

### Source Code
- **Components:** 7 files (~16 KB)
- **Config:** 2 files (~5 KB)
- **Main Components:** 6 files (~60 KB total)
- **Stylesheets:** 6 files (~45 KB total)

### Documentation
- **Markdown files:** 10 files
- **Total documentation:** ~50 KB

### Configuration
- **Git/GitHub:** 5 files
- **Package/Env:** 3 files

## 🎯 Key Files Explained

### Root Level

| File | Purpose | Important? |
|------|---------|-----------|
| `.env` | Environment variables (API URLs, keys) | ⚠️ DO NOT COMMIT |
| `.env.example` | Template for `.env` | ✅ Commit |
| `.gitignore` | Files to exclude from Git | ✅ Essential |
| `package.json` | Dependencies & scripts | ✅ Essential |
| `README.md` | Project overview | ✅ Essential |
| `LICENSE` | MIT license | ✅ Recommended |
| `CONTRIBUTING.md` | How to contribute | ✅ Open source |
| `CHANGELOG.md` | Version history | ✅ Recommended |

### Source (`src/`)

#### Components (`src/components/`)

| Component | Lines | Purpose | Reusable? |
|-----------|-------|---------|-----------|
| `Logo.jsx` | 35 | Application branding | ✅ Yes |
| `Sidebar.jsx` | 58 | Navigation & logout | ✅ Yes |
| `MetricCard.jsx` | 52 | Sector metrics display | ✅ Yes |
| `SummaryBlock.jsx` | 44 | Metric summaries | ✅ Yes |
| `ChartCard.jsx` | 86 | Chart visualizations | ✅ Yes |
| `Dashboard.jsx` | 176 | Main layout | ✅ Yes |

#### Configuration (`src/config/`)

| File | Purpose | Contains |
|------|---------|----------|
| `assets.js` | Asset URLs | Icons, logos, charts (100 URLs) |
| `constants.js` | Business data | Sectors, metrics, ranges |

#### Main Components (`src/`)

| Component | Purpose | Status |
|-----------|---------|--------|
| `DashboardGeneral.jsx` | Main dashboard | ✅ Refactored |
| `LoginScreen.jsx` | Desktop login | 📝 Original |
| `LoginScreenMobile.jsx` | Mobile login | 📝 Original |
| `MenuMovil.jsx` | Mobile menu | 📝 Original |
| `SensorDropdown.jsx` | Dropdown selector | 📝 Original |

### Documentation (`docs/`)

| Document | For | When to Read |
|----------|-----|--------------|
| `QUICK_START.md` | New users | First time setup |
| `REFACTORING_SUMMARY.md` | Developers | Understanding changes |
| `MIGRATION_GUIDE.md` | Upgrading | Moving from old version |
| `BEFORE_AFTER_COMPARISON.md` | Learning | Code examples |
| `TODO_NEXT.md` | Developers | Next development steps |
| `COMPLETION_REPORT.md` | Project managers | Project status |

### GitHub (`.github/`)

| File | Purpose | Used By |
|------|---------|---------|
| `ISSUE_TEMPLATE/bug_report.md` | Bug reporting | Contributors |
| `ISSUE_TEMPLATE/feature_request.md` | Feature requests | Contributors |
| `pull_request_template.md` | PR submissions | Contributors |
| `workflows/` | CI/CD automation | GitHub Actions |

## 🔍 Import Paths

### Component Imports
```javascript
// From any component
import { ASSETS } from '../config/assets';
import { SECTORS, METRICS } from '../config/constants';
import Logo from './Logo';

// From main components (src/)
import { Logo, Sidebar, MetricCard } from './components';
import { ASSETS } from './config/assets';
```

### Style Imports
```javascript
// Component stylesheets
import './DashboardGeneral.css';
```

## 📦 What to Include in Git

### ✅ Include (Commit to GitHub)

- All `.jsx` and `.js` files (except `node_modules/`)
- All `.css` files
- All `.md` documentation
- Configuration files (`.gitignore`, `package.json`)
- `.env.example` (template)
- `LICENSE`
- `.github/` templates

### ❌ Exclude (In .gitignore)

- `node_modules/` - Dependencies (npm install)
- `.env` - Environment secrets
- `build/` - Build output
- `.DS_Store` - macOS files
- `old-backup-*/` - Backups
- `*.log` - Log files

## 🚀 Getting Started

### For Developers
1. Read `QUICK_START.md`
2. Copy `.env.example` to `.env`
3. Run `npm install`
4. Run `npm start`

### For Contributors
1. Read `CONTRIBUTING.md`
2. Check `TODO_NEXT.md` for tasks
3. Read `REFACTORING_SUMMARY.md` for context
4. Follow coding standards

### For Users
1. Read `README.md`
2. Follow installation steps
3. Configure `.env`
4. Start using the dashboard

## 🔄 Maintenance

### When to Update

| File | Update When |
|------|------------|
| `package.json` | Add/remove dependencies |
| `README.md` | Features change |
| `CHANGELOG.md` | Every release |
| `.env.example` | Add new env variables |
| `CONTRIBUTING.md` | Process changes |

### Regular Tasks

- **Daily:** Commit code changes
- **Weekly:** Update `CHANGELOG.md`
- **Monthly:** Review dependencies
- **Per Release:** Update version, create release notes

## 📈 Growth Path

### Current Structure
```
src/
├── components/      (6 components)
├── config/          (2 files)
└── utils/           (empty - ready)
```

### Future Additions
```
src/
├── components/      (expand to 15+ components)
├── config/          (add themes, routes)
├── utils/           (helpers, formatters)
├── hooks/           (custom hooks)
├── services/        (API calls)
├── contexts/        (state management)
└── tests/           (unit tests)
```

## 🎯 Best Practices

### File Naming
- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Config: `camelCase.js`
- Styles: `PascalCase.css`

### Organization
- One component per file
- Group related files
- Keep components small (<200 lines)
- Co-locate tests with components

### Import Order
1. React imports
2. External libraries
3. Internal components
4. Config/constants
5. Styles

```javascript
// Good import order
import { useState } from 'react';
import PropTypes from 'prop-types';
import Logo from './components/Logo';
import { ASSETS } from './config/assets';
import './Dashboard.css';
```

---

## 🆘 Need Help?

- **Structure questions:** Check this file
- **Setup help:** Read `QUICK_START.md`
- **Code examples:** See `BEFORE_AFTER_COMPARISON.md`
- **Contribution:** Read `CONTRIBUTING.md`

---

**Last Updated:** January 19, 2026
**Version:** 1.0.0
