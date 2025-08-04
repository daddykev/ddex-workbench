// functions/validators/schematronValidator.js
const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

class SchematronValidator {
  constructor() {
    this.rulesCache = new Map();
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
          const releases = Array.isArray(doc.ReleaseList.Release) 
            ? doc.ReleaseList.Release 
            : [doc.ReleaseList.Release];
          return releases.length > 0 && releases[0];
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
        name: 'Release-ReleaseId',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => 
            release.ReleaseId?.GRid || release.ReleaseId?.ICPN || release.ReleaseId?.ProprietaryId
          );
        },
        message: 'Each Release must have a ReleaseId (GRid, ICPN, or ProprietaryId)',
        severity: 'error'
      },
      {
        name: 'Release-ReleaseReference',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => release.ReleaseReference);
        },
        message: 'Each Release must have a ReleaseReference',
        severity: 'error'
      },
      {
        name: 'Resource-ResourceReference',
        test: (doc) => {
          const resources = this.getAllResources(doc);
          return resources.every(resource => resource.ResourceReference);
        },
        message: 'Each Resource must have a ResourceReference',
        severity: 'error'
      },
      {
        name: 'ResourceReference-Uniqueness',
        test: (doc) => {
          const refs = this.getAllResourceReferences(doc);
          const uniqueRefs = new Set(refs);
          return refs.length === uniqueRefs.size;
        },
        message: 'ResourceReference values must be unique within the message',
        severity: 'error'
      }
    ];

    // Profile-specific rules
    const profileRules = {
      'AudioAlbum': [
        {
          name: 'AudioAlbum-MinTracks',
          test: (doc) => {
            const soundRecordings = this.countResources(doc, 'SoundRecording');
            return soundRecordings >= 2;
          },
          message: 'AudioAlbum profile requires at least 2 SoundRecording resources',
          severity: 'error'
        },
        {
          name: 'AudioAlbum-ReleaseType',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const releaseType = this.getValue(release?.ReleaseType);
            return ['Album', 'EP', 'LongFormRelease', 'AudioAlbumMusicOnly'].includes(releaseType);
          },
          message: 'AudioAlbum ReleaseType should be "Album", "EP", or "LongFormRelease"',
          severity: 'warning'
        },
        {
          name: 'AudioAlbum-PrimaryResource',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            return !!release?.ReleaseResourceReferenceList;
          },
          message: 'AudioAlbum must specify primary resources in ReleaseResourceReferenceList',
          severity: 'error'
        },
        {
          name: 'AudioAlbum-TrackListComplete',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const resourceRefs = this.getResourceReferences(release);
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            // All sound recordings should be referenced
            return soundRecordings.every(sr => 
              resourceRefs.some(ref => ref === sr.ResourceReference)
            );
          },
          message: 'All SoundRecording resources must be referenced in the Release',
          severity: 'error'
        },
        {
          name: 'AudioAlbum-DisplayArtist',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const details = this.getReleaseDetails(release);
            return details.some(detail => detail.DisplayArtist || detail.DisplayArtistName);
          },
          message: 'AudioAlbum should specify DisplayArtist',
          severity: 'warning'
        }
      ],
      'AudioSingle': [
        {
          name: 'AudioSingle-MaxTracks',
          test: (doc) => {
            const soundRecordings = this.countResources(doc, 'SoundRecording');
            return soundRecordings >= 1 && soundRecordings <= 3;
          },
          message: 'AudioSingle profile should contain 1-3 SoundRecording resources',
          severity: 'error'
        },
        {
          name: 'AudioSingle-ReleaseType',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const releaseType = this.getValue(release?.ReleaseType);
            return ['Single', 'AudioSingle', 'ShortFormRelease', 'AudioSingleMusicOnly'].includes(releaseType);
          },
          message: 'AudioSingle ReleaseType should be "Single" or equivalent',
          severity: 'warning'
        },
        {
          name: 'AudioSingle-MainResource',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const resourceRefs = this.getResourceReferences(release);
            return resourceRefs.length >= 1;
          },
          message: 'AudioSingle must have at least one primary track',
          severity: 'error'
        }
      ],
      'Video': [
        {
          name: 'Video-Required',
          test: (doc) => {
            const videos = this.countResources(doc, 'Video');
            return videos >= 1;
          },
          message: 'Video profile must contain at least one Video resource',
          severity: 'error'
        },
        {
          name: 'Video-TechnicalDetails',
          test: (doc) => {
            const videos = this.getResources(doc, 'Video');
            return videos.every(video => {
              const hasTechnical = video.TechnicalVideoDetails || 
                                  video.TechnicalDetails ||
                                  (video.VideoDetailsByTerritory && 
                                   this.getTerritoryDetails(video).some(t => t.TechnicalVideoDetails));
              return hasTechnical;
            });
          },
          message: 'All Video resources must include technical details',
          severity: 'error'
        },
        {
          name: 'Video-Duration',
          test: (doc) => {
            const videos = this.getResources(doc, 'Video');
            return videos.every(video => {
              const details = video.TechnicalVideoDetails || 
                             video.TechnicalDetails ||
                             this.getTerritoryDetails(video).find(t => t.TechnicalVideoDetails)?.TechnicalVideoDetails;
              return details?.Duration || details?.PlayingTime;
            });
          },
          message: 'All Video resources must specify duration',
          severity: 'error'
        },
        {
          name: 'Video-ImageResources',
          test: (doc) => {
            const images = this.countResources(doc, 'Image');
            return images >= 1;
          },
          message: 'Video profile should include at least one Image resource (cover art)',
          severity: 'warning'
        }
      ],
      'Mixed': [
        {
          name: 'Mixed-MultipleResourceTypes',
          test: (doc) => {
            const hasAudio = this.countResources(doc, 'SoundRecording') > 0;
            const hasVideo = this.countResources(doc, 'Video') > 0;
            const hasImage = this.countResources(doc, 'Image') > 0;
            const hasText = this.countResources(doc, 'Text') > 0;
            const types = [hasAudio, hasVideo, hasImage, hasText].filter(Boolean).length;
            return types >= 2;
          },
          message: 'Mixed profile should contain at least 2 different resource types',
          severity: 'warning'
        },
        {
          name: 'Mixed-BundleComplete',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            return release?.ReleaseType?.includes('Bundle') || 
                   release?.ReleaseType?.includes('Mixed');
          },
          message: 'Mixed profile should use appropriate ReleaseType (e.g., "Bundle")',
          severity: 'info'
        }
      ],
      'Classical': [
        {
          name: 'Classical-Composer',
          test: (doc) => {
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            return soundRecordings.every(recording => {
              const contributors = this.getContributors(recording);
              return contributors.some(c => 
                ['Composer', 'ComposerLyricist'].includes(this.getValue(c.ArtistRole))
              );
            });
          },
          message: 'Classical recordings must credit composer(s)',
          severity: 'error'
        },
        {
          name: 'Classical-WorkInformation',
          test: (doc) => {
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            return soundRecordings.every(recording => {
              const works = recording.IndirectResourceContributor;
              return works && works.length > 0;
            });
          },
          message: 'Classical recordings should include work information',
          severity: 'warning'
        },
        {
          name: 'Classical-Movement',
          test: (doc) => {
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            return soundRecordings.some(recording => {
              const title = this.getValue(recording.ReferenceTitle?.TitleText);
              return title && (title.includes('Movement') || 
                              title.includes('mvt') || 
                              title.includes('No.'));
            });
          },
          message: 'Classical recordings should indicate movement information in titles',
          severity: 'info'
        }
      ],
      'Ringtone': [
        {
          name: 'Ringtone-Duration',
          test: (doc) => {
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            return soundRecordings.every(recording => {
              const duration = this.getDuration(recording);
              return duration && duration <= 40; // 40 seconds max
            });
          },
          message: 'Ringtone duration should not exceed 40 seconds',
          severity: 'error'
        },
        {
          name: 'Ringtone-TechnicalDetails',
          test: (doc) => {
            const soundRecordings = this.getResources(doc, 'SoundRecording');
            return soundRecordings.every(recording => {
              const details = recording.TechnicalSoundRecordingDetails || 
                             recording.TechnicalDetails;
              return details?.IsPreview === true || details?.IsClip === true;
            });
          },
          message: 'Ringtone should be marked as Preview or Clip',
          severity: 'warning'
        }
      ],
      'DJ': [
        {
          name: 'DJ-MixType',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const releaseType = this.getValue(release?.ReleaseType);
            return releaseType?.includes('DJ') || releaseType?.includes('Mix');
          },
          message: 'DJ Mix should use appropriate ReleaseType',
          severity: 'warning'
        },
        {
          name: 'DJ-Compiler',
          test: (doc) => {
            const release = this.getMainRelease(doc);
            const details = this.getReleaseDetails(release);
            return details.some(detail => {
              const contributors = Array.isArray(detail.ResourceContributor) 
                ? detail.ResourceContributor 
                : [detail.ResourceContributor].filter(Boolean);
              return contributors.some(c => 
                ['Compiler', 'DJ', 'Mixer'].includes(this.getValue(c.ArtistRole))
              );
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
      
      // ERN 3.8.2 uses different structure
      baseRules.push({
        name: 'ReleaseDetailsByTerritory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => 
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
          return deals.every(deal => deal.ValidityPeriod?.StartDate);
        },
        message: 'Each Deal must have a ValidityPeriod with StartDate',
        severity: 'error'
      });
      
      // ERN 4.x specific
      baseRules.push({
        name: 'ReleaseDetailsByTerritory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => 
            release.GlobalReleaseDetails || 
            (release.ReleaseDetailsByTerritory && release.ReleaseDetailsByTerritory.length > 0)
          );
        },
        message: 'ERN 4.x requires either GlobalReleaseDetails or ReleaseDetailsByTerritory',
        severity: 'error'
      });
    }

    // Add profile-specific rules to base rules
    const specificRules = profileRules[profile] || [];
    return [...baseRules, ...specificRules];
  }

  async validate(xmlContent, version, profile) {
    const errors = [];
    
    try {
      // Parse the XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
        trimValues: true,
        parseTagValue: true
      });
      
      const parsedDoc = parser.parse(xmlContent);
      
      // Get the root element
      const rootKeys = Object.keys(parsedDoc);
      const rootElement = rootKeys.find(key => 
        key.includes('NewReleaseMessage') || key === 'NewReleaseMessage'
      );
      
      if (!rootElement) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Could not find NewReleaseMessage root element',
          severity: 'error',
          rule: 'Schematron-Parse'
        });
        return { errors, valid: false };
      }
      
      const doc = parsedDoc[rootElement];
      
      // Check if profile matches message
      if (profile && doc['@_ReleaseProfileVersionId']) {
        const messageProfile = doc['@_ReleaseProfileVersionId'];
        if (!messageProfile.includes(profile)) {
          errors.push({
            line: 0,
            column: 0,
            message: `Message profile "${messageProfile}" does not match requested profile "${profile}"`,
            severity: 'warning',
            rule: 'Schematron-ProfileMismatch'
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
              context: `Profile: ${profile}`
            });
          }
        } catch (error) {
          console.warn(`Rule ${rule.name} evaluation failed: ${error.message}`);
        }
      });
      
    } catch (error) {
      errors.push({
        line: 0,
        column: 0,
        message: `Schematron validation error: ${error.message}`,
        severity: 'error',
        rule: 'Schematron-Error'
      });
    }

    return { 
      errors: errors.filter(e => e.severity !== 'info'), 
      warnings: errors.filter(e => e.severity === 'warning' || e.severity === 'info'),
      valid: errors.filter(e => e.severity === 'error').length === 0 
    };
  }

  // Helper methods
  getValue(node) {
    if (!node) return null;
    return node['#text'] || node;
  }

  getReleases(doc) {
    if (!doc.ReleaseList) return [];
    return Array.isArray(doc.ReleaseList.Release) 
      ? doc.ReleaseList.Release 
      : [doc.ReleaseList.Release].filter(Boolean);
  }

  getMainRelease(doc) {
    return this.getReleases(doc)[0];
  }

  getReleaseDetails(release) {
    if (!release) return [];
    // Handle both ERN 3.x and 4.x structures
    const details = release.ReleaseDetailsByTerritory || 
                   [release.GlobalReleaseDetails].filter(Boolean);
    return Array.isArray(details) ? details : [details].filter(Boolean);
  }

  getAllResources(doc) {
    const resources = [];
    if (!doc.ResourceList) return resources;
    
    Object.entries(doc.ResourceList).forEach(([key, value]) => {
      if (!key.startsWith('@_') && key !== '#text') {
        if (Array.isArray(value)) {
          resources.push(...value);
        } else if (value && typeof value === 'object') {
          resources.push(value);
        }
      }
    });
    
    return resources;
  }

  getResources(doc, resourceType) {
    if (!doc.ResourceList) return [];
    const resources = [];
    
    Object.entries(doc.ResourceList).forEach(([key, value]) => {
      if (key.includes(resourceType) || key === resourceType) {
        if (Array.isArray(value)) {
          resources.push(...value);
        } else if (value) {
          resources.push(value);
        }
      }
    });
    
    return resources;
  }

  countResources(doc, resourceType) {
    return this.getResources(doc, resourceType).length;
  }

  getAllResourceReferences(doc) {
    const resources = this.getAllResources(doc);
    return resources.map(r => r.ResourceReference).filter(Boolean);
  }

  getResourceReferences(release) {
    if (!release?.ReleaseResourceReferenceList) return [];
    const refs = release.ReleaseResourceReferenceList.ReleaseResourceReference;
    const refArray = Array.isArray(refs) ? refs : [refs].filter(Boolean);
    
    // Extract the actual reference value
    return refArray.map(ref => {
      if (typeof ref === 'string') return ref;
      if (ref['#text']) return ref['#text'];
      if (ref.ResourceReference) return ref.ResourceReference;
      return ref;
    });
  }

  getContributors(resource) {
    const contributors = [];
    if (resource.Contributor) {
      const c = Array.isArray(resource.Contributor) 
        ? resource.Contributor 
        : [resource.Contributor];
      contributors.push(...c);
    }
    if (resource.IndirectContributor) {
      const ic = Array.isArray(resource.IndirectContributor) 
        ? resource.IndirectContributor 
        : [resource.IndirectContributor];
      contributors.push(...ic);
    }
    if (resource.ResourceContributor) {
      const rc = Array.isArray(resource.ResourceContributor) 
        ? resource.ResourceContributor 
        : [resource.ResourceContributor];
      contributors.push(...rc);
    }
    return contributors;
  }

  getTerritoryDetails(resource) {
    const territories = resource.VideoDetailsByTerritory || 
                       resource.SoundRecordingDetailsByTerritory ||
                       [];
    return Array.isArray(territories) ? territories : [territories].filter(Boolean);
  }

  getDeals(doc) {
    if (!doc.DealList) return [];
    const deals = doc.DealList.ReleaseDeal || doc.DealList.Deal;
    return Array.isArray(deals) ? deals : [deals].filter(Boolean);
  }

  getDuration(resource) {
    const details = resource.TechnicalSoundRecordingDetails || 
                   resource.TechnicalDetails ||
                   resource.Duration;
    if (!details) return null;
    
    const duration = details.Duration || details.PlayingTime;
    if (!duration) return null;
    
    // Parse ISO 8601 duration (PT30S = 30 seconds)
    const durationStr = this.getValue(duration);
    if (!durationStr) return null;
    
    const match = durationStr.match(/PT(?:(\d+)M)?(\d+(?:\.\d+)?)S/);
    if (match) {
      const minutes = parseInt(match[1] || '0');
      const seconds = parseFloat(match[2]);
      return minutes * 60 + seconds;
    }
    return null;
  }
}

module.exports = SchematronValidator;