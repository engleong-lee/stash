# Stash - Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** December 2024  
> **Status:** Draft  
> **Author:** Eng Leong  

---

## 1. Overview

### 1.1 Product Summary

**Stash** is a modern browser extension for saving and restoring tab sessions. It provides a clean, minimal interface with one-click actions and AI-powered session naming, solving the "too many tabs" problem that affects millions of users daily.

### 1.2 Problem Statement

Browser users frequently have 15-30+ tabs open across multiple projects or research topics. When they need to switch contexts, close the browser, or clean up, they face these problems:

1. **Losing context:** Closing tabs means losing the carefully curated set of pages
2. **Clunky existing tools:** Solutions like OneTab and Session Buddy have dated, cluttered UIs
3. **Too many clicks:** Current tools require multiple clicks to save and restore
4. **Hard to find sessions:** No good search or organization in existing tools
5. **Manual naming:** Users must manually name sessions, which is tedious

### 1.3 Solution

Stash provides:
- **One-click save:** Stash all tabs with a single click
- **AI-powered naming:** Automatically generates meaningful session names
- **Clean, modern UI:** Minimal design that doesn't feel overwhelming
- **Fast search:** Find any session by name or tab content
- **One-click restore:** Open all tabs from a session instantly

### 1.4 Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| Developer | Multiple projects, many tabs | Quick context switching |
| Researcher | Deep research sessions | Save and resume research |
| Knowledge Worker | Various work streams | Organize browser workspace |
| Student | Multiple courses/topics | Separate study sessions |

### 1.5 Success Criteria

| Metric | Target |
|--------|--------|
| Clicks to save | ≤ 2 |
| Clicks to restore | ≤ 2 |
| Popup load time | < 200ms |
| Chrome Web Store rating | ≥ 4.5 stars |
| Weekly active users (6 months) | 1,000+ |

---

## 2. Requirements

### 2.1 Functional Requirements

#### 2.1.1 Save Session (P0 - Must Have)

| ID | Requirement | Details |
|----|-------------|---------|
| SAV-01 | Stash all tabs | Save all tabs in current window |
| SAV-02 | AI-generated name | Generate name from tab titles using Claude API |
| SAV-03 | Manual name edit | Allow user to edit suggested name |
| SAV-04 | Fallback name | Use "Session - {date}" if AI unavailable |
| SAV-05 | Tab metadata | Store URL, title, and favicon for each tab |
| SAV-06 | Close tabs option | Optional: close tabs after saving |
| SAV-07 | Success feedback | Show toast notification on save |

#### 2.1.2 Restore Session (P0 - Must Have)

| ID | Requirement | Details |
|----|-------------|---------|
| RST-01 | One-click restore | Click session to restore all tabs |
| RST-02 | New window option | Open tabs in new window |
| RST-03 | Current window option | Open tabs in current window |
| RST-04 | Restore feedback | Show toast with tab count |
| RST-05 | Handle dead URLs | Gracefully handle tabs that fail to load |

#### 2.1.3 Session List (P0 - Must Have)

| ID | Requirement | Details |
|----|-------------|---------|
| LST-01 | Display sessions | Show all saved sessions in popup |
| LST-02 | Sort by date | Newest sessions first |
| LST-03 | Show metadata | Display name, tab count, relative date |
| LST-04 | Session preview | Show first 3-4 tabs on hover |
| LST-05 | Empty state | Friendly message when no sessions |

#### 2.1.4 Search (P0 - Must Have)

| ID | Requirement | Details |
|----|-------------|---------|
| SRC-01 | Search box | Always visible at top of popup |
| SRC-02 | Search session names | Filter by session name |
| SRC-03 | Search tab content | Search within tab URLs and titles |
| SRC-04 | Real-time filter | Filter as user types |
| SRC-05 | No results state | Friendly message when no matches |

#### 2.1.5 Manage Sessions (P1 - Should Have)

| ID | Requirement | Details |
|----|-------------|---------|
| MGT-01 | Delete session | Remove session with confirmation |
| MGT-02 | Rename session | Edit session name inline |
| MGT-03 | Undo delete | 5-second undo option after delete |
| MGT-04 | Delete all | Clear all sessions (with strong confirmation) |

#### 2.1.6 Select Tabs (P1 - Should Have)

| ID | Requirement | Details |
|----|-------------|---------|
| SEL-01 | Selection mode | Toggle to select specific tabs |
| SEL-02 | Checkbox per tab | Show checkbox next to each current tab |
| SEL-03 | Select all/none | Buttons to select/deselect all |
| SEL-04 | Stash selected | Save only selected tabs |
| SEL-05 | Show tab info | Display favicon and title for each tab |

#### 2.1.7 Settings (P1 - Should Have)

| ID | Requirement | Details |
|----|-------------|---------|
| SET-01 | Restore behavior | New window vs current window |
| SET-02 | Close after save | Default on/off for closing tabs |
| SET-03 | AI naming toggle | Enable/disable AI suggestions |
| SET-04 | Export sessions | Export all sessions as JSON |
| SET-05 | Import sessions | Import sessions from JSON |

#### 2.1.8 Sync (P2 - Nice to Have)

| ID | Requirement | Details |
|----|-------------|---------|
| SYN-01 | Chrome sync | Use chrome.storage.sync for cross-device |
| SYN-02 | Sync toggle | Allow user to enable/disable sync |
| SYN-03 | Sync status | Show sync indicator |

#### 2.1.9 Keyboard Shortcuts (P1 - Should Have)

| ID | Requirement | Details |
|----|-------------|---------|
| KEY-01 | Open popup | Cmd+Shift+S (configurable) |
| KEY-02 | Quick stash | Cmd+Shift+A to stash all without popup |
| KEY-03 | Navigate list | Arrow keys to move through sessions |
| KEY-04 | Confirm action | Enter to restore selected session |
| KEY-05 | Focus search | `/` or Cmd+F to focus search |

#### 2.1.10 AI Features (P1 - Should Have)

| ID | Requirement | Details |
|----|-------------|---------|
| AI-01 | Generate name | Suggest session name from tab titles |
| AI-02 | Multiple providers | Support Ollama (local) and Claude API |
| AI-03 | Provider selection | User can choose preferred AI provider |
| AI-04 | Ollama detection | Auto-detect if Ollama is running locally |
| AI-05 | Model selection | User can select Ollama model |
| AI-06 | Context-aware | Base name on tab titles and URLs |
| AI-07 | Fast response | Name suggestion < 3 seconds |
| AI-08 | Graceful fallback | Use default name if AI fails |
| AI-09 | Offline support | Ollama works without internet |

**AI Provider Comparison:**

| Provider | Pros | Cons |
|----------|------|------|
| Ollama (local) | Free, private, offline | Requires install, slower |
| Claude API | Fast, high quality | Costs money, requires internet |

---

### 2.2 Non-Functional Requirements

#### 2.2.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-01 | Popup load time | < 200ms |
| PERF-02 | Save operation | < 500ms |
| PERF-03 | Search response | < 50ms |
| PERF-04 | Memory usage | < 50MB |

#### 2.2.2 Compatibility

| ID | Requirement | Details |
|----|-------------|---------|
| CMP-01 | Chrome | v88+ (Manifest V3) |
| CMP-02 | Edge | v88+ (Chromium-based) |
| CMP-03 | Firefox | v109+ (Manifest V3 support) |
| CMP-04 | Brave | Compatible via Chromium |

#### 2.2.3 Storage

| ID | Requirement | Details |
|----|-------------|---------|
| STR-01 | Local storage | Use chrome.storage.local |
| STR-02 | Storage limit | Handle up to 100 sessions |
| STR-03 | Quota management | Warn when approaching limits |
| STR-04 | Data format | JSON with versioned schema |

#### 2.2.4 Privacy

| ID | Requirement | Details |
|----|-------------|---------|
| PRV-01 | No tracking | No analytics or user tracking |
| PRV-02 | Local by default | Data stays on device unless sync enabled |
| PRV-03 | Minimal permissions | Only request necessary permissions |
| PRV-04 | AI privacy | Only send tab titles, not URLs, to AI |

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | React 18 + TypeScript | Component-based, type-safe |
| Styling | Tailwind CSS | Utility-first, consistent design |
| State | Zustand | Lightweight, simple API |
| Build | Vite + CRXJS | Fast builds, HMR for extensions |
| AI | Claude API (Haiku) | Fast, cost-effective naming |

### 3.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Extension                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────┐     ┌─────────────────────────┐   │
│   │     Popup       │     │   Background Service    │   │
│   │   (React App)   │ ←→  │      Worker             │   │
│   │                 │     │                         │   │
│   │ • UI Components │     │ • Tab management        │   │
│   │ • State (Zustand)     │ • Storage operations    │   │
│   │ • User interactions   │ • Keyboard shortcuts    │   │
│   │                 │     │ • AI API calls          │   │
│   └─────────────────┘     └─────────────────────────┘   │
│            │                         │                   │
│            └───────────┬─────────────┘                   │
│                        │                                 │
│                        ▼                                 │
│            ┌─────────────────────────┐                   │
│            │   Chrome Storage API    │                   │
│            │   (local + sync)        │                   │
│            └─────────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Ollama (Local)    │   │    Claude API       │
│  localhost:11434    │   │   (Cloud)           │
│  Free, Private      │   │   Fast, Paid        │
└─────────────────────┘   └─────────────────────┘
```

### 3.3 Project Structure

```
stash/
├── src/
│   ├── popup/                    # Popup UI
│   │   ├── components/
│   │   │   ├── App.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── StashButton.tsx
│   │   │   ├── SessionList.tsx
│   │   │   ├── SessionItem.tsx
│   │   │   ├── TabSelector.tsx
│   │   │   ├── SaveDialog.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useSessions.ts
│   │   │   ├── useCurrentTabs.ts
│   │   │   └── useSearch.ts
│   │   ├── stores/
│   │   │   ├── sessionStore.ts
│   │   │   └── uiStore.ts
│   │   ├── popup.tsx             # Entry point
│   │   └── popup.html
│   │
│   ├── background/               # Service worker
│   │   ├── index.ts
│   │   ├── storage.ts
│   │   ├── tabs.ts
│   │   ├── shortcuts.ts
│   │   └── ai/
│   │       ├── index.ts          # AI provider manager
│   │       ├── ollama.ts         # Ollama provider
│   │       └── claude.ts         # Claude API provider
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── types.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── manifest.json
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 3.4 Data Schema

```typescript
// Session schema
interface Session {
  id: string;                    // UUID
  name: string;                  // Session name
  tabs: Tab[];                   // Array of tabs
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
}

interface Tab {
  url: string;
  title: string;
  favicon: string;               // Favicon URL or data URI
}

// Storage schema
interface StorageData {
  version: number;               // Schema version for migrations
  sessions: Session[];
  settings: Settings;
}

interface Settings {
  restoreInNewWindow: boolean;
  closeTabsAfterSave: boolean;
  aiNamingEnabled: boolean;
  aiProvider: 'ollama' | 'claude';     // AI provider choice
  ollamaModel: string;                  // e.g., 'llama3.2:1b'
  claudeApiKey: string;                 // User's Claude API key
  syncEnabled: boolean;
}
```

### 3.5 Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Stash - Tab Session Manager",
  "version": "1.0.0",
  "description": "Save and restore tab sessions with one click. AI-powered naming.",
  
  "permissions": [
    "tabs",
    "storage"
  ],
  
  "host_permissions": [
    "http://localhost:11434/*"
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+S",
        "mac": "Command+Shift+S"
      },
      "description": "Open Stash"
    },
    "quick-stash": {
      "suggested_key": {
        "default": "Ctrl+Shift+A",
        "mac": "Command+Shift+A"
      },
      "description": "Quick stash all tabs"
    }
  },
  
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

**Note on host_permissions:** The `localhost:11434` permission allows the extension to communicate with a locally running Ollama instance for AI-powered session naming.

---

## 4. Development Phases

### Phase 1: Core MVP (Week 1)

**Goal:** Save and restore sessions with clean UI

| Task | Priority | Estimate |
|------|----------|----------|
| Project setup (Vite + React + TypeScript) | P0 | 2 hours |
| Manifest V3 configuration | P0 | 1 hour |
| Basic popup UI structure | P0 | 3 hours |
| Save all tabs functionality | P0 | 3 hours |
| Session storage (chrome.storage.local) | P0 | 2 hours |
| Session list display | P0 | 3 hours |
| Restore session functionality | P0 | 2 hours |
| Basic search | P0 | 2 hours |
| Styling with Tailwind | P0 | 4 hours |

**Deliverable:** Working extension that saves and restores sessions.

### Phase 2: Polish & Features (Week 2)

**Goal:** Refined UX, management features, keyboard shortcuts

| Task | Priority | Estimate |
|------|----------|----------|
| Delete session | P1 | 2 hours |
| Rename session | P1 | 2 hours |
| Undo delete | P1 | 2 hours |
| Select specific tabs | P1 | 4 hours |
| Session preview on hover | P1 | 2 hours |
| Settings page | P1 | 3 hours |
| Keyboard shortcuts | P1 | 3 hours |
| Toast notifications | P1 | 2 hours |
| Dark mode support | P1 | 2 hours |

**Deliverable:** Full-featured extension ready for beta.

### Phase 3: AI & Distribution (Week 3)

**Goal:** AI naming, store submission

| Task | Priority | Estimate |
|------|----------|----------|
| Claude API integration | P1 | 4 hours |
| AI name generation | P1 | 3 hours |
| Graceful AI fallback | P1 | 1 hour |
| Export/import sessions | P2 | 3 hours |
| Chrome sync (optional) | P2 | 3 hours |
| Create store assets (icons, screenshots) | P0 | 2 hours |
| Write store listing | P0 | 1 hour |
| Privacy policy | P0 | 1 hour |
| Submit to Chrome Web Store | P0 | 1 hour |
| Submit to Edge Add-ons | P0 | 1 hour |

**Deliverable:** Published extension with AI features.

---

## 5. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API costs | Medium | Medium | Use Haiku (cheap), implement caching, fallback to default names |
| Storage quota exceeded | Medium | Low | Warn user, implement cleanup of old sessions |
| Manifest V3 limitations | Low | Low | Test early, use documented APIs only |
| Chrome review rejection | Medium | Low | Follow guidelines, minimal permissions |

---

## 6. Competitive Analysis

| Feature | Stash | OneTab | Session Buddy | Toby |
|---------|-------|--------|---------------|------|
| Modern UI | ✅ | ❌ | ❌ | ⚠️ |
| One-click save | ✅ | ✅ | ❌ | ❌ |
| One-click restore | ✅ | ⚠️ | ⚠️ | ⚠️ |
| AI naming | ✅ | ❌ | ❌ | ❌ |
| Fast search | ✅ | ❌ | ⚠️ | ⚠️ |
| Tab selection | ✅ | ❌ | ✅ | ✅ |
| Dark mode | ✅ | ❌ | ❌ | ⚠️ |
| Free | ✅ | ✅ | ⚠️ | ⚠️ |

**Stash differentiators:**
1. Modern, clean design
2. AI-powered session naming
3. Truly one-click save and restore
4. Fast, effective search

---

## 7. Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| Auto-save | P3 | Periodic backup of current tabs |
| Tab groups support | P3 | Preserve Chrome tab groups |
| Session sharing | P3 | Share session via link |
| Firefox version | P2 | Port to Firefox |
| Auto-group by topic | P2 | AI clusters tabs by topic |
| Session scheduling | P3 | Auto-restore sessions at times |

---

## 8. Appendix

### A. Chrome Extension Permissions Explained

| Permission | Why Needed |
|------------|------------|
| `tabs` | Read tab URLs and titles to save sessions |
| `storage` | Store sessions locally and sync across devices |

### B. Store Listing Draft

**Title:** Stash - Tab Session Manager

**Short Description:** (132 chars max)
Save and restore tab sessions with one click. AI-powered naming. Clean, modern design.

**Full Description:**
Too many tabs? Stash them.

Stash is a modern tab session manager that helps you save and restore groups of tabs with a single click.

✨ Features:
• One-click save - Stash all your tabs instantly
• AI-powered naming - Automatically generates meaningful session names
• Fast search - Find any session by name or content
• Clean design - Modern UI that's a joy to use
• Keyboard shortcuts - Power user friendly

Unlike cluttered alternatives, Stash focuses on speed and simplicity. No account required, no tracking, just a better way to manage your tabs.

---

*Document end*