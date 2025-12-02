/**
 * Template storage utilities using localStorage
 */

const TEMPLATE_STORAGE_KEY = 'rfp_templates';
const ACTIVE_TEMPLATE_KEY = 'rfp_active_template';

/**
 * Get all saved templates
 */
export function getTemplates() {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

/**
 * Save a template
 */
export function saveTemplate(template) {
  try {
    const templates = getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex !== -1) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error('Error saving template:', error);
    return false;
  }
}

/**
 * Delete a template
 */
export function deleteTemplate(templateId) {
  try {
    const templates = getTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}

/**
 * Get active template
 */
export function getActiveTemplate() {
  try {
    const stored = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (!stored) return null;
    
    const templates = getTemplates();
    return templates.find(t => t.id === stored) || null;
  } catch (error) {
    console.error('Error loading active template:', error);
    return null;
  }
}

/**
 * Set active template
 */
export function setActiveTemplate(templateId) {
  try {
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, templateId);
    return true;
  } catch (error) {
    console.error('Error setting active template:', error);
    return false;
  }
}

/**
 * Match template based on headers
 */
export function matchTemplate(headers) {
  const templates = getTemplates();
  if (templates.length === 0) return null;
  
  // Simple matching: count how many template header mappings match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const template of templates) {
    let score = 0;
    const headerLower = headers.map(h => String(h || '').toLowerCase());
    
    // Check each mapping in template
    Object.values(template.mapping || {}).forEach(mappedNames => {
      if (Array.isArray(mappedNames)) {
        mappedNames.forEach(name => {
          if (headerLower.some(h => h.includes(name.toLowerCase()))) {
            score++;
          }
        });
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }
  
  // Only return match if score is reasonable (at least 2 matches)
  return bestScore >= 2 ? bestMatch : null;
}



