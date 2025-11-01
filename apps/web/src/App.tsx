import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/Home'
import { NotFoundPage } from '@/pages/NotFound'
import { MainLayout } from '@/components/layout/MainLayout'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </div>
  )
}

export default App