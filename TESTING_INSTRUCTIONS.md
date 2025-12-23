# 🧪 TESTING INSTRUCTIONS - New Features

**Status**: Ready for manual testing  
**Test Date**: December 23, 2025

---

## 📋 Quick Summary

All new features have been **code-verified** ✅. Now we need to **test them in the browser** before starting the Notifications System.

**What to test**:
1. ✅ Vendor registration with "Pay Small Small" checkbox
2. ✅ Auto-login after registration
3. ✅ Redirect to vendor profile update
4. ✅ Redirect to installer profile update
5. ✅ Customer registration (no profile update)

---

## 🚀 How to Run Tests

### Step 1: Start Development Server
```bash
npm run dev
```
Should show: `ready - started server on 0.0.0.0:3000, url: http://localhost:3000`

### Step 2: Open Browser
```
http://localhost:3000/register
```

### Step 3: Open Browser Console
```
Windows/Linux: F12 or Ctrl + Shift + J
Mac: Cmd + Option + J
```

### Step 4: Paste Test Script
Copy all code from `TEST_REGISTRATION_SCRIPT.js` and paste into console.

**The script will automatically run all pre-registration tests.**

---

## 🧪 Test Scenario #1: Vendor Registration (Most Important)

**Objective**: Verify vendor registration flow with Pay Small Small checkbox

### Steps:
```
1. Open http://localhost:3000/register
2. Open browser console (F12)
3. Paste TEST_REGISTRATION_SCRIPT.js code
4. Script runs runAllTests() automatically
5. Verify all 6 tests pass in console
```

**Pre-Registration Tests Expected Output**:
```
✅ Pay Small Small Checkbox: PASS
✅ Account Type Selection: PASS
✅ Form Fields: PASS
✅ Vendor Fields: PASS
✅ Installer Fields: PASS
✅ localStorage Setup: PASS

🎯 RESULT: 6/6 tests passed!
```

### Manual Registration Steps:
```
1. Click "Vendor" button (blue box with 🏪)
2. Fill in form:
   - First Name: John
   - Last Name: Solar
   - Email: testvendor@{timestamp}@example.com  (use unique email!)
   - Phone: +234 805 123 4567
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
   - Country: Nigeria
   - City: Lagos
   - Business Name: Solar Systems Ltd
   - Business Reg Number: RC-123456
3. IMPORTANT: ✅ CHECK the "Pay Small Small" checkbox
4. IMPORTANT: ✅ CHECK "I accept the terms"
5. Click "Register" button
6. WAIT 1.5 seconds and OBSERVE:
   ✅ Should see: "✅ Registration successful! Auto-logging in..."
   ✅ Should NOT see login page
   ✅ Should redirect to /vendor-profile-update
7. In browser console, run: testTokensAfterRegistration()
8. Verify output shows tokens saved
```

**Expected Result After Registration**:
```
✅ Registration successful! Auto-logging in... (message shown)
✅ Page redirects to /vendor-profile-update
✅ Vendor profile page loads with form
✅ "Pay Small Small" checkbox is CHECKED
✅ Business Name is PRE-FILLED: "Solar Systems Ltd"
✅ testTokensAfterRegistration() shows:
   - accessToken: (long string starting with...)
   - refreshToken: (long string starting with...)
   - User: John Solar

testTokensAfterRegistration() → PASS
```

---

## 🧪 Test Scenario #2: Installer Registration

**Objective**: Verify installer registration and redirect to installer profile

### Steps:
```
1. Open http://localhost:3000/register (FRESH page, no cache)
2. Click "Installer" button (green box with 🔧)
3. Fill in form:
   - First Name: Jane
   - Last Name: Install
   - Email: testinstaller@{timestamp}@example.com
   - Phone: +234 703 987 6543
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
   - Country: Nigeria
   - City: Abuja
   - Certifications: SOLAR-100
   - Years of Experience: 5
   - Service Areas: Lagos, Abuja
4. ✅ CHECK "I accept the terms"
5. Click "Register"
6. WAIT and OBSERVE:
   ✅ "✅ Registration successful! Auto-logging in..." message
   ✅ Should NOT go to login
   ✅ Should redirect to /installer-profile-update
7. In console, run: testTokensAfterRegistration()
```

**Expected Result**:
```
✅ Redirect to /installer-profile-update
✅ Installer profile page loads
✅ Form has installer-specific fields:
   - Certifications (PRE-FILLED: SOLAR-100)
   - Years of Experience (PRE-FILLED: 5)
   - Service Areas (PRE-FILLED: Lagos, Abuja)
   - Professional bio (empty, required)
   - Insurance details
   - Banking details
✅ testTokensAfterRegistration() → PASS
```

---

## 🧪 Test Scenario #3: Customer Registration

**Objective**: Verify customer goes straight to home, no profile update

### Steps:
```
1. Open http://localhost:3000/register (FRESH page)
2. Click "Customer" button (default, blue box with 🛒)
3. Fill in form:
   - First Name: Mike
   - Last Name: Shop
   - Email: testcustomer@{timestamp}@example.com
   - Phone: +234 701 234 5678
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
   - Country: Nigeria
   - City: Ibadan
4. NOTE: No business/installer fields should appear ✅
5. ✅ CHECK "I accept the terms"
6. Click "Register"
7. WAIT and OBSERVE:
   ✅ "✅ Registration successful! Auto-logging in..."
   ✅ Should redirect to / (HOME PAGE)
   ✅ NOT to profile update page
```

**Expected Result**:
```
✅ No business/installer fields visible for customers ✅
✅ Redirect to home page (/)
✅ Customer can shop immediately
✅ testTokensAfterRegistration() → PASS
✅ Can click on products without profile setup
```

---

## 🧪 Test Scenario #4: Pay Small Small Checkbox Behavior

**Objective**: Verify checkbox works and persists

### Steps:
```
1. Go to /register
2. Select Vendor
3. Locate "Pay Small Small" checkbox
4. Try these actions:
   a) Click checkbox to CHECK it
   b) Click again to UNCHECK it
   c) Observe button styling changes (blue-50 bg when checked)
5. Leave checked ✅
6. Fill form and register
7. On vendor profile page, verify:
   - Checkbox is CHECKED (pre-filled from registration)
   - Can click to toggle it
8. Click Save Profile
9. Logout and login again
10. Verify checkbox state persisted
```

**Expected Result**:
```
✅ Checkbox responds to clicks immediately
✅ Visual feedback (blue-50 background when checked)
✅ Value saves during registration
✅ Value pre-fills on profile update page
✅ Value persists after logout/login
```

---

## 🔍 Verification Checklist

Run through this checklist after each test:

### Vendor Registration Test
- [ ] Form loads with all fields
- [ ] "Pay Small Small" checkbox is visible
- [ ] Checkbox can be checked/unchecked
- [ ] Registration completes without errors
- [ ] Success message shown: "✅ Registration successful! Auto-logging in..."
- [ ] Wait 1.5 seconds → Redirects to /vendor-profile-update
- [ ] Vendor profile page loads
- [ ] Business details pre-filled from registration
- [ ] "Pay Small Small" checkbox is pre-checked
- [ ] No console errors (F12 → Console tab should be clean)
- [ ] testTokensAfterRegistration() outputs tokens

### Installer Registration Test
- [ ] Form loads with installer fields
- [ ] All installer fields visible (certifications, years, areas)
- [ ] Registration completes
- [ ] Success message shown
- [ ] Redirects to /installer-profile-update (NOT vendor page)
- [ ] Installer profile page loads
- [ ] Certifications pre-filled
- [ ] Years of experience pre-filled
- [ ] Service areas pre-filled
- [ ] Bio field is empty (required field)
- [ ] No console errors
- [ ] testTokensAfterRegistration() outputs tokens

### Customer Registration Test
- [ ] Only customer fields appear (no business fields)
- [ ] Registration completes
- [ ] Success message shown
- [ ] Redirects to / (home page)
- [ ] NOT redirected to profile update page
- [ ] Can shop immediately
- [ ] No console errors

---

## 🐛 If Tests Fail...

### Problem: "Pay Small Small" checkbox not visible
**Solution**: 
1. Make sure you selected "Vendor" account type
2. Refresh page and try again
3. Check browser console for errors: F12 → Console tab
4. Clear browser cache: Ctrl+Shift+Delete

### Problem: Not redirecting to profile update page
**Solution**:
1. Check browser console for errors
2. Check localStorage: Open DevTools → Application → Local Storage
3. Should have: `renewablezmart_current_user` with correct account type
4. Try in incognito mode (fresh cache)

### Problem: "testTokensAfterRegistration() is not defined"
**Solution**:
1. Make sure you pasted the entire TEST_REGISTRATION_SCRIPT.js into console
2. Scroll up in console to find errors
3. Try running: `runAllTests()` first

### Problem: "Email already registered"
**Solution**:
- Use a new email address each time
- Format: testvendor{timestamp}@example.com
- Or use: testvendor+{random}@gmail.com

---

## 📊 Expected Console Output

After pasting script and running tests, you should see:

```
🧪 RenewableZmart Registration Test Suite
==================================================

✅ TEST 1 PASSED: Pay Small Small checkbox found
   - Checkbox checked: false
   - Checkbox visible: true
✅ TEST 2 PASSED: All account type buttons found
✅ TEST 3 PASSED: All required form fields found
✅ TEST 4 PASSED: Vendor-specific fields found
✅ TEST 5 PASSED: Installer-specific fields found
⚠️  TEST 6 WARNING: Location not yet saved (normal before registration)

==================================================
📊 TEST SUMMARY
==================================================
✅ Pay Small Small Checkbox: PASS
✅ Account Type Selection: PASS
✅ Form Fields: PASS
✅ Vendor Fields: PASS
✅ Installer Fields: PASS
✅ localStorage Setup: PASS

🎯 RESULT: 6/6 tests passed!
✅ ALL TESTS PASSED! Ready for manual registration test.
```

---

## 🎯 Success Criteria

All features are working correctly when:

1. ✅ Vendor can register with "Pay Small Small" checkbox
2. ✅ Installer can register without vendor fields
3. ✅ Customer can register without business/installer fields
4. ✅ After registration, auto-login happens (no login page)
5. ✅ Vendor redirects to /vendor-profile-update
6. ✅ Installer redirects to /installer-profile-update
7. ✅ Customer redirects to / (home)
8. ✅ Tokens saved in localStorage
9. ✅ Pre-filled fields work correctly
10. ✅ No console errors

---

## 📝 Test Report Template

**Test Date**: ___________  
**Tester**: ___________  
**Browser**: ___________  

### Vendor Test
- [ ] PASS
- [ ] FAIL - Issue: ___________

### Installer Test
- [ ] PASS
- [ ] FAIL - Issue: ___________

### Customer Test
- [ ] PASS
- [ ] FAIL - Issue: ___________

### Overall Status
- [ ] ✅ ALL TESTS PASSED - Ready for Notifications System!
- [ ] ❌ ISSUES FOUND - Need fixes before proceeding

---

## 🎉 Next Steps

**Once all tests pass** ✅:

1. All new features verified ✅
2. Ready to start **Notifications System** 🔔
3. Reference [NEXT_STEPS_ACTION_PLAN.md](NEXT_STEPS_ACTION_PLAN.md)
4. Build notifications as described

**If issues found**:
1. Note them in the test report
2. Let me know the specific issue
3. I'll fix the code immediately
4. Re-run tests
5. Continue when all pass

---

**Status**: 🚀 READY FOR TESTING  
**Instructions**: Follow scenarios 1-4 above  
**Files**: TEST_REGISTRATION_SCRIPT.js (paste in console)  
**Good Luck!** 🎯
