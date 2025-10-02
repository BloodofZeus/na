// Test script for staff API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testStaffAPI() {
  console.log('🧪 Testing Staff API Endpoints...\n');

  try {
    // Test 1: Get staff
    console.log('1. Testing GET /staff...');
    const getResponse = await axios.get(`${API_BASE}/staff`);
    console.log('✅ GET /staff response:', getResponse.data);
    console.log('');

    // Test 2: Add new staff
    console.log('2. Testing POST /staff...');
    const newStaff = {
      username: 'testuser',
      password: 'testpass123',
      role: 'staff'
    };
    const postResponse = await axios.post(`${API_BASE}/staff`, newStaff);
    console.log('✅ POST /staff response:', postResponse.data);
    console.log('');

    // Test 3: Update staff
    console.log('3. Testing PUT /staff...');
    const updateData = {
      username: 'testuser',
      role: 'admin',
      is_active: false
    };
    const putResponse = await axios.put(`${API_BASE}/staff`, updateData);
    console.log('✅ PUT /staff response:', putResponse.data);
    console.log('');

    // Test 4: Reset password
    console.log('4. Testing PATCH /staff...');
    const resetData = {
      username: 'testuser',
      newPassword: 'newpass123'
    };
    const patchResponse = await axios.patch(`${API_BASE}/staff`, resetData);
    console.log('✅ PATCH /staff response:', patchResponse.data);
    console.log('');

    // Test 5: Verify update
    console.log('5. Verifying update with GET /staff...');
    const verifyResponse = await axios.get(`${API_BASE}/staff`);
    const updatedUser = verifyResponse.data.find(u => u.username === 'testuser');
    console.log('✅ Updated user:', updatedUser);
    console.log('');

    // Test 6: Delete staff
    console.log('6. Testing DELETE /staff...');
    const deleteResponse = await axios.delete(`${API_BASE}/staff`, {
      data: { username: 'testuser' }
    });
    console.log('✅ DELETE /staff response:', deleteResponse.data);
    console.log('');

    // Test 7: Verify deletion
    console.log('7. Verifying deletion with GET /staff...');
    const finalResponse = await axios.get(`${API_BASE}/staff`);
    const deletedUser = finalResponse.data.find(u => u.username === 'testuser');
    console.log('✅ User deleted:', deletedUser ? '❌ Still exists' : '✅ Successfully deleted');
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testStaffAPI();


