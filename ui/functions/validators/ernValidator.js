// functions/validators/ernValidator.js
const { XMLParser, XMLValidator } = require('fast-xml-parser');

// ERN version-specific configurations
const ERN_CONFIGS = {
  '4.3': {
    namespaces: {
      main: 'http://ddex.net/xml/ern/43',
      release: 'http://ddex.net/xml/ern/43'
    },
    rootElements: ['NewReleaseMessage'],
    profiles: ['AudioAlbum', 'AudioSingle', 'Video', 'Mixed']
  },
  '4.2': {
    namespaces: {
      main: 'http://ddex.net/xml/ern/42',
      release: 'http://ddex.net/xml/ern/42'
    },
    rootElements: ['NewReleaseMessage'],
    profiles: ['AudioAlbum', 'AudioSingle', 'Video', 'Mixed']
  },
  '3.8.2': {
    namespaces: {
      main: 'http://ddex.net/xml/ern/382',
      release: 'http://ddex.net/xml/ern/382'
    },
    rootElements: ['NewReleaseMessage'],
    profiles: ['AudioAlbum', 'AudioSingle', 'Video', 'Mixed', 'ReleaseByRelease']
  }
};

class ERNValidator {
  constructor(version = '4.3') {
    this.version = version;
    this.config = ERN_CONFIGS[version];
    
    if (!this.config) {
      throw new Error(`Unsupported ERN version: ${version}`);
    }
  }

  async validate(xmlContent, profile) {
    const errors = [];
    
    // Step 1: Basic XML well-formedness check
    const wellFormednessResult = XMLValidator.validate(xmlContent, {
      allowBooleanAttributes: true,
      ignoreAttributes: false
    });

    if (wellFormednessResult !== true) {
      errors.push({
        line: wellFormednessResult.err.line || 0,
        column: wellFormednessResult.err.col || 0,
        message: wellFormednessResult.err.msg,
        severity: 'error',
        rule: 'XML Well-formedness'
      });
      
      return { valid: false, errors };
    }

    // Step 2: Parse XML for structural validation
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true,
      removeNSPrefix: false, // Keep namespace prefixes for proper validation
      parseTagValue: true
    });

    let parsedDoc;
    try {
      parsedDoc = parser.parse(xmlContent);
    } catch (error) {
      errors.push({
        line: 0,
        column: 0,
        message: `Failed to parse XML: ${error.message}`,
        severity: 'error',
        rule: 'XML Parsing'
      });
      return { valid: false, errors };
    }

    // Step 3: Version-specific validation
    this.validateVersionSpecific(parsedDoc, errors);

    // Step 4: Profile-specific validation
    if (profile) {
      this.validateProfile(parsedDoc, profile, errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateVersionSpecific(doc, errors) {
    // Get the root element (handle with or without namespace prefix)
    const rootKeys = Object.keys(doc);
    const rootElement = rootKeys.find(key => 
      key.includes('NewReleaseMessage') || key === 'NewReleaseMessage'
    );
    
    if (!rootElement) {
      errors.push({
        line: 1,
        column: 1,
        message: `Invalid root element. Expected 'NewReleaseMessage', found '${rootKeys[0]}'`,
        severity: 'error',
        rule: 'Root Element'
      });
      return;
    }

    // Get the actual root object
    const root = doc[rootElement];

    // Version-specific business rules
    switch (this.version) {
      case '4.3':
        this.validateERN43Rules(root, errors);
        break;
      case '4.2':
        this.validateERN42Rules(root, errors);
        break;
      case '3.8.2':
        this.validateERN382Rules(root, errors);
        break;
    }
  }

  validateERN43Rules(root, errors) {
    // ERN 4.3 specific validations
    if (!root.MessageHeader) {
      errors.push({
        line: 0,
        column: 0,
        message: 'MessageHeader is required in ERN 4.3',
        severity: 'error',
        rule: 'ERN43-MessageHeader'
      });
    }

    // UpdateIndicator was REMOVED in ERN 4.x - don't check for it!
    
    // Check for ReleaseList
    if (!root.ReleaseList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ReleaseList is required in ERN 4.3',
        severity: 'error',
        rule: 'ERN43-ReleaseList'
      });
    }

    // Check for ResourceList
    if (!root.ResourceList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ResourceList is required in ERN 4.3',
        severity: 'error',
        rule: 'ERN43-ResourceList'
      });
    }

    // Check for DealList
    if (!root.DealList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'DealList is required in ERN 4.3',
        severity: 'error',
        rule: 'ERN43-DealList'
      });
    }
  }

  validateERN42Rules(root, errors) {
    // ERN 4.2 specific validations
    if (!root.MessageHeader) {
      errors.push({
        line: 0,
        column: 0,
        message: 'MessageHeader is required in ERN 4.2',
        severity: 'error',
        rule: 'ERN42-MessageHeader'
      });
    }

    // Similar structure checks as 4.3
    if (!root.ReleaseList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ReleaseList is required in ERN 4.2',
        severity: 'error',
        rule: 'ERN42-ReleaseList'
      });
    }
  }

  validateERN382Rules(root, errors) {
    // ERN 3.8.2 specific validations
    if (!root.MessageHeader) {
      errors.push({
        line: 0,
        column: 0,
        message: 'MessageHeader is required in ERN 3.8.2',
        severity: 'error',
        rule: 'ERN382-MessageHeader'
      });
    }

    // UpdateIndicator is optional in ERN 3.x - just note if it's missing
    if (!root.UpdateIndicator) {
      errors.push({
        line: 0,
        column: 0,
        message: 'UpdateIndicator is recommended but not required in ERN 3.8.2',
        severity: 'warning',
        rule: 'ERN382-UpdateIndicator'
      });
    }
    
    // Check for ReleaseList
    if (!root.ReleaseList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ReleaseList is required in ERN 3.8.2',
        severity: 'error',
        rule: 'ERN382-ReleaseList'
      });
    }

    // Check for ResourceList
    if (!root.ResourceList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ResourceList is required in ERN 3.8.2',
        severity: 'error',
        rule: 'ERN382-ResourceList'
      });
    }
  }

  validateProfile(doc, profile, errors) {
    // Get the root element
    const rootKeys = Object.keys(doc);
    const rootElement = rootKeys.find(key => 
      key.includes('NewReleaseMessage') || key === 'NewReleaseMessage'
    );
    const root = doc[rootElement];

    // Profile-specific validation rules
    switch (profile) {
      case 'AudioAlbum':
        this.validateAudioAlbumProfile(root, errors);
        break;
      case 'AudioSingle':
        this.validateAudioSingleProfile(root, errors);
        break;
      case 'Video':
        this.validateVideoProfile(root, errors);
        break;
      case 'Mixed':
        this.validateMixedProfile(root, errors);
        break;
      case 'ReleaseByRelease':
        if (!this.version.startsWith('3.')) {
          errors.push({
            line: 0,
            column: 0,
            message: `Profile 'ReleaseByRelease' is only available in ERN 3.x versions`,
            severity: 'error',
            rule: 'Profile-Version-Mismatch'
          });
        }
        break;
    }
  }

  validateAudioAlbumProfile(root, errors) {
    // Audio Album specific checks
    if (!root.ReleaseList || !root.ReleaseList.Release) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ReleaseList with at least one Release is required for AudioAlbum profile',
        severity: 'error',
        rule: 'AudioAlbum-ReleaseList'
      });
      return;
    }

    // Check if it's actually an album (multiple tracks)
    const release = Array.isArray(root.ReleaseList.Release) 
      ? root.ReleaseList.Release[0] 
      : root.ReleaseList.Release;
    
    if (release.ReleaseType && release.ReleaseType !== 'Album' && release.ReleaseType !== 'EP') {
      errors.push({
        line: 0,
        column: 0,
        message: `AudioAlbum profile expects ReleaseType 'Album' or 'EP', found '${release.ReleaseType}'`,
        severity: 'warning',
        rule: 'AudioAlbum-ReleaseType'
      });
    }
  }

  validateAudioSingleProfile(root, errors) {
    // Audio Single specific checks
    if (!root.ReleaseList || !root.ReleaseList.Release) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ReleaseList with at least one Release is required for AudioSingle profile',
        severity: 'error',
        rule: 'AudioSingle-ReleaseList'
      });
      return;
    }

    const releases = Array.isArray(root.ReleaseList.Release) 
      ? root.ReleaseList.Release 
      : [root.ReleaseList.Release];
    
    if (releases.length > 1) {
      errors.push({
        line: 0,
        column: 0,
        message: 'AudioSingle profile should contain only one main Release',
        severity: 'warning',
        rule: 'AudioSingle-SingleRelease'
      });
    }
  }

  validateVideoProfile(root, errors) {
    // Video profile specific checks
    if (!root.ResourceList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ResourceList is required for Video profile',
        severity: 'error',
        rule: 'Video-ResourceList'
      });
      return;
    }

    // Check for video resources
    const hasVideo = Object.keys(root.ResourceList).some(key => 
      key.includes('Video') || key === 'Video'
    );

    if (!hasVideo) {
      errors.push({
        line: 0,
        column: 0,
        message: 'Video profile requires at least one Video resource',
        severity: 'error',
        rule: 'Video-VideoResource'
      });
    }
  }

  validateMixedProfile(root, errors) {
    // Mixed profile allows various content types - minimal validation
    if (!root.ResourceList) {
      errors.push({
        line: 0,
        column: 0,
        message: 'ResourceList is required for Mixed profile',
        severity: 'error',
        rule: 'Mixed-ResourceList'
      });
    }
  }
}

module.exports = { ERNValidator, ERN_CONFIGS };