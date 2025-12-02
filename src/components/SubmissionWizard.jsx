import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, FileText, Download, Send, ChevronRight, ChevronLeft } from 'lucide-react';

export default function SubmissionWizard({ isOpen, onClose, rfp, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [exportFormat, setExportFormat] = useState('excel');
  const [narrative, setNarrative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 4;

  // Pre-flight check
  const preflightChecks = [
    {
      id: 'errors',
      label: 'Errors',
      count: rfp.lanes.filter(l => l.status === 'Error').length,
      status: rfp.lanes.filter(l => l.status === 'Error').length === 0 ? 'pass' : 'fail',
      icon: XCircle,
      color: 'text-red-400'
    },
    {
      id: 'warnings',
      label: 'Warnings',
      count: rfp.lanes.filter(l => l.status === 'Warning').length,
      status: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-400'
    },
    {
      id: 'completeness',
      label: 'Completeness',
      value: `${rfp.completeness}%`,
      status: rfp.completeness >= 100 ? 'pass' : 'warning',
      icon: CheckCircle,
      color: rfp.completeness >= 100 ? 'text-emerald-400' : 'text-amber-400'
    },
    {
      id: 'validation',
      label: 'Validation',
      status: 'pass',
      icon: CheckCircle,
      color: 'text-emerald-400'
    }
  ];

  const exportFormats = [
    { id: 'excel', name: 'Excel (.xlsx)', description: 'Standard Excel format with formulas', icon: '📊' },
    { id: 'csv', name: 'CSV (.csv)', description: 'Comma-separated values', icon: '📄' },
    { id: 'pdf', name: 'PDF (.pdf)', description: 'Formatted PDF document', icon: '📑' },
    { id: 'json', name: 'JSON (.json)', description: 'Machine-readable format', icon: '🔧' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
    if (onSubmit) {
      onSubmit({
        format: exportFormat,
        narrative,
        timestamp: new Date().toISOString()
      });
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return preflightChecks.find(c => c.status === 'fail') === undefined;
    }
    if (currentStep === 2) {
      return exportFormat !== '';
    }
    if (currentStep === 3) {
      return true; // Narrative is optional
    }
    return true;
  };

  const progress = (currentStep / totalSteps) * 100;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card rounded-2xl p-8 w-full max-w-2xl animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Submission Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your RFP has been submitted successfully. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Simulate download
                const link = document.createElement('a');
                link.href = '#';
                link.download = `${rfp.id}_submission.${exportFormat}`;
                link.click();
              }}
              className="w-full glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Submission File
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Submit RFP</h2>
            <p className="text-sm text-slate-400">{rfp.shipper} • {rfp.id}</p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6 min-h-[400px]">
          {/* Step 1: Pre-flight Check */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Pre-flight Check</h3>
              <p className="text-sm text-slate-400 mb-6">
                Review all errors and warnings before submitting your RFP.
              </p>
              <div className="space-y-3">
                {preflightChecks.map(check => {
                  const Icon = check.icon;
                  return (
                    <div
                      key={check.id}
                      className={`glass-card rounded-lg p-4 flex items-center justify-between ${
                        check.status === 'fail' ? 'border border-red-500/30 bg-red-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${check.color}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{check.label}</p>
                          {check.count !== undefined && (
                            <p className="text-xs text-slate-400">{check.count} found</p>
                          )}
                          {check.value && (
                            <p className="text-xs text-slate-400">{check.value}</p>
                          )}
                        </div>
                      </div>
                      {check.status === 'pass' && (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                      {check.status === 'fail' && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  );
                })}
              </div>
              {preflightChecks.find(c => c.status === 'fail') && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    Please resolve all errors before proceeding with submission.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Export Format */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Export Format</h3>
              <p className="text-sm text-slate-400 mb-6">
                Select the format for your RFP submission.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {exportFormats.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`glass-card rounded-lg p-4 text-left transition-all ${
                      exportFormat === format.id
                        ? 'border-2 border-indigo-500 bg-indigo-500/20'
                        : 'border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{format.icon}</div>
                    <p className="text-sm font-medium text-white mb-1">{format.name}</p>
                    <p className="text-xs text-slate-400">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Narrative */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Narrative</h3>
              <p className="text-sm text-slate-400 mb-6">
                Add any additional notes or narrative to accompany your submission (optional).
              </p>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Enter your narrative here..."
                rows={10}
                className="w-full glass-card rounded-lg px-4 py-3 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="mt-2 text-xs text-slate-400">
                {narrative.length} characters
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Review & Confirm</h3>
              <p className="text-sm text-slate-400 mb-6">
                Please review your submission details before confirming.
              </p>
              <div className="glass-card rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">RFP ID</p>
                  <p className="text-sm text-white font-medium">{rfp.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Shipper</p>
                  <p className="text-sm text-white font-medium">{rfp.shipper}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Export Format</p>
                  <p className="text-sm text-white font-medium">
                    {exportFormats.find(f => f.id === exportFormat)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lanes</p>
                  <p className="text-sm text-white font-medium">{rfp.laneCount} lanes</p>
                </div>
                {narrative && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Narrative</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{narrative}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit RFP
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



