/**
 * Менеджер состояния для очистки данных при смене пользователя
 */

// Интерфейс для компонентов, которые нужно очистить
interface ClearableComponent {
  clearState: () => void;
}

// Глобальный реестр компонентов для очистки
const clearableComponents = new Set<ClearableComponent>();

/**
 * Регистрация компонента для очистки
 */
export const registerForClear = (component: ClearableComponent) => {
  clearableComponents.add(component);
  
  // Возвращаем функцию для отмены регистрации
  return () => {
    clearableComponents.delete(component);
  };
};

/**
 * Очистка всех зарегистрированных компонентов
 */
export const clearAllStates = () => {
  clearableComponents.forEach(component => {
    try {
      component.clearState();
    } catch (error) {
      console.error('Error clearing component state:', error);
    }
  });
};

/**
 * Очистка localStorage и sessionStorage
 */
export const clearStorage = () => {
  if (typeof window !== 'undefined') {
    // Очищаем localStorage (кроме системных ключей)
    const keysToKeep = ['theme', 'language']; // Системные настройки
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Очищаем sessionStorage
    sessionStorage.clear();
    
    // Очищаем кэш браузера
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }
};

/**
 * Полная очистка состояния приложения
 */
export const clearApplicationState = () => {
  // Очищаем состояние компонентов
  clearAllStates();
  
  // Очищаем хранилище
  clearStorage();
  
  // Очищаем глобальные переменные
  if (typeof window !== 'undefined') {
    // Очищаем любые глобальные переменные состояния
    (window as any).__APP_STATE__ = {};
  }
};

/**
 * Проверка валидности токена
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Декодируем JWT токен
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверяем время истечения
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Получение ID пользователя из токена
 */
export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Хук для автоматической очистки состояния при смене пользователя
 */
export const useStateCleanup = () => {
  const clearState = () => {
    clearApplicationState();
  };
  
  return { clearState };
};
