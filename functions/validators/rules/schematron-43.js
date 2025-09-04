// functions/validators/rules/schematron-43.js
/**
 * ERN 4.3 Schematron-equivalent validation rules
 * Based on ERN 4.3 XSD and DDEX specifications (ERN Part 1 v4.3 & Part 2 v2.3)
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
        suggestion: 'Consider adding DealList with commercial terms for a product delivery.'
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
   * Get reference pattern and integrity validation rules
   */
  getReferenceRules() {
    return [
      // Reference FORMATTING rules
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
            const ref = this.getValue(resource.ResourceReference);
            return ref && /^A[\d\-_a-zA-Z]+$/.test(ref);
          });
        },
        message: 'ResourceReference must start with "A" and contain only alphanumeric, dash, underscore',
        severity: 'error',
        suggestion: 'Use format like "A1", "A2", "A-cover", etc.'
      },

      // Referential INTEGRITY rules
      {
        name: 'ERN43-Party-Reference-Exists',
        test: (doc) => {
          const definedPartyIds = new Set(this.getParties(doc).map(p => this.getValue(p.PartyId)));
          if (definedPartyIds.size === 0) return true; // No parties to check against

          const referencedPartyIds = new Set();
          // Collect from MessageHeader
          referencedPartyIds.add(this.getValue(doc.MessageHeader?.MessageSender?.PartyId));
          referencedPartyIds.add(this.getValue(doc.MessageHeader?.MessageRecipient?.PartyId));
          
          // Collect from all Contributors and DisplayArtists
          this.getReleases(doc).forEach(release => {
            const artists = Array.isArray(release.DisplayArtist) ? release.DisplayArtist : (release.DisplayArtist ? [release.DisplayArtist] : []);
            artists.forEach(artist => referencedPartyIds.add(this.getValue(artist.ArtistPartyReference)));
          });
          this.getResources(doc).forEach(resource => {
            const resourceData = resource.SoundRecording || resource.Video || resource.Image || resource.Text;
            const contributors = Array.isArray(resourceData?.Contributor) ? resourceData.Contributor : (resourceData?.Contributor ? [resourceData.Contributor] : []);
            contributors.forEach(c => referencedPartyIds.add(this.getValue(c.PartyId)));
          });

          // Check if every referenced party ID exists in the PartyList
          for (const id of referencedPartyIds) {
            if (id && !definedPartyIds.has(id)) {
              return false; // Found a dangling reference
            }
          }
          return true;
        },
        message: 'All referenced parties (in MessageHeader, DisplayArtist, Contributor) must be defined in the PartyList.',
        severity: 'error'
      },
      {
        name: 'ERN43-ResourceGroup-Reference-Exists',
        test: (doc) => {
          const definedResourceRefs = new Set(this.getResources(doc).map(r => this.getValue(r.ResourceReference)));
          if (definedResourceRefs.size === 0) return true;

          const releases = this.getReleases(doc).filter(r => r.ResourceGroup?.ResourceGroupContentItem);

          return releases.every(release => {
            const items = Array.isArray(release.ResourceGroup.ResourceGroupContentItem)
              ? release.ResourceGroup.ResourceGroupContentItem
              : [release.ResourceGroup.ResourceGroupContentItem];
            
            return items.every(item => {
              const ref = this.getValue(item.ReleaseResourceReference);
              return definedResourceRefs.has(ref); // Referenced resource must exist in ResourceList
            });
          });
        },
        message: 'A resource referenced in a ResourceGroup does not exist in the ResourceList.',
        severity: 'error'
      }
    ];
  }

  /**
   * Get identifier validation rules (ISRC, GRid, etc.)
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
            if (!isrc) return true; // ISRC is optional on the element, but may be required by other rules
            return /^[a-zA-Z]{2}[a-zA-Z0-9]{3}[0-9]{7}$/.test(isrc);
          });
        },
        message: 'ISRC must match the format: 2 letters, 3 alphanumeric, 7 digits (e.g., USRC17607839).',
        severity: 'error'
      },
      {
        // Based on Profiles Doc, Clause 7.4, Rule 1
        name: 'ERN43-PrimaryResource-ISRC-Required',
        test: (doc) => {
          const primaryResourceRefs = new Set();
          this.getMainReleases(doc).forEach(release => {
              if (!release.ResourceGroup) return;
              const items = Array.isArray(release.ResourceGroup.ResourceGroupContentItem) ? release.ResourceGroup.ResourceGroupContentItem : [release.ResourceGroup.ResourceGroupContentItem];
              items.forEach(item => primaryResourceRefs.add(this.getValue(item.ReleaseResourceReference)));
          });
          
          const primaryAudioVideoResources = this.getResources(doc).filter(r => 
              (r.SoundRecording || r.Video) && primaryResourceRefs.has(this.getValue(r.ResourceReference))
          );
          
          if (primaryAudioVideoResources.length === 0) return true;

          return primaryAudioVideoResources.every(res => {
              const data = res.SoundRecording || res.Video;
              return !!data?.SoundRecordingId?.ISRC || !!data?.VideoId?.ISRC;
          });
        },
        message: 'Primary Resources (SoundRecordings and Videos) eligible for an ISRC must be identified by an ISRC.',
        severity: 'error'
      },
      {
        // Based on Profiles Doc, Clause 7.3, Rule 1
        name: 'ERN43-MainRelease-Identifier-Required',
        test: (doc) => {
          return this.getMainReleases(doc).every(release => {
            if (!release.ReleaseId) return false;
            const ids = Array.isArray(release.ReleaseId) ? release.ReleaseId : [release.ReleaseId];
            return ids.some(id => id.GRid || id.ICPN || id.ProprietaryId);
          });
        },
        message: 'Main releases must be identified by a GRid, ICPN, or ProprietaryId.',
        severity: 'error'
      }
    ];
  }

  /**
   * Get display metadata and contributor rules
   */
  getDisplayRules() {
    // AVS Data from XSD snippets
    const validDisplayArtistRoles = new Set(['Artist', 'Brand', 'Composer', 'FeaturedArtist', 'MainArtist', 'UserDefined']);
    const validContributorRoles = new Set(['Adapter', 'Architect', 'Arranger', 'Author', 'AuthorInQuotations', 'AuthorOfAfterword', 'Compiler', 'Composer', 'ComposerLyricist', 'Conceptor', 'Creator', 'DialogueAuthor', 'Dissertant', 'Engraver', 'Etcher', 'Journalist', 'LandscapeArchitect', 'Librettist', 'Lithographer', 'Lyricist', 'MetalEngraver', 'NonLyricAuthor', 'PlateMaker', 'Playwright', 'Reporter', 'Reviewer', 'Rubricator', 'ScreenplayAuthor', 'Sculptor', 'SubArranger', 'SubLyricist', 'Translator', 'Woodcutter', 'WoodEngraver', 'WriterOfAccompanyingMaterial', 'BookPublisher', 'CopyrightClaimant', 'CopyrightHolder', 'MusicPublisher', 'NewspaperPublisher', 'OriginalPublisher', 'PeriodicalPublisher', 'SubPublisher', 'SubstitutedPublisher', 'Unknown', 'UserDefined', 'Accompanyist', 'Actor', 'AdditionalEngineer', 'AdditionalMixingEngineer', 'AdditionalPerformer', 'AdditionalProgrammingEngineer', 'AdditionalStudioProducer', 'AnchorPerson', 'AnimalTrainer', 'Animator', 'Annotator', 'Announcer', 'AAndRAdministrator', 'AAndRCoordinator', 'Armourer', 'ArtCopyist', 'ArtDirector', 'Artist', 'ArtistBackgroundVocalEngineer', 'ArtistVocalEngineer', 'ArtistVocalSecondEngineer', 'AssistantCameraOperator', 'AssistantChiefLightingTechnician', 'AssistantConductor', 'AssistantDirector', 'AssistantEditor', 'AssistantEngineer', 'AssistantProducer', 'AssistantVisualEditor', 'AssociatedPerformer', 'AssociateProducer', 'AuralTrainer', 'BackgroundVocalist', 'BalanceEngineer', 'BandLeader', 'Binder', 'BindingDesigner', 'BookDesigner', 'BookjackDesigner', 'BookplateDesigner', 'BookProducer', 'BroadcastAssistant', 'BroadcastJournalist', 'Calligrapher', 'CameraOperator', 'Carpenter', 'Cartographer', 'Cartoonist', 'CastingDirector', 'Causeur', 'Censor', 'ChiefLightingTechnician', 'Choir', 'ChoirMember', 'Choreographer', 'ChorusMaster', 'CircusArtist', 'ClapperLoader', 'ClubDJ', 'CoDirector', 'CoExecutiveProducer', 'ColorSeparator', 'Comedian', 'CoMixer', 'CoMixingEngineer', 'Commentator', 'CommissioningBroadcaster', 'CompilationProducer', 'ComputerGraphicCreator', 'ComputerProgrammer', 'ConcertMaster', 'Conductor', 'Consultant', 'ContinuityChecker', 'Contractor', 'CoProducer', 'Correspondent', 'CostumeDesigner', 'CoverDesigner', 'Dancer', 'Delineator', 'Designer', 'DialogueCoach', 'DialogueDirector', 'DigitalAudioWorkstationEngineer', 'DigitalEditingEngineer', 'DigitalEditingSecondEngineer', 'Director', 'DirectStreamDigitalEngineer', 'DistributionCompany', 'DJ', 'Draughtsman', 'Dresser', 'Dubber', 'Editor', 'EditorInChief', 'EditorOfTheDay', 'Encoder', 'Engineer', 'Ensemble', 'ExecutiveProducer', 'Expert', 'Facsimilist', 'FightDirector', 'FilmDirector', 'FilmDistributor', 'FilmEditor', 'FilmProducer', 'FilmSoundEngineer', 'FloorManager', 'FocusPuller', 'FoleyArtist', 'FoleyEditor', 'FoleyMixer', 'GraphicArtist', 'GraphicAssistant', 'GraphicDesigner', 'Greensman', 'Grip', 'GuestConductor', 'GroupMember', 'Hairdresser', 'Illustrator', 'ImmersiveMasteringEngineer', 'ImmersiveMixingEngineer', 'InitialProducer', 'InterviewedGuest', 'Interviewer', 'KeyCharacter', 'KeyGrip', 'KeyTalent', 'Leadman', 'LeadPerformer', 'LeadVocalist', 'LightingDirector', 'LightingTechnician', 'LocationManager', 'MakeUpArtist', 'Manufacturer', 'MasteringEngineer', 'MasteringSecondEngineer', 'MatteArtist', 'Mime', 'Mixer', 'MixingEngineer', 'MixingSecondEngineer', 'MusicArranger', 'MusicCopyist', 'MusicDirector', 'MusicGroup', 'Musician', 'Narrator', 'NewsProducer', 'NewsReader', 'NotSpecified', 'Orchestra', 'OrchestraMember', 'OriginalArtist', 'OverdubEngineer', 'OverdubSecondEngineer', 'Painter', 'Performer', 'Photographer', 'PhotographyDirector', 'PlaybackSinger', 'PostProducer', 'PreProduction', 'PreProductionEngineer', 'PreProductionSecondEngineer', 'Presenter', 'PrimaryMusician', 'ProductionAssistant', 'ProductionCompany', 'ProductionCoordinator', 'ProductionDepartment', 'ProductionManager', 'ProductionSecretary', 'ProjectEngineer', 'Programmer', 'ProgrammingEngineer', 'ProgramProducer', 'PropertyManager', 'PublishingDirector', 'Puppeteer', 'Pyrotechnician', 'RecordingEngineer', 'RecordingSecondEngineer', 'Redactor', 'ReissueProducer', 'RemixedArtist', 'Remixer', 'RemixingEngineer', 'RemixingSecondEngineer', 'Repetiteur', 'Researcher', 'ResearchTeamHead', 'ResearchTeamMember', 'Restager', 'Rigger', 'RightsControllerOnProduct', 'Runner', 'ScenicOperative', 'ScientificAdvisor', 'ScriptSupervisor', 'SecondAssistantCameraOperator', 'SecondAssistantDirector', 'SecondConductor', 'SecondEngineer', 'SecondUnitDirector', 'SeriesProducer', 'SetDesigner', 'SetDresser', 'SignLanguageInterpreter', 'Soloist', 'SoundDesigner', 'SoundMixer', 'SoundRecordist', 'SoundSupervisor', 'Speaker', 'SpecialEffectsTechnician', 'Sponsor', 'StageAssistantEngineer', 'StageDirector', 'StageEngineer', 'StoryTeller', 'StringEngineer', 'StringProducer', 'StringsDirector', 'StudioConductor', 'StudioMusician', 'StudioPersonnel', 'StudioProducer', 'Stunts', 'SubtitlesEditor', 'SubtitlesTranslator', 'SupportingActor', 'SurroundMixingEngineer', 'SurroundMixingSecondEngineer', 'TapeOperator', 'TechnicalDirector', 'Tonmeister', 'TrackingEngineer', 'TrackingSecondEngineer', 'TransfersAndSafetiesEngineer', 'TransfersAndSafetiesSecondEngineer', 'TransportationManager', 'Treatment/ProgramProposal', 'TypeDesigner', 'VideoDirector', 'Videographer', 'VideoMusicalDirector', 'VideoProducer', 'VisionMixer', 'VisualEditor', 'VisualEffectsTechnician', 'VocalArranger', 'VocalEditingEngineer', 'VocalEditingSecondEngineer', 'VocalEngineer', 'Vocalist', 'VocalSecondEngineer', 'VocalProducer', 'VoiceActor', 'Wardrobe']);

    return [
      {
        name: 'ERN43-Release-DisplayTitle',
        test: (doc) => {
          const mainReleases = this.getMainReleases(doc);
          return mainReleases.every(release => (release.DisplayTitleText || release.DisplayTitle));
        },
        message: 'Each main Release must have DisplayTitleText and/or DisplayTitle elements',
        severity: 'error'
      },
      {
        name: 'ERN43-Release-DisplayArtist',
        test: (doc) => {
          const mainReleases = this.getMainReleases(doc);
          return mainReleases.every(release => (release.DisplayArtistName || release.DisplayArtist));
        },
        message: 'Each main Release must have DisplayArtistName and/or DisplayArtist elements',
        severity: 'error'
      },
      {
        // Based on Profiles Doc, Clause 7.2, Rule 1
        name: 'ERN43-DisplayArtist-Sequenced',
        test: (doc) => {
          return this.getReleases(doc).every(release => {
            if (!release.DisplayArtist) return true;
            const artists = Array.isArray(release.DisplayArtist) ? release.DisplayArtist : [release.DisplayArtist];
            return artists.every(artist => artist['@_SequenceNumber'] !== undefined);
          });
        },
        message: 'All DisplayArtist elements must have a SequenceNumber attribute.',
        severity: 'error',
        suggestion: 'Add SequenceNumber="1", SequenceNumber="2", etc., to order the artists correctly.'
      },
      {
        name: 'ERN43-DisplayArtistRole-Valid',
        test: (doc) => {
            return this.getReleases(doc).every(release => {
                if (!release.DisplayArtist) return true;
                const artists = Array.isArray(release.DisplayArtist) ? release.DisplayArtist : [release.DisplayArtist];
                return artists.every(artist => validDisplayArtistRoles.has(this.getValue(artist.DisplayArtistRole)));
            });
        },
        message: 'A DisplayArtistRole is not a valid value from the DDEX AVS for DisplayArtistRole (e.g., MainArtist, FeaturedArtist).',
        severity: 'error'
      },
      {
        name: 'ERN43-ContributorRole-Valid',
        test: (doc) => {
            return this.getResources(doc).every(resource => {
                const data = resource.SoundRecording || resource.Video || resource.Image || resource.Text;
                if (!data || !data.Contributor) return true;
                const contributors = Array.isArray(data.Contributor) ? data.Contributor : [data.Contributor];
                return contributors.every(c => {
                    if (!c.Role) return true; // Role is optional
                    const roles = Array.isArray(c.Role) ? c.Role : [c.Role];
                    return roles.every(role => validContributorRoles.has(this.getValue(role)));
                });
            });
        },
        message: 'A Contributor Role is not a valid value from the DDEX AVS for ContributorRole.',
        severity: 'error'
      },
      {
        name: 'ERN43-MusicalWork-Composer-Required',
        test: (doc) => {
            const musicalWorks = this.getResources(doc).filter(r => 
                r.SoundRecording && this.getValue(r.SoundRecording.Type) === 'MusicalWorkSoundRecording'
            );
            if (musicalWorks.length === 0) return true;

            return musicalWorks.every(mw => {
                if (!mw.SoundRecording.Contributor) return false;
                const contributors = Array.isArray(mw.SoundRecording.Contributor) ? mw.SoundRecording.Contributor : [mw.SoundRecording.Contributor];
                return contributors.some(c => {
                    if (!c.Role) return false;
                    const roles = Array.isArray(c.Role) ? c.Role.map(r => this.getValue(r)) : [this.getValue(c.Role)];
                    return roles.includes('Composer') || roles.includes('ComposerLyricist') || roles.includes('Lyricist');
                });
            });
        },
        message: 'MusicalWorkSoundRecordings should include at least one Contributor with the role of Composer, Lyricist, or ComposerLyricist.',
        severity: 'warning'
      },
      {
        name: 'ERN43-MainArtist-Exists',
        test: (doc) => {
            const mainReleases = this.getMainReleases(doc);
            if (mainReleases.length === 0) return true;

            return mainReleases.every(release => {
                if (!release.DisplayArtist) return false; // If no DisplayArtist, it will fail another rule
                const artists = Array.isArray(release.DisplayArtist) ? release.DisplayArtist : [release.DisplayArtist];
                return artists.some(artist => this.getValue(artist.DisplayArtistRole) === 'MainArtist');
            });
        },
        message: 'Each main Release must have at least one DisplayArtist with the role of MainArtist.',
        severity: 'error'
      }
    ];
  }

  /**
   * Get deal terms validation rules
   */
  getDealRules() {
    // AVS Data for UseType
    const validUseTypes = new Set(['AsPerContract', 'Broadcast', 'Cable', 'ConditionalDownload', 'ContentInfluencedStream', 'Display', 'Download', 'Dub', 'DubForOnDemandStreaming', 'DubForLivePerformance', 'DubForMovies', 'DubForMusicOnHold', 'DubForPublicPerformance', 'DubForRadio', 'DubForTV', 'ExtractForInternet', 'KioskDownload', 'Narrowcast', 'NonInteractiveStream', 'OnDemandStream', 'Perform', 'PerformAsMusicOnHold', 'PerformInLivePerformance', 'PerformInPublic', 'PermanentDownload', 'Playback', 'PlayInPublic', 'Podcast', 'Print', 'PrivateCopy', 'PurchaseAsPhysicalProduct', 'Rent', 'Simulcast', 'Stream', 'TetheredDownload', 'TimeInfluencedStream', 'Unknown', 'Use', 'UseAsAlertTone', 'UseAsDevice', 'UseAsKaraoke', 'UseAsRingbackTone', 'UseAsRingbackTune', 'UseAsRingtone', 'UseAsRingtune', 'UseAsScreensaver', 'UseAsVoiceMail', 'UseAsWallpaper', 'UseForDataMining', 'UseForTrainingGenerativeAI', 'UseForIdentification', 'UseForTrainingNonGenerativeAI', 'UseInMobilePhoneMessaging', 'UseInPhoneListening', 'UserDefined', 'UserMakeAvailableLabelProvided', 'UserMakeAvailableUserProvided', 'Webcast']);
    const deprecatedUseTypes = new Set(['Broadcast', 'Display', 'Download', 'Narrowcast', 'PerformInPublic', 'Print', 'Simulcast', 'UseAsRingtune', 'Webcast']);
    const parentUseTypes = {
        'Stream': ['NonInteractiveStream', 'OnDemandStream', 'ContentInfluencedStream', 'TimeInfluencedStream'],
        'Download': ['ConditionalDownload', 'PermanentDownload', 'TetheredDownload']
    };

    return [
      {
        name: 'ERN43-DealTerms-Territory',
        test: (doc) => {
          const deals = this.getDeals(doc);
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? releaseDeal.Deal : [releaseDeal.Deal];
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return false;
              const dtArray = Array.isArray(deal.DealTerms) ? deal.DealTerms : [deal.DealTerms];
              return dtArray.every(dt => {
                const hasTerritory = !!dt.TerritoryCode;
                const hasExcluded = !!dt.ExcludedTerritoryCode;
                return (hasTerritory && !hasExcluded) || (!hasTerritory && hasExcluded);
              });
            });
          });
        },
        message: 'Each DealTerms must have either TerritoryCode OR ExcludedTerritoryCode, but not both.',
        severity: 'error'
      },
      {
        name: 'ERN43-DealTerms-ValidityPeriod',
        test: (doc) => {
          const deals = this.getDeals(doc);
          return deals.every(releaseDeal => {
            if (!releaseDeal.Deal) return true;
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? releaseDeal.Deal : [releaseDeal.Deal];
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return false;
              const dtArray = Array.isArray(deal.DealTerms) ? deal.DealTerms : [deal.DealTerms];
              return dtArray.every(dt => {
                const vp = dt.ValidityPeriod;
                if (!vp) return false;
                const vpArray = Array.isArray(vp) ? vp : [vp];
                return vpArray.every(period => period.StartDate || period.StartDateTime);
              });
            });
          });
        },
        message: 'Each DealTerms must have a ValidityPeriod with a StartDate or StartDateTime.',
        severity: 'error'
      },
      {
        name: 'ERN43-Deal-UseType-Valid',
        test: (doc) => {
          const deals = this.getDeals(doc);
          return deals.every(rd => {
            if (!rd.Deal) return true;
            const nestedDeals = Array.isArray(rd.Deal) ? rd.Deal : [rd.Deal];
            return nestedDeals.every(d => {
              if (!d.DealTerms) return true;
              const dtArray = Array.isArray(d.DealTerms) ? d.DealTerms : [d.DealTerms];
              return dtArray.every(dt => {
                if (!dt.UseType) return true;
                const useTypes = Array.isArray(dt.UseType) ? dt.UseType : [dt.UseType];
                return useTypes.every(ut => validUseTypes.has(this.getValue(ut)));
              });
            });
          });
        },
        message: 'A UseType in the DealTerms is not a valid value from the DDEX AVS for UseType.',
        severity: 'error'
      },
      {
        name: 'ERN43-Deal-UseType-Deprecated',
        test: (doc) => {
          const deals = this.getDeals(doc);
          return deals.every(rd => {
            if (!rd.Deal) return true;
            const nestedDeals = Array.isArray(rd.Deal) ? rd.Deal : [rd.Deal];
            return nestedDeals.every(d => {
              if (!d.DealTerms) return true;
              const dtArray = Array.isArray(d.DealTerms) ? d.DealTerms : [d.DealTerms];
              return dtArray.every(dt => {
                if (!dt.UseType) return true;
                const useTypes = Array.isArray(dt.UseType) ? dt.UseType : [dt.UseType];
                return useTypes.every(ut => !deprecatedUseTypes.has(this.getValue(ut)));
              });
            });
          });
        },
        message: 'A UseType in the DealTerms has been deprecated. Use a more specific term (e.g., "OnDemandStream" instead of "Stream").',
        severity: 'warning'
      },
      {
        // Based on Message Definition Doc, Clause 6.18
        name: 'ERN43-Deal-UseType-ParentChild-Conflict',
        test: (doc) => {
          const deals = this.getDeals(doc);
          return deals.every(rd => {
            if (!rd.Deal) return true;
            const nestedDeals = Array.isArray(rd.Deal) ? rd.Deal : [rd.Deal];
            return nestedDeals.every(d => {
              if (!d.DealTerms) return true;
              const dtArray = Array.isArray(d.DealTerms) ? d.DealTerms : [d.DealTerms];
              return dtArray.every(dt => {
                if (!dt.UseType) return true;
                const useTypes = new Set( (Array.isArray(dt.UseType) ? dt.UseType : [dt.UseType]).map(ut => this.getValue(ut)) );
                
                for (const parent in parentUseTypes) {
                  if (useTypes.has(parent)) {
                    // If the parent is present, none of its children should be.
                    for (const child of parentUseTypes[parent]) {
                      if (useTypes.has(child)) return false; // Conflict found
                    }
                  }
                }
                return true;
              });
            });
          });
        },
        message: 'A DealTerms block cannot contain both a generic UseType (e.g., Stream) and one of its specializations (e.g., OnDemandStream).',
        severity: 'error'
      }
    ];
  }
  
  /**
   * Get cross-entity consistency rules
   */
  getConsistencyRules() {
    return [
      {
        // Based on Profiles Doc, Clause 6.1, Rule 2
        name: 'ERN43-MainRelease-ExactlyOne',
        test: (doc) => {
          // Rule applies to messages using a Release Profile
          if (!doc['@_ReleaseProfileVersionId']) return true;
          return this.getMainReleases(doc).length === 1;
        },
        message: 'A NewReleaseMessage using a Release Profile must contain exactly one main Release (IsMainRelease="true").',
        severity: 'error'
      },
      {
        // Implied by Profiles Doc, Clause 6.2 and others
        name: 'ERN43-ResourceGroup-TrackCount-Mismatch',
        test: (doc) => {
          const mainReleases = this.getMainReleases(doc);
          if (mainReleases.length !== 1) return true;
          const mainRelease = mainReleases[0];

          // Find TrackReleases associated with this main release
          const mainReleaseId = this.getValue(mainRelease.ReleaseId?.[0]?.GRid || mainRelease.ReleaseId?.[0]?.ICPN);
          if (!mainReleaseId) return true;
          const associatedTracks = this.getReleases(doc).filter(tr => 
            tr._isTrackRelease && tr.ReleaseId?.some(id => this.getValue(id.ReferredRelease) === mainReleaseId)
          );

          // Get the count of resources in the main release's resource group
          const resourceItems = mainRelease.ResourceGroup?.ResourceGroupContentItem;
          if (!resourceItems) return associatedTracks.length === 0;

          const resourceCount = Array.isArray(resourceItems) ? resourceItems.length : 1;
          return associatedTracks.length === resourceCount;
        },
        message: 'The number of associated TrackReleases does not match the number of resources in the main Release\'s ResourceGroup.',
        severity: 'error'
      },
      {
        name: 'ERN43-ParentalWarning-Consistency',
        test: (doc) => {
          const mainReleases = this.getMainReleases(doc);
          if (mainReleases.length !== 1) return true;

          const mainRelease = mainReleases[0];
          const releaseWarning = this.getValue(mainRelease.ParentalWarningType);
          
          // If release is already explicit, no need to check resources
          if (Array.isArray(releaseWarning) ? releaseWarning.includes('Explicit') : releaseWarning === 'Explicit') {
            return true;
          }

          // Find if any primary resource is explicit
          const primaryResourceRefs = new Set();
          if (mainRelease.ResourceGroup?.ResourceGroupContentItem) {
            const items = Array.isArray(mainRelease.ResourceGroup.ResourceGroupContentItem) ? mainRelease.ResourceGroup.ResourceGroupContentItem : [mainRelease.ResourceGroup.ResourceGroupContentItem];
            items.forEach(item => primaryResourceRefs.add(this.getValue(item.ReleaseResourceReference)));
          }

          const hasExplicitResource = this.getResources(doc).some(res => {
            if (!primaryResourceRefs.has(this.getValue(res.ResourceReference))) return false;
            const data = res.SoundRecording || res.Video;
            const resourceWarning = this.getValue(data?.ParentalWarningType);
            return Array.isArray(resourceWarning) ? resourceWarning.includes('Explicit') : resourceWarning === 'Explicit';
          });
          
          // If there's an explicit resource, the release should also be explicit.
          return !hasExplicitResource;
        },
        message: 'If any primary resource is marked "Explicit", the main Release should also be marked "Explicit".',
        severity: 'warning'
      },
      {
        name: 'ERN43-Deal-Dates-Logical',
        test: (doc) => {
          const deals = this.getDeals(doc);
          const releasesById = new Map(this.getReleases(doc).map(r => [this.getValue(r.ReleaseReference), r]));

          return deals.every(releaseDeal => {
            const release = releasesById.get(this.getValue(releaseDeal.ReleaseReference));
            if (!release) return true;
            const releaseDate = this.getValue(release.ReleaseDate?.Date);
            if (!releaseDate) return true;

            if (!releaseDeal.Deal) return true;
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? releaseDeal.Deal : [releaseDeal.Deal];
            return nestedDeals.every(deal => {
              if (!deal.DealTerms) return true;
              const dtArray = Array.isArray(deal.DealTerms) ? deal.DealTerms : [deal.DealTerms];
              return dtArray.every(dt => {
                const vp = dt.ValidityPeriod;
                if (!vp) return true;
                const vpArray = Array.isArray(vp) ? vp : [vp];
                return vpArray.every(period => {
                  const startDate = this.getValue(period.StartDate);
                  return !startDate || startDate >= releaseDate;
                });
              });
            });
          });
        },
        message: 'A Deal\'s StartDate cannot be before the ReleaseDate of the release it applies to.',
        severity: 'error'
      }
    ];
  }

  /**
   * Get rules for best practices and common DSP requirements
   */
  getBestPracticeRules() {
    return [
      {
        name: 'ERN43-FrontCover-Image-Quality',
        test: (doc) => {
          const images = this.getResources(doc).filter(r => r.Image);
          const coverImages = images.filter(img => this.getValue(img.Image?.Type) === 'FrontCoverImage');
          if (coverImages.length === 0) return true;

          return coverImages.every(img => {
            if (!img.Image.TechnicalDetails) return true; // Can't check if no details
            const details = Array.isArray(img.Image.TechnicalDetails) ? img.Image.TechnicalDetails : [img.Image.TechnicalDetails];
            return details.some(td => {
              const width = parseInt(this.getValue(td.ImageWidth), 10);
              const height = parseInt(this.getValue(td.ImageHeight), 10);
              const aspectRatio = parseFloat(this.getValue(td.AspectRatio));
              
              // Check for square aspect ratio and minimum resolution (common DSP requirement)
              const isSquare = !aspectRatio || aspectRatio === 1.0;
              const isHighRes = !width || width >= 3000;
              
              return isSquare && isHighRes;
            });
          });
        },
        message: 'FrontCoverImage should be square and high-resolution (at least 3000x3000 pixels).',
        severity: 'warning'
      }
    ];
  }

  /**
   * Get rules for mapping profile to allowed values
   */
  getProfileMappingRules() {
    const profileToReleaseTypes = {
      // Based on Profiles Doc, Clause 7.5, Table
      'Audio': ['Album', 'Bundle', 'ClassicalAlbum', 'ClassicalDigitalBoxedSet', 'DigitalBoxSetRelease', 'Documentary', 'EBookRelease', 'EP', 'Episode', 'KaraokeRelease', 'MaxiSingle', 'MiniAlbum', 'Playlist', 'Season', 'Series', 'Single', 'StemBundle'],
      'Video': ['Album', 'Bundle', 'ClassicalAlbum', 'ClassicalDigitalBoxedSet', 'ConcertVideo', 'DigitalBoxSetRelease', 'Documentary', 'EP', 'Episode', 'LiveEventVideo', 'MaxiSingle', 'MiniAlbum', 'Playlist', 'Season', 'Series', 'Single', 'VideoAlbum', 'VideoSingle'],
      'MixedMedia': ['Album', 'Bundle', 'ClassicalAlbum', 'ClassicalDigitalBoxedSet', 'ClassicalMultimediaAlbum', 'DigitalBoxSetRelease', 'Documentary', 'EBookRelease', 'EP', 'Episode', 'KaraokeRelease', 'MaxiSingle', 'MiniAlbum', 'MultimediaAlbum', 'MultimediaDigitalBoxedSet', 'MultimediaSingle', 'Playlist', 'Season', 'Series', 'Single'],
      'SimpleAudioSingle': ['Playlist', 'Single', 'SingleResourceRelease'],
      'SimpleVideoSingle': ['Playlist', 'Single', 'SingleResourceRelease'],
      'Ringtone': ['AlertToneRelease', 'RingbackToneRelease', 'RingtoneRelease', 'VideoMastertoneRelease'],
      'LongFormMusicalWorkVideo': ['ConcertVideo', 'DigitalBoxSetRelease', 'Documentary', 'Episode', 'FeatureFilm', 'LongFormMusicalWorkVideoRelease', 'LongFormNonMusicalWorkVideoRelease', 'Playlist', 'Season', 'Series'],
      'DJMix': ['DjMix', 'Playlist']
    };

    return [
      {
        name: 'ERN43-Profile-ReleaseType-Mapping',
        test: (doc) => {
          const profileId = doc['@_ReleaseProfileVersionId'];
          if (!profileId || !profileToReleaseTypes[profileId]) return true; // Cannot test if no profile or profile not in map

          const allowedTypes = new Set(profileToReleaseTypes[profileId]);
          const mainReleases = this.getMainReleases(doc);

          return mainReleases.every(release => {
            if (!release.ReleaseType) return true; // Optional element
            const types = Array.isArray(release.ReleaseType) ? release.ReleaseType : [release.ReleaseType];
            return types.every(type => {
              const typeValue = this.getValue(type);
              return typeValue === 'UserDefined' || allowedTypes.has(typeValue);
            });
          });
        },
        message: 'The ReleaseType is not recommended for the specified ReleaseProfileVersionId.',
        severity: 'warning'
      }
    ];
  }
  
  /**
   * Get territory code validation rules
   */
  getTerritoryRules() {
    // This list can be externalized for easier updates
    const validCodes = ['Worldwide', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ES-CE', 'ES-CN', 'ES-ML', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'];
    
    return [
      {
        name: 'ERN43-TerritoryCode-Valid',
        test: (doc) => {
          const territoryCodes = [];
          const deals = this.getDeals(doc);
          deals.forEach(releaseDeal => {
            if (!releaseDeal.Deal) return;
            const nestedDeals = Array.isArray(releaseDeal.Deal) ? releaseDeal.Deal : [releaseDeal.Deal];
            nestedDeals.forEach(deal => {
              if (!deal.DealTerms) return;
              const dtArray = Array.isArray(deal.DealTerms) ? deal.DealTerms : [deal.DealTerms];
              dtArray.forEach(dt => {
                if (dt.TerritoryCode) territoryCodes.push(...(Array.isArray(dt.TerritoryCode) ? dt.TerritoryCode : [dt.TerritoryCode]));
                if (dt.ExcludedTerritoryCode) territoryCodes.push(...(Array.isArray(dt.ExcludedTerritoryCode) ? dt.ExcludedTerritoryCode : [dt.ExcludedTerritoryCode]));
              });
            });
          });
          return territoryCodes.every(code => validCodes.includes(this.getValue(code)));
        },
        message: 'Invalid territory code. Must be an ISO 3166-1 alpha-2 code or "Worldwide".',
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
        name: 'ERN43-ResourceGroup-Required-For-Sequencing',
        test: (doc) => {
          const mainReleases = this.getMainReleases(doc);
          // Only flag if there are multiple primary resources that need sequencing
          return mainReleases.every(release => {
            const resourceItems = release.ResourceGroup?.ResourceGroupContentItem;
            const resourceCount = !resourceItems ? 0 : (Array.isArray(resourceItems) ? resourceItems.length : 1);
            return resourceCount <= 1 || !!release.ResourceGroup;
          });
        },
        message: 'Main Release with multiple tracks should have a ResourceGroup to define resource sequencing.',
        severity: 'warning'
      },
      {
        name: 'ERN43-ResourceGroup-Sequencing-Monotonic',
        test: (doc) => {
          const releases = this.getReleases(doc);
          return releases.every(release => {
            if (!release.ResourceGroup?.ResourceGroupContentItem) return true;
            
            const items = Array.isArray(release.ResourceGroup.ResourceGroupContentItem)
                ? release.ResourceGroup.ResourceGroupContentItem
                : [release.ResourceGroup.ResourceGroupContentItem];

            const sequenceNumbers = items.map(item => parseInt(item['@_SequenceNumber'], 10)).filter(n => !isNaN(n));
            if (sequenceNumbers.length <= 1) return true;

            // Check for duplicates
            if (new Set(sequenceNumbers).size !== sequenceNumbers.length) return false;
            
            // Check for monotonic increase
            for (let i = 1; i < sequenceNumbers.length; i++) {
              if (sequenceNumbers[i] < sequenceNumbers[i-1]) return false;
            }
            return true;
          });
        },
        message: 'SequenceNumbers within a ResourceGroup must be unique and increase monotonically.',
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
      ...this.getResourceGroupRules(),
      ...this.getConsistencyRules(),
      ...this.getBestPracticeRules(),
      ...this.getProfileMappingRules(),
    ];
  }

  /**
   * Get profile-specific rules for ERN 4.3
   */
  getProfileRules(profile) {
    // This section is now better covered by getProfileMappingRules and spec-based consistency rules.
    // However, it can still be used for fine-grained profile checks not covered elsewhere.
    const profileRules = {
      'SimpleAudioSingle': [
        {
          // Based on Profiles Doc, Clause 8.1
          name: 'SimpleAudioSingle-ResourceGroup-Structure',
          test: (doc) => {
            if (doc['@_ReleaseProfileVersionId'] !== 'SimpleAudioSingle') return true;
            const mainRelease = this.getMainReleases(doc)[0];
            if (!mainRelease?.ResourceGroup) return false;
            const hasOneRg = !Array.isArray(mainRelease.ResourceGroup);
            const items = mainRelease.ResourceGroup.ResourceGroupContentItem;
            const hasOneItem = items && !Array.isArray(items);
            return hasOneRg && hasOneItem;
          },
          message: 'A SimpleAudioSingle release must contain exactly one ResourceGroup with exactly one ResourceGroupContentItem.',
          severity: 'error'
        }
      ]
    };
    return profileRules[profile] || [];
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  getValue(node) {
    if (node === null || node === undefined) return null;
    if (typeof node !== 'object') return node;
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
      const releaseArray = Array.isArray(doc.ReleaseList.Release) ? doc.ReleaseList.Release : [doc.ReleaseList.Release];
      releases.push(...releaseArray.filter(Boolean).map(r => ({ ...r, '@_IsMainRelease': this.getValue(r.IsMainRelease) === 'true' })));
    }
    if (doc.ReleaseList.TrackRelease) {
      const trackReleaseArray = Array.isArray(doc.ReleaseList.TrackRelease) ? doc.ReleaseList.TrackRelease : [doc.ReleaseList.TrackRelease];
      trackReleaseArray.forEach(tr => { if (tr) { tr._isTrackRelease = true; releases.push(tr); } });
    }
    return releases;
  }

  getMainReleases(doc) {
    return this.getReleases(doc).filter(r => r['@_IsMainRelease'] === true);
  }

  getResources(doc) {
    if (!doc.ResourceList) return [];
    const resources = [];
    ['SoundRecording', 'Video', 'Image', 'Text'].forEach(type => {
      if (doc.ResourceList[type]) {
        const items = Array.isArray(doc.ResourceList[type]) ? doc.ResourceList[type] : [doc.ResourceList[type]];
        items.forEach(item => {
          if (!item) return;
          const resource = { [type]: item, ResourceReference: item.ResourceReference };
          Object.keys(item).filter(key => key.startsWith('@')).forEach(key => { resource[key] = item[key]; });
          resources.push(resource);
        });
      }
    });
    return resources;
  }

  getDeals(doc) {
    if (!doc.DealList || !doc.DealList.ReleaseDeal) return [];
    return Array.isArray(doc.DealList.ReleaseDeal) ? doc.DealList.ReleaseDeal : [doc.DealList.ReleaseDeal].filter(Boolean);
  }

  getParties(doc) {
    if (!doc.PartyList || !doc.PartyList.Party) return [];
    return Array.isArray(doc.PartyList.Party) ? doc.PartyList.Party : [doc.PartyList.Party].filter(Boolean);
  }
}

module.exports = ERN43Rules;