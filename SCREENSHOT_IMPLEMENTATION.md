# Screenshot Feature - Implementation Summary

## ✅ What Was Done

Successfully implemented **file system-based screenshot storage** with automatic cleanup for failed test cases.

## 🔄 Changes Made

### 1. **Backend Changes**

#### Models (`backend/models/TestResult.js`)
- Added `screenshots` JSON field to store array of screenshot URLs

#### Controllers
- **`uploadController.js`** (NEW):
  - Created file upload handler using `multer`
  - Screenshots organized by `run_id` in subdirectories
  - Added `cleanupOldScreenshots()` function
  - Keeps only last 30 test runs' screenshots

- **`resultController.js`**:
  - Updated to accept `screenshots` array in request body
  - Integrated automatic screenshot cleanup after data retention

#### Routes (`backend/routes/result.js`)
- Added `/api/results/upload-screenshots` endpoint for file uploads

#### Server (`backend/index.js`)
- Increased JSON payload limit to 50MB (for compatibility)
- Added static file serving: `/uploads` → `backend/uploads` directory
- Added path module import

### 2. **Reporter Changes** (`frameworkIntegrations/rp.js`)

- **Before**: Converted screenshots to base64 and sent in JSON
- **After**: 
  - Extracts screenshot file paths from Playwright attachments
  - Uploads actual files via multipart/form-data to `/api/results/upload-screenshots`
  - Receives file URLs from backend
  - Sends URLs (not base64) with test results
- Added `form-data` dependency requirement

### 3. **Frontend Changes** (`frontend/src/pages/TestRunDetails.js`)

- Updated to display screenshots from URLs
- Backward compatible: supports both old base64 and new URL formats
- Improved UI with image icons indicating screenshot availability
- Click to open full-size in new tab

### 4. **Docker Configuration**

Updated all Docker Compose files:
- **`docker-compose.yml`** (development)
- **`docker/windows-docker-compose.yml`** (production - Windows)
- **`docker/ubuntu-docker-compose.yml`** (production - Ubuntu)

Added:
```yaml
volumes:
  - screenshots_data:/app/uploads  # Backend service

volumes:
  screenshots_data:  # New volume definition
```

### 5. **Documentation**

- Updated `README.md`:
  - Screenshot feature in features list
  - Storage architecture explanation
  - API documentation for upload endpoint
  - Database schema update
  - Data retention section
  - Docker volume backup commands
  
- Updated `SCREENSHOT_GUIDE.md`:
  - File system storage explanation
  - Directory structure
  - Automatic cleanup details
  - Migration notes

## 📁 Storage Architecture

```
backend/uploads/screenshots/
├── {run_id_1}/
│   ├── test_name_1-timestamp.png
│   ├── test_name_2-timestamp.png
│   └── ...
├── {run_id_2}/
│   └── ...
└── ... (only last 30 runs)
```

## 🔄 Data Flow

1. **Test fails** → Playwright captures screenshot
2. **Reporter** extracts screenshot file path
3. **Upload** screenshot files to `/api/results/upload-screenshots`
4. **Backend** saves files to `uploads/screenshots/{run_id}/`
5. **Response** returns URLs: `/uploads/screenshots/{run_id}/{filename}`
6. **Submit** test result with screenshot URLs array
7. **Database** stores only URLs (not file data)
8. **Frontend** fetches results and displays screenshots via URLs
9. **Cleanup** automatically removes old screenshot directories

## ✅ Benefits Achieved

| Aspect | Before (Base64) | After (File System) |
|--------|----------------|---------------------|
| **Database Size** | Large (images in DB) | Small (only URLs) |
| **Query Speed** | Slow with large TEXT fields | Fast |
| **Backup Size** | Huge | Manageable |
| **Scalability** | Limited | Can move to S3/CDN |
| **Performance** | Poor with many screenshots | Excellent |
| **Storage Cost** | High DB cost | Low file storage cost |

## 🔧 Required Dependencies

### Backend (already has):
- `multer` - File uploads ✅

### Test Project (needs to install):
```bash
cd automation-with-playwright  # or your test project
npm install form-data
```

The reporter (`rp.js`) requires `form-data` to upload files.

## 🚀 Testing the Implementation

1. **Start services**:
   ```bash
   cd automationReportPortal
   docker-compose down -v  # Clean start
   docker-compose up --build
   ```

2. **Run Playwright tests** (from test project):
   ```bash
   cd automation-with-playwright
   npm install form-data  # if not already installed
   npx playwright test
   ```

3. **Verify**:
   - Check backend logs for upload messages
   - Navigate to test run details in Report Portal
   - Failed tests should show screenshots
   - Check volume: `docker exec reportportal-backend ls -la /app/uploads/screenshots/`

## 🔐 Automatic Cleanup

**Triggers**: After each new test result submission

**What gets cleaned**:
- Database: Keeps last 30 `run_id` per framework
- Screenshots: Deletes corresponding directories for old run_ids

**Example**:
- You have 35 test runs
- System keeps runs 6-35 (latest 30)
- Deletes runs 1-5 from database
- Deletes `/uploads/screenshots/run_1/` through `/uploads/screenshots/run_5/`

## 📦 Docker Volume Management

**List volumes**:
```bash
docker volume ls | grep screenshots
```

**Inspect volume**:
```bash
docker volume inspect reportportal_screenshots_data
```

**Backup screenshots**:
```bash
docker run --rm -v reportportal_screenshots_data:/source -v $(pwd):/backup ubuntu tar czf /backup/screenshots-backup-$(date +%Y%m%d).tar.gz -C /source .
```

**Restore screenshots**:
```bash
docker run --rm -v reportportal_screenshots_data:/target -v $(pwd):/backup ubuntu tar xzf /backup/screenshots-backup-20260219.tar.gz -C /target
```

## 🔄 Migration Path

If you have existing data with base64 screenshots:
1. System will continue to display old base64 screenshots
2. New test runs will use file system storage
3. Old base64 data will be cleaned up when those runs expire (after 30 new runs)
4. No manual migration needed

## ✅ Production Readiness

Before deploying to production:

1. **Test the cleanup** - run 31+ test executions to verify cleanup works
2. **Monitor disk space** - screenshots can accumulate quickly
3. **Set up volume backups** - automate screenshot backups
4. **Consider S3/CDN** - for very high volume, migrate to cloud storage later
5. **Install dependencies** - ensure `form-data` is in test project's package.json

---

**Implementation Date**: February 19, 2026  
**Status**: ✅ Complete and Ready for Testing
