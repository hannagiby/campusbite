const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/users/register', {
            name: "Test User",
            username: "23cs999",
            email: "test@cs.sjcetpalai.ac.in",
            password: "password123",
            role: "Student"
        });
        console.log("Success:", res.data);
    } catch (err) {
        if (err.response) {
            console.log("Error Status:", err.response.status);
            console.log("Error Data:", err.response.data);
        } else {
            console.log("Error Message:", err.message);
        }
    }
}

test();
