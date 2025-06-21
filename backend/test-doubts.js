const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDoubts() {
  try {
    console.log('Testing doubts endpoint...');
    
    // First, let's login to get a valid token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'naitikv2311@gmail.com',
        password: '225252'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.log('Login failed:', loginData);
      return;
    }

    const token = loginData.token;
    console.log('Got token, testing doubts endpoint...');

    // Test posting a doubt
    const doubtData = {
      subject: 'Mathematics',
      title: 'Test Doubt Title',
      description: 'This is a test doubt description with enough characters to meet the minimum requirement.'
    };

    const doubtResponse = await fetch('http://localhost:5000/api/doubts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(doubtData)
    });

    console.log('Doubt response status:', doubtResponse.status);
    console.log('Doubt response headers:', Object.fromEntries(doubtResponse.headers.entries()));
    
    const doubtResponseData = await doubtResponse.json();
    console.log('Doubt response body:', JSON.stringify(doubtResponseData, null, 2));

  } catch (error) {
    console.error('Error testing doubts:', error);
  }
}

testDoubts(); 