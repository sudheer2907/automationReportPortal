# Screenshot Configuration Guide

## Enable Screenshot Capture in Playwright

To capture screenshots for failed tests, ensure your `playwright.config.js` is configured correctly:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... other config
  
  // Screenshot configuration
  use: {
    screenshot: 'only-on-failure', // or 'on' to capture for all tests
    trace: 'retain-on-failure',
  },
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['./frameworkIntegrations/rp.js']  // Custom reporter with screenshot support
  ],
});
```

## Screenshot Options

- `screenshot: 'on'` - Capture screenshot for every test
- `screenshot: 'only-on-failure'` - Capture only when test fails (recommended)
- `screenshot: 'off'` - Don't capture screenshots

## How Screenshots are Handled

1. **Capture**: Playwright automatically captures screenshots based on your config
2. **Upload**: The custom reporter (`rp.js`) uploads screenshots to the backend `/api/results/upload-screenshots`
3. **Storage**: Screenshots are stored in the file system at `backend/uploads/screenshots/{run_id}/`
4. **Database**: Only the URLs are stored in the database, not the actual image data
5. **Frontend**: Screenshots are displayed in the test run details page for failed tests
6. **Cleanup**: Only the latest 30 test runs' screenshots are kept (automatic cleanup)

## Storage Architecture

```
backend/uploads/screenshots/
├── 1739388800000/           # run_id (timestamp)
│   ├── test_login-123456.png
│   ├── test_checkout-789012.png
│   └── ...
├── 1739389900000/           # another run_id
│   └── ...
└── ...
```

**Benefits:**
- ✅ Small database size (only URLs stored)
- ✅ Fast query performance
- ✅ Easy to backup/archive separately
- ✅ Can move to S3/Azure Blob later
- ✅ Automatic cleanup of old screenshots

## Manual Screenshot Capture

You can also manually capture screenshots in your tests:

```javascript
test('my test', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Manual screenshot
  await page.screenshot({ 
    path: 'screenshot.png',
    fullPage: true 
  });
  
  // Or attach to test report
  await test.info().attach('custom-screenshot', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});
```

## Viewing Screenshots

1. Run your tests: `npx playwright test`
2. Results are automatically sent to Report Portal
3. Navigate to the test run details
4. Click on any failed test case
5. Screenshots will be displayed below the error message
6. Click on a screenshot to view it in full size in a new tab

## Automatic Cleanup

The system automatically:
- Keeps only the **last 30 test runs** per project/framework
- Deletes older test results from database
- **Deletes corresponding screenshot directories**
- Runs cleanup after each new test result submission

## Storage Considerations

- Screenshots are stored on disk (file system)
- Each screenshot is limited to 10MB
- Docker volume `screenshots_data` persists files across container restarts
- Clean up happens automatically, no manual intervention needed

## Backup Screenshots

Since screenshots are in a Docker volume, to backup:

```bash
# Backup screenshots volume
docker run --rm -v reportportal_screenshots_data:/source -v $(pwd):/backup ubuntu tar czf /backup/screenshots-backup-$(date +%Y%m%d).tar.gz -C /source .

# Restore screenshots volume
docker run --rm -v reportportal_screenshots_data:/target -v $(pwd):/backup ubuntu tar xzf /backup/screenshots-backup-YYYYMMDD.tar.gz -C /target
```

## Migration from Base64 Storage

If you had screenshots stored as base64 in the database before this update:
- Old screenshots will still be displayed (backward compatible)
- New screenshots will be stored as files
- Old base64 data will be removed when those test runs are cleaned up

