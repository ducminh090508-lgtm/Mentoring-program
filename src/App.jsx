import './App.css'
import { AuthProvider } from './context/AuthContext'
import AuthApp from './components/AuthApp'

function App() {
  return (
    <AuthProvider>
      <AuthApp />
    </AuthProvider>
  )
}

export default App
