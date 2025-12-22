# Phone Number Validation System

## Overview
Comprehensive phone number validation system implemented across frontend and backend to ensure all phone numbers are valid for their respective countries and prevent fake/dummy numbers.

## Features

### ✅ Country-Specific Validation
- **40+ African Countries Supported** with specific validation rules
- Each country has custom regex patterns matching their phone number format
- Automatic format detection and validation

### ✅ Fake Number Detection
- Blocks repeated digits (0000000000, 1111111111, etc.)
- Blocks sequential numbers (123456789, 987654321)
- Blocks common test prefixes (555..., 000..., 999...)

### ✅ Format Guidance
- Shows expected format per country (e.g., "+234 XXX XXX XXXX" for Nigeria)
- Dynamic placeholder updates based on selected country
- Real-time validation feedback

## Supported Countries

### Major Countries with Full Validation:
- 🇳🇬 **Nigeria**: +234 XXX XXX XXXX (11-14 digits)
- 🇿🇦 **South Africa**: +27 XX XXX XXXX (10-12 digits)
- 🇰🇪 **Kenya**: +254 XXX XXX XXX (10-13 digits)
- 🇬🇭 **Ghana**: +233 XXX XXX XXX (10-13 digits)
- 🇪🇬 **Egypt**: +20 XXX XXX XXXX (10-13 digits)
- And 35+ more African countries...

## Implementation

### Frontend Validation
**Files Updated:**
1. `pages/register.tsx` - Registration form
2. `pages/vendor-dashboard.tsx` - Store profile updates
3. `pages/installer-dashboard.tsx` - Installer profile updates
4. `lib/phoneValidation.ts` - Core validation logic

**Features:**
- Real-time validation on form submission
- Country-specific format hints
- Dynamic placeholders based on country selection
- User-friendly error messages

### Backend Validation
**Files Updated:**
1. `backend/src/controllers/authController.ts` - User registration
2. `backend/src/controllers/storeController.ts` - Store updates
3. `backend/src/controllers/installmentController.ts` - Installment applications
4. `backend/src/routes/users.ts` - Profile updates
5. `backend/src/utils/phoneValidation.ts` - Core validation logic

**Features:**
- Server-side validation for all phone number inputs
- Prevents invalid data from entering database
- Returns descriptive error messages
- Country-aware validation

## Validation Rules by Country

### Nigeria 🇳🇬
- **Pattern**: `^(\+234|234|0)(70|80|81|90|91)[0-9]{8}$`
- **Format**: +234 XXX XXX XXXX
- **Length**: 11-14 digits
- **Valid Prefixes**: 070, 080, 081, 090, 091
- **Examples**: 
  - ✅ +234 803 123 4567
  - ✅ 08031234567
  - ❌ +234 555 555 5555 (fake)
  - ❌ 01234567890 (invalid prefix)

### South Africa 🇿🇦
- **Pattern**: `^(\+27|27|0)[1-8][0-9]{8}$`
- **Format**: +27 XX XXX XXXX
- **Length**: 10-12 digits

### Kenya 🇰🇪
- **Pattern**: `^(\+254|254|0)[17][0-9]{8}$`
- **Format**: +254 XXX XXX XXX
- **Length**: 10-13 digits

### Ghana 🇬🇭
- **Pattern**: `^(\+233|233|0)[2-5][0-9]{8}$`
- **Format**: +233 XXX XXX XXX
- **Length**: 10-13 digits

## Blocked Patterns

### Repeated Digits
- ❌ 0000000000
- ❌ 1111111111
- ❌ 2222222222
- ❌ All repeated digit combinations

### Sequential Numbers
- ❌ 123456789
- ❌ 987654321
- ❌ 111111111

### Test Prefixes
- ❌ 555... (common test prefix)
- ❌ 000... (invalid prefix)
- ❌ 999... (often fake)

## Usage Examples

### Frontend Example:
```typescript
import { validatePhoneNumber, getPhoneInfo } from '@/lib/phoneValidation'

// Validate a phone number
const validation = validatePhoneNumber('+234 803 123 4567', 'Nigeria')
if (!validation.isValid) {
  console.error(validation.error)
}

// Get format info for a country
const info = getPhoneInfo('Nigeria')
console.log(info?.format) // "+234 XXX XXX XXXX"
```

### Backend Example:
```typescript
import { validatePhoneNumber } from '../utils/phoneValidation'

const phoneValidation = validatePhoneNumber(phone, country)
if (!phoneValidation.isValid) {
  return res.status(400).json({ 
    message: phoneValidation.error 
  })
}
```

## Error Messages

### Common Error Messages:
- "Phone number is required"
- "This appears to be a fake or test number. Please enter a valid phone number."
- "Phone number must be between X and Y digits for [Country]"
- "Invalid phone number format for [Country]. Expected format: [Format]"
- "Please enter a valid phone number"

## Testing

### Test Cases:
1. **Valid Numbers**: ✅ Should accept valid numbers for each country
2. **Fake Numbers**: ❌ Should reject repeated/sequential digits
3. **Wrong Format**: ❌ Should reject numbers not matching country pattern
4. **Wrong Length**: ❌ Should reject too short/long numbers
5. **Invalid Prefix**: ❌ Should reject invalid mobile prefixes

### Sample Test Data:

#### Nigeria Valid:
- +234 803 123 4567
- 08031234567
- 2348031234567

#### Nigeria Invalid:
- 0000000000 (fake)
- 1234567890 (wrong format)
- +234 555 555 5555 (test prefix)
- 080312345 (too short)

## Benefits

1. **Data Quality**: Only valid phone numbers stored in database
2. **User Trust**: Prevents fake registrations and improves authenticity
3. **Communication**: Ensures contact information is reachable
4. **Country-Aware**: Respects international phone number formats
5. **User-Friendly**: Clear error messages guide users to correct format

## Future Enhancements

- Real-time phone carrier lookup
- SMS verification integration
- Phone number formatting on input
- Auto-detect country from phone prefix
- Additional countries outside Africa
