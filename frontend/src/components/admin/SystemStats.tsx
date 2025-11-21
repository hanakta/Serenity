'use client';

interface SystemStatsData {
  users: {
    total: number;
    admins: number;
    regular: number;
    new_last_30_days: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completion_rate: number;
    new_last_30_days: number;
  };
  projects: {
    total: number;
  };
  teams: {
    total: number;
  };
}

interface SystemStatsProps {
  systemStats: SystemStatsData | null;
  onRefresh: () => void;
}

export default function SystemStats({ systemStats, onRefresh }: SystemStatsProps) {
  if (!systemStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Загрузка статистики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Статистика системы</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Пользователи */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Всего пользователей</dt>
                  <dd className="text-2xl font-bold text-gray-900">{systemStats.users.total}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Админы: {systemStats.users.admins}</span>
                <span>Обычные: {systemStats.users.regular}</span>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  Новых за 30 дней: <span className="font-medium text-green-600">{systemStats.users.new_last_30_days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Задачи */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Всего задач</dt>
                  <dd className="text-2xl font-bold text-gray-900">{systemStats.tasks.total}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Выполнено: {systemStats.tasks.completed}</span>
                <span>В процессе: {systemStats.tasks.pending}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Процент выполнения:</span>
                  <span className="text-sm font-medium text-green-600">{systemStats.tasks.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${systemStats.tasks.completion_rate}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  Новых за 30 дней: <span className="font-medium text-green-600">{systemStats.tasks.new_last_30_days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Проекты */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📁</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Проекты</dt>
                  <dd className="text-2xl font-bold text-gray-900">{systemStats.projects.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Команды */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Команды</dt>
                  <dd className="text-2xl font-bold text-gray-900">{systemStats.teams.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика пользователей */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Распределение пользователей
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Обычные пользователи</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${systemStats.users.total > 0 ? (systemStats.users.regular / systemStats.users.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStats.users.regular}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Администраторы</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${systemStats.users.total > 0 ? (systemStats.users.admins / systemStats.users.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStats.users.admins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика задач */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Статистика задач
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Выполненные задачи</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${systemStats.tasks.total > 0 ? (systemStats.tasks.completed / systemStats.tasks.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStats.tasks.completed}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Задачи в процессе</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${systemStats.tasks.total > 0 ? (systemStats.tasks.pending / systemStats.tasks.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStats.tasks.pending}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

