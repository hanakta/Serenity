import React, { useState, useEffect } from 'react';
import { usePublicTeams, PublicTeam } from '../hooks/usePublicTeams';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  FolderOpen, 
  UserPlus, 
  Search,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const PublicTeamsSection: React.FC = () => {
  const { publicTeams, loading, error, getPublicTeams, joinPublicTeam, searchPublicTeams, setError } = usePublicTeams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);

  // Загружаем публичные команды при монтировании компонента
  useEffect(() => {
    getPublicTeams();
  }, [getPublicTeams]);

  // Обработка поиска
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      await getPublicTeams();
      return;
    }

    setSearchLoading(true);
    try {
      await searchPublicTeams(searchTerm);
    } catch (err) {
      console.error('Ошибка поиска:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Обработка присоединения к команде
  const handleJoinTeam = async (teamId: string, teamName: string) => {
    if (!user) {
      setError('Необходима авторизация для присоединения к команде');
      return;
    }

    setJoiningTeam(teamId);
    try {
      await joinPublicTeam(teamId);
      // Показываем уведомление об успехе
      alert(`Вы успешно присоединились к команде "${teamName}"!`);
    } catch (err) {
      console.error('Ошибка присоединения:', err);
    } finally {
      setJoiningTeam(null);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Получение инициалов владельца
  const getOwnerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Публичные команды
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Найдите и присоединяйтесь к командам других пользователей
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск команд..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Поиск
          </button>
        </form>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Ошибка</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка команд...</span>
        </div>
      )}

      {/* Список команд */}
      {!loading && publicTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Заголовок команды */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Создана {formatDate(team.created_at)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleJoinTeam(team.id, team.name)}
                  disabled={joiningTeam === team.id || !user}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {joiningTeam === team.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Присоединиться
                </button>
              </div>

              {/* Описание */}
              {team.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {team.description}
                </p>
              )}

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{team.member_count}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Участников</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{team.task_count}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Задач</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">{team.project_count}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Проектов</p>
                </div>
              </div>

              {/* Владелец */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {team.owner_avatar ? (
                    <img
                      src={team.owner_avatar}
                      alt={team.owner_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {getOwnerInitials(team.owner_name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {team.owner_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {team.owner_email}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && publicTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Команды не найдены
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? `По запросу "${searchTerm}" команды не найдены`
              : 'Пока нет публичных команд'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                getPublicTeams();
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Показать все команды
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicTeamsSection;




