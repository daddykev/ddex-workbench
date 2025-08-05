// services/ernBuilder.js
export class ERNBuilder {
  constructor() {
    this.version = '4.3'
    this.namespace = 'http://ddex.net/xml/ern/43'
  }

  buildERN(product, resources) {
    const messageId = this.generateMessageId()
    const createdDate = new Date().toISOString()
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="${this.namespace}" 
  xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
  MessageSchemaVersionId="ern/43"
  LanguageAndScriptCode="en">
  
  <MessageHeader>
    <MessageId>${messageId}</MessageId>
    <MessageCreatedDateTime>${createdDate}</MessageCreatedDateTime>
    <MessageSender>
      <PartyName>
        <FullName>DDEX Workbench Sandbox</FullName>
      </PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyName>
        <FullName>Test Recipient</FullName>
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
    // Default to sound recording
    return this.buildSoundRecording(resource)
  }

  buildSoundRecording(resource) {
    return `<SoundRecording>
      <SoundRecordingType>MusicalWorkSoundRecording</SoundRecordingType>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <ResourceId>
        <ISRC>${resource.isrc}</ISRC>
      </ResourceId>
      <DisplayTitleText>${this.escapeXml(resource.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(resource.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <Duration>${resource.duration}</Duration>
      <PLine>
        <Year>${resource.pLineYear}</Year>
        <PLineText>${this.escapeXml(resource.pLineText)}</PLineText>
      </PLine>
      <TechnicalDetails>
        <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
        <AudioCodecType>PCM</AudioCodecType>
        <File>
          <URI>${resource.fileUri}</URI>
        </File>
      </TechnicalDetails>
    </SoundRecording>`
  }

  buildVideo(resource) {
    return `<Video>
      <VideoType>${resource.type}</VideoType>
      <ResourceReference>${resource.resourceReference}</ResourceReference>
      <ResourceId>
        <ISRC>${resource.isrc}</ISRC>
      </ResourceId>
      <DisplayTitleText>${this.escapeXml(resource.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(resource.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <Duration>${resource.duration}</Duration>
      <PLine>
        <Year>${resource.pLineYear}</Year>
        <PLineText>${this.escapeXml(resource.pLineText)}</PLineText>
      </PLine>
      <TechnicalDetails>
        <TechnicalResourceDetailsReference>T${resource.resourceReference}</TechnicalResourceDetailsReference>
        <VideoCodecType>H264</VideoCodecType>
        <File>
          <URI>${resource.fileUri}</URI>
        </File>
      </TechnicalDetails>
    </Video>`
  }

  buildReleaseList(product, resources) {
    return `<ReleaseList>
    <Release>
      <ReleaseReference>${product.releaseReference}</ReleaseReference>
      <ReleaseType>${product.releaseType}</ReleaseType>
      <ReleaseId>
        <ICPN isEan="true">${product.upc}</ICPN>
      </ReleaseId>
      <DisplayTitleText>${this.escapeXml(product.title)}</DisplayTitleText>
      <DisplayArtist>
        <PartyName>
          <FullName>${this.escapeXml(product.artist)}</FullName>
        </PartyName>
      </DisplayArtist>
      <LabelName>${this.escapeXml(product.label)}</LabelName>
      <ReleaseResourceReferenceList>
        ${product.tracks.map(track => 
          `<ReleaseResourceReference ReleaseResourceType="PrimaryResource">${track.resourceReference}</ReleaseResourceReference>`
        ).join('\n        ')}
      </ReleaseResourceReferenceList>
    </Release>
  </ReleaseList>`
  }

  buildDealList(product) {
    return `<DealList>
    <ReleaseDeal>
      <DealReleaseReference>${product.releaseReference}</DealReleaseReference>
      <Deal>
        <DealTerms>
          <Territory>
            <TerritoryCode>${product.territoryCode}</TerritoryCode>
          </Territory>
          <ValidityPeriod>
            <StartDate>${new Date().toISOString().split('T')[0]}</StartDate>
          </ValidityPeriod>
          <CommercialModelType>PayAsYouGoModel</CommercialModelType>
          <Usage>
            <UseType>OnDemandStream</UseType>
          </Usage>
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