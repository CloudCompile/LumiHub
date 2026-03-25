import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Characters from './pages/characters/Characters';
import CharacterDetail from './pages/characters/CharacterDetail';
import UserProfile from './pages/user/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="characters" element={<Characters />} />
          <Route path="characters/:id" element={<CharacterDetail />} />
          <Route path="worldbooks" element={<div>Worldbooks Page (Coming Soon)</div>} />
          <Route path="themes" element={<div>Themes Page (Coming Soon)</div>} />
          <Route path="presets" element={<div>Presets Page (Coming Soon)</div>} />
          <Route path="user/:discordId" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
