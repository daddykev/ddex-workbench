// functions/validators/rules/schematron-43.js
/**
 * ERN 4.3 Schematron-equivalent validation rules
 * Based on ERN 4.3 XSD and DDEX specifications
 */

class ERN43Rules {
  constructor() {
    this.version = '4.3';
  }

  /**
   * Get all base structural rules for ERN 4.3
   */
  getStructuralRules() {
    return [
      // Required top-level elements for ERN 4.3
      {
        name: 'ERN43-MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required in ERN 4.3',
        severity: 'error'
      },
      {
        name: 'ERN43-PartyList-Required',
        test: (doc) => !!doc.PartyList,
        message: 'PartyList is required in ERN 4.3 (contains all party information)',
        severity: 'error',
        suggestion: 'Add PartyList element after MessageHeader/ReleaseAdmin elements'
      },
      {
        name: 'ERN43-ResourceList-Required',
        test: (doc) => !!doc.ResourceList,
        message: 'ResourceList is required in ERN 4.3',
        severity: 'error'
      },
      {
        name: 'ERN43-ReleaseList-Required',
        test: (doc) => !!doc.ReleaseList,
        message: 'ReleaseList is required in ERN 4.3',
        severity: 'error'
      },
      
      // DealList is OPTIONAL in ERN 4.3
      {
        name: 'ERN43-DealList-Recommended',
        test: (doc) => !!doc.DealList,
        message: 'DealList is recommended but not required in ERN 4.3',
        severity: 'warning',
        suggestion: 'Consider adding DealList with commercial terms'
      },

      // Required attributes on NewReleaseMessage
      {
        name: 'ERN43-Required-Attributes',
        test: (doc) => {
          return doc['@_AvsVersionId'] && doc['@_LanguageAndScriptCode'];
        },
        message: 'NewReleaseMessage must have AvsVersionId and LanguageAndScriptCode attributes',
        severity: 'error',
        suggestion: 'Add AvsVersionId="2024" LanguageAndScriptCode="en" to NewReleaseMessage'
      }
    ];
  }

  /**
   * Get reference pattern validation rules
   */
  getReferenceRules() {
    return [
      {
        name: 'ERN43-ReleaseReference-Pattern',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            const ref = release.ReleaseReference;
            return ref && /^R[\d\-_a-zA-Z]+$/.test(ref);
          });
        },
        message: 'ReleaseReference must start with "R" and contain only alphanumeric, dash, underscore',
        severity: 'error',
        suggestion: 'Use format like "R0", "R1", "R-main", etc.'
      },
      {
        name: 'ERN43-ResourceReference-Pattern',
        test: (doc) => {
          const resources = this.getResources(doc);
          return resources.every(resource => {
            const ref = resource.ResourceReference || 
                      resource.SoundRecording?.ResourceReference ||
                      resource.Video?.ResourceReference ||
                      resource.Image?.ResourceReference ||
                      resource.Text?.ResourceReference;
            return ref && /^A[\d\-_a-zA-Z]+$/.test(ref);
          });
        },
        message: 'ResourceReference must start with "A" and contain only alphanumeric, dash, underscore',
        severity: 'error',
        suggestion: 'Use format like "A1", "A2", "A-cover", etc.'
      },
      {
        name: 'ERN43-PartyReference-Pattern',
        test: (doc) => {
          // Check all party references in the document
          const partyRefs = [];
          
          // Collect from MessageHeader
          if (doc.MessageHeader?.MessageSender?.PartyId) {
            partyRefs.push(doc.MessageHeader.MessageSender.PartyId);
          }
          if (doc.MessageHeader?.MessageRecipient?.PartyId) {
            partyRefs.push(doc.MessageHeader.MessageRecipient.PartyId);
          }
          
          // Collect from DisplayArtists
          const releases = this.getReleases(doc);
          releases.forEach(release => {
            if (release.DisplayArtist) {
              const artists = Array.isArray(release.DisplayArtist) ? 
                            release.DisplayArtist : [release.DisplayArtist];
              artists.forEach(artist => {
                if (artist.ArtistPartyReference) {
                  partyRefs.push(artist.ArtistPartyReference);
                }
              });
            }
          });
          
          // Check PartyList exists and has matching parties
          if (partyRefs.length > 0 && !doc.PartyList) {
            return false; // PartyList required when party references exist
          }
          
          // Validate pattern for local party references
          const localRefs = partyRefs.filter(ref => ref.startsWith('P'));
          return localRefs.every(ref => /^P[\d\-_a-zA-Z]+$/.test(ref));
        },
        message: 'Party references must start with "P" and all referenced parties must exist in PartyList',
        severity: 'error'
      }
    ];
  }

  /**
   * Get identifier validation rules (ISRC, ISNI, etc.)
   */
  getIdentifierRules() {
    return [
      {
        name: 'ERN43-ISRC-Format',
        test: (doc) => {
          const resources = this.getResources(doc);
          const soundRecordings = resources.filter(r => r.SoundRecording);
          
          return soundRecordings.every(sr => {
            const isrc = sr.SoundRecording?.SoundRecordingId?.ISRC;
            if (!isrc) return true; // ISRC is optional
            
            // ISRC format: 2 letters, 3 alphanumeric, 7 digits
            return /^[a-zA-Z]{2}[a-zA-Z0-9]{3}[0-9]{7}$/.test(isrc);
          });
        },
        message: 'ISRC must match format: 2 letters, 3 alphanumeric, 7 digits (e.g., USRC17607839)',
        severity: 'error'
      }
    ];
  }

  /**
   * Get display metadata rules
   */
  getDisplayRules() {
    return [
      {
        name: 'ERN43-Release-DisplayTitle',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            // Must have both DisplayTitleText AND DisplayTitle
            return (release.DisplayTitleText && release.DisplayTitle);
          });
        },
        message: 'Each Release must have both DisplayTitleText and DisplayTitle elements',
        severity: 'error',
        suggestion: 'DisplayTitleText contains the full title string, DisplayTitle contains structured title parts'
      },
      {
        name: 'ERN43-Release-DisplayArtist',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            // Must have both DisplayArtistName AND DisplayArtist
            return (release.DisplayArtistName && release.DisplayArtist);
          });
        },
        message: 'Each Release must have both DisplayArtistName and DisplayArtist elements',
        severity: 'error'
      },
      {
        name: 'ERN43-DisplayArtist-Structure',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            if (!release.DisplayArtist) return true;
            
            const artists = Array.isArray(release.DisplayArtist) ? 
                          release.DisplayArtist : [release.DisplayArtist];
            
            return artists.every(artist => {
              // Must have ArtistPartyReference and DisplayArtistRole
              return artist.ArtistPartyReference && artist.DisplayArtistRole;
            });
          });
        },
        message: 'Each DisplayArtist must have ArtistPartyReference and DisplayArtistRole',
        severity: 'error'
      }
    ];
  }

  /**
   * Get deal terms validation rules
   */
  getDealRules() {
    return [
      {
        name: 'ERN43-DealTerms-Territory',
        test: (doc) => {
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (releaseDeal.Deal) {
              const nestedDeals = Array.isArray(releaseDeal.Deal) ? 
                                releaseDeal.Deal : [releaseDeal.Deal];
              
              return nestedDeals.every(deal => {
                if (!deal.DealTerms) return false;
                
                const dealTermsArray = Array.isArray(deal.DealTerms) ? 
                                      deal.DealTerms : [deal.DealTerms];
                
                return dealTermsArray.every(dt => {
                  // Must have either TerritoryCode OR ExcludedTerritoryCode, not both
                  const hasTerritory = !!dt.TerritoryCode;
                  const hasExcluded = !!dt.ExcludedTerritoryCode;
                  return (hasTerritory && !hasExcluded) || (!hasTerritory && hasExcluded);
                });
              });
            }
            return true;
          });
        },
        message: 'DealTerms must have either TerritoryCode OR ExcludedTerritoryCode (not both)',
        severity: 'error'
      },
      {
        name: 'ERN43-DealTerms-ValidityPeriod',
        test: (doc) => {
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (releaseDeal.Deal) {
              const nestedDeals = Array.isArray(releaseDeal.Deal) ? 
                                releaseDeal.Deal : [releaseDeal.Deal];
              
              return nestedDeals.every(deal => {
                if (!deal.DealTerms) return false;
                
                const dealTermsArray = Array.isArray(deal.DealTerms) ? 
                                      deal.DealTerms : [deal.DealTerms];
                
                return dealTermsArray.every(dt => {
                  // ValidityPeriod is required
                  const vp = dt.ValidityPeriod;
                  if (!vp) return false;
                  
                  const vpArray = Array.isArray(vp) ? vp : [vp];
                  // Must have at least StartDate or StartDateTime
                  return vpArray.every(period => 
                    period.StartDate || period.StartDateTime
                  );
                });
              });
            }
            return true;
          });
        },
        message: 'Each DealTerms must have ValidityPeriod with StartDate or StartDateTime',
        severity: 'error',
        suggestion: 'Use StartDateTime for precise timing, StartDate is deprecated'
      }
    ];
  }

  /**
   * Get territory code validation rules
   */
  getTerritoryRules() {
    // Valid territory codes from ERN 4.3 XSD
    const validCodes = ['Worldwide', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 
      'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 
      'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 
      'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 
      'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 
      'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 
      'ES', 'ES-CE', 'ES-CN', 'ES-ML', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 
      'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 
      'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 
      'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 
      'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 
      'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 
      'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 
      'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 
      'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 
      'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 
      'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 
      'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 
      'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 
      'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 
      'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 
      'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'];
    
    return [
      {
        name: 'ERN43-TerritoryCode-Valid',
        test: (doc) => {
          // Check all territory codes in the document
          const territoryCodes = [];
          
          // Collect from DealTerms
          const deals = this.getDeals(doc);
          deals.forEach(releaseDeal => {
            if (releaseDeal.Deal) {
              const nestedDeals = Array.isArray(releaseDeal.Deal) ? 
                                releaseDeal.Deal : [releaseDeal.Deal];
              
              nestedDeals.forEach(deal => {
                if (deal.DealTerms) {
                  const dealTermsArray = Array.isArray(deal.DealTerms) ? 
                                        deal.DealTerms : [deal.DealTerms];
                  
                  dealTermsArray.forEach(dt => {
                    if (dt.TerritoryCode) {
                      const codes = Array.isArray(dt.TerritoryCode) ? 
                                  dt.TerritoryCode : [dt.TerritoryCode];
                      territoryCodes.push(...codes);
                    }
                    if (dt.ExcludedTerritoryCode) {
                      const codes = Array.isArray(dt.ExcludedTerritoryCode) ? 
                                  dt.ExcludedTerritoryCode : [dt.ExcludedTerritoryCode];
                      territoryCodes.push(...codes);
                    }
                  });
                }
              });
            }
          });
          
          // Validate all codes
          return territoryCodes.every(code => validCodes.includes(code));
        },
        message: 'Invalid territory code. Must be ISO 3166-1 code or "Worldwide"',
        severity: 'error'
      }
    ];
  }

  /**
   * Get resource group validation rules
   */
  getResourceGroupRules() {
    return [
      {
        name: 'ERN43-ResourceGroup-Required',
        test: (doc) => {
          const releases = this.getReleases(doc);
          // Main releases should have ResourceGroup for sequencing
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          return mainReleases.every(release => !!release.ResourceGroup);
        },
        message: 'Main Release should have ResourceGroup to define resource sequencing',
        severity: 'warning',
        suggestion: 'Add ResourceGroup with ResourceGroupContentItem elements to define track order'
      },
      {
        name: 'ERN43-ResourceGroup-ContentItems',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            if (!release.ResourceGroup) return true;
            
            // Check if ResourceGroup has content items
            const rg = release.ResourceGroup;
            const hasContentItems = rg.ResourceGroupContentItem && 
                                  rg.ResourceGroupContentItem.length > 0;
            
            if (!hasContentItems) return false;
            
            // Validate each content item
            const items = Array.isArray(rg.ResourceGroupContentItem) ? 
                        rg.ResourceGroupContentItem : [rg.ResourceGroupContentItem];
            
            return items.every(item => {
              // Must have ReleaseResourceReference
              if (!item.ReleaseResourceReference) return false;
              // Reference must match pattern
              return /^A[\d\-_a-zA-Z]+$/.test(item.ReleaseResourceReference);
            });
          });
        },
        message: 'ResourceGroup must contain ResourceGroupContentItem elements with valid references',
        severity: 'error'
      }
    ];
  }

  /**
   * Get all rules for ERN 4.3
   */
  getAllRules() {
    return [
      ...this.getStructuralRules(),
      ...this.getReferenceRules(),
      ...this.getIdentifierRules(),
      ...this.getDisplayRules(),
      ...this.getDealRules(),
      ...this.getTerritoryRules(),
      ...this.getResourceGroupRules()
    ];
  }

  /**
   * Get profile-specific rules for ERN 4.3
   */
  getProfileRules(profile) {
    const profileRules = {
      'AudioAlbum': [
        {
          name: 'AudioAlbum-ReleaseType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseTypes = Array.isArray(release.ReleaseType) ? 
                                release.ReleaseType : [release.ReleaseType];
              
              return releaseTypes.some(rt => {
                const type = this.getValue(rt);
                return ['Album', 'ClassicalAlbum', 'DigitalBoxSetRelease', 
                        'MultimediaAlbum'].includes(type);
              });
            });
          },
          message: 'AudioAlbum profile expects ReleaseType of Album or similar',
          severity: 'warning'
        },
        {
          name: 'AudioAlbum-MinimumSoundRecordings',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            
            // Check that they're MusicalWorkSoundRecording type
            const musicalRecordings = soundRecordings.filter(sr => {
              const type = sr.SoundRecording?.Type || 
                          sr.SoundRecording?.SoundRecordingType;
              const typeValue = this.getValue(type);
              return !typeValue || typeValue === 'MusicalWorkSoundRecording' || 
                    typeValue === 'Unknown';
            });
            
            return musicalRecordings.length >= 2;
          },
          message: 'AudioAlbum requires at least 2 MusicalWorkSoundRecording resources',
          severity: 'error'
        },
        {
          name: 'AudioAlbum-FrontCoverImage',
          test: (doc) => {
            const resources = this.getResources(doc);
            const images = resources.filter(r => r.Image);
            
            return images.some(img => {
              const type = this.getValue(img.Image?.Type);
              return type === 'FrontCoverImage';
            });
          },
          message: 'AudioAlbum should have at least one FrontCoverImage',
          severity: 'warning'
        },
        {
          name: 'AudioAlbum-ImageCodec',
          test: (doc) => {
            const resources = this.getResources(doc);
            const images = resources.filter(r => r.Image);
            
            return images.every(img => {
              const technicalDetails = img.Image?.TechnicalDetails;
              if (!technicalDetails) return true;
              
              const tdArray = Array.isArray(technicalDetails) ? 
                            technicalDetails : [technicalDetails];
              
              return tdArray.some(td => {
                const codec = this.getValue(td.ImageCodecType);
                return ['JPEG', 'PNG', 'GIF', 'TIFF'].includes(codec);
              });
            });
          },
          message: 'Images should use standard codecs: JPEG, PNG, GIF, or TIFF',
          severity: 'info'
        }
      ],
      
      'AudioSingle': [
        {
          name: 'AudioSingle-ReleaseType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseTypes = Array.isArray(release.ReleaseType) ? 
                                release.ReleaseType : [release.ReleaseType];
              
              return releaseTypes.some(rt => {
                const type = this.getValue(rt);
                return ['Single', 'EP', 'SingleResourceRelease'].includes(type);
              });
            });
          },
          message: 'AudioSingle profile expects ReleaseType of Single or EP',
          severity: 'warning'
        },
        {
          name: 'AudioSingle-MaximumSoundRecordings',
          test: (doc) => {
            const resources = this.getResources(doc);
            const soundRecordings = resources.filter(r => r.SoundRecording);
            return soundRecordings.length <= 4;
          },
          message: 'AudioSingle should have no more than 4 SoundRecording resources',
          severity: 'warning'
        }
      ],

      'Video': [
        {
          name: 'Video-ReleaseType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseTypes = Array.isArray(release.ReleaseType) ? 
                                release.ReleaseType : [release.ReleaseType];
              
              return releaseTypes.some(rt => {
                const type = this.getValue(rt);
                return ['VideoAlbum', 'VideoSingle', 'ConcertVideo', 
                        'FeatureFilm', 'Documentary', 'Episode'].includes(type);
              });
            });
          },
          message: 'Video profile expects video-related ReleaseType',
          severity: 'warning'
        },
        {
          name: 'Video-RequiredVideoResource',
          test: (doc) => {
            const resources = this.getResources(doc);
            return resources.some(r => r.Video);
          },
          message: 'Video profile requires at least one Video resource',
          severity: 'error'
        }
      ],

      'Classical': [
        {
          name: 'Classical-ReleaseType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseTypes = Array.isArray(release.ReleaseType) ? 
                                release.ReleaseType : [release.ReleaseType];
              
              return releaseTypes.some(rt => {
                const type = this.getValue(rt);
                return ['ClassicalAlbum', 'ClassicalDigitalBoxedSet', 
                        'ClassicalMultimediaAlbum'].includes(type);
              });
            });
          },
          message: 'Classical profile expects ClassicalAlbum or similar ReleaseType',
          severity: 'warning'
        }
      ],

      'Ringtone': [
        {
          name: 'Ringtone-ReleaseType',
          test: (doc) => {
            const releases = this.getReleases(doc);
            return releases.some(release => {
              const releaseTypes = Array.isArray(release.ReleaseType) ? 
                                release.ReleaseType : [release.ReleaseType];
              
              return releaseTypes.some(rt => {
                const type = this.getValue(rt);
                return ['RingtoneRelease', 'RingbackToneRelease', 
                        'AlertToneRelease'].includes(type);
              });
            });
          },
          message: 'Ringtone profile expects RingtoneRelease or similar ReleaseType',
          severity: 'warning'
        }
      ]
    };

    return profileRules[profile] || [];
  }

  // Helper methods (bind these to the validator instance)
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

module.exports = ERN43Rules;