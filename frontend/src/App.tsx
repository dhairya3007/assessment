import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/jobs/:id" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
