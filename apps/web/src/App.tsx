import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/Home'
import { NotFoundPage } from '@/pages/NotFound'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthProvider } from '@/providers/AuthProvider'
import { ConnectionTest } from '@/components/ConnectionTest'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test-connection" element={<ConnectionTest />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </div>
    </AuthProvider>
  )
}

export { App }
export default App