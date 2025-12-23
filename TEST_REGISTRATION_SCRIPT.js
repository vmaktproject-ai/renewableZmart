// QUICK TEST SCRIPT - Paste in Browser Console During Registration Test
// Location: http://localhost:3000/register

console.log("🧪 RenewableZmart Registration Test Suite");
console.log("=" .repeat(50));

// TEST 1: Check if Pay Small Small checkbox exists
function testPaySmallSmallCheckbox() {
  const checkbox = document.querySelector('input[name="interestedInPaySmallSmall"]');
  if (checkbox) {
    console.log("✅ TEST 1 PASSED: Pay Small Small checkbox found");
    console.log("   - Checkbox checked:", checkbox.checked);
    console.log("   - Checkbox visible:", checkbox.offsetParent !== null);
    return true;
  } else {
    console.log("❌ TEST 1 FAILED: Pay Small Small checkbox NOT found");
    return false;
  }
}

// TEST 2: Check if account type selector works
function testAccountTypeSelection() {
  const vendorBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Vendor')
  );
  const installerBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Installer')
  );
  const customerBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Customer')
  );
  
  if (vendorBtn && installerBtn && customerBtn) {
    console.log("✅ TEST 2 PASSED: All account type buttons found");
    return true;
  } else {
    console.log("❌ TEST 2 FAILED: Account type buttons missing");
    console.log("   - Vendor:", !!vendorBtn);
    console.log("   - Installer:", !!installerBtn);
    console.log("   - Customer:", !!customerBtn);
    return false;
  }
}

// TEST 3: Check form validation fields
function testFormFields() {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'password', 'confirmPassword'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!document.querySelector(`input[name="${field}"], select[name="${field}"]`)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    console.log("✅ TEST 3 PASSED: All required form fields found");
    return true;
  } else {
    console.log("❌ TEST 3 FAILED: Missing fields:", missingFields);
    return false;
  }
}

// TEST 4: Test Vendor-specific fields
function testVendorFields() {
  const businessNameField = document.querySelector('input[name="businessName"]');
  const businessRegField = document.querySelector('input[name="businessRegNumber"]');
  
  if (businessNameField && businessRegField) {
    console.log("✅ TEST 4 PASSED: Vendor-specific fields found");
    return true;
  } else {
    console.log("❌ TEST 4 FAILED: Vendor fields missing");
    return false;
  }
}

// TEST 5: Test Installer-specific fields
function testInstallerFields() {
  const certificationsField = document.querySelector('input[name="certifications"]');
  const yearsField = document.querySelector('input[name="yearsOfExperience"]');
  
  if (certificationsField && yearsField) {
    console.log("✅ TEST 5 PASSED: Installer-specific fields found");
    return true;
  } else {
    console.log("❌ TEST 5 FAILED: Installer fields missing");
    return false;
  }
}

// TEST 6: Check localStorage setup
function testLocalStorageSetup() {
  const location = localStorage.getItem('renewablezmart_location');
  if (location) {
    console.log("✅ TEST 6 PASSED: Location saved to localStorage");
    console.log("   -", JSON.parse(location));
    return true;
  } else {
    console.log("⚠️  TEST 6 WARNING: Location not yet saved (normal before registration)");
    return true; // Not a failure, just hasn't happened yet
  }
}

// SIMULATION: Vendor Registration
function simulateVendorRegistration() {
  console.log("\n" + "=".repeat(50));
  console.log("🎯 SIMULATING VENDOR REGISTRATION");
  console.log("=".repeat(50));
  
  // Fill vendor form
  document.querySelector('input[name="firstName"]').value = "John";
  document.querySelector('input[name="lastName"]').value = "Vendor";
  document.querySelector('input[name="email"]').value = `test-vendor-${Date.now()}@example.com`;
  document.querySelector('input[name="phone"]').value = "+234 805 123 4567";
  document.querySelector('input[name="password"]').value = "TestPassword123!";
  document.querySelector('input[name="confirmPassword"]').value = "TestPassword123!";
  
  // Select vendor account type
  const vendorBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Vendor')
  );
  vendorBtn?.click();
  
  // Wait for vendor fields to appear
  setTimeout(() => {
    document.querySelector('input[name="businessName"]').value = "Solar Systems Ltd";
    document.querySelector('input[name="businessRegNumber"]').value = "RC-123456";
    
    // Check Pay Small Small
    const checkbox = document.querySelector('input[name="interestedInPaySmallSmall"]');
    if (checkbox && !checkbox.checked) {
      checkbox.click();
    }
    
    console.log("✅ SIMULATION: Vendor form filled");
    console.log("   - First Name: John");
    console.log("   - Business Name: Solar Systems Ltd");
    console.log("   - Pay Small Small: CHECKED");
    console.log("\nNow manually:");
    console.log("   1. Accept terms");
    console.log("   2. Click Register");
    console.log("   3. Watch for auto-login and redirect to /vendor-profile-update");
  }, 1000);
}

// AFTER REGISTRATION: Check tokens
function testTokensAfterRegistration() {
  console.log("\n" + "=".repeat(50));
  console.log("🔐 CHECKING TOKENS (Run this AFTER registration)");
  console.log("=".repeat(50));
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('renewablezmart_current_user');
  
  if (accessToken && refreshToken && user) {
    console.log("✅ TEST PASSED: All tokens saved");
    console.log("   - accessToken:", accessToken.substring(0, 20) + "...");
    console.log("   - refreshToken:", refreshToken.substring(0, 20) + "...");
    console.log("   - User:", JSON.parse(user).firstName, JSON.parse(user).lastName);
    return true;
  } else {
    console.log("❌ TEST FAILED: Tokens missing");
    console.log("   - accessToken:", !!accessToken);
    console.log("   - refreshToken:", !!refreshToken);
    console.log("   - User:", !!user);
    return false;
  }
}

// RUN ALL TESTS
function runAllTests() {
  console.log("\n🧪 RUNNING ALL REGISTRATION TESTS\n");
  
  const results = {
    paySmallSmall: testPaySmallSmallCheckbox(),
    accountTypes: testAccountTypeSelection(),
    formFields: testFormFields(),
    vendorFields: testVendorFields(),
    installerFields: testInstallerFields(),
    localStorage: testLocalStorageSetup(),
  };
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log("✅ Pay Small Small Checkbox:", results.paySmallSmall ? "PASS" : "FAIL");
  console.log("✅ Account Type Selection:", results.accountTypes ? "PASS" : "FAIL");
  console.log("✅ Form Fields:", results.formFields ? "PASS" : "FAIL");
  console.log("✅ Vendor Fields:", results.vendorFields ? "PASS" : "FAIL");
  console.log("✅ Installer Fields:", results.installerFields ? "PASS" : "FAIL");
  console.log("✅ localStorage Setup:", results.localStorage ? "PASS" : "FAIL");
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log(`\n🎯 RESULT: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("✅ ALL TESTS PASSED! Ready for manual registration test.");
    console.log("\nNext steps:");
    console.log("1. Fill in the registration form");
    console.log("2. Click 'Register'");
    console.log("3. Watch for auto-login message");
    console.log("4. Verify redirect to /vendor-profile-update");
    console.log("5. Run testTokensAfterRegistration() to verify tokens");
  } else {
    console.log("⚠️  Some tests failed. Check implementation.");
  }
}

// QUICK COMMANDS
console.log("\n📝 AVAILABLE TEST COMMANDS:\n");
console.log("runAllTests()                    - Run all pre-registration tests");
console.log("testPaySmallSmallCheckbox()      - Check Pay Small Small checkbox");
console.log("testAccountTypeSelection()       - Check account type buttons");
console.log("testFormFields()                 - Check required fields");
console.log("testVendorFields()               - Check vendor fields");
console.log("testInstallerFields()            - Check installer fields");
console.log("simulateVendorRegistration()     - Auto-fill vendor form");
console.log("testTokensAfterRegistration()    - Check tokens AFTER registration");

console.log("\n💡 TIP: Run runAllTests() to start!");
console.log("=" .repeat(50) + "\n");

// Auto-run all tests on page load
runAllTests();
