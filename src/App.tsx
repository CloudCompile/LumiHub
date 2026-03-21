import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Characters from './pages/Characters';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="characters" element={<Characters />} />
          <Route path="worldbooks" element={<div>Worldbooks Page (Coming Soon)</div>} />
          <Route path="themes" element={<div>Themes Page (Coming Soon)</div>} />
          <Route path="presets" element={<div>Presets Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
