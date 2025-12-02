import React, { useState, useRef, useEffect } from 'react';
import { Package, Bell, Settings, Users, Mail, FileText, Clock, CheckCircle, ExternalLink, UserPlus, FolderOpen, FileEdit, ChevronRight } from 'lucide-react';

export default function Header({ onSettingsClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Dummy notification data
  const notifications = [
    {
      id: 1,
      type: 'email',
      message: '3 new RFPs were added from email',
      time: '5 minutes ago',
      icon: Mail,
      unread: true
    },
    {
      id: 2,
      type: 'rfp',
      message: 'RFP #2024-045 requires your attention',
      time: '15 minutes ago',
      icon: FileText,
      unread: true
    },
    {
      id: 3,
      type: 'deadline',
      message: 'Deadline approaching for RFP #2024-042',
      time: '1 hour ago',
      icon: Clock,
      unread: true
    },
    {
      id: 4,
      type: 'completed',
      message: 'Response completed for RFP #2024-038',
      time: '2 hours ago',
      icon: CheckCircle,
      unread: false
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  return (
    <header className="glass-card border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">RFP Command</h1>
                <p className="text-xs text-slate-400 mono">FREIGHT PRICING ENGINE</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">3</span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden animate-slide-up bg-slate-900/95 backdrop-blur-xl">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <p className="text-xs text-slate-400 mt-1">You have 3 unread notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                            notification.unread ? 'bg-slate-800/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              notification.type === 'email' ? 'bg-indigo-500/20 text-indigo-400' :
                              notification.type === 'rfp' ? 'bg-purple-500/20 text-purple-400' :
                              notification.type === 'deadline' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notification.unread ? 'text-white font-medium' : 'text-slate-300'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-slate-700/50">
                    <button className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={onSettingsClick}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="glass-card px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Analyst</p>
                  <p className="text-xs text-slate-400">Operations</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden animate-slide-up bg-slate-900/95 backdrop-blur-xl z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">RFP Command</h3>
                    <button className="text-sm text-slate-400 hover:text-white transition-colors">
                      Sign out
                    </button>
                  </div>
                  
                  {/* Profile Section */}
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Michael Glodosky</p>
                        <p className="text-xs text-slate-400 truncate">mglodosky@bearcognition.com</p>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1 flex items-center gap-1">
                          View account
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="py-2">
                    <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left group">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-sm text-white">My RFPs</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    
                    <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left group">
                      <div className="flex items-center gap-3">
                        <FileEdit className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-sm text-white">Templates</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    
                    <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left group border border-slate-600/30">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-sm text-white">Preferences</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-3 border-t border-slate-700/50">
                    <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-800/50 transition-colors text-left rounded-lg">
                      <UserPlus className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-white">Add another account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
