// functions/validators/rules/schematron-382.js
/**
 * ERN 3.8.2 Schematron-equivalent validation rules
 * Based on ERN 3.8.2 XSD and DDEX specifications
 */

class ERN382Rules {
  constructor() {
    this.version = '3.8.2';
  }

  /**
   * Get all base structural rules for ERN 3.8.2
   */
  getStructuralRules() {
    return [
      {
        name: 'ERN382-MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required in ERN 3.8.2',
        severity: 'error'
      },
      {
        name: 'ERN382-UpdateIndicator-Recommended',
        test: (doc) => !!doc.UpdateIndicator,
        message: 'UpdateIndicator is recommended but not required in ERN 3.8.2',
        severity: 'warning',
        suggestion: 'Add UpdateIndicator element to specify if this is an update or original message'
      },
      {
        name: 'ERN382-ResourceList-Required',
        test: (doc) => !!doc.ResourceList,
        message: 'ResourceList is required in ERN 3.8.2',
        severity: 'error'
      },
      {
        name: 'ERN382-ReleaseList-Required',
        test: (doc) => !!doc.ReleaseList,
        message: 'ReleaseList is required in ERN 3.8.2',
        severity: 'error'
      },
      // TODO: Add more ERN 3.8.2 specific rules based on XSD analysis
      {
        name: 'ERN382-ReleaseDetailsByTerritory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            // In ERN 3.x, ReleaseDetailsByTerritory is the primary way to specify details
            return !!release.ReleaseDetailsByTerritory;
          });
        },
        message: 'Releases in ERN 3.8.2 should use ReleaseDetailsByTerritory for territorial details',
        severity: 'warning'
      }
    ];
  }

  /**
   * Get all rules for ERN 3.8.2
   */
  getAllRules() {
    return [
      ...this.getStructuralRules()
      // TODO: Add more rule categories as we analyze the XSD
    ];
  }

  /**
   * Get profile-specific rules for ERN 3.8.2
   */
  getProfileRules(profile) {
    // TODO: Implement profile-specific rules for ERN 3.8.2
    return [];
  }

  // Helper methods
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
          resources.push(resource);
        });
      }
    });
    
    return resources;
  }
}

module.exports = ERN382Rules;