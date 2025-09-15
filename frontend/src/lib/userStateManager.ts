/**
 * Менеджер состояния пользователя для предотвращения утечки данных между пользователями
 */

import { clearApplicationState, getUserIdFromToken } from './stateManager';

// Глобальное состояние текущего пользователя
let currentUserId: string | null = null;
let stateListeners: Set<() => void> = new Set();

/**
 * Установить текущего пользователя
 */
export const setCurrentUser = (userId: string | null) => {
  const previousUserId = currentUserId;
  currentUserId = userId;
  
  // Если пользователь изменился, очищаем все состояние
  // НО НЕ при первом входе (когда previousUserId === null)
  if (previousUserId !== userId && previousUserId !== null) {
    console.log(`User changed from ${previousUserId} to ${userId}. Clearing all state.`);
    clearAllUserState();
  } else if (previousUserId === null && userId !== null) {
    console.log(`First login for user ${userId}. Setting current user.`);
  }
};

/**
 * Получить текущего пользователя
 */
export const getCurrentUser = (): string | null => {
  return currentUserId;
};

/**
 * Проверить, изменился ли пользователь
 */
export const hasUserChanged = (token: string | null): boolean => {
  const tokenUserId = getUserIdFromToken(token);
  
  // Если текущий пользователь null, а токен содержит пользователя - это не смена, а первый вход
  if (currentUserId === null && tokenUserId !== null) {
    return false;
  }
  
  // Если токен null, а текущий пользователь есть - это выход
  if (currentUserId !== null && tokenUserId === null) {
    return true;
  }
  
  // Если оба не null и разные - это смена пользователя
  if (currentUserId !== null && tokenUserId !== null && currentUserId !== tokenUserId) {
    return true;
  }
  
  return false;
};

/**
 * Очистить все состояние пользователя
 */
export const clearAllUserState = () => {
  console.log('Clearing all user state...');
  
  // Очищаем глобальное состояние
  clearApplicationState();
  
  // Очищаем React состояние через слушателей
  stateListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Error clearing state listener:', error);
    }
  });
  
  // Сбрасываем текущего пользователя
  currentUserId = null;
  
  console.log('All user state cleared.');
};

/**
 * Зарегистрировать слушатель для очистки состояния
 */
export const registerStateListener = (listener: () => void): (() => void) => {
  stateListeners.add(listener);
  
  return () => {
    stateListeners.delete(listener);
  };
};

/**
 * Принудительная очистка всех данных
 */
export const forceClearAllData = () => {
  console.log('Force clearing all data...');
  
  // Очищаем состояние
  clearAllUserState();
  
  // Очищаем localStorage полностью
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Очищаем кэш браузера
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Очищаем IndexedDB
    if ('indexedDB' in window) {
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } catch (error) {
        console.log('IndexedDB not available or error:', error);
      }
    }
  }
};

/**
 * Принудительная очистка с перезагрузкой страницы (только для logout)
 */
export const forceClearAllDataWithReload = () => {
  console.log('Force clearing all data with reload...');
  
  // Очищаем состояние
  clearAllUserState();
  
  // Очищаем localStorage полностью
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Очищаем кэш браузера
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Очищаем IndexedDB
    if ('indexedDB' in window) {
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } catch (error) {
        console.log('IndexedDB not available or error:', error);
      }
    }
    
    // Перезагружаем страницу для полной очистки
    window.location.reload();
  }
};

/**
 * Проверить и очистить состояние при необходимости
 */
export const checkAndClearState = (token: string | null) => {
  if (hasUserChanged(token)) {
    console.log('User changed, clearing state...');
    clearAllUserState();
    
    const newUserId = getUserIdFromToken(token);
    if (newUserId) {
      setCurrentUser(newUserId);
    }
  }
};

/**
 * Мягкая проверка и очистка состояния (без перезагрузки)
 */
export const softCheckAndClearState = (token: string | null) => {
  if (hasUserChanged(token)) {
    console.log('User changed, soft clearing state...');
    clearAllUserState();
    
    const newUserId = getUserIdFromToken(token);
    if (newUserId) {
      setCurrentUser(newUserId);
    }
  } else {
    // Если пользователь не изменился, просто устанавливаем текущего пользователя
    const newUserId = getUserIdFromToken(token);
    if (newUserId && currentUserId !== newUserId) {
      console.log('Setting current user without clearing state:', newUserId);
      setCurrentUser(newUserId);
    }
  }
};

/**
 * Инициализация менеджера состояния
 */
export const initializeUserStateManager = () => {
  // Очищаем состояние при загрузке страницы
  if (typeof window !== 'undefined') {
    // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem('token');
    if (token) {
      const userId = getUserIdFromToken(token);
      setCurrentUser(userId);
    } else {
      // Если нет токена, очищаем все состояние
      clearAllUserState();
    }
  }
};
