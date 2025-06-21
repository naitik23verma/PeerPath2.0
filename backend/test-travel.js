const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTravelCompanions() {
  try {
    console.log('Testing travel companion functionality...');
    
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
    console.log('Got token, testing travel companion endpoints...');

    // Test adding a travel plan
    const travelPlanData = {
      destination: 'University Campus',
      date: new Date().toISOString(),
      transportMode: 'bus',
      description: 'Going to campus for classes'
    };

    console.log('Adding travel plan:', travelPlanData);

    const addPlanResponse = await fetch('http://localhost:5000/api/location/travel-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(travelPlanData)
    });

    console.log('Add travel plan response status:', addPlanResponse.status);
    
    const addPlanData = await addPlanResponse.json();
    console.log('Add travel plan response:', addPlanData);

    if (addPlanResponse.ok) {
      // Test finding travel companions
      console.log('\nFinding travel companions...');
      
      const companionsResponse = await fetch('http://localhost:5000/api/location/travel-companions?destination=University Campus', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Find companions response status:', companionsResponse.status);
      
      const companionsData = await companionsResponse.json();
      console.log('Travel companions found:', companionsData);

      // Test getting user's own travel plans
      console.log('\nGetting user travel plans...');
      
      const userPlansResponse = await fetch('http://localhost:5000/api/location/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('User plans response status:', userPlansResponse.status);
      
      const userPlansData = await userPlansResponse.json();
      console.log('User travel plans:', userPlansData);

      // Test with a different destination to see if it finds companions
      console.log('\nTesting with different destination...');
      
      const differentDestResponse = await fetch('http://localhost:5000/api/location/travel-companions?destination=Shopping Mall', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Different destination response status:', differentDestResponse.status);
      
      const differentDestData = await differentDestResponse.json();
      console.log('Travel companions for Shopping Mall:', differentDestData);
    }

  } catch (error) {
    console.error('Error testing travel companions:', error);
  }
}

testTravelCompanions(); 