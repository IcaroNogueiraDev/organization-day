import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { WelcomePage } from './pages/WelcomePage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { NewPasswordPage } from './pages/NewPasswordPage'
import { AgendaPage } from './pages/AgendaPage'

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<WelcomePage />} />
                    <Route path='/entrar' element={<LoginPage />} />
                    <Route path='/cadastro' element={<SignUpPage />} />
                    <Route path='/esqueci-senha' element={<ForgotPasswordPage />} />
                    <Route path='/nova-senha' element={<NewPasswordPage />} />
                    <Route path='/agenda' element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                    {/* links antigos (/login) e endereços desconhecidos */}
                    <Route path='/login' element={<Navigate to='/entrar' replace />} />
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
