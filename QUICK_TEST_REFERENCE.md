# 🎯 QUICK REFERENCE - TESTING CHECKLIST

**Print or bookmark this!** Quick reference for testing the 5 new features.

---

## 📱 TEST IN 3 STEPS

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Open Registration  
```
http://localhost:3000/register
```

### Step 3: Run Tests
```
F12 → Console → Paste TEST_REGISTRATION_SCRIPT.js
```

---

## ✅ VENDOR TEST (5 mins)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Vendor" 🏪 | Vendor form appears |
| 2 | Fill all fields | No validation errors |
| 3 | CHECK "Pay Small Small" 💰 | Checkbox shows checked |
| 4 | Accept terms ✅ | Checkbox enabled |
| 5 | Click "Register" | Success message shows |
| 6 | Wait 1.5 sec | Redirect to /vendor-profile-update |
| 7 | Check form loads | "Pay Small Small" is PRE-CHECKED |

**Success**: ✅ Pay Small Small checkbox checked, redirected to profile page

---

## ✅ INSTALLER TEST (5 mins)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open /register fresh | Clean form |
| 2 | Click "Installer" 🔧 | Installer fields appear |
| 3 | Fill: Jane, Smith, email, phone | Form validates |
| 4 | Enter: SOLAR-100, 5 years, Lagos | Fields accept input |
| 5 | Accept terms ✅ | Checkbox enabled |
| 6 | Click "Register" | Success message |
| 7 | Wait 1.5 sec | Redirect to /installer-profile-update |
| 8 | Check page | Certifications PRE-FILLED: SOLAR-100 |

**Success**: ✅ Redirected to installer profile, fields pre-filled correctly

---

## ✅ CUSTOMER TEST (3 mins)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open /register fresh | Clean form |
| 2 | Click "Customer" 🛒 (default) | Customer form only |
| 3 | NO business fields appear | ✅ Correct! |
| 4 | Fill basic fields | Form validates |
| 5 | Accept terms ✅ | Checkbox enabled |
| 6 | Click "Register" | Success message |
| 7 | Wait 1.5 sec | Redirect to / (home) |
| 8 | Check page | Home page loads, can shop |

**Success**: ✅ Redirected to home, no profile update needed

---

## 🔍 VERIFY IN BROWSER CONSOLE

Run after each registration test:

```javascript
// Check tokens saved
JSON.parse(localStorage.getItem('renewablezmart_current_user'))

// Should show: { firstName: "John", accountType: "vendor", ... }

// Check localStorage
localStorage.getItem('accessToken')      // Should exist
localStorage.getItem('refreshToken')     // Should exist
```

---

## ⚠️ COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| Checkbox not visible | Make sure you clicked "Vendor" first |
| Won't redirect to profile | Check console for errors (F12) |
| Token shows null | Registration may have failed - check error message |
| "Email already registered" | Use new email: testvendor+{time}@gmail.com |
| Console shows error | Refresh page, check TEST_REGISTRATION_SCRIPT.js copied fully |

---

## 📊 CHECKBOX LOCATIONS

**Registration Form** (vendors only)
```
Line 386: <input type="checkbox" name="interestedInPaySmallSmall" ...>
Text: "I am interested in 'Pay Small Small' installment deals 💰"
```

**Vendor Profile Update** (always shows)
```
Line 230: <input type="checkbox" name="interestedInPaySmallSmall" ...>
Text: "Enable 'Pay Small Small' installment deals 💰"
PRE-FILLED: From registration selection
```

---

## 🚀 PASS/FAIL MATRIX

### Feature 1: Pay Small Small Checkbox
- [ ] Visible in vendor registration
- [ ] Can check/uncheck
- [ ] Value saves
- [ ] Pre-fills in profile update
- [ ] Persists after logout/login

**Status**: ☐ PASS ☐ FAIL

### Feature 2: Auto-Login
- [ ] No redirect to login page
- [ ] Tokens saved to localStorage
- [ ] Success message shown
- [ ] 1.5 sec delay before redirect
- [ ] Redirect happens automatically

**Status**: ☐ PASS ☐ FAIL

### Feature 3: Vendor Profile Update
- [ ] Page loads after registration
- [ ] Form fields visible
- [ ] Business name pre-filled
- [ ] "Skip for Now" button works
- [ ] "Save" button works

**Status**: ☐ PASS ☐ FAIL

### Feature 4: Installer Profile Update
- [ ] Page loads after registration
- [ ] Certifications pre-filled
- [ ] Experience pre-filled
- [ ] Service areas pre-filled
- [ ] "Skip for Now" button works

**Status**: ☐ PASS ☐ FAIL

### Feature 5: Conditional Routing
- [ ] Vendor → /vendor-profile-update ✓
- [ ] Installer → /installer-profile-update ✓
- [ ] Customer → / (home) ✓

**Status**: ☐ PASS ☐ FAIL

---

## 📋 TEST FORM DATA

### Vendor Test Email
```
testvendor{timestamp}@example.com
Example: testvendor1703361425@example.com
```

### Installer Test Email
```
testinstaller{timestamp}@example.com
Example: testinstaller1703361425@example.com
```

### Customer Test Email
```
testcustomer{timestamp}@example.com
Example: testcustomer1703361425@example.com
```

**Why timestamp?** Avoid "email already registered" errors!

---

## 📍 URLS TO TEST

| Test | URL | Expected Redirect |
|------|-----|-------------------|
| Vendor Registration | /register?type=vendor | /vendor-profile-update |
| Installer Registration | /register?type=installer | /installer-profile-update |
| Customer Registration | /register | / (home) |
| After Login | /vendor-dashboard | Stay on page |
| After Login | /installer-dashboard | Stay on page |
| No Auth | /vendor-dashboard | Redirect to /login |

---

## 🎯 FINAL CHECKLIST

Before saying "All tests passed!":

- [ ] Ran runAllTests() in console - 6/6 PASSED
- [ ] Vendor registration test completed
- [ ] Installer registration test completed
- [ ] Customer registration test completed
- [ ] Checked localStorage for tokens
- [ ] No console errors (F12 → Console)
- [ ] Checkbox functionality verified
- [ ] All redirects tested
- [ ] Pre-fill functionality verified
- [ ] Can logout and login again

---

## 🎉 RESULT

**When all checks pass**:

```
✅ All new features working!
✅ Ready for Notifications System!
✅ Next: Follow NEXT_STEPS_ACTION_PLAN.md
```

---

## 📞 IF YOU NEED HELP

**Console shows error?**
- Copy full error message
- Tell me the error and what you were testing

**Redirect not happening?**
- Check URL in browser address bar
- Might be redirecting but you don't see it
- Look in localStorage for user data

**Checkbox not visible?**
- Make sure you selected "Vendor" account type first
- Refresh page
- Check if you're on the right test

---

**Test Time**: ~15 minutes for all 3 tests  
**Files Needed**: TEST_REGISTRATION_SCRIPT.js  
**Status**: Ready! 🚀
