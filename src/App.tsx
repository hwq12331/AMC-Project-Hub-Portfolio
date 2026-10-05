import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Procurement } from './pages/Procurement';
import { HR } from './pages/HR';
import { QA } from './pages/QA';
import { Clients } from './pages/Clients';
import { GatePass } from './pages/GatePass';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="hr" element={<HR />} />
          <Route path="qa" element={<QA />} />
          <Route path="clients" element={<Clients />} />
          <Route path="gate-pass" element={<GatePass />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App
