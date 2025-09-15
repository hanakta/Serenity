'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Clock, UserPlus, X, Copy, Check } from 'lucide-react'
import { useInvitations } from '@/hooks/useInvitations'

interface TeamInvitationsProps {
  teamId: string
  teamName: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  token: string
  expires_at: string
  created_at: string
  invited_by_name?: string
}

export const TeamInvitations: React.FC<TeamInvitationsProps> = ({
  teamId,
  teamName
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const { loading, error, getTeamInvitations } = useInvitations()

  const loadInvitations = async () => {
    try {
      const data = await getTeamInvitations(teamId)
      setInvitations(data)
    } catch (err) {
      console.error('Ошибка загрузки приглашений:', err)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [teamId])

  const copyInvitationLink = async (token: string) => {
    const invitationUrl = `${window.location.origin}/invitations/${token}`
    
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/20'
      case 'declined': return 'text-red-400 bg-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'accepted': return 'Принято'
      case 'declined': return 'Отклонено'
      case 'expired': return 'Просрочено'
      default: return status
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-500/20'
      case 'member': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Админ'
      case 'member': return 'Участник'
      default: return role
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Приглашения команды
          </h3>
          <p className="text-white/70 text-sm">
            Отправленные приглашения для &quot;{teamName}&quot;
          </p>
        </div>
        <button
          onClick={loadInvitations}
          className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Нет приглашений
          </h3>
          <p className="text-white/70">
            Отправьте первое приглашение новому участнику команды
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Email and Role */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-white/60" />
                      <span className="text-white font-medium">
                        {invitation.email}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                      {getRoleText(invitation.role)}
                    </span>
                  </div>

                  {/* Status and Dates */}
                  <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                        {getStatusText(invitation.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Создано: {formatDate(invitation.created_at)}</span>
                    </div>
                    {invitation.status === 'pending' && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className={isExpired(invitation.expires_at) ? 'text-red-400' : ''}>
                          Истекает: {formatDate(invitation.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Copy Link Button */}
                  {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                    <button
                      onClick={() => copyInvitationLink(invitation.token)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      {copiedToken === invitation.token ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Копировать ссылку</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Actions */}
                {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Отменить приглашение"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
