import {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import LogEntry from './LogEntry';

export default function RSAPanel({onClick, loggingIn, email}) {
    const [serverLogs, setServerLogs] = useState([]);
    const [clientLogs, setClientLogs] = useState([]);

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    async function updateServerLogs(newEntries) {
        for (let entry of newEntries) {
            await delay(700);

            setServerLogs(prev => {
                const updated = [...prev];
                const lastLog = updated[updated.length - 1];

                return [
                    ...updated.slice(0, -1),
                    {
                        ...lastLog,
                        entries: [...lastLog.entries, entry]
                    }
                ];
            });
        }
    }

    async function updateClientLogs(newEntries) {
        for (let entry of newEntries) {
            await delay(700);

            setClientLogs(prev => {
                const updated = [...prev];
                const lastLog = updated[updated.length - 1];

                return [
                    ...updated.slice(0, -1),
                    {
                        ...lastLog,
                        entries: [...lastLog.entries, entry]
                    }
                ];
            });
        }
    }

    const generateSessionKey = () => {
        const array = new Uint8Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    };

    const encodeASCII = (text) => {
        return text
            .split("")
            .map(char => char.charCodeAt(0).toString().padStart(3, "0"))
            .join("");
    };

    const rsaEncrypt = (message, e, n) => {
        // Convert each character to its ASCII code and encrypt
        const codes = message.split("").map(char => char.charCodeAt(0));

        // Encrypt each code: C = m^e mod n
        const encrypted = codes.map(m => {
            let result = 1n;
            let base = BigInt(m);
            let exponent = BigInt(e);
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

        return encrypted;
    };

    const chunkString = (str, size = 15) => {
        const chunks = [];
      
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.slice(i, i + size));
        }
      
        return chunks;
    };

    useEffect(() => {
        const computeRSA = async () => {
            if (!loggingIn) return;

            // 1a. Request public key

            await new Promise(res => setTimeout(res, 700));
            setClientLogs(prev => [...prev,
                {
                    "step": "1A",
                    "title": "Requesting public key...",
                    "entries": [
                        {
                            "content": "GET /api/public-key",
                            "color": "yellow"
                        }
                    ]
                }
            ]);

            // 1b. Generate RSA key pair
            await new Promise(res => setTimeout(res, 1000));
            const res = await fetch("http://localhost:5050/api/public-key");
            const data = await res.json();

            const sessionId = data.sessionId;
            const p = data.p;
            const q = data.q;
            const n = data.n;
            const z = data.z;
            const e = data.e;
            const d = data.d;

            setServerLogs(prev => [...prev,
                {
                    step: "1B",
                    title: "Generating RSA key pair...",
                    entries: [
                        {content: "Choose primes p, q", color: "yellow"},
                    ]
                }
            ]);

            let newEntries = [
                {content: `p = ${p}, q = ${q}`, color: "white"},
                {content: `n = p * q = ${n}`, color: "white"},
                {content: `z = (p-1)(q-1) = ${z}`, color: "white"},
                {content: `e = ${e} (gcd(e,z) = 1)`, color: "green"},
                {content: `d = ${d}`, color: "red"}
            ];

            await updateServerLogs(newEntries);

            // Back to 1A - receive n and e
            await new Promise(res => setTimeout(res, 1000));
            newEntries = [
                {content: `Received n = ${n}`, color: "green"},
                {content: `Received e = ${e}`, color: "green"}
            ]

            await updateClientLogs(newEntries);

            // 2 - Generate session key
            await new Promise(res => setTimeout(res, 1000));

            setClientLogs(prev => [...prev,
                {
                    step: "2",
                    title: "Generating session key...",
                    entries: [
                        {content: "Random symmetric key for this session.", color: "yellow"},
                    ]
                }
            ]);

            const sessKey = generateSessionKey();
            newEntries = [
                {content: `sessKey="${sessKey}"`, color: "green"}
            ];
            updateClientLogs(newEntries);

            // Encrypt session key with RSA
            await delay(1000);

            setClientLogs(prev => [...prev,
                {
                    step: "3",
                    title: "Encrypting session key with RSA...",
                    entries: [
                        {content: `C = mᵉ mod n using e = ${e}, n = ${n}`, color: "yellow"},
                    ]
                }
            ]);

            // Encode session key to ASCII then encrypt
            const encryptedBlocks = rsaEncrypt(sessKey, e, n);

            newEntries = [
                {
                    content: `Cipher codes: ${encryptedBlocks.slice(0, 3).join(", ")}${encryptedBlocks.length > 3 ? ", ..." : ""}`,
                    color: "green"
                },
                {content: `${encryptedBlocks.length} blocks – session key is now unreadable`, color: "white"}
            ];
            await updateClientLogs(newEntries);

            // Send encrypted key to server
            await delay(1000);

            setClientLogs(prev => [...prev,
                {
                    step: "4",
                    title: "Sending encrypted key to server...",
                    entries: [
                        {content: "POST /api/auth/session", color: "yellow"},
                        {
                            content: `Payload: [${encryptedBlocks.slice(0, 3).join(", ")}${encryptedBlocks.length > 3 ? ", ..." : ""}]`,
                            color: "green"
                        },
                        {content: "Transmitted – only server can decrypt", color: "white"}
                    ]
                }
            ]);

            // Server receives and decrypts
            await delay(1000);

            setServerLogs(prev => [...prev,
                {
                    step: "5",
                    title: "Received encrypted session key...",
                    entries: [
                        {content: "m = Cᵈ mod n using d, n", color: "yellow"},
                    ]
                }
            ]);

            // Send to backend for decryption
            const decryptRes = await fetch("http://localhost:5050/api/auth/session", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    encryptedKey: encryptedBlocks,
                    sessionId: sessionId
                })
            });

            const decryptData = await decryptRes.json();

            newEntries = [
                {content: `Decrypted codes → ASCII → chars`, color: "white"},
                {content: `sessKey = "${decryptData.decodedKey}"`, color: "green"},
                {content: `Keys match – handshake complete`, color: "green"}
            ];
            await updateServerLogs(newEntries);

            // Secure channel established
            await delay(1000);

            setServerLogs(prev => [...prev,
                {
                    step: "6",
                    title: "Secure channel established",
                    entries: [
                        {content: `User "${email}" authenticated`, color: "green"},
                        {content: "Symmetric encryption now active", color: "white"}
                    ]
                }
            ]);
        };

        computeRSA();
    }, [loggingIn]);

    const cards = [
        {
            "title": "CLIENT",
            "textColor": "text-green-300",
            "dotColor": "bg-green-300",
            "logs": clientLogs
        },
        {
            "title": "SERVER",
            "textColor": "text-blue-300",
            "dotColor": "bg-blue-300",
            "logs": serverLogs
        },
    ];

    return (
        <div
            className="fixed top-0 right-0 h-full bg-slate-800 w-1/2 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] flex flex-col space-y-3">
            <div className="fixed top-0 p-4 w-1/2 flex justify-end">
                <button
                    className="border-gray-400 border p-0.5 rounded-md bg-gray-600 text-gray-400 hover:text-gray-100 hover:border-gray-100 transition duration-500"
                    onClick={onClick}
                >
                    <X className="w-5 h-5"/>
                </button>
            </div>
            <div className="p-5 border-b border-gray-600">
                <h3 className="text-gray-200 font-mono text-center font-bold text-lg">
                    RSA {" "}
                    <span className="text-green-300">
                        Under the Hood
                    </span>
                </h3>
                <p className="text-gray-400 text-xs text-center">
                    See how a session key is encrypted and decrypted after login.
                </p>
            </div>
            <div className="h-[calc(100%-58px)] overflow-y-scroll !mt-0">
                <section className="w-full p-4">
                    <p className="text-gray-400 text-xs font-bold font-mono">01 Live Activity</p>
                    <div className="flex w-full justify-between space-x-4">
                        {cards.map((c, idx) => (
                            <div key={idx} className="border flex-1 border-gray-600 w-60 mt-4 rounded-xl bg-gray-700">
                                <div
                                    className="flex justify-start w-full border-b border-gray-600 p-2 items-center space-x-2">
                                    <div className={`h-2 w-2 ${c.dotColor} rounded-full`}/>
                                    <p className={`font-mono text-xs font-bold ${c.textColor}`}>{c.title}</p>
                                </div>
                                <div className="p-4">
                                    {c.logs.map((l, logIdx) => (
                                        <div key={logIdx} className="w-full p-2 pb-4 flex border-b border-gray-600 border-opacity-40 space-x-1
                                            transition-all duration-500 ease-out opacity-0
                                            translate-y-2 animate-[fadeIn_0.4s_forwards]">
                                            <div className="w-full flex space-x-1 items-start">
                                                <div className={`h-1 w-1 ${c.dotColor} rounded-full mt-1`}/>
                                                <p className="text-[9px] text-gray-500 font-mono">
                                                    {l.step}
                                                </p>
                                                <div className="flex flex-col w-full">
                                                    <p className="text-[10px] text-gray-400 font-mono">
                                                        {l.title}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {l.entries.map((e, i) => (
                                                            <LogEntry
                                                                key={i + e.content}
                                                                content={e.content}
                                                                color={e.color}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}