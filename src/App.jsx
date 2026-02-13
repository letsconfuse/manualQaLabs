import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ChallengeView from './pages/ChallengeView';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <SEO
        title="Manual QA Labs | Practice Software Testing"
        description="Practice manual software testing on realistic, buggy applications."
      />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/challenge/:id" element={<ChallengeView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
