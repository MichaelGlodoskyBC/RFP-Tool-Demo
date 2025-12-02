import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function Settings({ onClose }) {
  const [activeCategory, setActiveCategory] = useState('general');
  const [fullName, setFullName] = useState('Michael Glodosky');
  const [jobTitle, setJobTitle] = useState('Analyst');
  const [department, setDepartment] = useState('Operations');
  const [rfpPreferences, setRfpPreferences] = useState('e.g. default margin threshold: 12%, prefer FTL over LTL for long distances.');
  const [responseCompletions, setResponseCompletions] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [colorMode, setColorMode] = useState('mixed');
  const [chatFont, setChatFont] = useState('medium');

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'account', label: 'Account' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'billing', label: 'Billing' },
    { id: 'usage', label: 'Usage' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'connectors', label: 'Connectors' }
  ];

  const departmentOptions = [
    'Operations',
    'Pricing',
    'Sales',
    'Business Development',
    'Logistics',
    'Supply Chain',
    'Finance',
    'Other'
  ];

  const colorModes = [
    { id: 'light', label: 'Light', preview: 'bg-white' },
    { id: 'mixed', label: 'Mixed', preview: 'bg-gradient-to-b from-slate-800 to-white' },
    { id: 'dark', label: 'Dark', preview: 'bg-slate-800' },
    { id: 'gray', label: 'Gray', preview: 'bg-slate-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="flex h-full">
        {/* Left Sidebar Navigation */}
        <div className="w-64 border-r border-slate-800/50 glass-card p-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            {activeCategory === 'general' && (
              <div className="space-y-8">
                {/* Profile Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Profile</h3>
                  
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full name
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          MG
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="flex-1 px-4 py-2 glass-card border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900/50"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Analyst, Pricing Manager, Operations Specialist"
                        className="w-full px-4 py-2 glass-card border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900/50"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-2 glass-card border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-slate-900/50 pr-10"
                        >
                          {departmentOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900">
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* RFP Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Default RFP Preferences
                      </label>
                      <p className="text-sm text-slate-400 mb-2">
                        Set default preferences for pricing, margins, and workflow that will be applied to new RFPs.
                      </p>
                      <textarea
                        value={rfpPreferences}
                        onChange={(e) => setRfpPreferences(e.target.value)}
                        rows={3}
                        placeholder="e.g. default margin threshold: 12%, prefer FTL over LTL for long distances, auto-apply fuel surcharge adjustments"
                        className="w-full px-4 py-2 glass-card border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-slate-900/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Notifications</h3>
                  
                  <div className="space-y-6">
                    {/* Response Completions */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white mb-1">
                          Response completions
                        </p>
                        <p className="text-sm text-slate-400">
                          Get notified when the tool has finished. Most useful for long-running tasks.
                        </p>
                      </div>
                      <button
                        onClick={() => setResponseCompletions(!responseCompletions)}
                        className={`ml-6 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          responseCompletions ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            responseCompletions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white mb-1">
                          Emails from the tool on the web
                        </p>
                        <p className="text-sm text-slate-400">
                          Get an email when the tool on the web has finished building or needs your response.
                        </p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`ml-6 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailNotifications ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appearance Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Appearance</h3>
                  
                  <div className="space-y-6">
                    {/* Color Mode */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-4">
                        Color mode
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {colorModes.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setColorMode(mode.id)}
                            className={`relative aspect-[4/3] rounded-lg border-2 transition-all overflow-hidden ${
                              colorMode === mode.id
                                ? 'border-indigo-500 shadow-lg shadow-indigo-500/30'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <div className={`w-full h-full ${mode.preview} flex flex-col items-center justify-center p-2`}>
                              {/* Chat preview bubbles */}
                              <div className="w-full space-y-1.5">
                                <div className={`h-3 rounded ${
                                  mode.id === 'light' ? 'bg-slate-200' :
                                  mode.id === 'mixed' ? 'bg-slate-300' :
                                  mode.id === 'dark' ? 'bg-slate-600' :
                                  'bg-slate-500'
                                }`} style={{ width: '60%' }}></div>
                                <div className={`h-3 rounded ${
                                  mode.id === 'light' ? 'bg-slate-100' :
                                  mode.id === 'mixed' ? 'bg-slate-200' :
                                  mode.id === 'dark' ? 'bg-slate-700' :
                                  'bg-slate-500'
                                }`} style={{ width: '70%', marginLeft: 'auto' }}></div>
                              </div>
                            </div>
                            {colorMode === mode.id && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Font */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-4">
                        Chat font
                      </label>
                      <div className="flex gap-3">
                        {['large', 'medium', 'small'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setChatFont(size)}
                            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all glass-card ${
                              chatFont === size
                                ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/30'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`text-white font-medium ${
                                size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-base'
                              }`}
                            >
                              Aa
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory !== 'general' && (
              <div className="py-12 text-center">
                <p className="text-slate-400">Settings for {categories.find(c => c.id === activeCategory)?.label} coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

