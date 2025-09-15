'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Bell, BellOff, Clock, Mail, Smartphone } from 'lucide-react'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: any) => Promise<void>
}

export default function NotificationSettingsModal({ isOpen, onClose, onSave }: NotificationSettingsModalProps) {
  // Состояния для различных типов уведомлений
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [deadlineAlerts, setDeadlineAlerts] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(false)
  const [teamActivity, setTeamActivity] = useState(false)

  // Настройки времени уведомлений
  const [quietHours, setQuietHours] = useState(true)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')

  const handleSave = () => {
    // Здесь будет логика сохранения настроек уведомлений
    console.log('Сохранение настроек уведомлений...')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Настройки уведомлений
          </DialogTitle>
          <DialogDescription>
            Управляйте тем, как и когда вы получаете уведомления о задачах и проектах
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основные уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основные уведомления</CardTitle>
              <CardDescription>
                Выберите каналы для получения уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="email-notifications">Email уведомления</Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <Label htmlFor="push-notifications">Push уведомления</Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Уведомления о задачах */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Уведомления о задачах</CardTitle>
              <CardDescription>
                Настройте уведомления, связанные с вашими задачами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <Label htmlFor="task-reminders">Напоминания о задачах</Label>
                </div>
                <Switch
                  id="task-reminders"
                  checked={taskReminders}
                  onCheckedChange={setTaskReminders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-red-500" />
                  <Label htmlFor="deadline-alerts">Уведомления о дедлайнах</Label>
                </div>
                <Switch
                  id="deadline-alerts"
                  checked={deadlineAlerts}
                  onCheckedChange={setDeadlineAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Отчеты и сводки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Отчеты и сводки</CardTitle>
              <CardDescription>
                Получайте регулярные отчеты о вашей активности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-digest">Ежедневная сводка</Label>
                <Switch
                  id="daily-digest"
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-report">Еженедельный отчет</Label>
                <Switch
                  id="weekly-report"
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                />
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дополнительные уведомления</CardTitle>
              <CardDescription>
                Другие типы уведомлений, которые могут быть полезны
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="project-updates">Обновления проектов</Label>
                <Switch
                  id="project-updates"
                  checked={projectUpdates}
                  onCheckedChange={setProjectUpdates}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="team-activity">Активность команды</Label>
                <Switch
                  id="team-activity"
                  checked={teamActivity}
                  onCheckedChange={setTeamActivity}
                />
              </div>
            </CardContent>
          </Card>

          {/* Тихие часы */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Тихие часы</CardTitle>
              <CardDescription>
                Настройте время, когда вы не хотите получать уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-hours">Включить тихие часы</Label>
                <Switch
                  id="quiet-hours"
                  checked={quietHours}
                  onCheckedChange={setQuietHours}
                />
              </div>

              {quietHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-start">Начало</Label>
                    <input
                      id="quiet-start"
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">Конец</Label>
                    <input
                      id="quiet-end"
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить настройки
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
