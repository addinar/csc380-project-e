import { useState } from 'react';
import { User, Lock, Eye, EyeClosed } from 'lucide-react';

export default function LoginCard({ onLogin, loggingIn, email, setEmail }) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (!email) {
            alert("You must enter an email.")
            return;
        }

        if (!password) {
            alert("You must enter a password.")
            return;
        }

        onLogin();
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-300 flex flex-col justify-center items-center space-y-2">
            <p className="text-gray-600 text-xs">RSA Algorithm Demo</p>
            <h3 className="text-xl font-bold font-mono">Sign in 
                <span className="text-blue-800"> Securely</span>
            </h3>
            <p className="text-gray-400 text-xs text-center">
                On login, a one-time session key is generated and <br /> 
                RSA-encrypted before being sent to the server. <br /> 
                Your credentials never travel unprotected.
            </p>
            <div className="flex flex-col w-full !mt-6 space-y-4">
                <div className="flex w-full items-center p-2 space-x-1 border border-slate-300 rounded-xl">
                    <User className="h-5 text-slate-300"/>
                    <input 
                        className="outline-none bg-transparent text-sm w-full"
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex w-full items-center p-2 border border-slate-300 rounded-xl justify-between">
                    <div className="flex space-x-1">
                        <Lock className="h-5 text-slate-300"/>
                        <input 
                            className="outline-none bg-transparent text-sm w-full"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                    className="outline-none"
                    onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ?
                            <Eye className="h-5 text-slate-300" /> :
                            <EyeClosed className="h-5 text-slate-300" />
                        }
                    </button>
                </div>
                <button 
                    className="bg-gray-600 text-gray-100 p-2 text-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition duration-200 ease-in-out"
                    onClick={handleLogin}
                >
                    {loggingIn ? "Logging In Securely..." : "Login Securely"}
                </button>
            </div>
        </div>
    );
}