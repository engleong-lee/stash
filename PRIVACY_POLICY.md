# Privacy Policy for Stash - Tab Session Manager

**Last Updated:** December 25, 2024

## Overview

Stash is a browser extension that helps you save and restore browser tab sessions. We are committed to protecting your privacy and being transparent about our data practices.

## Data Collection

### What We Collect

**Session Data (Stored Locally)**
- Tab URLs
- Tab titles
- Tab favicons
- Session names and timestamps

All session data is stored **locally** in your browser using Chrome's storage API. This data never leaves your device unless you explicitly export it.

### What We DON'T Collect

- Personal information
- Browsing history beyond your saved sessions
- Account information
- Analytics or usage data
- Cookies or tracking information

## AI Features

Stash offers optional AI-powered session naming. You have full control over which AI provider to use:

### Ollama (Recommended for Privacy)
- Runs **entirely on your local machine**
- No data is sent to any external server
- Requires Ollama to be installed separately on your computer
- 100% private and offline-capable

### Claude API (Anthropic)
- If you choose to use Claude API, **only tab titles** are sent to Anthropic's servers
- Tab URLs and content are NOT sent
- Requires your own API key
- Subject to [Anthropic's Privacy Policy](https://www.anthropic.com/privacy)

You can disable AI features entirely in the extension settings.

## Data Storage

- All data is stored locally using `chrome.storage.local`
- Optional sync feature uses `chrome.storage.sync` to sync across your signed-in Chrome browsers
- You can export all your data as a JSON file at any time
- You can delete all data by removing the extension

## Third-Party Services

Stash does not integrate with any third-party analytics, advertising, or tracking services.

The only external connections are:
1. **Ollama** (localhost only) - If you enable Ollama AI naming
2. **Claude API** (api.anthropic.com) - Only if you enable Claude AI naming and provide an API key

## Your Rights

You have the right to:
- Export all your session data at any time
- Delete all your data by removing the extension
- Disable AI features to prevent any external data transmission
- Use the extension without creating any account

## Children's Privacy

Stash does not knowingly collect any personal information from children under 13 years of age.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date above.

## Contact

If you have any questions about this privacy policy, please open an issue on our GitHub repository.

## Open Source

Stash is open source. You can review the complete source code to verify our privacy practices.

---

**Summary:** Your data stays on your device. We don't track you. AI features are optional and privacy-respecting (Ollama runs locally, Claude only receives tab titles). No accounts, no analytics, no ads.
