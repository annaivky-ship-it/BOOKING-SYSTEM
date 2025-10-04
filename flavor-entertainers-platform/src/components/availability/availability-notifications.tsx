'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Calendar,
  MapPin,
  Star,
  Settings,
  Send,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationSettings {
  id: string;
  performer_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  whatsapp_notifications: boolean;
  booking_requests: boolean;
  booking_confirmations: boolean;
  booking_cancellations: boolean;
  payment_received: boolean;
  calendar_reminders: boolean;
  profile_views: boolean;
  new_reviews: boolean;
  system_updates: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_sound: boolean;
  auto_respond_enabled: boolean;
  auto_respond_message: string;
  location_sharing: boolean;
  updated_at: string;
}

interface NotificationPreview {
  id: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  title: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  recipient: string;
}

interface AvailabilityNotificationsProps {
  performerId: string;
  className?: string;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

const notificationChannels = [
  {
    key: 'email_notifications',
    label: 'Email',
    icon: Mail,
    description: 'Get notifications via email'
  },
  {
    key: 'sms_notifications',
    label: 'SMS',
    icon: Smartphone,
    description: 'Text messages to your phone'
  },
  {
    key: 'push_notifications',
    label: 'Push',
    icon: Bell,
    description: 'Browser and app notifications'
  },
  {
    key: 'whatsapp_notifications',
    label: 'WhatsApp',
    icon: MessageSquare,
    description: 'Messages via WhatsApp'
  }
];

const notificationTypes = [
  {
    key: 'booking_requests',
    label: 'Booking Requests',
    description: 'New booking inquiries',
    icon: Calendar,
    priority: 'high'
  },
  {
    key: 'booking_confirmations',
    label: 'Booking Confirmations',
    description: 'When bookings are confirmed',
    icon: Check,
    priority: 'high'
  },
  {
    key: 'booking_cancellations',
    label: 'Booking Cancellations',
    description: 'When bookings are cancelled',
    icon: X,
    priority: 'medium'
  },
  {
    key: 'payment_received',
    label: 'Payment Received',
    description: 'When payments are processed',
    icon: Star,
    priority: 'high'
  },
  {
    key: 'calendar_reminders',
    label: 'Calendar Reminders',
    description: 'Upcoming performance reminders',
    icon: Clock,
    priority: 'medium'
  },
  {
    key: 'profile_views',
    label: 'Profile Views',
    description: 'When clients view your profile',
    icon: Users,
    priority: 'low'
  },
  {
    key: 'new_reviews',
    label: 'New Reviews',
    description: 'When you receive new reviews',
    icon: Star,
    priority: 'medium'
  },
  {
    key: 'system_updates',
    label: 'System Updates',
    description: 'Platform updates and announcements',
    icon: Settings,
    priority: 'low'
  }
];

export function AvailabilityNotifications({
  performerId,
  className,
  onSettingsChange
}: AvailabilityNotificationsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    id: 'settings_1',
    performer_id: performerId,
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    whatsapp_notifications: false,
    booking_requests: true,
    booking_confirmations: true,
    booking_cancellations: true,
    payment_received: true,
    calendar_reminders: true,
    profile_views: false,
    new_reviews: true,
    system_updates: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    notification_sound: true,
    auto_respond_enabled: false,
    auto_respond_message: 'Thanks for your interest! I\'ll get back to you within 2 hours.',
    location_sharing: false,
    updated_at: new Date().toISOString()
  });

  const [recentNotifications, setRecentNotifications] = useState<NotificationPreview[]>([]);
  const [isTestNotification, setIsTestNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  // Load recent notifications
  useEffect(() => {
    const mockNotifications: NotificationPreview[] = [
      {
        id: 'notif_1',
        type: 'whatsapp',
        title: 'New Booking Request',
        message: 'Sarah Wilson wants to book you for a wedding on March 15th',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'delivered',
        recipient: '+61400123456'
      },
      {
        id: 'notif_2',
        type: 'email',
        title: 'Payment Received',
        message: 'PayID payment of $375 received for your recent performance',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'read',
        recipient: 'performer@email.com'
      },
      {
        id: 'notif_3',
        type: 'sms',
        title: 'Performance Reminder',
        message: 'Reminder: Performance at Crown Perth in 2 hours',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'delivered',
        recipient: '+61400123456'
      },
      {
        id: 'notif_4',
        type: 'push',
        title: 'Profile View',
        message: 'Your profile was viewed by a potential client',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'read',
        recipient: 'Browser'
      }
    ];
    setRecentNotifications(mockNotifications);
  }, []);

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = {
      ...settings,
      [key]: value,
      updated_at: new Date().toISOString()
    };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const sendTestNotification = async () => {
    setIsTestNotification(true);
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      const testNotification: NotificationPreview = {
        id: `test_${Date.now()}`,
        type: 'push',
        title: 'Test Notification',
        message: 'This is a test notification from Flavor Entertainers. Your notifications are working correctly!',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        recipient: 'Test'
      };

      setRecentNotifications(prev => [testNotification, ...prev.slice(0, 9)]);
      toast.success('Test notification sent successfully!');
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setIsTestNotification(false);
    }
  };

  const getNotificationTypeIcon = (type: NotificationPreview['type']) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'push': return Bell;
      case 'whatsapp': return MessageSquare;
      default: return Bell;
    }
  };

  const getStatusColor = (status: NotificationPreview['status']) => {
    switch (status) {
      case 'sent': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      case 'read': return 'text-purple-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>

        {/* Tab Navigation */}
        <div className="flex space-x-2 pt-4">
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-4 h-4 mr-1" />
            History
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {activeTab === 'settings' ? (
          <>
            {/* Notification Channels */}
            <div>
              <h3 className="font-medium mb-4">Notification Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationChannels.map(channel => {
                  const IconComponent = channel.icon;
                  const isEnabled = settings[channel.key as keyof NotificationSettings] as boolean;

                  return (
                    <div key={channel.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{channel.label}</div>
                          <div className="text-sm text-muted-foreground">{channel.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateSetting(channel.key as keyof NotificationSettings, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="font-medium mb-4">Notification Types</h3>
              <div className="space-y-3">
                {notificationTypes.map(type => {
                  const IconComponent = type.icon;
                  const isEnabled = settings[type.key as keyof NotificationSettings] as boolean;

                  return (
                    <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{type.label}</span>
                            <Badge
                              variant={type.priority === 'high' ? 'destructive' : type.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {type.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateSetting(type.key as keyof NotificationSettings, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h3 className="font-medium mb-4">Quiet Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                No notifications will be sent during quiet hours except for urgent booking requests.
              </p>
            </div>

            {/* Auto-Respond */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Auto-Respond</h3>
                <Switch
                  checked={settings.auto_respond_enabled}
                  onCheckedChange={(checked) => updateSetting('auto_respond_enabled', checked)}
                />
              </div>
              {settings.auto_respond_enabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="auto-message">Auto-Respond Message</Label>
                    <Textarea
                      id="auto-message"
                      value={settings.auto_respond_message}
                      onChange={(e) => updateSetting('auto_respond_message', e.target.value)}
                      placeholder="Enter your auto-respond message..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span>This message will be sent automatically to new booking inquiries</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="font-medium mb-4">Additional Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Notification Sound</div>
                    <div className="text-sm text-muted-foreground">Play sound for notifications</div>
                  </div>
                  <Switch
                    checked={settings.notification_sound}
                    onCheckedChange={(checked) => updateSetting('notification_sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Location Sharing</div>
                    <div className="text-sm text-muted-foreground">Share your location for nearby bookings</div>
                  </div>
                  <Switch
                    checked={settings.location_sharing}
                    onCheckedChange={(checked) => updateSetting('location_sharing', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Test Notification */}
            <div className="pt-4 border-t">
              <Button
                onClick={sendTestNotification}
                disabled={isTestNotification}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isTestNotification ? 'Sending Test...' : 'Send Test Notification'}
              </Button>
            </div>
          </>
        ) : (
          /* Notification History */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Notifications</h3>
              <Badge variant="outline">
                {recentNotifications.length} notifications
              </Badge>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map(notification => {
                  const IconComponent = getNotificationTypeIcon(notification.type);

                  return (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              To: {notification.recipient}
                            </span>
                            <span className={cn("text-xs font-medium", getStatusColor(notification.status))}>
                              {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Settings last updated: {new Date(settings.updated_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}