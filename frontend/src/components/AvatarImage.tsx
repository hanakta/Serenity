import React, { useState, useEffect, useRef } from 'react';

interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

const AvatarImage: React.FC<AvatarImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null // Убираем fallback на несуществующий файл
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const currentObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    // Очищаем предыдущий Object URL при смене src
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
      currentObjectUrl.current = null;
    }

    if (!src) {
      setImageSrc('');
      setError(false);
      return;
    }

    // Если это URL аватарки с нашего API, получаем с авторизацией
    if (src.includes('/api/profile/avatar')) {
      fetchAvatarWithAuth(src);
    } else {
      // Для других URL используем как есть
      setImageSrc(src);
    }
  }, [src]);

  const fetchAvatarWithAuth = async (url: string) => {
    try {
      setIsLoading(true);
      setError(false);

      const token = localStorage.getItem('token');
      if (!token) {
        setImageSrc('');
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store' // Отключаем кэширование
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Сохраняем ссылку на текущий Object URL
      currentObjectUrl.current = objectUrl;
      setImageSrc(objectUrl);
    } catch (err) {
      console.error('Ошибка загрузки аватарки:', err);
      setError(true);
      setImageSrc('');
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-slate-700 rounded-full flex items-center justify-center ${className}`}>
        <div className="w-5 h-5 bg-slate-600 rounded-full"></div>
      </div>
    );
  }

  // Если нет изображения или ошибка, показываем инициалы
  if (!imageSrc || error) {
    const initials = alt.charAt(0).toUpperCase();
    return (
      <div className={`bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} object-cover`}
      onError={() => {
        if (!error) {
          setError(true);
          setImageSrc('');
        }
      }}
    />
  );
};

export default AvatarImage;

