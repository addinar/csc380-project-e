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

const encodeASCII = (text) => {
    return text
        .split("")
        .map(char => char.charCodeAt(0).toString().padStart(3, "0"))
        .join("");
};

const decodeASCII = (numStr) => {
    let result = "";
    for (let i = 0; i < numStr.length; i += 3) {
        const chunk = numStr.slice(i, i + 3);
        result += String.fromCharCode(parseInt(chunk));
    }
    return result;
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
    const sessionId = Date.now().toString();

    privateKeyStore[sessionId] = {d, n, e};

    res.json({
        sessionId,
        p, q, n, z, e, d
    });
});

app.post("/api/auth/session", (req, res) => {
    const {encryptedKey, sessionId} = req.body;
    const {d, n} = privateKeyStore[sessionId] || {};

    if (!d || !n) {
        return res.status(400).json({error: "Invalid session"});
    }

    // Decrypt each block: m = C^d mod n
    const decryptedCodes = encryptedKey.map(cipher => {
        // Modular exponentiation: cipher^d mod n
        let result = 1n;
        let base = BigInt(cipher);
        let exponent = BigInt(d);
        let modulus = BigInt(n);

        while (exponent > 0) {
            if (exponent & 1n) {
                result = (result * base) % modulus;
            }
            base = (base * base) % modulus;
            exponent >>= 1n;
        }
        return Number(result);
    });

    // Convert codes to string
    const codeString = decryptedCodes.map(code => code.toString().padStart(3, "0")).join("");
    const sessKey = decodeASCII(codeString);

    res.json({
        success: true,
        message: "Session key decrypted successfully",
        decryptedCodes,
        decodedKey: sessKey
    });
});

app.listen(5050, () => {
    console.log("Server running on http://localhost:5050");
});