'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationToast, { Notification } from './NotificationToast'

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications?: number
}

const NotificationContainer = memo(function NotificationContainer({
  notifications,
  onRemove,
  position = 'top-right',
  maxNotifications = 5
}: NotificationContainerProps) {
  const visibleNotifications = notifications.slice(0, maxNotifications)

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            style={{
              pointerEvents: 'auto',
              transform: `translateY(${index * 10}px)`
            }}
          >
            <NotificationToast
              notification={notification}
              onRemove={onRemove}
              position={position}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
})

export default NotificationContainer















