'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, forceClearAllData, checkAndClearState } from '@/lib/userStateManager';
import { getUserIdFromToken } from '@/lib/stateManager';

interface UserStateDebuggerProps {
  className?: string;
}

export default function UserStateDebugger({ className = '' }: UserStateDebuggerProps) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [tokenUser, setTokenUser] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateUserInfo = () => {
      const token = localStorage.getItem('token');
      const tokenUserId = getUserIdFromToken(token);
      const currentUserId = getCurrentUser();
      
      setCurrentUser(currentUserId);
      setTokenUser(tokenUserId);
    };

    updateUserInfo();
    
    // Обновляем информацию каждые 2 секунды
    const interval = setInterval(updateUserInfo, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleForceClear = () => {
    if (confirm('Вы уверены, что хотите принудительно очистить все данные? Это перезагрузит страницу.')) {
      forceClearAllData();
    }
  };

  const handleCheckAndClear = () => {
    const token = localStorage.getItem('token');
    checkAndClearState(token);
    alert('Проверка и очистка выполнена');
  };

  // Показываем только в development режиме
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
      >
        🐛 Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-80">
          <h3 className="font-bold text-lg mb-3 text-gray-800">User State Debugger</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current User:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {currentUser || 'null'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Token User:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {tokenUser || 'null'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Match:</span>
              <span className={`text-sm font-mono px-2 py-1 rounded ${
                currentUser === tokenUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {currentUser === tokenUser ? '✅' : '❌'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleCheckAndClear}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Check & Clear State
            </button>
            
            <button
              onClick={handleForceClear}
              className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
            >
              Force Clear All Data
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Этот компонент доступен только в development режиме
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



