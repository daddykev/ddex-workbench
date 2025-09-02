// functions/validators/rules/schematron-42.js
/**
 * ERN 4.2 Schematron-equivalent validation rules
 * Based on ERN 4.2 XSD and DDEX specifications
 */

class ERN42Rules {
  constructor() {
    this.version = '4.2';
  }

  /**
   * Get all base structural rules for ERN 4.2
   */
  getStructuralRules() {
    return [
      {
        name: 'ERN42-MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required in ERN 4.2',
        severity: 'error'
      },
      {
        name: 'ERN42-ResourceList-Required',
        test: (doc) => !!doc.ResourceList,
        message: 'ResourceList is required in ERN 4.2',
        severity: 'error'
      },
      {
        name: 'ERN42-ReleaseList-Required',
        test: (doc) => !!doc.ReleaseList,
        message: 'ReleaseList is required in ERN 4.2',
        severity: 'error'
      },
      // TODO: Add more ERN 4.2 specific rules based on XSD analysis
      // Note: ERN 4.2 is very similar to 4.3 but may have some differences
    ];
  }

  /**
   * Get all rules for ERN 4.2
   */
  getAllRules() {
    return [
      ...this.getStructuralRules()
      // TODO: Add more rule categories as we analyze the XSD
    ];
  }

  /**
   * Get profile-specific rules for ERN 4.2
   */
  getProfileRules(profile) {
    // TODO: Implement profile-specific rules for ERN 4.2
    return [];
  }

  // Helper methods (similar to ERN 4.3)
  getValue(node) {
    if (!node) return null;
    if (Array.isArray(node)) {
      const nonUserDefined = node.find(n => n !== 'UserDefined' && n['#text'] !== 'UserDefined');
      return nonUserDefined ? (nonUserDefined['#text'] || nonUserDefined) : (node[0]['#text'] || node[0]);
    }
    return node['#text'] || node;
  }

  getReleases(doc) {
    if (!doc.ReleaseList) return [];
    
    const releases = [];
    
    if (doc.ReleaseList.Release) {
      const releaseArray = Array.isArray(doc.ReleaseList.Release) 
        ? doc.ReleaseList.Release 
        : [doc.ReleaseList.Release];
      releases.push(...releaseArray.filter(Boolean));
    }
    
    if (doc.ReleaseList.TrackRelease) {
      const trackReleaseArray = Array.isArray(doc.ReleaseList.TrackRelease) 
        ? doc.ReleaseList.TrackRelease 
        : [doc.ReleaseList.TrackRelease];
      trackReleaseArray.forEach(tr => {
        if (tr) {
          tr._isTrackRelease = true;
          releases.push(tr);
        }
      });
    }
    
    return releases;
  }

  getResources(doc) {
    if (!doc.ResourceList) return [];
    
    const resources = [];
    
    ['SoundRecording', 'Video', 'Image', 'Text'].forEach(type => {
      if (doc.ResourceList[type]) {
        const items = Array.isArray(doc.ResourceList[type]) 
          ? doc.ResourceList[type] 
          : [doc.ResourceList[type]];
        items.forEach(item => {
          const resource = { 
            [type]: item, 
            ResourceReference: item.ResourceReference
          };
          
          for (const key of Object.keys(item)) {
            if (key.startsWith('@')) {
              resource[key] = item[key];
            }
          }
          
          resources.push(resource);
        });
      }
    });
    
    return resources;
  }

  getDeals(doc) {
    if (!doc.DealList || !doc.DealList.ReleaseDeal) return [];
    return Array.isArray(doc.DealList.ReleaseDeal) 
      ? doc.DealList.ReleaseDeal 
      : [doc.DealList.ReleaseDeal].filter(Boolean);
  }
}

module.exports = ERN42Rules;