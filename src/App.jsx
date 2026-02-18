import { Routes, Route } from 'react-router-dom';
import SEO from './components/SEO';
import Layout from './components/Layout';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import ChallengeView from './pages/ChallengeView';
import About from './pages/About';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="font-sans min-h-screen transition-colors duration-300">
        <SEO
          title="Manual QA Labs | Practice Software Testing"
          description="Practice manual software testing on realistic, buggy applications."
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/about" element={<About />} />
            <Route path="/challenge/:id" element={<ChallengeView />} />
          </Routes>
        </Layout>
      </div>
    </ThemeProvider>
  );
}

export default App;
