import { useState } from 'react'
import LoginCard from './components/login/LoginCard';
import RSAPanel from './components/RSA/RSAPanel';
import './App.css'

function App() {
  const [showRSA, setShowRSA] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <main className="flex min-h-screen items-center bg-slate-200" >
      <section
        className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
          showRSA ? "w-1/2" : "w-full"
        }`}
      >
        <LoginCard 
          onLogin={() => {
            setLoggingIn(true);
            setTimeout(() => {
              setShowRSA(true);
            }, 500);
          }}
          loggingIn={loggingIn}
          email={email}
          setEmail={setEmail}
        />
      </section>
      <section
        className={`transition-all duration-500 ${
          showRSA ? "w-1/2 opacity-100" : "w-0 opacity-0"
        } overflow-hidden`}
      >
        { showRSA &&
          <RSAPanel 
            onClick={() => setShowRSA(false)}
            loggingIn={loggingIn}
            email={email}
          />
        }
      </section>
    </main>
  )
}

export default App
