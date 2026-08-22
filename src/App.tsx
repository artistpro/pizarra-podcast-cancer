import React, { useState, useEffect } from 'react';
import type { BoardState } from './types/board';
import { DEFAULT_BOARD_STATE } from './types/board';
import { subscribeBoardState } from './firebase';
import { LiveBoard } from './components/LiveBoard';
import { AdminConsole } from './components/admin/AdminConsole';

export const App: React.FC = () => {
  const [boardState, setBoardState] = useState<BoardState>(DEFAULT_BOARD_STATE);
  const [currentView, setCurrentView] = useState<'board' | 'admin'>('board');

  useEffect(() => {
    const checkView = () => {
      const params = new URLSearchParams(window.location.search);
      const isPathAdmin = window.location.pathname.includes('admin');
      const isQueryAdmin = params.get('view') === 'admin';
      setCurrentView(isPathAdmin || isQueryAdmin ? 'admin' : 'board');
    };

    checkView();
    window.addEventListener('popstate', checkView);

    const unsubscribe = subscribeBoardState((state) => {
      setBoardState(state);
    });

    return () => {
      window.removeEventListener('popstate', checkView);
      unsubscribe();
    };
  }, []);

  if (currentView === 'admin') {
    return <AdminConsole />;
  }

  return <LiveBoard state={boardState} />;
};

export default App;
