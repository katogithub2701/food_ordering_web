import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return <HomePage user={user} setUser={setUser} showAuth={showAuth} setShowAuth={setShowAuth} authMode={authMode} setAuthMode={setAuthMode} />;
}

export default App;
