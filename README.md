# Metaduck

A blog about technology, programming, and more.

## Analytics

This site uses PostHog for analytics tracking. The integration is configured to track:

- **Page views**: Automatic tracking on initial page load and client-side navigation
- **Internal link clicks**: Custom events when users click internal links
- **Navigation events**: Back/forward navigation and programmatic routing

### PostHog Configuration

- **Project ID**: `phc_NqiGUIXWaL0Bl2nE3UI34zpJLlOd7k60JyOSgHq3VWc`
- **API Host**: `https://eu.i.posthog.com`
- **Person Profiles**: Identified only
- **Debug Mode**: Disabled by default (set `debug: true` in `src/components/posthog.astro` to enable)

### Tracking Features

1. **Automatic Page View Tracking**: Tracks page views on:

   - Initial page load
   - Browser back/forward navigation
   - Programmatic navigation (pushState/replaceState)
   - Internal link clicks
   - Page visibility changes

2. **Enhanced Data**: Each page view includes:

   - Current URL and pathname
   - Page title
   - Referrer information
   - Host, search parameters, and hash

3. **Custom Events**: Additional tracking for:
   - Internal link clicks with link text and destination
   - Navigation patterns

### Troubleshooting

To debug PostHog tracking:

1. Enable debug mode by setting `debug: true` in the PostHog initialization
2. Open browser developer tools and check the console for `[PostHog Debug]` messages
3. Verify events are being sent to PostHog dashboard

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
