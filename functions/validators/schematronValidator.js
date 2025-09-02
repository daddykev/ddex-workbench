// functions/validators/schematronValidator.js
const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const SVRLGenerator = require('../utils/svrlGenerator');

class SchematronValidator {
  constructor() {
    this.rulesCache = new Map();
    this.svrlGenerator = new SVRLGenerator();
    this.lastValidationMetadata = null;
    this.lastValidationResult = null;
  }

  async validate(xmlContent, version, profile, options = {}) {
    const errors = [];
    const passedRules = [];
    
    // Store metadata for potential SVRL generation
    this.lastValidationMetadata = {
      version,
      profile,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Parse the XML - Remove namespaces for easier access
      const parser = new XMLParser({
        ignoreAttributes: false,  // Keep attributes
        attributeNamePrefix: "@_", // Prefix for attributes
        parseAttributeValue: false,  // Keep as strings
        trimValues: true,
        parseTagValue: true,
        ignoreNameSpace: true,  // IGNORE namespaces completely
        removeNSPrefix: true,    // REMOVE all prefixes
        allowBooleanAttributes: true
      });
      
      const parsedDoc = parser.parse(xmlContent);
      
      // Find the root element (should be NewReleaseMessage without namespace now)
      let doc = null;
      let rootElement = null;
      
      // Should be just NewReleaseMessage now
      if (parsedDoc['NewReleaseMessage']) {
        doc = parsedDoc['NewReleaseMessage'];
        rootElement = 'NewReleaseMessage';
      } else {
        // Fallback - look for any key containing NewReleaseMessage
        const key = Object.keys(parsedDoc).find(k => k.includes('NewReleaseMessage'));
        if (key) {
          doc = parsedDoc[key];
          rootElement = key;
        }
      }
      
      if (!doc) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Could not find NewReleaseMessage root element',
          severity: 'error',
          rule: 'Schematron-Parse'
        });
        return this.formatResult(errors, passedRules, options);
      }
      
      // Store message ID in metadata
      if (doc.MessageHeader?.MessageId) {
        this.lastValidationMetadata.messageId = this.getValue(doc.MessageHeader.MessageId);
      }
      
      // Check if profile matches message
      if (profile && doc['@_ReleaseProfileVersionId']) {
        const messageProfile = doc['@_ReleaseProfileVersionId'];
        
        // Map requested profiles to acceptable DDEX profile names
        const profileMap = {
          'AudioAlbum': ['Audio', 'AudioAlbum'],
          'AudioSingle': ['AudioSingle', 'SimpleAudioSingle'],
          'Video': ['Video', 'SimpleVideo'],
          'Classical': ['Classical', 'SimpleClassical'],
          'Ringtone': ['Ringtone', 'SimpleRingtone'],
          'Mixed': ['Mixed', 'MixedMedia'],
          'DJ': ['DJ', 'DJMix', 'DjMix']
        };
        
        const acceptableProfiles = profileMap[profile] || [profile];
        const profileMatches = acceptableProfiles.some(p => 
          messageProfile === p || messageProfile.includes(p)
        );
        
        if (!profileMatches) {
          errors.push({
            line: 0,
            column: 0,
            message: `Message profile "${messageProfile}" does not match requested profile "${profile}"`,
            severity: 'warning',
            rule: 'Schematron-ProfileMismatch',
            context: `Profile: ${profile}`
          });
        }
      }
      
      // Load rules for this version/profile
      const rules = await this.loadSchematronRules(version, profile);
      
      // Apply each rule
      rules.forEach(rule => {
        try {
          const passed = rule.test.call(this, doc);
          
          if (!passed) {
            errors.push({
              line: 0,
              column: 0,
              message: rule.message,
              severity: rule.severity || 'error',
              rule: `Schematron-${rule.name || 'Rule'}`,
              context: `Profile: ${profile}`,
              suggestion: rule.suggestion
            });
          } else {
            passedRules.push({
              name: rule.name,
              description: rule.message,
              severity: rule.severity || 'info',
              context: `Profile: ${profile}`
            });
          }
        } catch (error) {
          console.warn(`Rule ${rule.name} evaluation failed:`, error.message);
        }
      });
      
    } catch (error) {
      console.error('Schematron validation error:', error);
      errors.push({
        line: 0,
        column: 0,
        message: `Schematron validation error: ${error.message}`,
        severity: 'error',
        rule: 'Schematron-Error'
      });
    }

    // Store passed rules for potential SVRL generation
    this.lastValidationMetadata.passedRules = passedRules;
    
    return this.formatResult(errors, passedRules, options);
  }

  /**
   * Format validation result with optional SVRL generation
   */
  formatResult(errors, passedRules, options = {}) {
    const errorList = errors.filter(e => e.severity === 'error');
    const warningList = errors.filter(e => e.severity === 'warning' || e.severity === 'info');
    
    const result = {
      errors: errorList,
      warnings: warningList,
      valid: errorList.length === 0
    };
    
    // Store the result for SVRL generation
    this.lastValidationResult = result;
    
    // Generate SVRL if requested
    if (options.generateSVRL || options.format === 'svrl') {
      try {
        result.svrl = this.svrlGenerator.generateSVRL(result, this.lastValidationMetadata);
      } catch (error) {
        console.error('SVRL generation failed:', error);
        result.svrlError = error.message;
      }
    }
    
    // Include passed rules if verbose mode
    if (options.verbose) {
      result.passedRules = passedRules;
    }
    
    return result;
  }

  /**
   * Generate SVRL report from last validation
   */
  generateSVRL(validationResult = null) {
    if (!this.svrlGenerator) {
      throw new Error('SVRL Generator not initialized');
    }
    
    const result = validationResult || this.lastValidationResult;
    const metadata = this.lastValidationMetadata || {};
    
    return this.svrlGenerator.generateSVRL(result, metadata);
  }

  /**
   * Get SVRL report as a separate call (for API endpoints)
   */
  getLastSVRLReport() {
    if (!this.lastValidationMetadata || !this.lastValidationResult) {
      throw new Error('No validation has been performed yet');
    }
    
    return this.generateSVRL();
  }

  async loadSchematronRules(version, profile) {
    const cacheKey = `${version}-${profile}`;
    
    if (this.rulesCache.has(cacheKey)) {
      return this.rulesCache.get(cacheKey);
    }

    // Use comprehensive built-in rules based on DDEX specifications
    const builtInRules = this.getBuiltInRules(version, profile);
    this.rulesCache.set(cacheKey, builtInRules);
    return builtInRules;
  }

  getBuiltInRules(version, profile) {
    // Base rules common to all profiles
    const baseRules = [
      {
        name: 'MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required',
        severity: 'error'
      },
      {
        name: 'MessageHeader-MessageId',
        test: (doc) => doc.MessageHeader?.MessageId,
        message: 'MessageHeader must contain MessageId',
        severity: 'error'
      },
      {
        name: 'MessageHeader-MessageSender',
        test: (doc) => {
          const sender = doc.MessageHeader?.MessageSender;
          return sender?.PartyId && sender?.PartyName?.FullName;
        },
        message: 'MessageHeader must contain complete MessageSender information (PartyId and PartyName)',
        severity: 'error'
      },
      {
        name: 'MessageHeader-MessageRecipient',
        test: (doc) => {
          const recipient = doc.MessageHeader?.MessageRecipient;
          return recipient?.PartyId && recipient?.PartyName?.FullName;
        },
        message: 'MessageHeader must contain complete MessageRecipient information (PartyId and PartyName)',
        severity: 'error'
      },
      {
        name: 'MessageHeader-MessageCreatedDateTime',
        test: (doc) => doc.MessageHeader?.MessageCreatedDateTime,
        message: 'MessageHeader must contain MessageCreatedDateTime',
        severity: 'error'
      },
      {
        name: 'ReleaseList-Required',
        test: (doc) => !!doc.ReleaseList,
        message: 'ReleaseList is required',
        severity: 'error'
      },
      {
        name: 'ReleaseList-NotEmpty',
        test: (doc) => {
          if (!doc.ReleaseList) return false;
          const releases = this.getReleases(doc);
          return releases.length > 0;
        },
        message: 'ReleaseList must contain at least one Release',
        severity: 'error'
      },
      {
        name: 'ResourceList-Required',
        test: (doc) => !!doc.ResourceList,
        message: 'ResourceList is required',
        severity: 'error'
      },
      {
        name: 'ResourceList-NotEmpty',
        test: (doc) => {
          if (!doc.ResourceList) return false;
          const resources = this.getResources(doc);
          return resources.length > 0;
        },
        message: 'ResourceList must contain at least one Resource',
        severity: 'error'
      },
      {
        name: 'Release-MainRelease',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          // Filter out TrackReleases - they're never main releases
          const mainCandidates = releases.filter(r => !r._isTrackRelease);
          
          // If only one non-track release, it's implicitly main
          if (mainCandidates.length === 1) return true;
          
          // Check for Album or Single type releases (these are implicitly main)
          const albumOrSingle = mainCandidates.filter(r => {
            const releaseType = this.getValue(r.ReleaseType);
            return releaseType === 'Album' || 
                   releaseType === 'Single' ||
                   releaseType === 'EP' ||
                   releaseType === 'SingleResourceRelease';
          });
          
          if (albumOrSingle.length === 1) return true;
          
          // Otherwise check for explicit IsMainRelease
          const explicitMain = mainCandidates.filter(r => 
            r['@_IsMainRelease'] === 'true' || r['@_IsMainRelease'] === true
          );
          
          return explicitMain.length === 1;
        },
        message: 'There must be exactly one identifiable main release',
        severity: 'error'
      },
      {
        name: 'Release-ReleaseId',
        test: (doc) => {
          const releases = this.getReleases(doc);
          // Filter out TrackReleases as they might have different ID requirements
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          return mainReleases.every(release => 
            release.ReleaseId?.GRid || release.ReleaseId?.ICPN || release.ReleaseId?.ProprietaryId
          );
        },
        message: 'Each main Release must have a ReleaseId (GRid, ICPN, or ProprietaryId)',
        severity: 'error'
      },
      {
        name: 'Resource-ResourceReference',
        test: (doc) => {
          const resources = this.getResources(doc);
          const refs = resources.map(r => r.ResourceReference);
          return refs.every(ref => ref) && refs.length === new Set(refs).size;
        },
        message: 'Each Resource must have a unique ResourceReference',
        severity: 'error'
      },
      {
        name: 'Resource-Type',
        test: (doc) => {
          const resources = this.getResources(doc);
          return resources.every(resource => 
            resource.SoundRecording || resource.Video || resource.Image || resource.Text
          );
        },
        message: 'Each Resource must have a type (SoundRecording, Video, Image, or Text)',
        severity: 'error'
      }
    ];

    // Profile-specific rules
    const profileRules = {
      'AudioAlbum': [
        {
          name: 'AudioAlbum-MinimumTracks',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.length >= 2;
          },
          message: 'AudioAlbum profile requires at least 2 SoundRecording resources',
          severity: 'error'
        },
        {
          name: 'AudioAlbum-CoverArt',
          test: (doc) => {
            const resources = this.getResources(doc);
            const images = resources.filter(r => r.Image);
            return images.some(img => {
              const type = this.getValue(img.Image.Type);
              return type === 'FrontCoverImage';
            });
          },
          message: 'AudioAlbum profile requires at least one FrontCoverImage',
          severity: 'warning'
        },
        {
          name: 'AudioAlbum-Duration',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.every(sr => sr.SoundRecording?.Duration);
          },
          message: 'All SoundRecordings should have Duration specified',
          severity: 'warning'
        }
      ],
      'AudioSingle': [
        {
          name: 'AudioSingle-MaximumTracks',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.length <= 4;
          },
          message: 'AudioSingle profile should have no more than 4 SoundRecording resources',
          severity: 'warning'
        },
        {
          name: 'AudioSingle-MainTrack',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            
            // If only one sound recording, it's implicitly the main resource - PASS
            if (soundRecordings.length === 1) return true;
            
            // If multiple, check for explicit main resource marking
            const hasMainResource = soundRecordings.some(r => 
              r['@_IsMainResource'] === 'true' || r['@_IsMainResource'] === true
            );
            
            if (hasMainResource) return true;
            
            // Alternative: Check in ReleaseResourceReferenceList
            const releases = this.getReleases(doc);
            const mainRelease = releases.find(r => !r._isTrackRelease);
            
            if (!mainRelease) return false;
            
            const resourceRefs = mainRelease.ReleaseResourceReferenceList?.ReleaseResourceReference;
            if (!resourceRefs) return false;
            
            const refArray = Array.isArray(resourceRefs) ? resourceRefs : [resourceRefs];
            return refArray.some(ref => 
              ref['@_ReleaseResourceType'] === 'PrimaryResource' ||
              ref.ReleaseResourceType === 'PrimaryResource'
            );
          },
          message: 'Multiple sound recordings require one to be identified as primary',
          severity: 'error'
        }
      ],
      'Video': [
        {
          name: 'Video-RequiredVideo',
          test: (doc) => {
            const resources = this.getResources(doc);
            return resources.some(r => r.Video);
          },
          message: 'Video profile requires at least one Video resource',
          severity: 'error'
        },
        {
          name: 'Video-VideoDetails',
          test: (doc) => {
            const resources = this.getResources(doc);
            const videos = resources.filter(r => r.Video);
            return videos.every(v => v.Video?.VideoCodec);
          },
          message: 'Video resources should specify VideoCodec',
          severity: 'warning'
        }
      ],
      'Classical': [
        {
          name: 'Classical-Composer',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.every(sr => {
              const details = sr.SoundRecording?.SoundRecordingDetailsByTerritory;
              if (!details) return false;
              const detailArray = Array.isArray(details) ? details : [details];
              return detailArray.some(detail => {
                const contributors = Array.isArray(detail.IndirectResourceContributor) 
                  ? detail.IndirectResourceContributor 
                  : [detail.IndirectResourceContributor].filter(Boolean);
                return contributors.some(c => 
                  this.getValue(c.IndirectResourceContributorRole) === 'Composer'
                );
              });
            });
          },
          message: 'Classical profile requires Composer information for all recordings',
          severity: 'error'
        },
        {
          name: 'Classical-WorkTitle',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.every(sr => {
              const titles = sr.SoundRecording?.Title;
              if (!titles) return false;
              const titleArray = Array.isArray(titles) ? titles : [titles];
              return titleArray.some(t => t['@_TitleType'] === 'FormalTitle');
            });
          },
          message: 'Classical recordings should have FormalTitle',
          severity: 'warning'
        }
      ],
      'Ringtone': [
        {
          name: 'Ringtone-Duration',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.every(sr => {
              const duration = sr.SoundRecording?.Duration;
              if (!duration) return false;
              // Parse duration (PT format)
              const match = duration.match(/PT(\d+)S/);
              if (!match) return false;
              const seconds = parseInt(match[1]);
              return seconds <= 40; // Ringtones typically under 40 seconds
            });
          },
          message: 'Ringtone duration should be 40 seconds or less',
          severity: 'warning'
        },
        {
          name: 'Ringtone-Format',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.every(sr => {
              const details = sr.SoundRecording?.SoundRecordingDetailsByTerritory;
              if (!details) return false;
              const detailArray = Array.isArray(details) ? details : [details];
              return detailArray.some(detail => {
                const technicalDetails = detail.TechnicalSoundRecordingDetails;
                if (!technicalDetails) return false;
                const techArray = Array.isArray(technicalDetails) ? technicalDetails : [technicalDetails];
                return techArray.some(tech => {
                  const codec = this.getValue(tech.AudioCodec);
                  return ['MP3', 'AAC', 'M4R'].includes(codec);
                });
              });
            });
          },
          message: 'Ringtone should use appropriate audio codec (MP3, AAC, or M4R)',
          severity: 'info'
        }
      ],
      'Mixed': [
        {
          name: 'Mixed-MultipleResourceTypes',
          test: (doc) => {
            const resources = this.getResources(doc);
            const hasAudio = resources.some(r => r.SoundRecording);
            const hasVideo = resources.some(r => r.Video);
            return hasAudio && hasVideo;
          },
          message: 'Mixed profile should contain both audio and video resources',
          severity: 'warning'
        }
      ],
      'DJ': [
        {
          name: 'DJ-MixType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseType = this.getValue(release.ReleaseType);
              return releaseType === 'DjMix' || releaseType === 'MixTape';
            });
          },
          message: 'DJ profile should specify ReleaseType as DjMix or MixTape',
          severity: 'warning'
        },
        {
          name: 'DJ-Compiler',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.some(sr => {
              const details = sr.SoundRecording?.SoundRecordingDetailsByTerritory;
              if (!details) return false;
              const detailArray = Array.isArray(details) ? details : [details];
              return detailArray.some(detail => {
                const contributors = Array.isArray(detail.ResourceContributor) 
                  ? detail.ResourceContributor 
                  : [detail.ResourceContributor].filter(Boolean);
                return contributors.some(c => 
                  ['Compiler', 'DJ', 'Mixer'].includes(this.getValue(c.ArtistRole))
                );
              });
            });
          },
          message: 'DJ Mix should credit the DJ/Compiler',
          severity: 'error'
        }
      ]
    };

    // Version-specific rules
    if (version === '3.8.2') {
      baseRules.push({
        name: 'UpdateIndicator-Recommended',
        test: (doc) => !!doc.UpdateIndicator,
        message: 'UpdateIndicator is recommended in ERN 3.8.2',
        severity: 'info'
      });
      
      // ERN 3.8.2 requires ReleaseDetailsByTerritory
      baseRules.push({
        name: 'ReleaseDetailsByTerritory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          return mainReleases.every(release => 
            release.ReleaseDetailsByTerritory && release.ReleaseDetailsByTerritory.length > 0
          );
        },
        message: 'ERN 3.8.2 requires ReleaseDetailsByTerritory',
        severity: 'error'
      });
    }

    if (version === '4.3' || version === '4.2') {
      baseRules.push({
        name: 'DealList-Required',
        test: (doc) => !!doc.DealList,
        message: `DealList is required in ERN ${version}`,
        severity: 'error'
      });
      
      baseRules.push({
        name: 'Deal-ValidityPeriod',
        test: (doc) => {
          const deals = this.getDeals(doc);
          
          return deals.every((releaseDeal) => {
            // Handle nested Deal structure in ERN 4.3
            if (releaseDeal.Deal) {
              const nestedDeals = Array.isArray(releaseDeal.Deal) ? releaseDeal.Deal : [releaseDeal.Deal];
              return nestedDeals.every(deal => {
                if (deal.DealTerms) {
                  const dealTermsArray = Array.isArray(deal.DealTerms) ? deal.DealTerms : [deal.DealTerms];
                  return dealTermsArray.some(dt => dt.ValidityPeriod?.StartDate);
                }
                return false;
              });
            }
            
            // Fallback for direct DealTerms
            if (releaseDeal.DealTerms) {
              const dealTermsArray = Array.isArray(releaseDeal.DealTerms) ? releaseDeal.DealTerms : [releaseDeal.DealTerms];
              return dealTermsArray.some(dt => dt.ValidityPeriod?.StartDate);
            }
            
            return false;
          });
        },
        message: 'Each Deal must have a ValidityPeriod with StartDate',
        severity: 'error'
      });
      
      // NOTE: ReleaseDetailsByTerritory is NOT required in ERN 4.3
      // The official DDEX samples don't have it, so we skip this rule for 4.3
    }

    // Add profile-specific rules to base rules
    const specificRules = profileRules[profile] || [];
    return [...baseRules, ...specificRules];
  }

  // Helper methods
  getValue(node) {
    if (!node) return null;
    // Handle multiple ReleaseType elements (can be array)
    if (Array.isArray(node)) {
      // Return the first non-UserDefined type, or the first one
      const nonUserDefined = node.find(n => n !== 'UserDefined' && n['#text'] !== 'UserDefined');
      return nonUserDefined ? (nonUserDefined['#text'] || nonUserDefined) : (node[0]['#text'] || node[0]);
    }
    return node['#text'] || node;
  }

  getReleases(doc) {
    if (!doc.ReleaseList) return [];
    
    const releases = [];
    
    // Get regular Release elements
    if (doc.ReleaseList.Release) {
      const releaseArray = Array.isArray(doc.ReleaseList.Release) 
        ? doc.ReleaseList.Release 
        : [doc.ReleaseList.Release];
      releases.push(...releaseArray.filter(Boolean));
    }
    
    // Get TrackRelease elements if present
    if (doc.ReleaseList.TrackRelease) {
      const trackReleaseArray = Array.isArray(doc.ReleaseList.TrackRelease) 
        ? doc.ReleaseList.TrackRelease 
        : [doc.ReleaseList.TrackRelease];
      // Mark them as track releases for filtering
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
    
    // Collect all resource types and preserve their attributes
    ['SoundRecording', 'Video', 'Image', 'Text'].forEach(type => {
      if (doc.ResourceList[type]) {
        const items = Array.isArray(doc.ResourceList[type]) 
          ? doc.ResourceList[type] 
          : [doc.ResourceList[type]];
        items.forEach(item => {
          // Create resource object preserving all attributes
          const resource = { 
            [type]: item, 
            ResourceReference: item.ResourceReference
          };
          
          // Copy all attributes from the item to the resource wrapper
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

  // Additional helper for territory-specific data
  getTerritoryDetails(release, territoryCode = null) {
    if (release.GlobalReleaseDetails) {
      return release.GlobalReleaseDetails;
    }
    
    if (release.ReleaseDetailsByTerritory) {
      const territories = Array.isArray(release.ReleaseDetailsByTerritory) 
        ? release.ReleaseDetailsByTerritory 
        : [release.ReleaseDetailsByTerritory];
      
      if (territoryCode) {
        return territories.find(t => 
          t.TerritoryCode?.includes(territoryCode)
        );
      }
      
      // Return first or worldwide
      return territories.find(t => 
        t.TerritoryCode?.includes('Worldwide')
      ) || territories[0];
    }
    
    return null;
  }
}

module.exports = SchematronValidator;