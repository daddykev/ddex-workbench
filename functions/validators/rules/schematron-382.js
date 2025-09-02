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
      // Required top-level elements
      {
        name: 'ERN382-MessageHeader-Required',
        test: (doc) => !!doc.MessageHeader,
        message: 'MessageHeader is required in ERN 3.8.2',
        severity: 'error'
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
      
      // UpdateIndicator is optional but deprecated
      {
        name: 'ERN382-UpdateIndicator-Deprecated',
        test: (doc) => {
          if (!doc.UpdateIndicator) return true; // OK if not present
          
          const value = this.getValue(doc.UpdateIndicator);
          // If present, should be valid value
          return ['OriginalMessage', 'UpdateMessage'].includes(value);
        },
        message: 'UpdateIndicator should be "OriginalMessage" or "UpdateMessage" (deprecated element)',
        severity: 'warning',
        suggestion: 'UpdateIndicator is deprecated and may be removed in future versions'
      },

      // DealList is optional in ERN 3.8.2
      {
        name: 'ERN382-DealList-Optional',
        test: (doc) => true, // Always passes, just informational
        message: 'DealList is optional in ERN 3.8.2',
        severity: 'info'
      },

      // Required attributes on NewReleaseMessage
      {
        name: 'ERN382-Required-Attributes',
        test: (doc) => {
          // MessageSchemaVersionId is required
          return !!doc['@_MessageSchemaVersionId'];
        },
        message: 'NewReleaseMessage must have MessageSchemaVersionId attribute',
        severity: 'error',
        suggestion: 'Add MessageSchemaVersionId="ern/382" to NewReleaseMessage'
      },

      // NO PartyList in ERN 3.8.2
      {
        name: 'ERN382-No-PartyList',
        test: (doc) => !doc.PartyList,
        message: 'PartyList should not be present in ERN 3.8.2 (introduced in ERN 4.x)',
        severity: 'error'
      }
    ];
  }

  /**
   * Get MessageHeader validation rules
   */
  getMessageHeaderRules() {
    return [
      {
        name: 'ERN382-MessageHeader-MessageId',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageId;
        },
        message: 'MessageHeader must contain MessageId',
        severity: 'error'
      },
      {
        name: 'ERN382-MessageHeader-MessageSender',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageSender;
        },
        message: 'MessageHeader must contain MessageSender',
        severity: 'error'
      },
      {
        name: 'ERN382-MessageHeader-MessageRecipient',
        test: (doc) => {
          return doc.MessageHeader && doc.MessageHeader.MessageRecipient;
        },
        message: 'MessageHeader must contain at least one MessageRecipient',
        severity: 'error'
      },
      {
        name: 'ERN382-MessageHeader-MessageCreatedDateTime',
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
        name: 'ERN382-MessageControlType',
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
   * Get ReleaseDetailsByTerritory validation rules
   */
  getTerritorialRules() {
    return [
      {
        name: 'ERN382-ReleaseDetailsByTerritory-Required',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            // Each Release must have ReleaseDetailsByTerritory
            if (!release.ReleaseDetailsByTerritory) return false;
            
            // Can be single or array
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            return details.length > 0;
          });
        },
        message: 'Each Release must have at least one ReleaseDetailsByTerritory in ERN 3.8.2',
        severity: 'error'
      },
      {
        name: 'ERN382-Territory-Specification',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            return details.every(detail => {
              // Must have EITHER TerritoryCode OR ExcludedTerritoryCode, not both
              const hasTerritory = !!detail.TerritoryCode;
              const hasExcluded = !!detail.ExcludedTerritoryCode;
              
              return (hasTerritory && !hasExcluded) || (!hasTerritory && hasExcluded);
            });
          });
        },
        message: 'ReleaseDetailsByTerritory must have either TerritoryCode OR ExcludedTerritoryCode (not both)',
        severity: 'error'
      },
      {
        name: 'ERN382-DisplayArtistName-In-Territory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            // At least one territory should have DisplayArtistName
            return details.some(detail => !!detail.DisplayArtistName);
          });
        },
        message: 'At least one ReleaseDetailsByTerritory should include DisplayArtistName',
        severity: 'warning',
        suggestion: 'Add DisplayArtistName within ReleaseDetailsByTerritory elements'
      },
      {
        name: 'ERN382-Title-In-Territory',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            // At least one territory should have Title
            return details.some(detail => !!detail.Title);
          });
        },
        message: 'At least one ReleaseDetailsByTerritory should include Title',
        severity: 'warning'
      },
      {
        name: 'ERN382-DisplayTitle-Type',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            // Check if at least one territory has a DisplayTitle
            return details.some(detail => {
              if (!detail.Title) return false;
              
              const titles = Array.isArray(detail.Title) ? detail.Title : [detail.Title];
              
              return titles.some(title => {
                const titleType = title['@_TitleType'];
                // Accept DisplayTitle, FormalTitle, or GroupingTitle as valid display titles
                return titleType === 'DisplayTitle' || 
                      titleType === 'FormalTitle' || 
                      titleType === 'GroupingTitle';
              });
            });
          });
        },
        message: 'At least one ReleaseDetailsByTerritory should have a Title with TitleType="DisplayTitle"',
        severity: 'warning',
        suggestion: 'Add TitleType="DisplayTitle" to the main Title element in ReleaseDetailsByTerritory'
      },
      {
        name: 'ERN382-TerritoryCode-Valid',
        test: (doc) => {
          // Same valid codes as ERN 4.2 since they share the same AVS
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
            
            // CISAC TIS numeric codes (commonly used in ERN 3.8.2)
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
          
          const releases = this.getReleases(doc);
          const territoryCodes = [];
          
          // Collect territory codes from ReleaseDetailsByTerritory
          releases.forEach(release => {
            if (release.ReleaseDetailsByTerritory) {
              const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                            release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
              
              details.forEach(detail => {
                if (detail.TerritoryCode) {
                  const codes = Array.isArray(detail.TerritoryCode) ?
                              detail.TerritoryCode : [detail.TerritoryCode];
                  territoryCodes.push(...codes.map(c => this.getValue(c)));
                }
                if (detail.ExcludedTerritoryCode) {
                  const codes = Array.isArray(detail.ExcludedTerritoryCode) ?
                              detail.ExcludedTerritoryCode : [detail.ExcludedTerritoryCode];
                  territoryCodes.push(...codes.map(c => this.getValue(c)));
                }
              });
            }
          });
          
          // Also check resource-level territories
          const resources = this.getResources(doc);
          resources.forEach(resource => {
            let detailsByTerritory = null;
            
            if (resource.SoundRecording) {
              detailsByTerritory = resource.SoundRecording.SoundRecordingDetailsByTerritory;
            } else if (resource.Video) {
              detailsByTerritory = resource.Video.VideoDetailsByTerritory;
            } else if (resource.Image) {
              detailsByTerritory = resource.Image.ImageDetailsByTerritory;
            } else if (resource.Text) {
              detailsByTerritory = resource.Text.TextDetailsByTerritory;
            }
            
            if (detailsByTerritory) {
              const details = Array.isArray(detailsByTerritory) ?
                            detailsByTerritory : [detailsByTerritory];
              
              details.forEach(detail => {
                if (detail.TerritoryCode) {
                  const codes = Array.isArray(detail.TerritoryCode) ?
                              detail.TerritoryCode : [detail.TerritoryCode];
                  territoryCodes.push(...codes.map(c => this.getValue(c)));
                }
                if (detail.ExcludedTerritoryCode) {
                  const codes = Array.isArray(detail.ExcludedTerritoryCode) ?
                              detail.ExcludedTerritoryCode : [detail.ExcludedTerritoryCode];
                  territoryCodes.push(...codes.map(c => this.getValue(c)));
                }
              });
            }
          });
          
          // Also check DealList territories if present
          if (doc.DealList) {
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
          }
          
          // Validate all collected codes
          return territoryCodes.every(code => validCodes.includes(code));
        },
        message: 'Invalid territory code. Must be ISO 3166-1, TIS numeric code, or "Worldwide"',
        severity: 'error',
        suggestion: 'Use standard ISO country codes (e.g., US, GB, FR), TIS numeric codes, or "Worldwide"'
      }      
    ];
  }

  /**
   * Get resource-level territory validation rules
   */
  getResourceTerritoryRules() {
    return [
      {
        name: 'ERN382-Resource-TerritoryDetails',
        test: (doc) => {
          const resources = this.getResources(doc);
          
          return resources.every(resource => {
            // Each resource type should have its corresponding DetailsByTerritory
            if (resource.SoundRecording) {
              return !!resource.SoundRecording.SoundRecordingDetailsByTerritory;
            }
            if (resource.Video) {
              return !!resource.Video.VideoDetailsByTerritory;
            }
            if (resource.Image) {
              return !!resource.Image.ImageDetailsByTerritory;
            }
            if (resource.Text) {
              return !!resource.Text.TextDetailsByTerritory;
            }
            return true;
          });
        },
        message: 'Each Resource should have its corresponding DetailsByTerritory element in ERN 3.8.2',
        severity: 'warning'
      },
      {
        name: 'ERN382-Resource-Territory-Specification',
        test: (doc) => {
          const resources = this.getResources(doc);
          
          return resources.every(resource => {
            let detailsByTerritory = null;
            
            if (resource.SoundRecording) {
              detailsByTerritory = resource.SoundRecording.SoundRecordingDetailsByTerritory;
            } else if (resource.Video) {
              detailsByTerritory = resource.Video.VideoDetailsByTerritory;
            } else if (resource.Image) {
              detailsByTerritory = resource.Image.ImageDetailsByTerritory;
            } else if (resource.Text) {
              detailsByTerritory = resource.Text.TextDetailsByTerritory;
            }
            
            if (!detailsByTerritory) return true;
            
            const details = Array.isArray(detailsByTerritory) ?
                          detailsByTerritory : [detailsByTerritory];
            
            return details.every(detail => {
              // Must have EITHER TerritoryCode OR ExcludedTerritoryCode, not both
              const hasTerritory = !!detail.TerritoryCode;
              const hasExcluded = !!detail.ExcludedTerritoryCode;
              
              return (hasTerritory && !hasExcluded) || (!hasTerritory && hasExcluded);
            });
          });
        },
        message: 'Resource DetailsByTerritory must have either TerritoryCode OR ExcludedTerritoryCode (not both)',
        severity: 'error'
      }
    ];
  }

  /**
   * Get reference pattern validation rules
   */
  getReferenceRules() {
    return [
      {
        name: 'ERN382-ReleaseReference-Pattern',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            const ref = release.ReleaseReference || release['@_ReleaseReference'];
            // ERN 3.8.2 typically uses R prefix but may be more flexible
            return ref && /^R[\d\-_a-zA-Z]+$/.test(ref);
          });
        },
        message: 'ReleaseReference should start with "R" and contain only alphanumeric, dash, underscore',
        severity: 'warning',
        suggestion: 'Use format like "R0", "R1", "R-main", etc.'
      },
      {
        name: 'ERN382-ResourceReference-Pattern',
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
      }
    ];
  }

  /**
   * Get identifier validation rules
   */
  getIdentifierRules() {
    return [
      {
        name: 'ERN382-ISRC-Format',
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
      },
      {
        name: 'ERN382-ProprietaryId',
        test: (doc) => {
          const resources = this.getResources(doc);
          
          return resources.every(resource => {
            // Check if ProprietaryId exists and has proper structure
            const soundRecording = resource.SoundRecording;
            const video = resource.Video;
            const image = resource.Image;
            
            const checkProprietaryIds = (resourceObj) => {
              if (!resourceObj) return true;
              
              const idObj = resourceObj.SoundRecordingId || 
                          resourceObj.VideoId || 
                          resourceObj.ImageId;
              
              if (!idObj || !idObj.ProprietaryId) return true;
              
              const propIds = Array.isArray(idObj.ProprietaryId) ?
                            idObj.ProprietaryId : [idObj.ProprietaryId];
              
              return propIds.every(pid => {
                // Should have value and optionally Namespace attribute
                if (typeof pid === 'string') return true;
                if (pid['#text']) return true;
                if (pid['@_Namespace']) return true; // Has namespace attribute
                return false;
              });
            };
            
            return checkProprietaryIds(soundRecording) && 
                   checkProprietaryIds(video) && 
                   checkProprietaryIds(image);
          });
        },
        message: 'ProprietaryId must have a value when present',
        severity: 'warning'
      }
    ];
  }

  /**
   * Get deal validation rules
   */
  getDealRules() {
    return [
      {
        name: 'ERN382-Deal-Structure',
        test: (doc) => {
          if (!doc.DealList) return true; // DealList is optional
          
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            // Must have DealReleaseReference (note: not DealReleaseReference)
            if (!releaseDeal.DealReleaseReference) return false;
            
            // Must have Deal
            if (!releaseDeal.Deal) return false;
            
            const nestedDeals = Array.isArray(releaseDeal.Deal) ?
                              releaseDeal.Deal : [releaseDeal.Deal];
            
            return nestedDeals.every(deal => {
              // Should have DealTerms OR DealReference (for external policies)
              return !!deal.DealTerms || !!deal.DealReference;
            });
          });
        },
        message: 'Each ReleaseDeal must have DealReleaseReference and Deal with DealTerms or DealReference',
        severity: 'error'
      },
      {
        name: 'ERN382-UseType',
        test: (doc) => {
          if (!doc.DealList) return true;
          
          // Complete list of valid UseTypes from ERN 3.8.2 XSD
          const validUseTypes = [
            'AsPerContract',
            'Broadcast', // deprecated
            'Cable',
            'ConditionalDownload',
            'ContentInfluencedStream',
            'Display', // deprecated
            'Download', // deprecated
            'Dub',
            'DubForAdvertisement',
            'DubForLivePerformance',
            'DubForMovies',
            'DubForMusicOnHold',
            'DubForOnDemandStreaming',
            'DubForPublicPerformance',
            'DubForRadio',
            'DubForTV',
            'ExtractForInternet',
            'KioskDownload', // deprecated
            'Narrowcast', // deprecated
            'NonInteractiveStream',
            'OnDemandStream',
            'Perform',
            'PerformAsMusicOnHold',
            'PerformInLivePerformance',
            'PerformInPublic', // deprecated
            'PermanentDownload',
            'Playback',
            'PlayInPublic',
            'Podcast',
            'Print', // deprecated
            'PrivateCopy',
            'PurchaseAsPhysicalProduct',
            'Rent',
            'Simulcast', // deprecated
            'Stream',
            'TetheredDownload',
            'TimeInfluencedStream',
            'Unknown',
            'Use',
            'UseAsAlertTone',
            'UseAsDevice',
            'UseAsKaraoke',
            'UseAsRingbackTone',
            'UseAsRingbackTune',
            'UseAsRingtone',
            'UseAsRingtune', // deprecated
            'UseAsScreensaver',
            'UseAsVoiceMail',
            'UseAsWallpaper',
            'UseForIdentification',
            'UseInMobilePhoneMessaging',
            'UseInPhoneListening',
            'UserDefined',
            'UserMakeAvailableLabelProvided',
            'UserMakeAvailableUserProvided',
            'Webcast' // deprecated
          ];
          
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            
            const nestedDeals = Array.isArray(releaseDeal.Deal) ?
                              releaseDeal.Deal : [releaseDeal.Deal];
            
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return true;
              
              // Check Usage/UseType structure
              if (deal.DealTerms.Usage) {
                const usage = deal.DealTerms.Usage;
                if (!usage.UseType) return true; // UseType is optional within Usage
                
                const useTypes = Array.isArray(usage.UseType) ? 
                                usage.UseType : [usage.UseType];
                
                return useTypes.every(type => {
                  const typeValue = this.getValue(type);
                  return validUseTypes.includes(typeValue);
                });
              }
              
              return true;
            });
          });
        },
        message: 'UseType must be a valid ERN 3.8.2 use type',
        severity: 'error',
        suggestion: 'Common values: PermanentDownload, OnDemandStream, NonInteractiveStream, ConditionalDownload, etc. See DDEX documentation for full list.'
      },
      {
        name: 'ERN382-CommercialModelType',
        test: (doc) => {
          if (!doc.DealList) return true;
          
          // Updated to match actual ERN 3.8.2 XSD allowed values
          const validModels = [
            'AdvertisementSupportedModel',
            'AsPerContract',
            'DeviceFeeModel',
            'FreeOfChargeModel',
            'PayAsYouGoModel',
            'PerformanceRoyaltiesModel',
            'RightsClaimModel',
            'SubscriptionModel',
            'Unknown',  // Deprecated but still valid
            'UserDefined'
          ];
          
          const deals = this.getDeals(doc);
          
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            
            const nestedDeals = Array.isArray(releaseDeal.Deal) ?
                              releaseDeal.Deal : [releaseDeal.Deal];
            
            return nestedDeals.every(deal => {
              if (!deal.DealTerms || !deal.DealTerms.CommercialModelType) return true;
              
              const models = Array.isArray(deal.DealTerms.CommercialModelType) ?
                          deal.DealTerms.CommercialModelType : 
                          [deal.DealTerms.CommercialModelType];
              
              return models.every(model => {
                const modelValue = this.getValue(model);
                return validModels.includes(modelValue);
              });
            });
          });
        },
        message: 'CommercialModelType must be a valid ERN 3.8.2 commercial model type',
        severity: 'warning',
        suggestion: 'Valid values: AdvertisementSupportedModel, SubscriptionModel, PayAsYouGoModel, FreeOfChargeModel, DeviceFeeModel, PerformanceRoyaltiesModel, RightsClaimModel, AsPerContract, UserDefined'
      }
    ];
  }

  /**
   * Get resource group validation rules
   */
  getResourceGroupRules() {
    return [
      {
        name: 'ERN382-ResourceGroup-Structure',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            return details.every(detail => {
              if (!detail.ResourceGroup) return true; // Optional
              
              // ResourceGroup can be nested
              const checkResourceGroup = (group) => {
                // Can have nested ResourceGroups
                if (group.ResourceGroup) {
                  const nestedGroups = Array.isArray(group.ResourceGroup) ?
                                      group.ResourceGroup : [group.ResourceGroup];
                  
                  if (!nestedGroups.every(ng => checkResourceGroup(ng))) {
                    return false;
                  }
                }
                
                // Should have ResourceGroupContentItem
                if (!group.ResourceGroupContentItem) return false;
                
                const items = Array.isArray(group.ResourceGroupContentItem) ?
                            group.ResourceGroupContentItem : [group.ResourceGroupContentItem];
                
                return items.every(item => {
                  // Must have ReleaseResourceReference
                  const ref = item.ReleaseResourceReference;
                  if (!ref) return false;
                  
                  const refValue = this.getValue(ref);
                  // Should match resource reference pattern
                  return /^A[\d\-_a-zA-Z]+$/.test(refValue);
                });
              };
              
              return checkResourceGroup(detail.ResourceGroup);
            });
          });
        },
        message: 'ResourceGroup must contain ResourceGroupContentItem with valid ReleaseResourceReference',
        severity: 'error'
      },
      {
        name: 'ERN382-SequenceNumber',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            if (!release.ReleaseDetailsByTerritory) return true;
            
            const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                          release.ReleaseDetailsByTerritory : [release.ReleaseDetailsByTerritory];
            
            return details.every(detail => {
              if (!detail.ResourceGroup) return true;
              
              const checkSequenceNumbers = (group) => {
                if (!group.ResourceGroupContentItem) return true;
                
                const items = Array.isArray(group.ResourceGroupContentItem) ?
                            group.ResourceGroupContentItem : [group.ResourceGroupContentItem];
                
                const seqNumbers = items.map(item => 
                  parseInt(this.getValue(item.SequenceNumber))
                ).filter(n => !isNaN(n));
                
                // Check for duplicates
                const uniqueSeq = new Set(seqNumbers);
                return uniqueSeq.size === seqNumbers.length;
              };
              
              return checkSequenceNumbers(detail.ResourceGroup);
            });
          });
        },
        message: 'SequenceNumber values must be unique within a ResourceGroup',
        severity: 'warning'
      }
    ];
  }

  /**
   * Get release list validation rules
   */
  getReleaseListRules() {
    return [
      {
        name: 'ERN382-Main-Release',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          // Should have at least one main release
          const mainReleases = releases.filter(r => 
            r['@_IsMainRelease'] === 'true' || r['@_IsMainRelease'] === true
          );
          
          return mainReleases.length === 1;
        },
        message: 'There should be exactly one Release with IsMainRelease="true"',
        severity: 'warning'
      },
      {
        name: 'ERN382-ReleaseResourceReferenceList',
        test: (doc) => {
          const releases = this.getReleases(doc);
          
          return releases.every(release => {
            // Each release should have ReleaseResourceReferenceList
            if (!release.ReleaseResourceReferenceList) return false;
            
            const refs = release.ReleaseResourceReferenceList.ReleaseResourceReference;
            if (!refs) return false;
            
            const refArray = Array.isArray(refs) ? refs : [refs];
            
            return refArray.every(ref => {
              const refValue = this.getValue(ref);
              // Should match resource reference pattern
              return /^A[\d\-_a-zA-Z]+$/.test(refValue);
            });
          });
        },
        message: 'Each Release must have ReleaseResourceReferenceList with valid resource references',
        severity: 'error'
      }
    ];
  }

  /**
   * Get all rules for ERN 3.8.2
   */
  getAllRules() {
    return [
      ...this.getStructuralRules(),
      ...this.getMessageHeaderRules(),
      ...this.getTerritorialRules(),
      ...this.getResourceTerritoryRules(),
      ...this.getReferenceRules(),
      ...this.getIdentifierRules(),
      ...this.getDealRules(),
      ...this.getResourceGroupRules(),
      ...this.getReleaseListRules()
    ];
  }

  /**
   * Get profile-specific rules for ERN 3.8.2
   */
  getProfileRules(profile) {
    const profileRules = {
      'AudioAlbum': [
        {
          name: 'AudioAlbum-ReleaseType-382',
          test: (doc) => {
            const releases = this.getReleases(doc);
            
            // Find the main release
            const mainRelease = releases.find(r => 
              r['@_IsMainRelease'] === 'true' || r['@_IsMainRelease'] === true
            );
            
            if (!mainRelease) return false;
            
            // Check ReleaseType at release level
            if (mainRelease.ReleaseType) {
              const type = this.getValue(mainRelease.ReleaseType);
              if (['Album', 'ClassicalAlbum', 'DigitalBoxSetRelease'].includes(type)) {
                return true;
              }
            }
            
            // Also check in ReleaseDetailsByTerritory
            if (mainRelease.ReleaseDetailsByTerritory) {
              const details = Array.isArray(mainRelease.ReleaseDetailsByTerritory) ?
                            mainRelease.ReleaseDetailsByTerritory : 
                            [mainRelease.ReleaseDetailsByTerritory];
              
              return details.some(detail => {
                if (!detail.ReleaseType) return false;
                
                const releaseTypes = Array.isArray(detail.ReleaseType) ?
                                  detail.ReleaseType : [detail.ReleaseType];
                
                return releaseTypes.some(rt => {
                  const type = this.getValue(rt);
                  return ['Album', 'ClassicalAlbum', 'DigitalBoxSetRelease'].includes(type);
                });
              });
            }
            
            return false;
          },
          message: 'AudioAlbum profile expects ReleaseType of Album or similar',
          severity: 'warning'
        },
        {
          name: 'AudioAlbum-TrackReleases',
          test: (doc) => {
            const releases = this.getReleases(doc);
            
            // Should have multiple releases (main album + tracks)
            return releases.length >= 2;
          },
          message: 'AudioAlbum typically includes main album release plus individual track releases',
          severity: 'info'
        }
      ],
      
      'AudioSingle': [
        {
          name: 'AudioSingle-ReleaseType-382',
          test: (doc) => {
            const releases = this.getReleases(doc);
            
            return releases.some(release => {
              // Check ReleaseType at release level
              if (release.ReleaseType) {
                const type = this.getValue(release.ReleaseType);
                if (['Single', 'EP', 'SingleResourceRelease', 'TrackRelease'].includes(type)) {
                  return true;
                }
              }
              
              // Also check in ReleaseDetailsByTerritory
              if (release.ReleaseDetailsByTerritory) {
                const details = Array.isArray(release.ReleaseDetailsByTerritory) ?
                              release.ReleaseDetailsByTerritory : 
                              [release.ReleaseDetailsByTerritory];
                
                return details.some(detail => {
                  if (!detail.ReleaseType) return false;
                  
                  const releaseTypes = Array.isArray(detail.ReleaseType) ?
                                    detail.ReleaseType : [detail.ReleaseType];
                  
                  return releaseTypes.some(rt => {
                    const type = this.getValue(rt);
                    return ['Single', 'EP', 'SingleResourceRelease', 'TrackRelease'].includes(type);
                  });
                });
              }
              
              return false;
            });
          },
          message: 'AudioSingle profile expects ReleaseType of Single, EP, or TrackRelease',
          severity: 'warning'
        }
      ],

      'ReleaseByRelease': [
        {
          name: 'ReleaseByRelease-MultipleReleases',
          test: (doc) => {
            const releases = this.getReleases(doc);
            // ReleaseByRelease typically has multiple releases
            return releases.length >= 1;
          },
          message: 'ReleaseByRelease profile typically contains multiple Release elements',
          severity: 'info'
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
    
    return releases;
  }

  getResources(doc) {
    if (!doc.ResourceList) return [];
    
    const resources = [];
    
    ['SoundRecording', 'Video', 'Image', 'Text', 'SheetMusic'].forEach(type => {
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

  getDeals(doc) {
    if (!doc.DealList || !doc.DealList.ReleaseDeal) return [];
    return Array.isArray(doc.DealList.ReleaseDeal) 
      ? doc.DealList.ReleaseDeal 
      : [doc.DealList.ReleaseDeal].filter(Boolean);
  }
}

module.exports = ERN382Rules;