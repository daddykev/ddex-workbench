// services/ernBuilder.js
// Builds ERN 4.3 NewReleaseMessage XML for the Sandbox.
// Element order follows functions/schemas/ern/4.3/release-notification.xsd.

// AvsVersionId of the allowed-value-sets file the 4.3 schema imports
// (functions/schemas/ern/4.3/allowed-value-sets.xsd, <xs:documentation source="AvsVersionId">)
const AVS_VERSION_ID = '9'

// Placeholder DDEX Party IDs for the sandbox's test sender and recipient.
// MessageSender/MessageRecipient require a PartyId (pattern PADPIDA[a-zA-Z0-9]+).
const SANDBOX_SENDER_DPID = 'PADPIDA0000000000S'
const SANDBOX_RECIPIENT_DPID = 'PADPIDA0000000000R'

// Placeholder used when the form leaves a schema-required value empty
const DEFAULT_PARENTAL_WARNING = 'NoAdviceAvailable'
const DEFAULT_GENRE = 'Unspecified'

// Names used when the form leaves the sender or recipient name empty
const SANDBOX_SENDER_NAME = 'DDEX Workbench Sandbox'
const SANDBOX_RECIPIENT_NAME = 'Test Recipient'

// Sandbox form values mapped to ERN 4.3 allowed values
const CONTRIBUTOR_ROLES = { Producer: 'StudioProducer' }
const VIDEO_TYPES = { MusicalWorkVideoRecording: 'ShortFormMusicalWorkVideo', Video: 'ShortFormNonMusicalWorkVideo' }
const VIDEO_CODECS = { H264: 'AVC', H265: 'HEVC' }
const RELEASE_TYPES = { Video: 'VideoSingle' }

export class ERNBuilder {
  constructor() {
    this.version = '4.3'
    this.namespace = 'http://ddex.net/xml/ern/43'
  }

  buildERN(product, resources, options = {}) {
    const messageId = this.generateMessageId()
    const createdDate = new Date().toISOString()

    const config = {
      messageControlType: options.messageControlType || 'TestMessage',
      ...options
    }
    const header = this.resolveMessageParties(product, config)

    // Every artist, label and contributor named in the form becomes a Party
    const parties = this.collectParties(product, resources)

    return `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="${this.namespace}"
  AvsVersionId="${AVS_VERSION_ID}"
  LanguageAndScriptCode="en">

  <MessageHeader>
    <MessageId>${messageId}</MessageId>
    <MessageSender>
      <PartyId>${this.escapeXml(header.senderDPID)}</PartyId>
      <PartyName>
        <FullName>${this.escapeXml(header.senderName)}</FullName>
      </PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyId>${this.escapeXml(header.recipientDPID)}</PartyId>
      <PartyName>
        <FullName>${this.escapeXml(header.recipientName)}</FullName>
      </PartyName>
    </MessageRecipient>
    <MessageCreatedDateTime>${createdDate}</MessageCreatedDateTime>
    <MessageControlType>${config.messageControlType}</MessageControlType>
  </MessageHeader>

  ${this.buildPartyList(parties)}
  ${this.buildResourceList(resources, parties, header.senderDPID)}
  ${this.buildReleaseList(product, resources, parties, header.senderDPID)}
  ${this.buildDealList(product)}

</ern:NewReleaseMessage>`
  }

  /**
   * MessageSender/MessageRecipient values: the form's values, else the
   * builder options, else the sandbox placeholders
   */
  resolveMessageParties(product = {}, options = {}) {
    const value = (v) => (typeof v === 'string' ? v.trim() : '')
    return {
      senderDPID: value(product.senderDPID) || SANDBOX_SENDER_DPID,
      senderName: value(product.senderName) || options.messageSender || SANDBOX_SENDER_NAME,
      recipientDPID: value(product.recipientDPID) || SANDBOX_RECIPIENT_DPID,
      recipientName: value(product.recipientName) || options.messageRecipient || SANDBOX_RECIPIENT_NAME
    }
  }

  resolveGenre(product = {}, resources = []) {
    return product.genre || resources.find(r => r.genre)?.genre || DEFAULT_GENRE
  }

  /**
   * Placeholder values buildERN() would write for this form, in display order
   */
  getPlaceholders(product = {}, resources = [], options = {}) {
    const h = this.resolveMessageParties(product, options)
    const used = []
    if (h.senderDPID === SANDBOX_SENDER_DPID) {
      // The sender DPID is also the namespace for catalog numbers and AV1 codec values
      const usedIn = ['MessageSender']
      if (product.catalogNumber) usedIn.push('CatalogNumber')
      if (resources.some(r => this.isVideo(r) && r.codecType === 'AV1')) usedIn.push('VideoCodecType')
      used.push({ field: 'senderDPID', value: SANDBOX_SENDER_DPID, usedIn })
    }
    if (h.recipientDPID === SANDBOX_RECIPIENT_DPID) used.push({ field: 'recipientDPID', value: SANDBOX_RECIPIENT_DPID, usedIn: ['MessageRecipient'] })
    if (h.senderName === SANDBOX_SENDER_NAME) used.push({ field: 'senderName', value: SANDBOX_SENDER_NAME })
    if (h.recipientName === SANDBOX_RECIPIENT_NAME) used.push({ field: 'recipientName', value: SANDBOX_RECIPIENT_NAME })
    // Only when the builder filled it in, not when someone typed "Unspecified"
    if (!product.genre && !resources.some(r => r.genre)) used.push({ field: 'genre', value: DEFAULT_GENRE })
    return used
  }

  /**
   * Map each distinct name to a PartyReference (P1, P2, ...)
   */
  collectParties(product, resources) {
    const parties = new Map()
    const add = (name) => {
      const key = (name || '').trim()
      if (key && !parties.has(key)) {
        parties.set(key, `P${parties.size + 1}`)
      }
    }

    add(product.artist)
    add(product.label)
    resources.forEach(resource => {
      add(resource.artist)
      ;(resource.contributors || []).forEach(contrib => add(contrib.name))
    })

    // A Release needs at least one artist and one label reference
    if (!parties.size) add('Unknown')
    return parties
  }

  partyRef(parties, name) {
    const key = (name || '').trim()
    return parties.get(key) || parties.values().next().value
  }

  buildPartyList(parties) {
    const items = [...parties.entries()].map(([name, ref]) => `<Party>
      <PartyReference>${ref}</PartyReference>
      <PartyName>
        <FullName>${this.escapeXml(name)}</FullName>
      </PartyName>
    </Party>`)

    return `<PartyList>
    ${items.join('\n    ')}
  </PartyList>`
  }

  buildResourceList(resources, parties, senderDPID = SANDBOX_SENDER_DPID) {
    return `<ResourceList>
    ${resources.map(resource => this.buildResource(resource, parties, senderDPID)).join('\n    ')}
  </ResourceList>`
  }

  isVideo(resource) {
    return resource.type === 'MusicalWorkVideoRecording' || resource.type === 'Video'
  }

  buildResource(resource, parties, senderDPID = SANDBOX_SENDER_DPID) {
    if (this.isVideo(resource)) {
      return this.buildVideo(resource, parties, senderDPID)
    }
    return this.buildSoundRecording(resource, parties)
  }

  formatPLineText(pLineText, pLineYear, fallbackLabel) {
    // Remove any (P) symbols if present
    let text = (pLineText || '').replace(/^\(P\)\s*/i, '').trim()
    const year = pLineYear || new Date().getFullYear()

    // If no text or just whitespace, create default
    if (!text) {
      text = `${year} ${fallbackLabel || 'Unknown'}`
    } else if (!text.startsWith(year.toString())) {
      // Ensure year is at the start
      text = `${year} ${text}`
    }

    return text
  }

  formatCLineText(cLineText, cLineYear, fallbackLabel) {
    // Remove any (C) or © symbols if present
    let text = (cLineText || '').replace(/^[\(©C\)]+\s*/i, '').trim()
    const year = cLineYear || new Date().getFullYear()

    // If no text or just whitespace, create default
    if (!text) {
      text = `${year} ${fallbackLabel || 'Unknown'}`
    } else if (!text.startsWith(year.toString())) {
      // Ensure year is at the start
      text = `${year} ${text}`
    }

    return text
  }

  // Elements shared by SoundRecording and Video, from DisplayTitleText to Contributor
  buildResourceTitlesAndArtists(resource, parties) {
    const named = (resource.contributors || []).filter(contrib => contrib.name)

    // Featured artists are display artists in ERN 4.3, not contributors
    const featured = named
      .filter(contrib => contrib.role === 'FeaturedArtist')
      .map((contrib, index) => `<DisplayArtist SequenceNumber="${index + 2}">
        <ArtistPartyReference>${this.partyRef(parties, contrib.name)}</ArtistPartyReference>
        <DisplayArtistRole>FeaturedArtist</DisplayArtistRole>
      </DisplayArtist>`)

    const contributors = named
      .filter(contrib => contrib.role !== 'FeaturedArtist')
      .map((contrib, index) => `<Contributor SequenceNumber="${index + 1}">
        <ContributorPartyReference>${this.partyRef(parties, contrib.name)}</ContributorPartyReference>
        <Role>${CONTRIBUTOR_ROLES[contrib.role] || contrib.role}</Role>
      </Contributor>`)

    return `<DisplayTitleText>${this.escapeXml(resource.title)}</DisplayTitleText>
      <DisplayTitle>
        <TitleText>${this.escapeXml(resource.title)}</TitleText>
      </DisplayTitle>
      <DisplayArtistName>${this.escapeXml(resource.artist)}</DisplayArtistName>
      <DisplayArtist SequenceNumber="1">
        <ArtistPartyReference>${this.partyRef(parties, resource.artist)}</ArtistPartyReference>
        <DisplayArtistRole>MainArtist</DisplayArtistRole>
      </DisplayArtist>${[...featured, ...contributors].map(el => `
      ${el}`).join('')}`
  }

  buildPreviewClip(resource, deliveryFileType) {
    if (!resource.previewDetails) return ''
    const start = resource.previewDetails.startPoint || 0
    const end = resource.previewDetails.endPoint || 60

    return `
          <ClipDetails>
            <TechnicalResourceDetailsReference>T${resource.resourceReference}-Preview</TechnicalResourceDetailsReference>
            <ClipType>Preview</ClipType>
            <Timing>
              <StartPoint>${start}</StartPoint>
              <EndPoint>${end}</EndPoint>
            </Timing>
            <ExpressionType>Informative</ExpressionType>
          </ClipDetails>`
  }

  buildSoundRecording(resource, parties) {
    const pLineYear = resource.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(resource.pLineText, pLineYear, resource.label || resource.artist)

    return `<SoundRecording>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <Type>MusicalWorkSoundRecording</Type>
      <SoundRecordingEdition>
        <ResourceId>
          <ISRC>${resource.isrc}</ISRC>
        </ResourceId>
        <PLine>
          <Year>${pLineYear}</Year>
          <PLineText>${this.escapeXml(pLineText)}</PLineText>
        </PLine>
        <TechnicalDetails>
          <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
          <DeliveryFile>
            <Type>AudioFile</Type>
            <AudioCodecType>${resource.codecType || 'PCM'}</AudioCodecType>
            <BitRate>${resource.bitRate || '1411'}</BitRate>
            <NumberOfChannels>${resource.channels || '2'}</NumberOfChannels>
            <SamplingRate>${resource.samplingRate || '44100'}</SamplingRate>
            <BitsPerSample>${resource.bitsPerSample || '16'}</BitsPerSample>
            <File>
              <URI>${this.escapeXml(resource.fileUri)}</URI>${resource.fileHash ? `
              <HashSum>
                <Algorithm>MD5</Algorithm>
                <HashSumValue>${resource.fileHash}</HashSumValue>
              </HashSum>` : ''}
            </File>
          </DeliveryFile>${this.buildPreviewClip(resource)}
        </TechnicalDetails>
      </SoundRecordingEdition>
      ${this.buildResourceTitlesAndArtists(resource, parties)}
      <Duration>${resource.duration}</Duration>${resource.creationDate ? `
      <CreationDate>${resource.creationDate}</CreationDate>` : ''}
      <ParentalWarningType>${resource.parentalWarning || DEFAULT_PARENTAL_WARNING}</ParentalWarningType>${resource.languageOfPerformance ? `
      <LanguageOfPerformance>${resource.languageOfPerformance}</LanguageOfPerformance>` : ''}
    </SoundRecording>`
  }

  buildVideo(resource, parties, senderDPID = SANDBOX_SENDER_DPID) {
    const pLineYear = resource.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(resource.pLineText, pLineYear, resource.label || resource.artist)

    return `<Video>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <Type>${VIDEO_TYPES[resource.type] || 'ShortFormMusicalWorkVideo'}</Type>
      <VideoEdition>
        <ResourceId>
          <ISRC>${resource.isrc}</ISRC>
        </ResourceId>
        <PLine>
          <Year>${pLineYear}</Year>
          <PLineText>${this.escapeXml(pLineText)}</PLineText>
        </PLine>
        <TechnicalDetails>
          <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
          <DeliveryFile>
            <Type>AudioVisualFile</Type>
            ${this.buildVideoCodec(resource.codecType || 'H264', senderDPID)}
            <VideoBitRate>${resource.bitRate || '5000'}</VideoBitRate>
            <AspectRatio AspectRatioType="DAR">${this.aspectRatioToDecimal(resource.aspectRatio || '16:9')}</AspectRatio>
            <File>
              <URI>${this.escapeXml(resource.fileUri)}</URI>
            </File>
          </DeliveryFile>
        </TechnicalDetails>
      </VideoEdition>
      ${this.buildResourceTitlesAndArtists(resource, parties)}
      <Duration>${resource.duration}</Duration>${resource.creationDate ? `
      <CreationDate>${resource.creationDate}</CreationDate>` : ''}
      <ParentalWarningType>${resource.parentalWarning || DEFAULT_PARENTAL_WARNING}</ParentalWarningType>
      <ReasonForCueSheetAbsence>Not provided by the ERN Sandbox</ReasonForCueSheetAbsence>${resource.languageOfPerformance ? `
      <LanguageOfPerformance>${resource.languageOfPerformance}</LanguageOfPerformance>` : ''}
    </Video>`
  }

  buildVideoCodec(codec, senderDPID = SANDBOX_SENDER_DPID) {
    // AV1 has no ERN 4.3 code, so it's sent as a user-defined value in the sender's namespace
    if (codec === 'AV1') {
      return `<VideoCodecType Namespace="DPID:${this.escapeXml(senderDPID)}" UserDefinedValue="AV1">UserDefined</VideoCodecType>`
    }
    return `<VideoCodecType>${VIDEO_CODECS[codec] || codec}</VideoCodecType>`
  }

  // "16:9" -> 1.78 (ERN 4.3 AspectRatio is a decimal)
  aspectRatioToDecimal(ratio) {
    const [w, h] = String(ratio).split(':').map(Number)
    if (!w || !h) return ratio
    return (w / h).toFixed(2)
  }

  buildReleaseList(product, resources, parties, senderDPID = SANDBOX_SENDER_DPID) {
    const releaseDate = product.releaseDate || new Date().toISOString().split('T')[0]

    const pLineYear = product.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(product.pLineText, pLineYear, product.label)

    const cLineYear = product.cLineYear || new Date().getFullYear()
    const cLineText = this.formatCLineText(product.cLineText, cLineYear, product.label)

    const genre = this.resolveGenre(product, resources)

    const contentItems = (product.tracks || []).map((track, index) => `<ResourceGroupContentItem>
          <SequenceNumber>${index + 1}</SequenceNumber>
          <ReleaseResourceReference>${track.resourceReference}</ReleaseResourceReference>
        </ResourceGroupContentItem>`)

    return `<ReleaseList>
    <Release>
      <ReleaseReference>${product.releaseReference}</ReleaseReference>
      <ReleaseType>${RELEASE_TYPES[product.releaseType] || product.releaseType}</ReleaseType>
      <ReleaseId>
        <ICPN>${product.upc}</ICPN>${product.catalogNumber ? `
        <CatalogNumber Namespace="DPID:${this.escapeXml(senderDPID)}">${this.escapeXml(product.catalogNumber)}</CatalogNumber>` : ''}
      </ReleaseId>
      <DisplayTitleText>${this.escapeXml(product.title)}</DisplayTitleText>
      <DisplayTitle>
        <TitleText>${this.escapeXml(product.title)}</TitleText>
      </DisplayTitle>
      <DisplayArtistName>${this.escapeXml(product.artist)}</DisplayArtistName>
      <DisplayArtist SequenceNumber="1">
        <ArtistPartyReference>${this.partyRef(parties, product.artist)}</ArtistPartyReference>
        <DisplayArtistRole>MainArtist</DisplayArtistRole>
      </DisplayArtist>
      <ReleaseLabelReference>${this.partyRef(parties, product.label)}</ReleaseLabelReference>
      <PLine>
        <Year>${pLineYear}</Year>
        <PLineText>${this.escapeXml(pLineText)}</PLineText>
      </PLine>
      <CLine>
        <Year>${cLineYear}</Year>
        <CLineText>${this.escapeXml(cLineText)}</CLineText>
      </CLine>
      <Genre>
        <GenreText>${this.escapeXml(genre)}</GenreText>
      </Genre>
      <ReleaseDate>${releaseDate}</ReleaseDate>${product.originalReleaseDate ? `
      <OriginalReleaseDate>${product.originalReleaseDate}</OriginalReleaseDate>` : ''}
      <ParentalWarningType>${product.parentalWarning || DEFAULT_PARENTAL_WARNING}</ParentalWarningType>
      <ResourceGroup>
        ${contentItems.join('\n        ')}
      </ResourceGroup>
    </Release>
  </ReleaseList>`
  }

  buildDealList(product) {
    const startDate = product.dealStartDate || new Date().toISOString().split('T')[0]
    const commercialModels = product.commercialModels || [{
      type: 'PayAsYouGoModel',
      usageTypes: ['PermanentDownload']
    }]

    // One Deal per commercial model
    const deals = commercialModels.map((model, index) => `<Deal>
        <DealReference>${product.releaseReference}_DEAL_${index + 1}</DealReference>
        <DealTerms>
          <TerritoryCode>${product.territoryCode || 'Worldwide'}</TerritoryCode>
          <ValidityPeriod>
            <StartDate>${startDate}</StartDate>${product.dealEndDate ? `
            <EndDate>${product.dealEndDate}</EndDate>` : ''}
          </ValidityPeriod>
          <CommercialModelType>${model.type}</CommercialModelType>
          ${(model.usageTypes || []).map(useType => `<UseType>${useType}</UseType>`).join('\n          ')}${model.price && model.type === 'PayAsYouGoModel' ? `
          <PriceInformation>
            <WholesalePricePerUnit CurrencyCode="${model.currency || 'USD'}">${model.price}</WholesalePricePerUnit>
          </PriceInformation>` : ''}
        </DealTerms>
      </Deal>`)

    return `<DealList>
    <ReleaseDeal>
      <DealReleaseReference>${product.releaseReference}</DealReleaseReference>
      ${deals.join('\n      ')}
    </ReleaseDeal>
  </DealList>`
  }

  generateMessageId() {
    return `MSG_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  escapeXml(text) {
    if (!text) return ''
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

export default new ERNBuilder()
