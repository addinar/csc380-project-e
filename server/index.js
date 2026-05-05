const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -- FUNCTIONS AND VARIABLES

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};
  
const generatePrime = (min = 50, max = 200) => {
    while (true) {
        const num = Math.floor(Math.random() * (max - min)) + min;
        if (isPrime(num)) return num;
    }
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const modInverse = (e, phi) => {
    for (let d = 1; d < phi; d++) {
        if ((e * d) % phi === 1) return d;
    }
    return null;
};



// -- ROUTES

let privateKeyStore = {};

app.get("/api/public-key", (req, res) => {
    let p = generatePrime();
    let q = generatePrime();

    while (q === p) {
        q = generatePrime();
    }

    const n = p * q;
    const z = (p - 1) * (q - 1);

    let e = 3;
    while (gcd(e, z) !== 1) {
        e += 2;
    }

    const d = modInverse(e, z);

    privateKeyStore["demo"] = d;

    res.json({
        p, q, n, z, e, d
    });
});



app.listen(5050, () => {
    console.log("Server running on http://localhost:5050");
});