import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Chat from './pages/chat';
import ChannelChat from './pages/chat/channel-chat';

const App = () => {
  return (
    <Routes>
      <Route path="/chat" element={<Chat />} />
      <Route path="/channel-chat/:id" element={<ChannelChat />} />
    </Routes>
  );
}

export default App;
