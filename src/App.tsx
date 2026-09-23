import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardUser } from './pages/DashboardUser'

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route
                        path='/'
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <DashboardUser />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
