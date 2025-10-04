'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Send,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StatusUpdate {
  id: string;
  type: 'booking' | 'availability' | 'system' | 'message' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  action_required?: boolean;
  related_booking_id?: string;
  performer_id?: string;
  performer_name?: string;
  performer_avatar?: string;
  metadata?: Record<string, any>;
}

interface StatusUpdatesProps {
  performerId: string;
  className?: string;
  showNotifications?: boolean;
  onUpdateAction?: (update: StatusUpdate) => void;
}

const updateTypeConfig = {
  booking: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  availability: {
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  system: {
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  message: {
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  reminder: {
    icon: Bell,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

export function StatusUpdates({
  performerId,
  className,
  showNotifications = true,
  onUpdateAction
}: StatusUpdatesProps) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [quickMessage, setQuickMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate mock real-time updates
  const generateMockUpdate = (): StatusUpdate => {
    const types: StatusUpdate['type'][] = ['booking', 'availability', 'system', 'message', 'reminder'];
    const priorities: StatusUpdate['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const updateTemplates = {
      booking: [
        {
          title: 'New Booking Request',
          message: 'Sarah Wilson wants to book you for a wedding reception on Friday, March 15th from 7:00 PM - 11:00 PM at Crown Perth.',
          metadata: { client_name: 'Sarah Wilson', event_type: 'Wedding', location: 'Crown Perth' }
        },
        {
          title: 'Booking Confirmed',
          message: 'Your booking for Mike Johnson\'s birthday party has been confirmed. Check-in details sent to your email.',
          metadata: { client_name: 'Mike Johnson', event_type: 'Birthday Party' }
        },
        {
          title: 'Booking Cancelled',
          message: 'Unfortunately, the corporate event scheduled for tomorrow has been cancelled. Automatic refund processed.',
          metadata: { event_type: 'Corporate Event', refund_amount: '$450' }
        }
      ],
      availability: [
        {
          title: 'Status Changed to Available',
          message: 'You\'re now marked as available. Auto-accept is enabled for bookings within your preferred rate range.',
          metadata: { status: 'available', auto_accept: true }
        },
        {
          title: 'Calendar Sync Complete',
          message: 'Your Google Calendar has been synced. 3 new available slots detected for this week.',
          metadata: { synced_slots: 3 }
        }
      ],
      system: [
        {
          title: 'Profile Views Increased',
          message: 'Your profile has been viewed 25 times today, 15% higher than yesterday. Great job!',
          metadata: { views_today: 25, increase_percentage: 15 }
        },
        {
          title: 'Payment Received',
          message: 'PayID payment of $375.00 has been received for your recent performance at The Westin.',
          metadata: { amount: '$375.00', venue: 'The Westin' }
        }
      ],
      message: [
        {
          title: 'New Message from Client',
          message: 'Emma Davis: "Hi! I\'d love to discuss availability for our anniversary party next month. Could you give me a call?"',
          metadata: { client_name: 'Emma Davis', message_preview: 'Hi! I\'d love to discuss...' }
        }
      ],
      reminder: [
        {
          title: 'Upcoming Performance',
          message: 'Reminder: You have a performance in 2 hours at The Ritz-Carlton. Check-in at the main lobby.',
          metadata: { venue: 'The Ritz-Carlton', time_until: '2 hours' }
        },
        {
          title: 'Profile Update Needed',
          message: 'Your profile photos haven\'t been updated in 60 days. Fresh photos can increase bookings by 30%!',
          metadata: { days_since_update: 60 }
        }
      ]
    };

    const templates = updateTemplates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      message: template.message,
      timestamp: new Date().toISOString(),
      priority,
      read: false,
      action_required: priority === 'urgent' || type === 'booking',
      metadata: template.metadata
    };
  };

  // Simulate real-time updates
  useEffect(() => {
    // Initial load
    const initialUpdates = Array.from({ length: 8 }, () => ({
      ...generateMockUpdate(),
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      read: Math.random() > 0.6
    }));
    setUpdates(initialUpdates);

    // Simulate new updates coming in
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newUpdate = generateMockUpdate();
        setUpdates(prev => [newUpdate, ...prev.slice(0, 19)]); // Keep last 20 updates

        // Play notification sound
        if (soundEnabled && showNotifications) {
          try {
            // Create a simple notification sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
          } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Notification sound not available');
          }
        }

        // Show toast notification
        if (showNotifications) {
          toast.info(newUpdate.title, {
            description: newUpdate.message.slice(0, 100) + (newUpdate.message.length > 100 ? '...' : ''),
            duration: 4000,
          });
        }
      }
    }, 10000);

    // Simulate connection status changes
    const connectionInterval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.95 ? !prev : prev);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [soundEnabled, showNotifications]);

  const markAsRead = (updateId: string) => {
    setUpdates(prev => prev.map(update =>
      update.id === updateId ? { ...update, read: true } : update
    ));
  };

  const markAllAsRead = () => {
    setUpdates(prev => prev.map(update => ({ ...update, read: true })));
  };

  const sendQuickMessage = () => {
    if (quickMessage.trim()) {
      const newUpdate: StatusUpdate = {
        id: `msg_${Date.now()}`,
        type: 'message',
        title: 'Quick Status Update',
        message: quickMessage,
        timestamp: new Date().toISOString(),
        priority: 'low',
        read: true,
        performer_id: performerId
      };

      setUpdates(prev => [newUpdate, ...prev]);
      setQuickMessage('');
      toast.success('Status update sent');
    }
  };

  const filteredUpdates = updates.filter(update => {
    switch (filter) {
      case 'unread':
        return !update.read;
      case 'urgent':
        return update.priority === 'urgent' || update.action_required;
      default:
        return true;
    }
  });

  const unreadCount = updates.filter(u => !u.read).length;
  const urgentCount = updates.filter(u => u.priority === 'urgent' || u.action_required).length;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Live Updates</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}></div>
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Updates
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button
            variant={filter === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('urgent')}
          >
            Urgent {urgentCount > 0 && `(${urgentCount})`}
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>

        {/* Quick Message */}
        <div className="flex space-x-2">
          <Input
            placeholder="Send a quick status update..."
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendQuickMessage()}
            className="flex-1"
          />
          <Button size="sm" onClick={sendQuickMessage} disabled={!quickMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredUpdates.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No updates to show</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredUpdates.map((update) => {
                const config = updateTypeConfig[update.type];
                const priorityStyle = priorityConfig[update.priority];
                const IconComponent = config.icon;

                return (
                  <div
                    key={update.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                      config.bgColor,
                      config.borderColor,
                      !update.read && "ring-2 ring-primary/20"
                    )}
                    onClick={() => {
                      markAsRead(update.id);
                      onUpdateAction?.(update);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-full bg-white/80")}>
                        <IconComponent className={cn("w-4 h-4", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{update.title}</h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className={cn("text-xs", priorityStyle.color)}>
                              {priorityStyle.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(update.timestamp)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {update.message}
                        </p>

                        {/* Metadata display */}
                        {update.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {update.metadata.client_name && (
                              <div className="flex items-center space-x-1 text-xs">
                                <User className="w-3 h-3" />
                                <span>{update.metadata.client_name}</span>
                              </div>
                            )}
                            {update.metadata.location && (
                              <div className="flex items-center space-x-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                <span>{update.metadata.location}</span>
                              </div>
                            )}
                            {update.metadata.amount && (
                              <Badge variant="secondary" className="text-xs">
                                {update.metadata.amount}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action required indicator */}
                        {update.action_required && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Action Required</span>
                          </div>
                        )}

                        {/* Unread indicator */}
                        {!update.read && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-primary">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span>Unread</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time status */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3" />
              <span>Real-time updates enabled</span>
            </div>
            <span>Last update: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}