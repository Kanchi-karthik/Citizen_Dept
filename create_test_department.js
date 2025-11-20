const axios = require('axios');

async function createTestDepartment() {
  try {
    const response = await axios.post('http://localhost:5000/api/departments', {
      departmentName: 'Test Department',
      departmentCode: 'TEST001',
      headName: 'Test Head',
      contactEmail: 'test@department.com',
      contactNumber: '1234567890',
      city: 'Test City',
      state: 'Test State',
      address: '123 Test Street',
      description: 'This is a test department for login purposes',
      website: 'https://testdepartment.com',
      establishedYear: 2020,
      employeeCount: 50,
      username: 'testuser',
      password: 'testpass123'
    });
    
    console.log('Department created successfully:');
    console.log('Username: testuser');
    console.log('Password: testpass123');
    console.log('Department ID:', response.data._id);
  } catch (error) {
    console.error('Error creating department:', error.response ? error.response.data : error.message);
  }
}

createTestDepartment();