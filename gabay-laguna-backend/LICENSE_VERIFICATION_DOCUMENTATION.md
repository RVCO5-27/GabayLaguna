# License Verification Documentation
## Gabay Laguna: Tour Guide License Verification System

---

## Overview

The Gabay Laguna system includes a comprehensive license verification process to ensure that only licensed and verified tour guides can operate on the platform. This documentation describes the complete license verification workflow, from registration to approval.

---

## License Verification Workflow

### Phase 1: Guide Registration with License Information

#### 1.1 Registration Process

When a tour guide registers, they must provide their license number:

**Frontend Implementation**:
- **File**: `src/pages/SignupGuide.jsx`
- **Field**: `license_number` (required)
- **Validation**: 
  - Required field validation
  - Format validation (if applicable)
  - Uniqueness check (license numbers must be unique)

**Backend Implementation**:
- **File**: `app/Http/Controllers/AuthController.php`
- **Endpoint**: `POST /api/guide/register`
- **Validation Rules**:
  ```php
  'license_number' => 'required|string|max:100|unique:tour_guides'
  ```

**Database Schema**:
- **Table**: `tour_guides`
- **Column**: `license_number` (string, unique)
- **Migration**: `2025_08_14_153701_create_tour_guides_table.php`

#### 1.2 Initial Status

Upon registration:
- ✅ User account created with `user_type = 'guide'`
- ✅ Tour guide profile created with `license_number` stored
- ⚠️ `is_verified = false` (default)
- ⚠️ `is_available = false` (default until verified)

**Database Fields**:
- `users.is_verified = false`
- `tour_guides.is_verified = false`
- `tour_guides.is_available = false`

---

### Phase 2: License Verification by Administrator

#### 2.1 Admin Verification Dashboard

Administrators can view pending verifications:

**Backend Endpoint**:
- **File**: `app/Http/Controllers/AdminController.php`
- **Method**: `dashboard()`
- **Endpoint**: `GET /api/admin/dashboard`
- **Returns**: `pending_verifications` count

**Frontend Implementation**:
- **File**: `src/pages/AdminDashboard.jsx`
- Displays pending verification count
- Links to user management for verification

#### 2.2 Verification Process

**Step 1: Review Guide Application**
- Admin accesses guide list with verification status filter
- Admin views guide profile including:
  - License number
  - Experience years
  - Bio and credentials
  - Specializations

**Backend Endpoints**:
- `GET /api/admin/guides?is_verified=false` - Get unverified guides
- `GET /api/admin/guides/{id}` - Get specific guide details

**Step 2: License Verification**
- Admin reviews license number against official records
- Admin may request additional documentation if needed
- Admin verifies license validity with tourism office (manual process)

**Step 3: Verification Decision**

**Approve Guide**:
- **Endpoint**: `PUT /api/admin/guides/{guide}/verify`
- **File**: `app/Http/Controllers/AdminController.php`
- **Method**: `verifyGuide()`
- **Actions**:
  ```php
  $guide->update(['is_verified' => true]);
  $guide->user->update(['is_verified' => true]);
  ```
- **Result**:
  - `tour_guides.is_verified = true`
  - `users.is_verified = true`
  - Guide can now set availability and receive bookings

**Reject Guide** (if license invalid):
- Admin can update user status to inactive
- **Endpoint**: `PUT /api/admin/users/{user}/status`
- **Action**: Set `is_active = false`
- Guide receives notification (if implemented)

---

### Phase 3: Post-Verification

#### 3.1 Verified Guide Capabilities

Once verified, guides can:
- ✅ Set availability schedules
- ✅ Update profile information
- ✅ Receive and manage bookings
- ✅ Appear in search results (only verified guides shown)
- ✅ Accept payments

**Search Filtering**:
- **File**: `app/Services/SearchService.php`
- **Implementation**: Only verified guides appear in search results
- **Code**:
  ```php
  ->whereHas('user', function ($q) {
      $q->where('is_verified', true)
        ->where('is_active', true);
  })
  ```

#### 3.2 License Display

Verified guides' license numbers are:
- ✅ Stored in database
- ✅ Visible on guide profile (if configured)
- ✅ Used for verification tracking

---

## Database Schema

### Users Table
```sql
users
├── id
├── user_type (enum: 'tourist', 'guide', 'admin')
├── is_verified (boolean, default: false)
├── is_active (boolean, default: true)
└── ...
```

### Tour Guides Table
```sql
tour_guides
├── id
├── user_id (foreign key to users)
├── license_number (string, unique)
├── is_verified (boolean, default: false)
├── is_available (boolean, default: false)
├── experience_years
├── hourly_rate
├── languages
└── ...
```

---

## API Endpoints

### Public Endpoints

#### Guide Registration
- **Endpoint**: `POST /api/guide/register`
- **Required Fields**: `license_number` (required, unique)
- **Response**: Creates user and tour guide profile with `is_verified = false`

### Admin Endpoints (Protected)

#### Get Pending Verifications
- **Endpoint**: `GET /api/admin/dashboard`
- **Returns**: Count of unverified guides
- **Response**:
  ```json
  {
    "statistics": {
      "pending_verifications": 5
    }
  }
  ```

#### Get Unverified Guides
- **Endpoint**: `GET /api/admin/guides?is_verified=false`
- **Returns**: List of guides awaiting verification
- **Response**:
  ```json
  {
    "tour_guides": {
      "data": [
        {
          "id": 1,
          "license_number": "GL-123456",
          "is_verified": false,
          "user": {...}
        }
      ]
    }
  }
  ```

#### Verify Guide
- **Endpoint**: `PUT /api/admin/guides/{guide}/verify`
- **Method**: `verifyGuide()`
- **Actions**:
  1. Sets `tour_guides.is_verified = true`
  2. Sets `users.is_verified = true`
- **Response**:
  ```json
  {
    "message": "Tour guide verified successfully",
    "tour_guide": {...}
  }
  ```

#### Verify User (General)
- **Endpoint**: `PUT /api/admin/users/{user}/verify`
- **Method**: `verifyUser()`
- **Action**: Sets `users.is_verified = true`

---

## Verification Checklist for Administrators

When verifying a tour guide, administrators should:

### Required Checks:
- [ ] **License Number Format**: Verify license number format matches official pattern
- [ ] **License Validity**: Cross-reference with tourism office records
- [ ] **License Uniqueness**: Ensure license number is not duplicated
- [ ] **Profile Completeness**: Verify all required profile fields are filled
- [ ] **Documentation**: Review any uploaded certificates or credentials

### Optional Checks:
- [ ] **Experience Verification**: Verify experience years are reasonable
- [ ] **Language Proficiency**: Review listed languages
- [ ] **Specializations**: Verify category specializations are appropriate
- [ ] **Contact Information**: Verify phone and email are valid

---

## Integration with Tourism Office

### Manual Verification Process

The system supports integration with local tourism offices for license verification:

1. **License Number Collection**: System collects license numbers during registration
2. **Admin Review**: Administrators review license numbers
3. **External Verification**: Admin contacts tourism office to verify license validity
4. **Status Update**: Admin updates verification status in system

### Future Enhancement: Automated Verification

**Potential Implementation**:
- API integration with tourism office database
- Automated license number validation
- Real-time license status checking
- License expiration tracking

**Database Enhancement**:
```sql
ALTER TABLE tour_guides ADD COLUMN license_verified_at TIMESTAMP;
ALTER TABLE tour_guides ADD COLUMN license_expires_at DATE;
ALTER TABLE tour_guides ADD COLUMN verification_notes TEXT;
```

---

## Security Considerations

### License Number Protection

1. **Uniqueness Constraint**: Database-level unique constraint on `license_number`
2. **Validation**: Backend validation prevents duplicate licenses
3. **Access Control**: Only admins can view and verify licenses
4. **Audit Trail**: Timestamps track when verification occurred

### Verification Security

1. **Admin-Only Access**: Verification endpoints protected by admin middleware
2. **Role-Based Access**: Only users with `user_type = 'admin'` can verify
3. **Middleware**: `app/Http/Middleware/AdminMiddleware.php` protects routes

---

## Notification System

### Guide Verification Notifications

**Implementation**: `app/Services/NotificationService.php`

**Methods**:
- `sendGuideVerificationNotification()` - Sends email when guide is verified

**Notification Triggers**:
- ✅ Guide verified successfully
- ⚠️ Guide verification rejected (if implemented)

---

## Verification Status Flow

```
Registration
    ↓
License Number Provided
    ↓
is_verified = false
is_available = false
    ↓
Admin Reviews Application
    ↓
    ├─→ Approved → is_verified = true → is_available = true
    │                                      ↓
    │                              Can receive bookings
    │
    └─→ Rejected → is_active = false → Cannot use system
```

---

## Testing License Verification

### Test Cases

1. **Registration with License**:
   - ✅ Guide can register with license number
   - ✅ Duplicate license numbers are rejected
   - ✅ License number is stored correctly

2. **Admin Verification**:
   - ✅ Admin can view pending verifications
   - ✅ Admin can verify guide
   - ✅ Verification updates both user and guide records

3. **Search Filtering**:
   - ✅ Only verified guides appear in search results
   - ✅ Unverified guides are hidden from tourists

4. **Access Control**:
   - ✅ Only admins can verify guides
   - ✅ Verified guides can set availability
   - ✅ Unverified guides cannot receive bookings

**Test File**: `tests/Feature/AuthTest.php`
- `test_guide_registration_with_license()`
- `test_duplicate_license_number_registration()`

---

## Configuration

### Verification Requirements

**File**: `config/gabay-laguna.php`

```php
'verification_required' => true,
```

This setting controls whether verification is required before guides can operate.

---

## Best Practices

### For Administrators:

1. **Regular Verification**: Review pending verifications regularly
2. **Documentation**: Keep notes on verification decisions
3. **Communication**: Notify guides of verification status
4. **Audit**: Maintain records of verification actions

### For Developers:

1. **Validation**: Always validate license numbers on registration
2. **Uniqueness**: Enforce unique license numbers at database level
3. **Security**: Protect verification endpoints with proper middleware
4. **Notifications**: Send notifications when verification status changes

---

## Future Enhancements

### Planned Features:

1. **License Document Upload**: Allow guides to upload license certificates
2. **License Expiration Tracking**: Track and notify about expiring licenses
3. **Automated Verification**: Integration with tourism office API
4. **Verification History**: Track all verification actions
5. **Bulk Verification**: Verify multiple guides at once

### Database Enhancements:

```sql
-- License verification tracking
CREATE TABLE license_verifications (
    id BIGINT PRIMARY KEY,
    tour_guide_id BIGINT,
    verified_by BIGINT, -- admin user_id
    verification_status ENUM('pending', 'approved', 'rejected'),
    verification_notes TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP,
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- License document storage
ALTER TABLE tour_guides ADD COLUMN license_document_path VARCHAR(255);
ALTER TABLE tour_guides ADD COLUMN license_issued_date DATE;
ALTER TABLE tour_guides ADD COLUMN license_expires_at DATE;
```

---

## Conclusion

The license verification system ensures that only licensed and verified tour guides can operate on the Gabay Laguna platform. The workflow includes:

1. ✅ License number collection during registration
2. ✅ Admin review and verification process
3. ✅ Status-based access control
4. ✅ Search filtering for verified guides only

This system maintains platform quality and builds trust with tourists by ensuring all guides are properly licensed and verified.

---

**Document Version**: 1.0  
**Last Updated**: Current Review  
**Related Documents**: 
- `PROJECT_DOCUMENTATION.md`
- `REQUIREMENTS_COMPLIANCE_REPORT.md`
- `API_DOCUMENTATION.md`

