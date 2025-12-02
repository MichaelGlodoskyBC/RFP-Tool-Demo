import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, User, Calendar, FileText, Users, Clock, Award, Upload, Edit, Send, ArrowLeft } from 'lucide-react';

export default function RFPDetailHeader({ rfp, onBack }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data - in real app, this would come from props or API
  const metadata = {
    shipperContact: {
      name: 'John Smith',
      email: 'john.smith@usps.gov',
      phone: '(555) 123-4567'
    },
    awardDate: rfp.dueDate ? new Date(new Date(rfp.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    specialTerms: [
      'Minimum 48-hour response time required',
      'NDA required for access to pricing data',
      'Carrier must maintain 95% on-time performance',
      'Quarterly business reviews required'
    ],
    documents: [
      { id: 1, name: 'RFP_Requirements.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 2, name: 'Pricing_Template.xlsx', size: '856 KB', type: 'excel' },
      { id: 3, name: 'Service_Agreement.docx', size: '1.2 MB', type: 'word' }
    ],
    teamMembers: [
      { id: 1, name: 'Sarah Johnson', role: 'Pricing Manager', avatar: 'SJ' },
      { id: 2, name: 'Mike Chen', role: 'Operations Lead', avatar: 'MC' },
      { id: 3, name: 'Emily Davis', role: 'Account Executive', avatar: 'ED' }
    ],
    activity: [
      { id: 1, type: 'uploaded', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), user: 'System' },
      { id: 2, type: 'edited', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), user: 'Sarah Johnson' },
      { id: 3, type: 'submitted', timestamp: rfp.status === 'Submitted' ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null, user: 'Sarah Johnson' },
      { id: 4, type: 'awarded', timestamp: rfp.status === 'Awarded' ? new Date() : null, user: 'System' }
    ].filter(a => a.timestamp)
  };

  const getActivityIcon = (type) => {
    const icons = {
      uploaded: Upload,
      edited: Edit,
      submitted: Send,
      awarded: Award
    };
    return icons[type] || Clock;
  };

  const getActivityColor = (type) => {
    const colors = {
      uploaded: 'text-blue-400',
      edited: 'text-amber-400',
      submitted: 'text-purple-400',
      awarded: 'text-emerald-400'
    };
    return colors[type] || 'text-slate-400';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      {/* Collapsed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div
            className="flex items-center gap-4 cursor-pointer flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">{rfp.shipper}</h2>
              <p className="text-sm text-slate-400 mono">{rfp.id} • {rfp.laneCount} lanes</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{metadata.shipperContact.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDate(rfp.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-800 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Shipper Contact
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  <p className="text-white font-medium">{metadata.shipperContact.name}</p>
                  <p className="text-sm text-slate-400">{metadata.shipperContact.email}</p>
                  <p className="text-sm text-slate-400">{metadata.shipperContact.phone}</p>
                </div>
              </div>

              {/* Special Terms */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Special Terms
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  {metadata.specialTerms.map((term, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <p className="text-sm text-slate-300">{term}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Award Information */}
              {metadata.awardDate && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Award Information
                  </h3>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Award Date</p>
                    <p className="text-white font-medium">{formatDate(metadata.awardDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attached Documents
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  {metadata.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.size}</p>
                        </div>
                      </div>
                      <button className="glass-card p-1.5 rounded text-slate-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  {metadata.teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity Timeline
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-3">
                  {metadata.activity.map((activity, idx) => {
                    const Icon = getActivityIcon(activity.type);
                    const color = getActivityColor(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 relative">
                        <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ${color} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {idx < metadata.activity.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-6 bg-slate-700" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white capitalize">{activity.type}</p>
                          <p className="text-xs text-slate-400">{formatDate(activity.timestamp)}</p>
                          <p className="text-xs text-slate-500">by {activity.user}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

