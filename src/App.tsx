import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Landing from '@/pages/Landing'
import ForYou from '@/pages/ForYou'
import Home from '@/pages/Home'
import Journal from '@/pages/Journal'
import Write from '@/pages/Write'
import ForHerStudio from '@/pages/ForHerStudio'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/for-you" element={<ForYou />} />

        {/* His side. */}
        <Route path="/studio" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="journal" element={<Journal />} />
          <Route path="write/:id" element={<Write />} />
          <Route path="for-her" element={<ForHerStudio />} />
        </Route>

        {/* Old links from before the studio moved. */}
        <Route path="/journal" element={<Navigate to="/studio/journal" replace />} />
        <Route path="/write/:id" element={<RedirectWrite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function RedirectWrite() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/studio/write/${id}`} replace />
}
