import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileInput } from '@/components/ui/mobile-input';
import {
  Gear as Settings,
  User,
  Bell,
  CheckCircle as Shield,
  Clock as Moon,
  TrendUp as Sun,
  DeviceMobile as Smartphone,
  Users,
  CheckCircle as Eye,
  SignOut as LogOut,
  Download,
  CloudArrowUp as Upload,
  TrashSimple as Trash2,
  Coffee as HelpCircle,
  DotsThreeVertical as Info,
  ArrowRight as ChevronRight,
  Bell as Volume2,
  X as VolumeX,
  DeviceMobile as Vibrate,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mobile settings configuration types
export interface NotificationSettings {
  pushEnabled: boolean;
  dailyReminders: boolean;
  challengeAlerts: boolean;
  partnerActivity: boolean;
  weeklyReports: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  activitySharing: boolean;
  locationSharing: boolean;
  readReceipts: boolean;
  onlineStatus: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'default' | 'warm' | 'cool' | 'romantic';
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface AccountSettings {
  email: string;
  phoneNumber: string;
  relationshipStatus: string;
  anniversaryDate: string;
  backupEnabled: boolean;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
}

export interface MobileSettingsData {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  account: AccountSettings;
}

interface MobileSettingsProps {
  _actions: Action[];
  _issues: Issue[];
  _partner: Partner;
  currentUser: Partner;
  settings: MobileSettingsData;
  onSettingUpdate: (category: keyof MobileSettingsData, key: string, value: unknown) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onExportData: () => void;
}

export const MobileSettings = ({
  _actions,
  _issues,
  _partner,
  currentUser,
  settings,
  onSettingUpdate,
  onSignOut,
  onDeleteAccount,
  onExportData,
}: MobileSettingsProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [activeSection, setActiveSection] = useState<
    'general' | 'notifications' | 'privacy' | 'appearance' | 'account' | 'help'
  >('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showQuietHours, setShowQuietHours] = useState(false);

  // Handle section change
  const handleSectionChange = (
    section: 'general' | 'notifications' | 'privacy' | 'appearance' | 'account' | 'help'
  ) => {
    triggerHaptic('light');
    setActiveSection(section);
  };

  // Handle setting toggle
  const handleToggleSetting = (
    category: keyof MobileSettingsData,
    key: string,
    currentValue: boolean
  ) => {
    triggerHaptic('light');
    onSettingUpdate(category, key, !currentValue);
    toast.success('Setting updated');
  };

  // Handle select setting
  const handleSelectSetting = (category: keyof MobileSettingsData, key: string, value: unknown) => {
    triggerHaptic('light');
    onSettingUpdate(category, key, value);
    toast.success('Setting updated');
  };

  // Get theme icon (unused but kept for future use)
  const _getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  // Get color scheme badge
  const getColorSchemeBadge = (scheme: string) => {
    switch (scheme) {
      case 'warm':
        return 'bg-orange-100 text-orange-700';
      case 'cool':
        return 'bg-blue-100 text-blue-700';
      case 'romantic':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Settings sections configuration
  const settingsSections = [
    {
      key: 'general',
      label: 'General',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'privacy',
      label: 'Privacy',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
    },
    {
      key: 'appearance',
      label: 'Appearance',
      icon: <Eye className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      key: 'account',
      label: 'Account',
      icon: <User className="w-5 h-5" />,
      color: 'from-red-500 to-red-600',
    },
    {
      key: 'help',
      label: 'Help & Info',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'from-yellow-500 to-yellow-600',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">{currentUser.name}</p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {settingsSections.map((section) => (
              <MobileButton
                key={section.key}
                variant={activeSection === section.key ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap',
                  'flex items-center gap-2',
                  activeSection === section.key
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
                onClick={() =>
                  handleSectionChange(
                    section.key as
                      | 'general'
                      | 'notifications'
                      | 'privacy'
                      | 'appearance'
                      | 'account'
                      | 'help'
                  )
                }
              >
                {section.icon}
                {section.label}
              </MobileButton>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            {/* General Section */}
            {activeSection === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      General Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <MobileButton
                        variant="outline"
                        className="py-3 h-auto flex-col gap-2"
                        onClick={() => {
                          triggerHaptic('medium');
                          setShowDataExport(true);
                        }}
                      >
                        <Download className="w-5 h-5" />
                        <span className="text-xs">Export Data</span>
                      </MobileButton>

                      <MobileButton
                        variant="outline"
                        className="py-3 h-auto flex-col gap-2"
                        onClick={() => {
                          triggerHaptic('light');
                          toast.info('Backup sync started');
                        }}
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">Sync Backup</span>
                      </MobileButton>
                    </div>

                    {/* Account Status */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Account Active</span>
                      </div>
                      <p className="text-xs text-green-600">
                        All systems operational. Last sync: 2 minutes ago
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Push Notifications */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Push Notifications</div>
                        <div className="text-sm text-gray-600">
                          Receive notifications on your device
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.pushEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('notifications', 'pushEnabled', !checked)
                        }
                      />
                    </div>

                    {/* Daily Reminders */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Daily Reminders</div>
                        <div className="text-sm text-gray-600">Get daily relationship tips</div>
                      </div>
                      <Switch
                        checked={settings.notifications.dailyReminders}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('notifications', 'dailyReminders', !checked)
                        }
                      />
                    </div>

                    {/* Challenge Alerts */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Challenge Alerts</div>
                        <div className="text-sm text-gray-600">New challenges and completions</div>
                      </div>
                      <Switch
                        checked={settings.notifications.challengeAlerts}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('notifications', 'challengeAlerts', !checked)
                        }
                      />
                    </div>

                    {/* Partner Activity */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Partner Activity</div>
                        <div className="text-sm text-gray-600">When your partner is active</div>
                      </div>
                      <Switch
                        checked={settings.notifications.partnerActivity}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('notifications', 'partnerActivity', !checked)
                        }
                      />
                    </div>

                    {/* Sound & Haptic Settings */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Sound & Haptics</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {settings.notifications.soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-blue-500" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium">Sound</span>
                          </div>
                          <Switch
                            checked={settings.notifications.soundEnabled}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('notifications', 'soundEnabled', !checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Vibrate className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Vibration</span>
                          </div>
                          <Switch
                            checked={settings.notifications.vibrationEnabled}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('notifications', 'vibrationEnabled', !checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="border-t pt-4 mt-4">
                      <MobileButton
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowQuietHours(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          <span>Quiet Hours</span>
                          {settings.notifications.quietHours.enabled && (
                            <Badge className="bg-blue-100 text-blue-700 ml-2">
                              {settings.notifications.quietHours.startTime} -{' '}
                              {settings.notifications.quietHours.endTime}
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </MobileButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Profile Visibility */}
                    <div>
                      <div className="font-medium text-gray-900 mb-2">Profile Visibility</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['public', 'friends', 'private'].map((option) => (
                          <MobileButton
                            key={option}
                            variant={
                              settings.privacy.profileVisibility === option ? 'default' : 'outline'
                            }
                            size="sm"
                            className="capitalize"
                            onClick={() =>
                              handleSelectSetting('privacy', 'profileVisibility', option)
                            }
                          >
                            {option}
                          </MobileButton>
                        ))}
                      </div>
                    </div>

                    {/* Activity Sharing */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Activity Sharing</div>
                        <div className="text-sm text-gray-600">
                          Share your activity with partner
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.activitySharing}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('privacy', 'activitySharing', !checked)
                        }
                      />
                    </div>

                    {/* Location Sharing */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Location Sharing</div>
                        <div className="text-sm text-gray-600">
                          Share your location for date suggestions
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.locationSharing}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('privacy', 'locationSharing', !checked)
                        }
                      />
                    </div>

                    {/* Read Receipts */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Read Receipts</div>
                        <div className="text-sm text-gray-600">Show when you've read messages</div>
                      </div>
                      <Switch
                        checked={settings.privacy.readReceipts}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('privacy', 'readReceipts', !checked)
                        }
                      />
                    </div>

                    {/* Online Status */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">Online Status</div>
                        <div className="text-sm text-gray-600">Show when you're online</div>
                      </div>
                      <Switch
                        checked={settings.privacy.onlineStatus}
                        onCheckedChange={(checked) =>
                          handleToggleSetting('privacy', 'onlineStatus', !checked)
                        }
                      />
                    </div>

                    {/* Data Collection */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Data & Analytics</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Data Collection</div>
                            <div className="text-sm text-gray-600">Help improve the app</div>
                          </div>
                          <Switch
                            checked={settings.privacy.dataCollection}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('privacy', 'dataCollection', !checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Analytics</div>
                            <div className="text-sm text-gray-600">
                              Usage analytics and insights
                            </div>
                          </div>
                          <Switch
                            checked={settings.privacy.analytics}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('privacy', 'analytics', !checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Theme Selection */}
                    <div>
                      <div className="font-medium text-gray-900 mb-3">Theme</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                          { key: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                          {
                            key: 'system',
                            label: 'System',
                            icon: <Smartphone className="w-4 h-4" />,
                          },
                        ].map((theme) => (
                          <MobileButton
                            key={theme.key}
                            variant={
                              settings.appearance.theme === theme.key ? 'default' : 'outline'
                            }
                            className="flex flex-col gap-1 h-auto py-3"
                            onClick={() => handleSelectSetting('appearance', 'theme', theme.key)}
                          >
                            {theme.icon}
                            <span className="text-xs">{theme.label}</span>
                          </MobileButton>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div>
                      <div className="font-medium text-gray-900 mb-3">Color Scheme</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'default', label: 'Default' },
                          { key: 'warm', label: 'Warm' },
                          { key: 'cool', label: 'Cool' },
                          { key: 'romantic', label: 'Romantic' },
                        ].map((scheme) => (
                          <MobileButton
                            key={scheme.key}
                            variant={
                              settings.appearance.colorScheme === scheme.key ? 'default' : 'outline'
                            }
                            size="sm"
                            className="justify-between"
                            onClick={() =>
                              handleSelectSetting('appearance', 'colorScheme', scheme.key)
                            }
                          >
                            {scheme.label}
                            <Badge className={getColorSchemeBadge(scheme.key)}>●</Badge>
                          </MobileButton>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <div className="font-medium text-gray-900 mb-3">Font Size</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'small', label: 'Small', size: 'text-xs' },
                          { key: 'medium', label: 'Medium', size: 'text-sm' },
                          { key: 'large', label: 'Large', size: 'text-base' },
                        ].map((size) => (
                          <MobileButton
                            key={size.key}
                            variant={
                              settings.appearance.fontSize === size.key ? 'default' : 'outline'
                            }
                            className={cn('justify-center', size.size)}
                            onClick={() => handleSelectSetting('appearance', 'fontSize', size.key)}
                          >
                            Aa
                          </MobileButton>
                        ))}
                      </div>
                    </div>

                    {/* Accessibility Options */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Accessibility</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Reduce Motion</div>
                            <div className="text-sm text-gray-600">Minimize animations</div>
                          </div>
                          <Switch
                            checked={settings.appearance.reduceMotion}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('appearance', 'reduceMotion', !checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">High Contrast</div>
                            <div className="text-sm text-gray-600">Increase color contrast</div>
                          </div>
                          <Switch
                            checked={settings.appearance.highContrast}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('appearance', 'highContrast', !checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Account Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <MobileInput
                          value={settings.account.email}
                          onChange={(e) => handleSelectSetting('account', 'email', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <MobileInput
                          value={settings.account.phoneNumber}
                          onChange={(e) =>
                            handleSelectSetting('account', 'phoneNumber', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Anniversary Date
                        </label>
                        <MobileInput
                          type="date"
                          value={settings.account.anniversaryDate}
                          onChange={(e) =>
                            handleSelectSetting('account', 'anniversaryDate', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Security</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              Two-Factor Authentication
                            </div>
                            <div className="text-sm text-gray-600">
                              Extra security for your account
                            </div>
                          </div>
                          <Switch
                            checked={settings.account.twoFactorEnabled}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('account', 'twoFactorEnabled', !checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Login Alerts</div>
                            <div className="text-sm text-gray-600">Get notified of new logins</div>
                          </div>
                          <Switch
                            checked={settings.account.loginAlerts}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('account', 'loginAlerts', !checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Automatic Backup</div>
                            <div className="text-sm text-gray-600">Backup your data regularly</div>
                          </div>
                          <Switch
                            checked={settings.account.backupEnabled}
                            onCheckedChange={(checked) =>
                              handleToggleSetting('account', 'backupEnabled', !checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>

                      <div className="space-y-3">
                        <MobileButton
                          variant="outline"
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            triggerHaptic('heavy');
                            onSignOut();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </MobileButton>

                        <MobileButton
                          variant="outline"
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            triggerHaptic('heavy');
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </MobileButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Help Section */}
            {activeSection === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Help & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Help Links */}
                    <div className="space-y-3">
                      {[
                        { label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
                        { label: 'Contact Support', icon: <Users className="w-4 h-4" /> },
                        { label: 'Privacy Policy', icon: <Shield className="w-4 h-4" /> },
                        { label: 'Terms of Service', icon: <Info className="w-4 h-4" /> },
                      ].map((item) => (
                        <MobileButton
                          key={item.label}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => {
                            triggerHaptic('light');
                            toast.info(`Opening ${item.label}`);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </MobileButton>
                      ))}
                    </div>

                    {/* App Version */}
                    <div className="border-t pt-4 mt-4 text-center">
                      <div className="text-sm text-gray-600">Couple Connect v2.1.0</div>
                      <div className="text-xs text-gray-500 mt-1">Build 2024.08.16</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <MobileDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle className="text-red-600">Delete Account</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete your account and remove
                all your data from our servers.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <MobileButton
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </MobileButton>

              <MobileButton
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => {
                  triggerHaptic('heavy');
                  onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </MobileButton>
            </div>
          </div>
        </MobileDialogContent>
      </MobileDialog>

      {/* Data Export Dialog */}
      <MobileDialog open={showDataExport} onOpenChange={setShowDataExport}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle>Export Your Data</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Export all your data including messages, photos, achievements, and settings. This may
              take a few minutes to prepare.
            </p>

            <MobileButton
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                triggerHaptic('medium');
                onExportData();
                toast.success("Data export started! You'll receive an email when ready.");
                setShowDataExport(false);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </MobileButton>
          </div>
        </MobileDialogContent>
      </MobileDialog>

      {/* Quiet Hours Dialog */}
      <MobileDialog open={showQuietHours} onOpenChange={setShowQuietHours}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle>Quiet Hours</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Quiet Hours</span>
              <Switch
                checked={settings.notifications.quietHours.enabled}
                onCheckedChange={(checked) =>
                  onSettingUpdate('notifications', 'quietHours', {
                    ...settings.notifications.quietHours,
                    enabled: checked,
                  })
                }
              />
            </div>

            {settings.notifications.quietHours.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <MobileInput
                    type="time"
                    value={settings.notifications.quietHours.startTime}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">End Time</label>
                  <MobileInput
                    type="time"
                    value={settings.notifications.quietHours.endTime}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600">
              During quiet hours, you'll only receive emergency notifications.
            </p>
          </div>
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobileSettings;
