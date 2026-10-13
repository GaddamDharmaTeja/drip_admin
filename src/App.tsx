import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { AdminLayout } from './components/AdminLayout'
import { Dashboard } from './pages/Dashboard'
import { IrrigationPlansPage } from './pages/IrrigationPlansPage'
import { Login } from './pages/Login'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProjectPlansPage } from './pages/ProjectPlansPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { QuotationsPage } from './pages/QuotationsPage'
import { RequestsPage } from './pages/RequestsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="irrigation-plans" element={<IrrigationPlansPage />} />
            <Route path="project-plans" element={<ProjectPlansPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
