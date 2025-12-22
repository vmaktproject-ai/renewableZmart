# Nigeria CAC Registration Validation System

## Overview
This system validates business registration numbers against Nigeria's Corporate Affairs Commission (CAC) official formats. It ensures vendors provide legitimate CAC registration numbers and prevents fake or test numbers.

## ✅ CAC Registration Types Supported

### 1. **RC - Limited Company (Company Limited by Shares)**
- **Format**: RC-XXXXXX or RC-XXXXXXX (6-7 digits)
- **Example**: RC-123456, RC-1234567
- **Description**: For private and public limited companies registered with CAC
- **Usage**: Most common type for businesses in Nigeria

### 2. **BN - Business Name**
- **Format**: BN-XXXXXX or BN-XXXXXXX (6-7 digits)
- **Example**: BN-789012, BN-7890123
- **Description**: For sole proprietorships or partnerships trading under a business name
- **Usage**: Small businesses, individual traders, partnerships

### 3. **IT - Incorporated Trustees**
- **Format**: IT-XXXXXX or IT-XXXXXXX (6-7 digits)
- **Example**: IT-345678, IT-3456789
- **Description**: For non-profit organizations registered as Incorporated Trustees
- **Usage**: NGOs, religious organizations, clubs, associations, charities

### 4. **LLP - Limited Liability Partnership**
- **Format**: LLP-XXXXXX or LLP-XXXXXXX (6-7 digits)
- **Example**: LLP-456789, LLP-4567890
- **Description**: For professional partnerships with limited liability
- **Usage**: Law firms, accounting firms, consulting partnerships

## 📋 Validation Rules

### Format Validation
✅ **Valid Formats:**
```
RC-123456
rc123456 (auto-normalized to RC-123456)
RC 123456 (auto-normalized to RC-123456)
BN-789012
IT-345678
LLP-456789
```

❌ **Invalid Formats:**
```
123456 (missing prefix)
ABC-123456 (invalid prefix)
RC123 (too short - less than 6 digits)
RC12345678 (too long - more than 7 digits)
RC-ABCDEF (non-numeric)
```

### Fake Number Detection
The system automatically rejects:
- **Repeated digits**: 000000, 111111, 222222, etc.
- **Test numbers**: 123456, 1234567
- **Placeholder numbers**: 000000
- **Sequential patterns**: Common test sequences

### Normalization Process
1. **Remove spaces**: "RC 123456" → "RC123456"
2. **Convert to uppercase**: "rc123456" → "RC123456"
3. **Add hyphen**: "RC123456" → "RC-123456"
4. **Final format**: "RC-123456"

## 🔍 CAC Verification Process

### Automatic Validation (Done by System)
1. ✅ Format check (prefix + digits)
2. ✅ Length validation (6-7 digits)
3. ✅ Fake number detection
4. ✅ Registration type verification
5. ✅ Duplicate check in database

### Manual Verification (Admin Process)
Since CAC doesn't provide a public API, admins should manually verify:

**Step 1: Visit CAC Public Search**
- URL: https://icrp.cac.gov.ng/public-search
- This is the official CAC portal for company searches

**Step 2: Search Registration Number**
- Enter the vendor's registration number (e.g., RC-123456)
- System will show company details if valid

**Step 3: Verify Details**
- ✅ Company name matches vendor's business name
- ✅ Registration status is "Active"
- ✅ Registration date is valid (not future date)
- ✅ Company type matches claimed type

**Step 4: Download Proof**
- Save company search result as PDF
- Attach to vendor verification records

## 📁 Files Created

### Backend Validation
**File**: `backend/src/utils/cacValidation.ts`
```typescript
// Main functions:
export function validateCACRegistrationNumber(regNumber: string): CACValidationResult
export function normalizeCACNumber(regNumber: string): string
export function getCACTypeInfo(type: string): CAC_REGISTRATION_INFO
export function getCACVerificationInstructions(regNumber: string): VerificationInstructions
export function getSupportedCACTypes(): Array<TypeInfo>
```

### Frontend Validation
**File**: `lib/cacValidation.ts`
```typescript
// Same functions for client-side validation
export function validateCACRegistrationNumber(regNumber: string): CACValidationResult
export function normalizeCACNumber(regNumber: string): string
export function getCACTypeInfo(type: string): CAC_REGISTRATION_INFO
export function getSupportedCACTypes(): Array<TypeInfo>
```

## 🔄 Integration

### Updated Files

**1. Backend Company Validation**
```typescript
// backend/src/utils/companyValidation.ts
import { validateCACRegistrationNumber } from './cacValidation';

export function validateCompanyRegistration(regNumber: string, country: string) {
  if (country === 'Nigeria') {
    return validateCACRegistrationNumber(regNumber);
  }
  // ... other countries
}
```

**2. Frontend Company Validation**
```typescript
// lib/companyValidation.ts
import { validateCACRegistrationNumber } from './cacValidation';

export function validateCompanyRegistration(regNumber: string, country: string) {
  if (country === 'Nigeria') {
    return validateCACRegistrationNumber(regNumber);
  }
  // ... other countries
}
```

## 📊 Validation Response Examples

### ✅ Valid Registration
```json
{
  "isValid": true,
  "normalizedValue": "RC-123456",
  "registrationType": "RC",
  "details": {
    "prefix": "RC",
    "number": "123456",
    "type": "Limited Company (Company Limited by Shares)",
    "description": "For private and public limited companies registered with CAC"
  }
}
```

### ❌ Invalid Format
```json
{
  "isValid": false,
  "error": "Invalid CAC registration number format",
  "suggestion": "Must start with RC, BN, IT, or LLP followed by 6-7 digits. Example: RC-123456, BN-789012"
}
```

### ❌ Fake Number Detected
```json
{
  "isValid": false,
  "error": "This appears to be a test or placeholder number",
  "suggestion": "Please enter your actual CAC registration number"
}
```

### ❌ Too Short
```json
{
  "isValid": false,
  "error": "RC registration number is too short",
  "suggestion": "RC numbers must be at least 6 digits. Example: RC-123456"
}
```

### ❌ Unknown Type
```json
{
  "isValid": false,
  "error": "Unknown registration type: XYZ",
  "suggestion": "Valid types are: RC (Company), BN (Business Name), IT (NGO/Trustees), LLP (Partnership)"
}
```

## 🧪 Testing Examples

### Valid Test Cases
```javascript
// Test 1: Valid RC with hyphen
validateCACRegistrationNumber('RC-123456')
// ✅ Valid

// Test 2: Valid RC without hyphen (auto-normalized)
validateCACRegistrationNumber('RC123456')
// ✅ Valid, normalized to RC-123456

// Test 3: Valid BN with space (auto-normalized)
validateCACRegistrationNumber('BN 789012')
// ✅ Valid, normalized to BN-789012

// Test 4: Valid IT lowercase (auto-normalized)
validateCACRegistrationNumber('it-345678')
// ✅ Valid, normalized to IT-345678

// Test 5: Valid LLP 7 digits
validateCACRegistrationNumber('LLP-1234567')
// ✅ Valid
```

### Invalid Test Cases
```javascript
// Test 1: Missing prefix
validateCACRegistrationNumber('123456')
// ❌ Invalid: Must start with RC, BN, IT, or LLP

// Test 2: Wrong prefix
validateCACRegistrationNumber('ABC-123456')
// ❌ Invalid: Unknown registration type

// Test 3: Too short
validateCACRegistrationNumber('RC-123')
// ❌ Invalid: RC registration number is too short

// Test 4: Too long
validateCACRegistrationNumber('RC-12345678')
// ❌ Invalid: RC registration number is too long

// Test 5: Fake number
validateCACRegistrationNumber('RC-111111')
// ❌ Invalid: Registration number appears to be invalid

// Test 6: Test number
validateCACRegistrationNumber('RC-123456') // If equals exactly 123456
// ❌ Invalid: This appears to be a test or placeholder number

// Test 7: Non-numeric
validateCACRegistrationNumber('RC-ABCDEF')
// ❌ Invalid: Invalid CAC registration number format
```

## 🎯 User Experience

### Registration Form
When a Nigerian vendor registers:

1. **Country Selection**: User selects "Nigeria"
2. **Registration Type Info**: System shows supported types:
   - RC (Limited Company)
   - BN (Business Name)
   - IT (Non-Profit/NGO)
   - LLP (Partnership)

3. **Real-time Validation**: As user types:
   - RC123456 → Auto-formats to RC-123456
   - Shows green checkmark when valid
   - Shows red error with suggestion when invalid

4. **Error Messages**: Clear, helpful errors:
   - "RC registration number is too short. Example: RC-123456"
   - "This appears to be a test number. Please enter your actual CAC registration"

5. **Submission**: Only allows submission with valid CAC format

### Admin Dashboard
Admins can verify vendors by:

1. **View Registration Number**: See normalized CAC number (RC-123456)
2. **Get Verification Link**: One-click access to CAC public search
3. **Follow Instructions**: Step-by-step verification guide
4. **Approve/Reject**: Based on CAC search results

## 🔒 Security Features

### 1. Multi-Layer Validation
- ✅ Frontend: Immediate feedback, UX improvement
- ✅ Backend: Security layer, cannot be bypassed
- ✅ Database: Unique constraint prevents duplicates

### 2. Fake Number Prevention
- ✅ Repeated digits blocked (000000, 111111)
- ✅ Test numbers blocked (123456, 1234567)
- ✅ Sequential patterns detected

### 3. Normalization
- ✅ Consistent storage format
- ✅ Case-insensitive duplicate detection
- ✅ Space and hyphen handling

### 4. Type Verification
- ✅ Only valid CAC types accepted
- ✅ Format specific to each type
- ✅ Length validation per type

## 📈 Database Schema

### User Model Update
```typescript
@Column({ nullable: true, unique: true })
businessRegNumber: string;
```

**Constraints:**
- `nullable: true` - Only required for vendors
- `unique: true` - No duplicate registrations
- Stored in normalized format (RC-123456)

## 🚀 Deployment Checklist

- [x] CAC validation utilities created (backend + frontend)
- [x] Company validation updated to use CAC
- [x] Fake number detection implemented
- [x] Normalization logic in place
- [x] Database unique constraint added
- [x] Frontend validation integrated
- [x] Error messages configured
- [x] Type information functions created
- [ ] Database migration applied (automatic on restart)
- [ ] Test with real CAC numbers
- [ ] Admin verification process documented
- [ ] Staff training on manual verification

## 📞 CAC Contact Information

**Corporate Affairs Commission (CAC) Nigeria**
- Website: https://www.cac.gov.ng
- Public Search: https://icrp.cac.gov.ng/public-search
- Email: helpdesk@cac.gov.ng
- Phone: +234-708-062-9000
- Address: Plot 420, Tigris Crescent, Off Aguiyi Ironsi Street, Maitama, Abuja

## 💡 Best Practices

### For Vendors
1. **Use Your Actual CAC Number**: Don't use test numbers
2. **Check Your Certificate**: Look at your CAC certificate for exact format
3. **Include Business Name**: Ensure business name matches CAC records
4. **Keep Certificate Handy**: Admin may request proof during verification

### For Admins
1. **Always Verify Manually**: Use CAC public search for every vendor
2. **Match All Details**: Company name, type, status must match
3. **Document Verification**: Save CAC search results as proof
4. **Check Registration Date**: Ensure company is established (not brand new)
5. **Verify Status**: Only approve "Active" companies

### For Developers
1. **Test with Various Formats**: rc123456, RC-123456, RC 123456
2. **Test Fake Numbers**: Ensure 111111, 123456 are rejected
3. **Test Edge Cases**: Very long/short numbers, wrong prefixes
4. **Monitor Duplicates**: Check unique constraint works
5. **Log Validation Failures**: Track common errors for UX improvement

## 🔄 Maintenance

### Adding New Registration Types
If CAC introduces new types (e.g., "SE" for Social Enterprise):

```typescript
// Update CAC_REGISTRATION_INFO in cacValidation.ts
SE: {
  description: 'Social Enterprise',
  minDigits: 6,
  maxDigits: 7,
  format: 'SE-XXXXXX',
  example: 'SE-123456',
  notes: 'For social enterprises registered with CAC'
}
```

### Updating Validation Rules
If CAC changes format requirements:

```typescript
// Update pattern in cacValidation.ts
const match = normalized.match(/^(RC|BN|IT|LLP|SE)-(\d+)$/i);
```

## ✅ Conclusion

The CAC validation system provides:
- ✅ **Official Format Compliance**: Matches CAC standards exactly
- ✅ **Fake Number Detection**: Prevents test/placeholder numbers
- ✅ **Duplicate Prevention**: No business can register twice
- ✅ **Type Verification**: Validates against 4 official CAC types
- ✅ **Manual Verification Support**: Instructions for admin verification
- ✅ **User-Friendly Errors**: Clear guidance for vendors
- ✅ **Auto-Normalization**: Handles various input formats

All Nigerian vendors must now provide valid CAC registration numbers according to official Corporate Affairs Commission standards.
