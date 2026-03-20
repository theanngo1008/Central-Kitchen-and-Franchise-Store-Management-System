async function test() {
  try {
    const loginRes = await fetch('https://centralkitchenandfranchisestoremanagemen.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UsernameOrEmail: 'manager_1',
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    console.log("LOGIN RESPONSE:", JSON.stringify(loginData, null, 2));

    const token = loginData?.data?.accessToken;
    if (!token) return;
    
    const bomsRes = await fetch('https://centralkitchenandfranchisestoremanagemen.onrender.com/api/boms?pageSize=1000', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bomsData = await bomsRes.json();
    
    console.log("BOMS DATA:", JSON.stringify(bomsData, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
