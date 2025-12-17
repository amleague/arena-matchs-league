
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateTeam from './pages/CreateTeam';
import SearchPage from './pages/Search';
import Inbox from './pages/Inbox';
import Tournaments from './pages/Tournaments';
import Profile from './pages/Profile';
import CreateTournament from './pages/CreateTournament';
import TeamDetails from './pages/TeamDetails';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/team/:id" element={<TeamDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
