import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for undo/redo functionality
 * @param {any} initialValue - Initial value for the history
 * @param {function} onUpdate - Callback when value changes
 * @returns {object} - Undo/redo state and functions
 */
export function useUndoRedo(initialValue, onUpdate = null) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const historyRef = useRef([JSON.parse(JSON.stringify(initialValue))]);
  const historyIndexRef = useRef(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const addToHistory = useCallback((newValue) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(JSON.parse(JSON.stringify(newValue)));
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCurrentValue(newValue);
    setHasUnsavedChanges(true);
    
    if (onUpdate) {
      onUpdate(newValue);
    }
  }, [onUpdate]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const previousValue = historyRef.current[historyIndexRef.current];
      setCurrentValue(previousValue);
      setHasUnsavedChanges(true);
      
      if (onUpdate) {
        onUpdate(previousValue);
      }
    }
  }, [onUpdate]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextValue = historyRef.current[historyIndexRef.current];
      setCurrentValue(nextValue);
      setHasUnsavedChanges(true);
      
      if (onUpdate) {
        onUpdate(nextValue);
      }
    }
  }, [onUpdate]);

  const reset = useCallback((newValue) => {
    setCurrentValue(newValue);
    historyRef.current = [JSON.parse(JSON.stringify(newValue))];
    historyIndexRef.current = 0;
    setHasUnsavedChanges(false);
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    value: currentValue,
    setValue: addToHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };
}

