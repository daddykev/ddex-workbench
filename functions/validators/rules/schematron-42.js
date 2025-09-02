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
      // Required top-level elements for ERN 4.2
      {
        name: 'ERN42-MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required in ERN 4.2',
        severity: 'error'
      },
      {
        name: 'ERN42-PartyList-Required',
        test: (doc) => !!doc.PartyList,
        message: 'PartyList is required in ERN 4.2',
        severity: 'error',
        suggestion: 'Add PartyList element after MessageHeader/ReleaseAdmin elements'
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
      
      // DealList is OPTIONAL in ERN 4.2
      {
        name: 'ERN42-DealList-Recommended',
        test: (doc) => !!doc.DealList,
        message: 'DealList is recommended but not required in ERN 4.2',
        severity: 'warning',
        suggestion: 'Consider adding DealList with commercial terms'
      },

      // Required attributes on NewReleaseMessage
      {
        name: 'ERN42-Required-Attributes',
        test: (doc) => {
          // LanguageAndScriptCode is required, but NOT AvsVersionId in 4.2
          return doc['@_LanguageAndScriptCode'];
        },
        message: 'NewReleaseMessage must have LanguageAndScriptCode attribute',
        severity: 'error',
        suggestion: 'Add LanguageAndScriptCode="en" to NewReleaseMessage'
      },

      // ReleaseProfileVersionId is optional but important
      {
        name: 'ERN42-ReleaseProfile-Recommended',
        test: (doc) => !!doc['@_ReleaseProfileVersionId'],
        message: 'ReleaseProfileVersionId attribute is recommended for profile validation',
        severity: 'info',
        suggestion: 'Add ReleaseProfileVersionId to specify the release profile'
      }
    ];
  }

  /**
   * Get MessageHeader validation rules
   */
  getMessageHeaderRules() {
    return [
      {
        name: 'ERN42-MessageHeader-MessageId',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageId;
        },
        message: 'MessageHeader must contain MessageId',
        severity: 'error'
      },
      {
        name: 'ERN42-MessageHeader-MessageSender',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageSender;
        },
        message: 'MessageHeader must contain MessageSender',
        severity: 'error'
      },
      {
        name: 'ERN42-MessageHeader-MessageRecipient',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageRecipient;
        },
        message: 'MessageHeader must contain at least one MessageRecipient',
        severity: 'error'
      },
      {
        name: 'ERN42-MessageHeader-MessageCreatedDateTime',
        test: (doc) => {
          if (!doc.MessageHeader || !doc.MessageHeader.MessageCreatedDateTime) {
            return false;
          }
          
          const dateTime = this.getValue(doc.MessageHeader.MessageCreatedDateTime);
          // Check ISO 8601 format: YYYY-MM-DDThh:mm:ssTZD
          return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateTime);
        },
        message: 'MessageCreatedDateTime must be in ISO 8601 format (YYYY-MM-DDThh:mm:ss)',
        severity: 'error'
      },
      {
        name: 'ERN42-MessageControlType',
        test: (doc) => {
          if (!doc.MessageHeader || !doc.MessageHeader.MessageControlType) {
            return true; // Optional
          }
          
          const type = this.getValue(doc.MessageHeader.MessageControlType);
          return ['TestMessage', 'LiveMessage'].includes(type);
        },
        message: 'MessageControlType must be "TestMessage" or "LiveMessage" when present',
        severity: 'warning'
      }
    ];
  }

  /**
   * Get reference pattern validation rules
   */
  getReferenceRules() {
    return [
      {
        name: 'ERN42-ReleaseReference-Pattern',
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
        name: 'ERN42-ResourceReference-Pattern',
        test: (doc) => {
          const resources = this.getResources(doc);
          return resources.every(resource => {
            const ref = resource.ResourceReference || 
                      resource.SoundRecording?.ResourceReference ||
                      resource.Video?.ResourceReference ||
                      resource.Image?.ResourceReference ||
                      resource.Text?.ResourceReference ||
                      resource.SheetMusic?.ResourceReference ||
                      resource.Software?.ResourceReference;
            return ref && /^A[\d\-_a-zA-Z]+$/.test(ref);
          });
        },
        message: 'ResourceReference must start with "A" and contain only alphanumeric, dash, underscore',
        severity: 'error',
        suggestion: 'Use format like "A1", "A2", "A-cover", etc.'
      },
      {
        name: 'ERN42-PartyReference-Pattern',
        test: (doc) => {
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
   * Get identifier validation rules
   */
  getIdentifierRules() {
    return [
      {
        name: 'ERN42-ISRC-Format',
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
        name: 'ERN42-Release-DisplayTitle',
        test: (doc) => {
          const releases = this.getReleases(doc);
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          
          return mainReleases.every(release => {
            // Must have EITHER DisplayTitleText OR DisplayTitle (or both)
            return (release.DisplayTitleText || release.DisplayTitle);
          });
        },
        message: 'Each Release must have DisplayTitleText and/or DisplayTitle elements',
        severity: 'error',
        suggestion: 'Add either DisplayTitleText (simple string) or DisplayTitle (structured) or both'
      },
      {
        name: 'ERN42-Release-DisplayArtist',
        test: (doc) => {
          const releases = this.getReleases(doc);
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          
          return mainReleases.every(release => {
            // Must have EITHER DisplayArtistName OR DisplayArtist (or both)
            return (release.DisplayArtistName || release.DisplayArtist);
          });
        },
        message: 'Each Release must have DisplayArtistName and/or DisplayArtist elements',
        severity: 'error'
      },
      {
        name: 'ERN42-DisplayArtist-Structure',
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
        name: 'ERN42-DealTerms-Territory',
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
        name: 'ERN42-DealTerms-ValidityPeriod',
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
                  // Must have at least StartDate (or StartDateTime in later updates)
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
        suggestion: 'Use StartDateTime for precise timing (StartDate is deprecated)'
      },
      {
        name: 'ERN42-UseType-Valid',
        test: (doc) => {
          const validUseTypes = [
            'AsPerContract', 'Broadcast', 'Cable', 'ConditionalDownload',
            'ContentInfluencedStream', 'Display', 'Download', 'Dub',
            'DubForAdvertisement', 'DubForLivePerformance', 'DubForMovies',
            'DubForMusicOnHold', 'DubForOnDemandStreaming', 'DubForPublicPerformance',
            'DubForRadio', 'DubForTV', 'ExtractForInternet', 'KioskDownload',
            'Narrowcast', 'NonInteractiveStream', 'OnDemandStream', 'Perform',
            'PerformAsMusicOnHold', 'PerformInLivePerformance', 'PerformInPublic',
            'PermanentDownload', 'Playback', 'PlayInPublic', 'Podcast', 'Print',
            'PrivateCopy', 'PurchaseAsPhysicalProduct', 'Rent', 'Simulcast',
            'Stream', 'TetheredDownload', 'TimeInfluencedStream', 'Unknown',
            'Use', 'UseAsAlertTone', 'UseAsDevice', 'UseAsKaraoke',
            'UseAsRingbackTone', 'UseAsRingbackTune', 'UseAsRingtone',
            'UseAsRingtune', 'UseAsScreensaver', 'UseAsVoiceMail',
            'UseAsWallpaper', 'UseForIdentification', 'UseInMobilePhoneMessaging',
            'UseInPhoneListening', 'UserDefined', 'UserMakeAvailableLabelProvided',
            'UserMakeAvailableUserProvided', 'Webcast'
          ];
          
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? 
                              releaseDeal.Deal : [releaseDeal.Deal];
            
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return true;
              
              const dealTermsArray = Array.isArray(deal.DealTerms) ? 
                                    deal.DealTerms : [deal.DealTerms];
              
              return dealTermsArray.every(dt => {
                if (!dt.UseType) return true;
                
                const useTypes = Array.isArray(dt.UseType) ? 
                                dt.UseType : [dt.UseType];
                
                return useTypes.every(ut => {
                  const type = this.getValue(ut);
                  return validUseTypes.includes(type);
                });
              });
            });
          });
        },
        message: 'UseType must be a valid ERN 4.2 use type',
        severity: 'error'
      },
      {
        name: 'ERN42-CommercialModelType-Valid',
        test: (doc) => {
          const validModels = [
            'AdvertisementSupportedModel', 'AsPerContract', 'DeviceFeeModel',
            'FreeOfChargeModel', 'PayAsYouGoModel', 'PerformanceRoyaltiesModel',
            'RightsClaimModel', 'SubscriptionModel', 'Unknown', 'UserDefined'
          ];
          
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? 
                              releaseDeal.Deal : [releaseDeal.Deal];
            
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return true;
              
              const dealTermsArray = Array.isArray(deal.DealTerms) ? 
                                    deal.DealTerms : [deal.DealTerms];
              
              return dealTermsArray.every(dt => {
                if (!dt.CommercialModelType) return true;
                
                const models = Array.isArray(dt.CommercialModelType) ? 
                              dt.CommercialModelType : [dt.CommercialModelType];
                
                return models.every(model => {
                  const type = this.getValue(model);
                  return validModels.includes(type);
                });
              });
            });
          });
        },
        message: 'CommercialModelType must be a valid ERN 4.2 commercial model',
        severity: 'error'
      }
    ];
  }

  /**
   * Get release type validation rules
   */
  getReleaseTypeRules() {
    const validReleaseTypes = [
      'Album', 'AlertToneRelease', 'AsPerContract', 'AudioBookRelease',
      'AudioDramaRelease', 'BackCoverImageRelease', 'BookletBackImageRelease',
      'BookletFrontImageRelease', 'BookletRelease', 'Bundle', 'ClassicalAlbum',
      'ClassicalDigitalBoxedSet', 'ClassicalMultimediaAlbum', 'ConcertVideo',
      'DigitalBoxSetRelease', 'DjMix', 'Documentary', 'Drama',
      'DramaticoMusicalVideoRelease', 'EBookRelease', 'EP', 'Episode',
      'FeatureFilm', 'KaraokeRelease', 'LiveEventVideo', 'LogoRelease',
      'LongFormMusicalWorkVideoRelease', 'LongFormNonMusicalWorkVideoRelease',
      'LyricSheetRelease', 'MultimediaAlbum', 'MultimediaDigitalBoxedSet',
      'MultimediaSingle', 'MusicalWorkBasedGameRelease',
      'NonMusicalWorkBasedGameRelease', 'PlayList', 'RingbackToneRelease',
      'RingtoneRelease', 'Season', 'Series', 'SheetMusicRelease', 'ShortFilm',
      'Single', 'SingleResourceRelease', 'StemBundle', 'UserDefined',
      'VideoAlbum', 'VideoMastertoneRelease', 'VideoSingle', 'WallpaperRelease',
      'TrackRelease'
    ];
    
    return [
      {
        name: 'ERN42-ReleaseType-Valid',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseType) return true;
            
            const releaseTypes = Array.isArray(release.ReleaseType) ? 
                              release.ReleaseType : [release.ReleaseType];
            
            return releaseTypes.every(rt => {
              const type = this.getValue(rt);
              return validReleaseTypes.includes(type);
            });
          });
        },
        message: 'ReleaseType must be a valid ERN 4.2 release type',
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
        name: 'ERN42-ResourceGroup-Required',
        test: (doc) => {
          const releases = this.getReleases(doc);
          const mainReleases = releases.filter(r => !r._isTrackRelease);
          return mainReleases.every(release => !!release.ResourceGroup);
        },
        message: 'Main Release should have ResourceGroup to define resource sequencing',
        severity: 'warning',
        suggestion: 'Add ResourceGroup with ResourceGroupContentItem elements to define track order'
      },
      {
        name: 'ERN42-ResourceGroup-ContentItems',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            if (!release.ResourceGroup) return true;
            
            const rg = release.ResourceGroup;
            const hasContentItems = !!rg.ResourceGroupContentItem;
            
            if (!hasContentItems) return false;
            
            const items = Array.isArray(rg.ResourceGroupContentItem) ? 
                        rg.ResourceGroupContentItem : [rg.ResourceGroupContentItem];
            
            return items.every(item => {
              if (!item.ReleaseResourceReference) return false;
              const ref = this.getValue(item.ReleaseResourceReference);
              return /^A[\d\-_a-zA-Z]+$/.test(ref);
            });
          });
        },
        message: 'ResourceGroup must contain ResourceGroupContentItem elements with valid references',
        severity: 'error'
      }
    ];
  }

  /**
   * Get all rules for ERN 4.2
   */
  getAllRules() {
    return [
      ...this.getStructuralRules(),
      ...this.getMessageHeaderRules(),
      ...this.getReferenceRules(),
      ...this.getIdentifierRules(),
      ...this.getDisplayRules(),
      ...this.getDealRules(),
      ...this.getReleaseTypeRules(),
      ...this.getResourceGroupRules()
    ];
  }

  /**
   * Get profile-specific rules for ERN 4.2
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
                        'FeatureFilm', 'Documentary', 'Episode', 'ShortFilm'].includes(type);
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
    
    // ERN 4.2 supports: SoundRecording, Video, Image, Text, SheetMusic, Software
    ['SoundRecording', 'Video', 'Image', 'Text', 'SheetMusic', 'Software'].forEach(type => {
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

  /**
   * Get territory code validation rules
   */
  getTerritoryRules() {
    // Valid territory codes from ERN 4.2 AVS (avs20200518.xsd)
    const validCodes = [
      // ISO 3166-1 two-letter codes
      'Worldwide', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AN', 'AO', 'AQ', 'AR', 
      'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 
      'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 
      'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 
      'CR', 'CS', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 
      'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ES-CE', 'ES-CN', 'ES-ML', 'ET', 
      'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 
      'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 
      'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 
      'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 
      'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 
      'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 
      'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 
      'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 
      'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 
      'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 
      'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 
      'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 
      'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 
      'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
      
      // CISAC TIS numeric codes
      '4', '8', '12', '20', '24', '28', '31', '32', '36', '40', '44', '48', '50', 
      '51', '52', '56', '64', '68', '70', '72', '76', '84', '90', '96', '100',
      '104', '108', '112', '116', '120', '124', '132', '140', '144', '148', '152',
      '156', '158', '170', '174', '178', '180', '188', '191', '192', '196', '200',
      '203', '204', '208', '212', '214', '218', '222', '226', '230', '231', '232',
      '233', '242', '246', '250', '258', '262', '266', '268', '270', '276', '278',
      '280', '288', '296', '300', '308', '320', '324', '328', '332', '336', '340',
      '344', '348', '352', '356', '360', '364', '368', '372', '376', '380', '384',
      '388', '392', '398', '400', '404', '408', '410', '414', '417', '418', '422',
      '426', '428', '430', '434', '438', '440', '442', '446', '450', '454', '458',
      '462', '466', '470', '478', '480', '484', '492', '496', '498', '499', '504',
      '508', '512', '516', '520', '524', '528', '540', '548', '554', '558', '562',
      '566', '578', '583', '584', '585', '586', '591', '598', '600', '604', '608',
      '616', '620', '624', '626', '630', '634', '642', '643', '646', '659', '662',
      '670', '674', '678', '682', '686', '688', '690', '694', '702', '703', '704',
      '705', '706', '710', '716', '720', '724', '728', '729', '732', '736', '740',
      '748', '752', '756', '760', '762', '764', '768', '776', '780', '784', '788',
      '792', '795', '798', '800', '804', '807', '810', '818', '826', '834', '840',
      '854', '858', '860', '862', '882', '886', '887', '890', '891', '894',
      
      // TIS regional codes
      '2100', '2101', '2102', '2103', '2104', '2105', '2106', '2107', '2108',
      '2109', '2110', '2111', '2112', '2113', '2114', '2115', '2116', '2117',
      '2118', '2119', '2120', '2121', '2122', '2123', '2124', '2125', '2126',
      '2127', '2128', '2129', '2130', '2131', '2132', '2133', '2134', '2136'
    ];
    
    return [
      {
        name: 'ERN42-TerritoryCode-Valid',
        test: (doc) => {
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
                      territoryCodes.push(...codes.map(c => this.getValue(c)));
                    }
                    if (dt.ExcludedTerritoryCode) {
                      const codes = Array.isArray(dt.ExcludedTerritoryCode) ? 
                                  dt.ExcludedTerritoryCode : [dt.ExcludedTerritoryCode];
                      territoryCodes.push(...codes.map(c => this.getValue(c)));
                    }
                  });
                }
              });
            }
          });
          
          // Validate all codes
          return territoryCodes.every(code => validCodes.includes(code));
        },
        message: 'Invalid territory code. Must be ISO 3166-1, TIS numeric code, or "Worldwide"',
        severity: 'error'
      }
    ];
  }

  getDeals(doc) {
    if (!doc.DealList || !doc.DealList.ReleaseDeal) return [];
    return Array.isArray(doc.DealList.ReleaseDeal) 
      ? doc.DealList.ReleaseDeal 
      : [doc.DealList.ReleaseDeal].filter(Boolean);
  }
}

module.exports = ERN42Rules;