# Maintenance Management Feature - Implementation Guide

## Overview
This document provides a complete overview of the enhanced maintenance management feature for your ERP application, including all updated and created files.

---

## 📋 Files Updated/Created

### 1. **Frontend Components**

#### `erp-frontend/src/pages/assets/Maintenance.jsx` ✅ UPDATED
**Purpose**: React component for managing maintenance entries with toggleable form

**Key Features**:
- **"Add Maintenance" Button**: Toggles form visibility on/off
- **Dynamic Form Fields**:
  - Asset Selection (dropdown of assigned assets)
  - Issue Description (textarea with validation)
  - Priority Level (low, medium, high, urgent)
- **Error Handling**: User-friendly error messages
- **Loading States**: Prevents duplicate submissions
- **Maintenance Logs Table**: Displays all maintenance history with status badges
- **Form Validation**: 
  - Ensures asset selection
  - Validates issue description (min 5 characters)
  - Prevents empty submissions

**State Management**:
```javascript
const [assets, setAssets] = useState([]);        // Assigned assets list
const [logs, setLogs] = useState([]);            // Maintenance logs
const [showForm, setShowForm] = useState(false); // Form visibility toggle
const [loading, setLoading] = useState(false);   // Loading state
const [error, setError] = useState(null);        // Error messages
const [form, setForm] = useState({               // Form data
  asset_id: "",
  issue: "",
  priority: "medium"
});
```

---

### 2. **API Integration**

#### `erp-frontend/src/api/maintenanceApi.js` ✅ CREATED
**Purpose**: Centralized API module for maintenance operations

**Available Functions**:
- `getMaintenanceLogs()` - Fetch all maintenance logs
- `getMaintenanceLogById(id)` - Get specific log details
- `createMaintenanceLog(payload)` - Create new maintenance entry
- `updateMaintenanceLog(id, payload)` - Update existing log
- `deleteMaintenanceLog(id)` - Delete a log
- `getMaintenanceLogsByStatus(status)` - Filter by status (open, in_progress, resolved)
- `getMaintenanceLogsByAsset(assetId)` - Get logs for specific asset

**Error Handling**: Standardized response handler with detailed error messages

---

### 3. **Backend - Database**

#### `Backend/initDb.js` ✅ UPDATED
**Changes Made**:
- Added `priority` field to `maintenance_logs` table
- Type: ENUM('low','medium','high','urgent') with default 'medium'
- Table structure now includes:
  ```sql
  CREATE TABLE maintenance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    issue TEXT,
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
    status ENUM('open','in_progress','resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
  )
  ```

**Note**: If your database already exists, run this migration:
```sql
ALTER TABLE maintenance_logs 
ADD COLUMN priority ENUM('low','medium','high','urgent') DEFAULT 'medium' AFTER issue;
```

---

### 4. **Backend - Controllers**

#### `Backend/controllers/maintenanceController.js` ✅ UPDATED
**Comprehensive Functions Implemented**:

1. **getMaintenanceLogs()** - Retrieves all logs with asset info, sorted by newest first
2. **getMaintenanceLogById(id)** - Gets specific log with validation
3. **createMaintenanceLog()** - Creates new log with:
   - Validation of asset_id and issue description
   - Verification that asset exists
   - Check asset is in 'assigned' or 'maintenance' state
   - Automatic asset status update to 'maintenance'
4. **updateMaintenanceLog(id)** - Updates log with:
   - Dynamic field updates (issue, status, priority)
   - Automatic asset status change to 'available' when resolved
   - Validation of status values
5. **deleteMaintenanceLog(id)** - Removes log with validation
6. **getMaintenanceLogsByStatus(status)** - Filters logs by status
7. **getMaintenanceLogsByAsset(assetId)** - Gets logs for specific asset

**Error Handling**:
- Input validation on all fields
- Foreign key constraint checks
- Clear error messages for debugging
- HTTP status codes (400, 404, 500)

---

### 5. **Backend - Routes**

#### `Backend/routes/maintenanceRoutes.js` ✅ UPDATED
**API Endpoints**:

```
GET    /api/maintenance                    - Get all maintenance logs
POST   /api/maintenance                    - Create new maintenance log
GET    /api/maintenance/:id                - Get specific log
PUT    /api/maintenance/:id                - Update log
DELETE /api/maintenance/:id                - Delete log
GET    /api/maintenance/status/:status     - Get logs by status
GET    /api/maintenance/asset/:assetId     - Get logs for asset
```

**Route Priority**:
- Parameterized routes (`/:id`) are defined after specific filter routes
- Ensures correct route matching

---

### 6. **Frontend - App Integration**

#### `erp-frontend/src/App.jsx` ✅ ALREADY INTEGRATED
**Route Configuration**:
```javascript
<Route
  path="/assets/maintenance"
  element={
    <ProtectedRoute roles={["admin","manager","assests"]}>
      <AppLayout>
        <Maintenance />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

**Access Control**: Available to admin, manager, and assets roles

---

## 🚀 How to Use

### Frontend Usage

1. **Navigate to Maintenance**
   - URL: `http://localhost:3000/assets/maintenance`
   - Button in sidebar (if configured)

2. **Create Maintenance Request**
   - Click "Add Maintenance" button
   - Form appears with fields:
     - **Asset**: Dropdown of assigned assets
     - **Issue**: Text description (min 5 chars)
     - **Priority**: Select from low/medium/high/urgent
   - Click "Create Maintenance Log" to submit
   - Form auto-resets and page refreshes

3. **View History**
   - All past maintenance requests display in table
   - Shows asset name, issue, status with color coding:
     - Red badge: Open
     - Orange badge: In Progress
     - Green badge: Resolved

### Backend Usage

**Create Maintenance via API**:
```bash
curl -X POST http://localhost:5000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "issue": "Screen is flickering intermittently",
    "priority": "high",
    "status": "open"
  }'
```

**Update Status**:
```bash
curl -X PUT http://localhost:5000/api/maintenance/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**Resolve Maintenance** (auto-sets asset to 'available'):
```bash
curl -X PUT http://localhost:5000/api/maintenance/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved"
  }'
```

---

## 🔄 Data Flow

```
User Interface (Maintenance.jsx)
    ↓
apiRequest() [API Helper]
    ↓
HTTP Request (Fetch API)
    ↓
Backend Express Routes (maintenanceRoutes.js)
    ↓
Controller Functions (maintenanceController.js)
    ↓
Database Query (maintenance_logs table)
    ↓
Response → Component State → UI Update
```

---

## ✨ Key Features

### 1. **Toggle Form Visibility**
- Click "Add Maintenance" to show form
- Click "Cancel" or button again to hide
- Form resets when hidden

### 2. **Real-time Validation**
- Prevents submission without required fields
- Shows validation errors inline
- Minimum description length enforced

### 3. **Loading State Management**
- Button disabled during submission
- Prevents duplicate requests
- Shows "Creating..." feedback

### 4. **Status Color Coding**
- Open: Red badge
- In Progress: Orange badge
- Resolved: Green badge

### 5. **Asset Lifecycle Management**
- Asset status automatically changes to 'maintenance' when log created
- Asset status reverts to 'available' when maintenance resolved
- Only assigned assets can be logged for maintenance

---

## 📊 Database Schema

### maintenance_logs Table
| Field | Type | Constraint | Default |
|-------|------|-----------|---------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | - |
| asset_id | INT | FOREIGN KEY (assets.id) | NULL |
| issue | TEXT | NOT NULL | - |
| priority | ENUM | ('low','medium','high','urgent') | 'medium' |
| status | ENUM | ('open','in_progress','resolved') | 'open' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | - |

---

## 🛠️ Setup Instructions

### 1. **Database Update**
If table already exists, add priority column:
```sql
ALTER TABLE maintenance_logs 
ADD COLUMN priority ENUM('low','medium','high','urgent') DEFAULT 'medium' AFTER issue;
```

### 2. **Start Backend**
```bash
cd Backend
npm install
npm start  # or node server.js
```

### 3. **Start Frontend**
```bash
cd erp-frontend
npm install
npm start  # or npm run dev
```

### 4. **Access Application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🔐 Security Considerations

1. **Input Validation**: All inputs validated on frontend and backend
2. **Role-Based Access**: Route protected with role checking
3. **SQL Injection Prevention**: Using parameterized queries
4. **Error Messages**: Generic messages for security (no database details exposed)

---

## 📝 Notes

- Form automatically hides after successful submission
- Data is fetched fresh from server after each operation
- Error messages persist until user dismisses or corrects input
- Asset status transitions are automatic (no manual updates needed)
- All timestamps use server time (UTC)

---

## 🐛 Troubleshooting

### Issue: "No assigned assets available"
- **Solution**: Create asset assignments first via Assignments page

### Issue: "Asset not found"
- **Solution**: Verify asset ID exists in database

### Issue: Form not submitting
- **Solution**: Check browser console for errors, ensure backend is running

### Issue: Maintenance table not created
- **Solution**: Run `initDb.js` again, or manually create table using SQL above

---

## 📚 Related Components

- **Assets.jsx**: Asset management
- **Assignments.jsx**: Asset assignments
- **Categories.jsx**: Asset categories
- **assetApi.js**: Asset API calls

---

## 🎯 Future Enhancements

- Technician assignment for maintenance tasks
- Estimated completion time tracking
- Maintenance cost tracking
- Spare parts inventory integration
- Email notifications on status changes
- Service history analytics

---

**Last Updated**: 2024
**Version**: 1.0
