'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('');

    try {
      // Тест 1: Проверка здоровья API
      const healthResponse = await fetch('http://localhost:8000');
      const healthData = await healthResponse.json();
      setResult(prev => prev + `✅ Health API: ${healthData.message}\n`);

      // Тест 2: Логин
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@serenity.com',
          password: 'password'
        })
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      const token = loginData.data.token;
      setResult(prev => prev + `✅ Login successful: ${token.substring(0, 20)}...\n`);

      // Тест 3: Получение команд
      const teamsResponse = await fetch('http://localhost:8000/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!teamsResponse.ok) {
        const errorText = await teamsResponse.text();
        throw new Error(`Teams API failed: ${teamsResponse.status} ${errorText}`);
      }

      const teamsData = await teamsResponse.json();
      setResult(prev => prev + `✅ Teams API: ${teamsData.message}\n`);
      setResult(prev => prev + `✅ Teams count: ${teamsData.data?.length || 0}\n`);

      // Тест 4: Сохранение токена в localStorage
      localStorage.setItem('token', token);
      setResult(prev => prev + `✅ Token saved to localStorage\n`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setResult(prev => prev + `✅ Token cleared from localStorage\n`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔧 API Test Page</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">API Tests</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testApi}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Testing...' : 'Test API'}
            </button>
            <button
              onClick={clearToken}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear Token
            </button>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4">
            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
              {result || 'Click "Test API" to run tests...'}
            </pre>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Token</h2>
          <div className="bg-black/20 rounded-lg p-4">
            <pre className="text-yellow-400 text-sm font-mono">
              {typeof window !== 'undefined' ? localStorage.getItem('token') || 'No token found' : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

