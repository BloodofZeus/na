// Verify database schema for staff management
const { queryDBOnce } = require('./api/_utils');

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying Database Schema...\n');

  try {
    // Check if users table exists and has correct structure
    console.log('1. Checking users table structure...');
    const tableInfo = await queryDBOnce(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log('');

    // Check current users data
    console.log('2. Checking current users data...');
    const users = await queryDBOnce('SELECT username, role, meta, created_at FROM users ORDER BY created_at');
    console.log('Current users:');
    users.forEach(user => {
      console.log(`  - ${user.username}: ${user.role} (meta: ${JSON.stringify(user.meta)})`);
    });
    console.log('');

    // Test updating a user
    console.log('3. Testing user update...');
    const testUsername = users[0]?.username;
    if (testUsername) {
      console.log(`Testing update on user: ${testUsername}`);
      
      const updateResult = await queryDBOnce(
        'UPDATE users SET meta = $1 WHERE username = $2 RETURNING username, meta',
        [JSON.stringify({ is_active: true, test: true }), testUsername]
      );
      console.log('Update result:', updateResult);
      
      // Verify the update
      const verifyResult = await queryDBOnce(
        'SELECT username, meta FROM users WHERE username = $1',
        [testUsername]
      );
      console.log('Verification result:', verifyResult);
    }
    console.log('');

    console.log('✅ Database schema verification completed!');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
  }
}

// Run the verification
verifyDatabaseSchema();


