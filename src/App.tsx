import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Journal from '@/pages/Journal'
import Write from '@/pages/Write'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/write/:id" element={<Write />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
