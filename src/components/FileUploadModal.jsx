import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { parseExcelFile, parseCSVFile, parsePDFFile, validateFileType, extractLanesFromData } from '../utils/fileParser';
import { matchTemplate, getActiveTemplate } from '../utils/templateStorage';
import TemplateConfigModal from './TemplateConfigModal';

export default function FileUploadModal({ isOpen, onClose, rfp, onRFPAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [parsedData, setParsedData] = useState(null);
  const [extractedLanes, setExtractedLanes] = useState([]);
  const [showTemplateConfig, setShowTemplateConfig] = useState(false);
  const [templateMapping, setTemplateMapping] = useState(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      if (!validateFileType(file)) {
        alert(`Invalid file type: ${file.name}. Please upload PDF, Excel, or CSV files.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const fileList = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'parsing',
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...fileList]);
    setUploadStatus('uploading');

    // Parse each file
    for (const fileItem of fileList) {
      try {
        setParsingProgress(0);
        let parsed = null;

        if (fileItem.name.toLowerCase().endsWith('.xlsx') || fileItem.name.toLowerCase().endsWith('.xls')) {
          parsed = await parseExcelFile(fileItem.file);
        } else if (fileItem.name.toLowerCase().endsWith('.csv')) {
          parsed = await parseCSVFile(fileItem.file);
        } else if (fileItem.name.toLowerCase().endsWith('.pdf')) {
          parsed = await parsePDFFile(fileItem.file);
        }

        if (parsed && parsed.headers && parsed.headers.length > 0) {
          // Try to match template
          const matchedTemplate = matchTemplate(parsed.headers) || getActiveTemplate();
          const mapping = matchedTemplate ? matchedTemplate.mapping : null;
          
          setParsedData(parsed);
          setTemplateMapping(mapping);
          
          // Extract lanes
          const lanes = extractLanesFromData(parsed, mapping);
          setExtractedLanes(lanes);
          
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileItem.id ? { ...f, status: 'success', parsed, lanesCount: lanes.length } : f)
          );
        } else {
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: 'Could not parse file' } : f)
          );
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f)
        );
      }
    }

    setUploadStatus('success');
    setParsingProgress(100);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (uploadedFiles.length === 1) {
      setUploadStatus('idle');
    }
  };

  const handleSubmit = () => {
    if (extractedLanes.length === 0) {
      alert('No lanes extracted from files. Please check your file format.');
      return;
    }

    // Create new RFP from extracted lanes
    const newRFP = {
      id: `RFP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      shipper: 'New Shipper', // Could be extracted from file or user input
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      mode: 'FTL',
      status: 'In Progress',
      laneCount: extractedLanes.length,
      completeness: 0,
      triageScore: 7.0,
      template: templateMapping ? 'Custom Template' : 'Auto-detected',
      hasNDA: false,
      lanes: extractedLanes,
      metadata: {
        totalVolume: extractedLanes.reduce((sum, l) => sum + (l.volume || 1), 0),
        avgDistance: Math.round(extractedLanes.reduce((sum, l) => sum + l.distance, 0) / extractedLanes.length),
        regions: [],
        equipment: [...new Set(extractedLanes.map(l => l.equipment).filter(Boolean))]
      }
    };

    if (onRFPAdded) {
      onRFPAdded(newRFP);
    }
    
    // Reset state
    setUploadedFiles([]);
    setParsedData(null);
    setExtractedLanes([]);
    setTemplateMapping(null);
    setUploadStatus('idle');
    onClose();
  };

  const handleConfigureTemplate = () => {
    if (parsedData) {
      setShowTemplateConfig(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {rfp ? 'Submit RFP' : 'Add New RFP'}
            </h2>
            {rfp && (
              <p className="text-sm text-slate-400">
                {rfp.shipper} • {rfp.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 mb-6
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
              : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/30'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-4 rounded-full transition-colors
              ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-800/50'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-white mb-2">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-400">
                or <span className="text-indigo-400 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Supports PDF, Excel (.xlsx, .xls), and CSV files
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="glass-card rounded-lg p-4 flex items-center justify-between animate-slide-up"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <File className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {fileItem.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(fileItem.size)}
                      </p>
                    </div>
                    {fileItem.status === 'success' && (
                      <div className="flex items-center gap-2">
                        {fileItem.lanesCount && (
                          <span className="text-xs text-slate-400">{fileItem.lanesCount} lanes</span>
                        )}
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      </div>
                    )}
                    {fileItem.status === 'parsing' && (
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(fileItem.id);
                    }}
                    className="ml-3 p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadStatus === 'success' && extractedLanes.length > 0 && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-400 font-medium">
                Successfully extracted {extractedLanes.length} lanes
              </p>
            </div>
            {parsedData && (
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleConfigureTemplate}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Configure Template Mapping
                </button>
              </div>
            )}
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Parsing files...</span>
              <span className="text-sm text-slate-400">{parsingProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${parsingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={extractedLanes.length === 0}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
              ${extractedLanes.length > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <Upload className="w-4 h-4" />
            {rfp ? 'Submit RFP' : 'Add RFP'}
          </button>
        </div>
      </div>

      {/* Template Configuration Modal */}
      {showTemplateConfig && parsedData && (
        <TemplateConfigModal
          isOpen={showTemplateConfig}
          onClose={() => setShowTemplateConfig(false)}
          headers={parsedData.headers}
          initialMapping={templateMapping}
          onSave={(mapping) => {
            setTemplateMapping(mapping);
            // Re-extract lanes with new mapping
            const lanes = extractLanesFromData(parsedData, mapping);
            setExtractedLanes(lanes);
            setShowTemplateConfig(false);
          }}
        />
      )}
    </div>
  );
}

