// src/utils/xmlSecurity.js

/**
 * XML Security utilities for validating and sanitizing XML content
 */

// Maximum file sizes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ENTITY_EXPANSIONS = 100; // Limit entity expansions

// Suspicious patterns that could indicate attacks
const SUSPICIOUS_PATTERNS = [
  {
    pattern: /<!DOCTYPE[^>]*\[[\s\S]*?\]>/gi,
    message: 'DTD declarations with internal subset are not allowed for security reasons'
  },
  {
    pattern: /<!ENTITY\s+[^>]*>/gi,
    message: 'Entity declarations are not allowed for security reasons'
  },
  {
    pattern: /<!ELEMENT\s+[^>]*>/gi,
    message: 'Element declarations are not allowed'
  },
  {
    pattern: /<!ATTLIST\s+[^>]*>/gi,
    message: 'Attribute list declarations are not allowed'
  },
  {
    pattern: /<!NOTATION\s+[^>]*>/gi,
    message: 'Notation declarations are not allowed'
  },
  {
    pattern: /\bSYSTEM\s+["'][^"']*["']/gi,
    message: 'External system references are not allowed'
  },
  {
    pattern: /\bPUBLIC\s+["'][^"']*["']/gi,
    message: 'External public references are not allowed'
  }
];

// Check for potential XML bombs (excessive entity references)
const XML_BOMB_PATTERNS = [
  {
    pattern: /(&[^;]{1,20};){10,}/g, // More than 10 entity references in succession
    message: 'Excessive entity references detected (potential XML bomb)'
  },
  {
    pattern: /(<[^>]*>){1000,}/g, // More than 1000 tags
    message: 'Excessive number of XML tags detected'
  }
];

/**
 * Validate XML content for security issues
 * @param {string} xmlContent - The XML content to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateXMLSecurity(xmlContent) {
  if (!xmlContent) {
    return { valid: false, error: 'No XML content provided' };
  }

  // Check size
  const sizeInBytes = new Blob([xmlContent]).size;
  if (sizeInBytes > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `XML content exceeds maximum size limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  // Check for suspicious patterns
  for (const { pattern, message } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(xmlContent)) {
      return { valid: false, error: message };
    }
  }

  // Check for XML bomb patterns
  for (const { pattern, message } of XML_BOMB_PATTERNS) {
    const matches = xmlContent.match(pattern);
    if (matches && matches.length > 0) {
      return { valid: false, error: message };
    }
  }

  // Check for recursive entity references
  const entityPattern = /&([^;]+);/g;
  const entities = new Map();
  let match;
  
  while ((match = entityPattern.exec(xmlContent)) !== null) {
    const entityName = match[1];
    entities.set(entityName, (entities.get(entityName) || 0) + 1);
    
    // If any entity appears too many times, it might be a bomb
    if (entities.get(entityName) > MAX_ENTITY_EXPANSIONS) {
      return { 
        valid: false, 
        error: `Entity '${entityName}' appears too many times (potential XML bomb)` 
      };
    }
  }

  // Check nesting depth (simple check)
  const nestingDepth = checkNestingDepth(xmlContent);
  if (nestingDepth > 100) {
    return { 
      valid: false, 
      error: 'XML nesting depth exceeds safe limit' 
    };
  }

  return { valid: true };
}

/**
 * Check XML nesting depth
 * @param {string} xmlContent 
 * @returns {number} Maximum nesting depth
 */
function checkNestingDepth(xmlContent) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  // Simple regex-based depth checker (not perfect but good enough for security)
  const tokens = xmlContent.match(/<[^>]+>/g) || [];
  
  for (const token of tokens) {
    if (token.startsWith('</')) {
      currentDepth--;
    } else if (!token.startsWith('<?') && !token.startsWith('<!') && !token.endsWith('/>')) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
  }
  
  return maxDepth;
}

/**
 * Sanitize file name to prevent path traversal
 * @param {string} fileName 
 * @returns {string} Sanitized file name
 */
export function sanitizeFileName(fileName) {
  // Remove any path components
  return fileName.replace(/^.*[\\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validate file type
 * @param {File} file 
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateFileType(file) {
  const validTypes = ['text/xml', 'application/xml', 'text/plain'];
  const validExtensions = ['.xml', '.ern'];
  
  const hasValidType = validTypes.includes(file.type) || file.type === '';
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidType && !hasValidExtension) {
    return { 
      valid: false, 
      error: 'Please select a valid XML file (.xml or .ern)' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate URL for loading external XML
 * @param {string} url 
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateURL(url) {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS in production
    if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
      return { 
        valid: false, 
        error: 'Only HTTPS URLs are allowed' 
      };
    }
    
    // Block local/internal URLs
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(urlObj.hostname)) {
      return { 
        valid: false, 
        error: 'Local URLs are not allowed' 
      };
    }
    
    // Block private IP ranges
    const privateIPRegex = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;
    if (privateIPRegex.test(urlObj.hostname)) {
      return { 
        valid: false, 
        error: 'Private network URLs are not allowed' 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Invalid URL format' 
    };
  }
}