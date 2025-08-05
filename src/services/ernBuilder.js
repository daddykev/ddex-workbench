// services/ernBuilder.js
export class ERNBuilder {
  constructor() {
    this.version = '4.3'
    this.namespace = 'http://ddex.net/xml/ern/43'
  }

  buildERN(product, resources, options = {}) {
    const messageId = this.generateMessageId()
    const createdDate = new Date().toISOString()
    
    // Default options
    const config = {
      messageControlType: options.messageControlType || 'TestMessage',
      messageSender: options.messageSender || 'DDEX Workbench Sandbox',
      messageRecipient: options.messageRecipient || 'Test Recipient',
      ...options
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="${this.namespace}" 
  xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
  MessageSchemaVersionId="ern/43"
  LanguageAndScriptCode="en">
  
  <MessageHeader>
    <MessageId>${messageId}</MessageId>
    <MessageCreatedDateTime>${createdDate}</MessageCreatedDateTime>
    <MessageControlType>${config.messageControlType}</MessageControlType>
    <MessageSender>
      <PartyName>
        <FullName>${this.escapeXml(config.messageSender)}</FullName>
      </PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyName>
        <FullName>${this.escapeXml(config.messageRecipient)}</FullName>
      </PartyName>
    </MessageRecipient>
  </MessageHeader>
  
  ${this.buildResourceList(resources)}
  ${this.buildReleaseList(product, resources)}
  ${this.buildDealList(product)}
  
</ern:NewReleaseMessage>`
  }

  buildResourceList(resources) {
    return `<ResourceList>
    ${resources.map(resource => this.buildResource(resource)).join('\n    ')}
  </ResourceList>`
  }

  buildResource(resource) {
    if (resource.type === 'MusicalWorkSoundRecording') {
      return this.buildSoundRecording(resource)
    } else if (resource.type === 'MusicalWorkVideoRecording' || resource.type === 'Video') {
      return this.buildVideo(resource)
    }
    return this.buildSoundRecording(resource)
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

  buildSoundRecording(resource) {
    const pLineYear = resource.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(resource.pLineText, pLineYear, resource.label || resource.artist)
    
    return `<SoundRecording>
      <SoundRecordingType>MusicalWorkSoundRecording</SoundRecordingType>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <ResourceId>
        <ISRC>${resource.isrc}</ISRC>
      </ResourceId>
      <ReferenceTitle>
        <TitleText>${this.escapeXml(resource.title)}</TitleText>
      </ReferenceTitle>
      <DisplayTitleText>${this.escapeXml(resource.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(resource.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <Duration>${resource.duration}</Duration>
      ${resource.genre ? `<Genre>
        <GenreText>${this.escapeXml(resource.genre)}</GenreText>
      </Genre>` : ''}
      ${resource.parentalWarning ? `<ParentalWarningType>${resource.parentalWarning}</ParentalWarningType>` : ''}
      ${resource.languageOfPerformance ? `<LanguageOfPerformance>${resource.languageOfPerformance}</LanguageOfPerformance>` : ''}
      ${resource.creationDate ? `<CreationDate>${resource.creationDate}</CreationDate>` : ''}
      <IsArtistRelated>true</IsArtistRelated>
      <PLine>
        <Year>${pLineYear}</Year>
        <PLineText>${this.escapeXml(pLineText)}</PLineText>
      </PLine>
      ${resource.contributors && resource.contributors.length > 0 ? 
        resource.contributors
          .filter(contrib => contrib.name)
          .map(contrib => `<ResourceContributor>
        <PartyName>
          <FullName>${this.escapeXml(contrib.name)}</FullName>
        </PartyName>
        <ResourceContributorRole>${contrib.role}</ResourceContributorRole>
      </ResourceContributor>`).join('\n      ') : ''}
      <TechnicalDetails>
        <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
        <AudioCodecType>${resource.codecType || 'PCM'}</AudioCodecType>
        <BitRate>${resource.bitRate || '1411'}</BitRate>
        <SamplingRate>${resource.samplingRate || '44100'}</SamplingRate>
        <BitsPerSample>${resource.bitsPerSample || '16'}</BitsPerSample>
        <NumberOfChannels>${resource.channels || '2'}</NumberOfChannels>
        <File>
          <URI>${resource.fileUri}</URI>
          ${resource.fileHash ? `<HashSum>
            <HashSum>${resource.fileHash}</HashSum>
            <HashSumAlgorithmType>MD5</HashSumAlgorithmType>
          </HashSum>` : ''}
        </File>
        ${resource.previewDetails ? `<PreviewDetails>
          <StartPoint>${resource.previewDetails.startPoint || '30'}</StartPoint>
          <EndPoint>${resource.previewDetails.endPoint || '60'}</EndPoint>
          <Duration>PT${(resource.previewDetails.endPoint || 60) - (resource.previewDetails.startPoint || 30)}S</Duration>
          <TopLeftCorner>0</TopLeftCorner>
          <BottomRightCorner>0</BottomRightCorner>
          <ExpressionType>Full</ExpressionType>
        </PreviewDetails>` : ''}
      </TechnicalDetails>
    </SoundRecording>`
  }

  buildVideo(resource) {
    const pLineYear = resource.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(resource.pLineText, pLineYear, resource.label || resource.artist)
    
    return `<Video>
      <VideoType>${resource.type}</VideoType>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <ResourceId>
        <ISRC>${resource.isrc}</ISRC>
      </ResourceId>
      <ReferenceTitle>
        <TitleText>${this.escapeXml(resource.title)}</TitleText>
      </ReferenceTitle>
      <DisplayTitleText>${this.escapeXml(resource.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(resource.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <Duration>${resource.duration}</Duration>
      ${resource.genre ? `<Genre>
        <GenreText>${this.escapeXml(resource.genre)}</GenreText>
      </Genre>` : ''}
      ${resource.parentalWarning ? `<ParentalWarningType>${resource.parentalWarning}</ParentalWarningType>` : ''}
      <IsArtistRelated>true</IsArtistRelated>
      <PLine>
        <Year>${pLineYear}</Year>
        <PLineText>${this.escapeXml(pLineText)}</PLineText>
      </PLine>
      ${resource.contributors && resource.contributors.length > 0 ? 
        resource.contributors
          .filter(contrib => contrib.name)
          .map(contrib => `<ResourceContributor>
        <PartyName>
          <FullName>${this.escapeXml(contrib.name)}</FullName>
        </PartyName>
        <ResourceContributorRole>${contrib.role}</ResourceContributorRole>
      </ResourceContributor>`).join('\n      ') : ''}
      <TechnicalDetails>
        <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
        <VideoCodecType>${resource.codecType || 'H264'}</VideoCodecType>
        <AspectRatio>${resource.aspectRatio || '16:9'}</AspectRatio>
        <BitRate>${resource.bitRate || '5000'}</BitRate>
        <File>
          <URI>${resource.fileUri}</URI>
        </File>
      </TechnicalDetails>
    </Video>`
  }

  buildReleaseList(product, resources) {
    const releaseDate = product.releaseDate || new Date().toISOString().split('T')[0]
    
    const pLineYear = product.pLineYear || new Date().getFullYear()
    const pLineText = this.formatPLineText(product.pLineText, pLineYear, product.label)
    
    const cLineYear = product.cLineYear || new Date().getFullYear()
    const cLineText = this.formatCLineText(product.cLineText, cLineYear, product.label)
    
    return `<ReleaseList>
    <Release>
      <ReleaseReference>${product.releaseReference}</ReleaseReference>
      <ReleaseType>${product.releaseType}</ReleaseType>
      <ReleaseId>
        <ICPN isEan="true">${product.upc}</ICPN>
        ${product.catalogNumber ? `<CatalogNumber Namespace="DPID:${product.labelDPID || 'PADPIDA2023081501R'}">${product.catalogNumber}</CatalogNumber>` : ''}
      </ReleaseId>
      <ReferenceTitle>
        <TitleText>${this.escapeXml(product.title)}</TitleText>
      </ReferenceTitle>
      <DisplayTitleText>${this.escapeXml(product.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(product.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <LabelName>${this.escapeXml(product.label)}</LabelName>
      ${product.genre ? `<Genre>
        <GenreText>${this.escapeXml(product.genre)}</GenreText>
      </Genre>` : ''}
      ${product.parentalWarning ? `<ParentalWarningType>${product.parentalWarning}</ParentalWarningType>` : ''}
      <PLine>
        <Year>${pLineYear}</Year>
        <PLineText>${this.escapeXml(pLineText)}</PLineText>
      </PLine>
      <CLine>
        <Year>${cLineYear}</Year>
        <CLineText>${this.escapeXml(cLineText)}</CLineText>
      </CLine>
      <ReleaseDate>${releaseDate}</ReleaseDate>
      ${product.originalReleaseDate ? `<OriginalReleaseDate>${product.originalReleaseDate}</OriginalReleaseDate>` : ''}
      <ReleaseResourceReferenceList>
        ${product.tracks.map((track, index) => 
          `<ReleaseResourceReference ReleaseResourceType="${index === 0 ? 'PrimaryResource' : 'SecondaryResource'}">${track.resourceReference}</ReleaseResourceReference>`
        ).join('\n        ')}
      </ReleaseResourceReferenceList>
    </Release>
  </ReleaseList>`
  }

  buildDealList(product) {
    const startDate = product.dealStartDate || new Date().toISOString().split('T')[0]
    const usageTypes = product.usageTypes || ['OnDemandStream']
    
    return `<DealList>
    <ReleaseDeal>
      <DealReleaseReference>${product.releaseReference}</DealReleaseReference>
      <Deal>
        <DealTerms>
          <Territory>
            <TerritoryCode>${product.territoryCode}</TerritoryCode>
          </Territory>
          <ValidityPeriod>
            <StartDate>${startDate}</StartDate>
            ${product.dealEndDate ? `<EndDate>${product.dealEndDate}</EndDate>` : ''}
          </ValidityPeriod>
          <CommercialModelType>${product.commercialModel || 'PayAsYouGoModel'}</CommercialModelType>
          ${usageTypes.map(useType => `<Usage>
            <UseType>${useType}</UseType>
          </Usage>`).join('\n          ')}
          ${product.priceInformation ? `<PriceInformation>
            <PriceType>${product.priceInformation.priceType || 'WholesalePricePerUnit'}</PriceType>
            ${product.priceInformation.price ? `<Price>
              <Amount CurrencyCode="${product.priceInformation.currency || 'USD'}">${product.priceInformation.price}</Amount>
            </Price>` : ''}
          </PriceInformation>` : ''}
        </DealTerms>
      </Deal>
    </ReleaseDeal>
  </DealList>`
  }

  generateMessageId() {
    return `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  escapeXml(text) {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

export default new ERNBuilder()