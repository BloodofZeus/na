// Test script for login error handling
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testLoginErrorHandling() {
  console.log('🧪 Testing Login Error Handling...\n');

  try {
    // Test 1: Valid credentials (should succeed)
    console.log('1. Testing valid credentials...');
    try {
      const validResponse = await axios.post(`${API_BASE}/login`, {
        username: 'admin',
        password: 'admin123'
      });
      console.log('✅ Valid login response:', validResponse.data);
    } catch (error) {
      console.log('ℹ️  Note: Admin user might not exist. Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 2: Invalid username (should return auth error)
    console.log('2. Testing invalid username...');
    try {
      const invalidUserResponse = await axios.post(`${API_BASE}/login`, {
        username: 'nonexistentuser',
        password: 'anypassword'
      });
      console.log('❌ Expected auth error but got success:', invalidUserResponse.data);
    } catch (error) {
      const errorData = error.response?.data;
      console.log('✅ Authentication error response:', errorData);
      if (errorData?.error?.includes('Invalid email or password')) {
        console.log('✅ Correct error message for invalid credentials');
      } else {
        console.log('❌ Unexpected error message:', errorData?.error);
      }
    }
    console.log('');

    // Test 3: Invalid password (should return auth error)
    console.log('3. Testing invalid password...');
    try {
      const invalidPassResponse = await axios.post(`${API_BASE}/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      console.log('❌ Expected auth error but got success:', invalidPassResponse.data);
    } catch (error) {
      const errorData = error.response?.data;
      console.log('✅ Authentication error response:', errorData);
      if (errorData?.error?.includes('Invalid email or password')) {
        console.log('✅ Correct error message for invalid credentials');
      } else {
        console.log('❌ Unexpected error message:', errorData?.error);
      }
    }
    console.log('');

    // Test 4: Missing credentials (should return validation error)
    console.log('4. Testing missing credentials...');
    try {
      const missingCredsResponse = await axios.post(`${API_BASE}/login`, {});
      console.log('❌ Expected validation error but got success:', missingCredsResponse.data);
    } catch (error) {
      const errorData = error.response?.data;
      console.log('✅ Validation error response:', errorData);
      if (errorData?.error?.includes('Please enter both username and password')) {
        console.log('✅ Correct validation error message');
      } else {
        console.log('❌ Unexpected validation error message:', errorData?.error);
      }
    }
    console.log('');

    // Test 5: Test network error simulation (using invalid URL)
    console.log('5. Testing network error simulation...');
    try {
      const networkErrorResponse = await axios.post(`http://invalid-domain-12345.com/api/login`, {
        username: 'admin',
        password: 'admin123'
      }, { timeout: 3000 });
      console.log('❌ Expected network error but got success:', networkErrorResponse.data);
    } catch (error) {
      console.log('✅ Network error caught:', error.code || error.message);
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
        console.log('✅ This is a real network error (would show network error message in frontend)');
      }
    }
    console.log('');

    console.log('🎉 Login error handling tests completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- Authentication errors (401) should show: "Invalid email or password. Please try again."');
    console.log('- Validation errors (400) should show: "Please enter both username and password"');
    console.log('- Server errors (500) should show: "Server error. Please try again later."');
    console.log('- Network errors should show: "Network error. Please check your connection and try again."');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    console.error('Make sure the server is running on localhost:3000');
  }
}

// Run the test
testLoginErrorHandling();
