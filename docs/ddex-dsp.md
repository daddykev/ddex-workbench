# DDEX DSP - Blueprint

## Project Overview

DDEX DSP is an open-source, npm-installable Digital Service Provider (streaming platform) that democratizes music streaming technology by providing a complete, DDEX-compliant platform anyone can deploy in minutes. Whether you're a distributor testing feeds, a startup entering new markets, or a brand launching a curated streaming experience, DDEX DSP handles the entire pipeline from ingesting DDEX ERN deliveries to delivering a world-class listening experience. Built as the consumption endpoint of the DDEX Workbench ecosystem alongside DDEX Distro (distribution).

### Vision
Transform streaming platform creation from a multi-million dollar endeavor to a single npm command, enabling innovation in underserved markets and use cases while maintaining enterprise-grade DDEX compliance and **providing the most flexible ingestion options in the industry**.

### Core Value Propositions
- **Instant Streaming Platform**: Deploy a functional DSP service with one command
- **DDEX-Native Ingestion**: Built to receive and process ERN deliveries seamlessly
- **Multi-Protocol Ingestion**: Support FTP, SFTP, Amazon S3, and Google Cloud Storage delivery methods
- **Complete Streaming Stack**: Catalog, search, playback, and user management included
- **Test Environment Ready**: Perfect for developers to test their DDEX Distro deployments with multiple protocols
- **White-Label Capable**: Fully customizable for any brand or market

## Technical Architecture

### Platform Stack
- **Frontend**: Vue 3 (Composition API) + Vite
- **Backend**: Firebase (Firestore, Functions, Storage, Auth)
- **Ingestion Servers**: Node.js FTP/SFTP servers + Cloud Storage listeners (S3/GCS)
- **Streaming**: Firebase Storage + CDN with adaptive bitrate
- **Search**: Algolia or Typesense integration
- **Processing**: Cloud Functions for ERN processing
- **Analytics**: Firebase Analytics + custom DSR generation
- **CLI**: Node.js CLI for project scaffolding

### Enhanced Ingestion Architecture

#### Multi-Protocol Support
```javascript
// Supported delivery protocols
const DeliveryProtocols = {
  FTP: {
    server: 'ftp.my-dsp.com',
    port: 21,
    authType: 'username/password'
  },
  SFTP: {
    server: 'sftp.my-dsp.com', 
    port: 22,
    authType: 'ssh-key or password'
  },
  S3: {
    bucket: 'my-dsp-deliveries',
    region: 'us-east-1',
    authType: 'iam-role, access-keys, or signed-url'
  },
  GoogleCloudStorage: {
    bucket: 'deliveries-my-dsp',
    authType: 'service-account or signed-url'
  }
}
```

### Deployment Model
```bash
# One-command deployment with protocol selection
npx create-ddex-dsp my-streaming-service \
  --protocols=ftp,sftp,s3,gcs \
  --template=streaming

cd my-streaming-service
npm run deploy
```

## Project Structure (Enhanced)

```
ddex-dsp/
├── cli/                          # CLI tool for scaffolding
│   ├── bin/                      
│   │   └── ddex-dsp.js           
│   ├── commands/                 
│   │   ├── create.js             
│   │   ├── init.js               
│   │   ├── deploy.js             
│   │   ├── configure.js          
│   │   └── protocols.js          # Protocol configuration
│   ├── templates/                
│   └── package.json
├── packages/                     
│   ├── @ddex/dsp-core/           
│   ├── @ddex/player/             
│   ├── @ddex/storefront/         
│   └── @ddex/ingestion-servers/  # Protocol servers
│       ├── src/
│       │   ├── ftp/              # FTP server implementation
│       │   │   ├── server.js     # FTP server setup
│       │   │   ├── auth.js       # Authentication
│       │   │   └── handlers.js   # File handlers
│       │   ├── sftp/             # SFTP server implementation
│       │   │   ├── server.js     # SFTP server setup
│       │   │   ├── auth.js       # SSH key/password auth
│       │   │   └── handlers.js   # File handlers
│       │   ├── s3/               # Amazon S3 implementation
│       │   │   ├── listener.js   # S3 event processor
│       │   │   ├── auth.js       # IAM/access key auth
│       │   │   ├── handlers.js   # Object handlers
│       │   │   └── lambda.js     # Lambda function entry
│       │   ├── gcs/              # Google Cloud Storage
│       │   │   ├── listener.js   # GCS event listener
│       │   │   ├── auth.js       # Service account auth
│       │   │   └── handlers.js   # Object handlers
│       │   └── common/           # Shared ingestion logic
│       │       ├── processor.js  # ERN processing
│       │       ├── validator.js  # Validation
│       │       └── notifier.js   # Acknowledgments
│       └── package.json
├── template/                     
│   ├── src/                      
│   │   ├── components/           
│   │   │   ├── admin/            
│   │   │   │   ├── DeliveryConfig.vue    # Protocol config UI
│   │   │   │   ├── DeliveryMonitor.vue   # Real-time monitoring
│   │   │   │   ├── ProtocolTest.vue      # Test deliveries
│   │   │   │   ├── Deliveries.vue
│   │   │   │   ├── Catalog.vue
│   │   │   │   └── Analytics.vue
│   │   ├── views/                
│   │   ├── stores/               
│   │   │   ├── delivery.js       # Delivery configuration store
│   │   │   └── ...
│   │   ├── services/             
│   │   │   ├── protocols.js      # Protocol management API
│   │   │   └── ...
│   ├── functions/                
│   │   ├── ingestion/            # Enhanced ingestion
│   │   │   ├── receiver.js       # Multi-protocol receiver
│   │   │   ├── protocols/        # Protocol-specific handlers
│   │   │   │   ├── ftp.js        # FTP ingestion handler
│   │   │   │   ├── sftp.js       # SFTP ingestion handler
│   │   │   │   ├── s3.js         # S3 ingestion handler
│   │   │   │   └── gcs.js        # GCS ingestion handler
│   │   │   ├── parser.js         
│   │   │   ├── validator.js      
│   │   │   ├── processor.js      
│   │   │   └── notifier.js       
│   │   ├── servers/              # Protocol server management
│   │   │   ├── ftp-manager.js    # FTP server lifecycle
│   │   │   ├── sftp-manager.js   # SFTP server lifecycle
│   │   │   ├── s3-manager.js     # S3 configuration manager
│   │   │   └── credentials.js    # Secure credential storage
│   ├── lambda/                   # AWS Lambda functions
│   │   ├── s3-ingestion/         
│   │   │   ├── index.js          # Lambda handler
│   │   │   ├── package.json      # Lambda dependencies
│   │   │   └── serverless.yml    # Serverless config
│   ├── servers/                  # Standalone protocol servers
│   │   ├── ftp/                  
│   │   │   ├── Dockerfile        # FTP server container
│   │   │   ├── server.js         # FTP server entry
│   │   │   └── config.js         # FTP configuration
│   │   ├── sftp/                 
│   │   │   ├── Dockerfile        # SFTP server container
│   │   │   ├── server.js         # SFTP server entry
│   │   │   └── config.js         # SFTP configuration
│   │   └── docker-compose.yml    # Multi-server orchestration
│   ├── scripts/                  
│   │   ├── setup-protocols.js    # Protocol setup wizard
│   │   ├── deploy-lambda.js      # Lambda deployment script
│   │   └── test-delivery.js      # Test delivery script
```

## Enhanced Core Features

### 1. Multi-Protocol ERN Ingestion Pipeline

#### Delivery Feed Configuration
```typescript
interface DeliveryFeed {
  id: string;
  name: string;
  distributorId: string;
  protocol: 'FTP' | 'SFTP' | 'S3' | 'GCS';
  
  config: {
    // FTP Configuration
    ftp?: {
      host: string;
      port: number;
      username: string;
      password: encrypted;
      directory: string;
      passive: boolean;
      secure: boolean; // FTPS
    };
    
    // SFTP Configuration  
    sftp?: {
      host: string;
      port: number;
      username: string;
      authentication: {
        type: 'password' | 'key';
        password?: encrypted;
        privateKey?: encrypted;
        passphrase?: encrypted;
      };
      directory: string;
    };
    
    // Amazon S3 Configuration
    s3?: {
      bucket: string;
      region: string;
      prefix: string;
      authentication: {
        type: 'iam-role' | 'access-keys' | 'signed-url';
        accessKeyId?: encrypted;
        secretAccessKey?: encrypted;
        roleArn?: string;
        externalId?: string; // For cross-account access
      };
      eventConfiguration?: {
        lambdaArn: string;
        snsTopicArn?: string;
        sqsQueueUrl?: string;
      };
    };
    
    // Google Cloud Storage Configuration
    gcs?: {
      bucket: string;
      prefix: string;
      serviceAccount?: encrypted;
      signedUrlEndpoint?: string;
    };
  };
  
  processing: {
    autoProcess: boolean;
    schedule?: CronSchedule;
    retryPolicy: RetryPolicy;
    notifications: NotificationConfig;
  };
  
  status: {
    active: boolean;
    lastDelivery?: Timestamp;
    lastError?: string;
    statistics: DeliveryStats;
  };
}
```

#### FTP Server Implementation
```javascript
// FTP server with Firebase integration
import { FtpSrv } from 'ftp-srv';

class DDEXFTPServer {
  constructor(config) {
    this.server = new FtpSrv({
      url: `ftp://${config.host}:${config.port}`,
      pasv_url: config.pasvUrl,
      greeting: 'DDEX DSP FTP Server Ready'
    });
    
    this.setupAuthentication();
    this.setupHandlers();
  }
  
  setupAuthentication() {
    this.server.on('login', async ({ username, password }, resolve, reject) => {
      // Validate against delivery feeds
      const feed = await validateFeedCredentials(username, password);
      
      if (feed) {
        const fileSystem = new DDEXFileSystem(feed);
        resolve({ root: feed.directory, fs: fileSystem });
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }
  
  setupHandlers() {
    // Handle file uploads
    this.server.on('upload', async (error, { path, stream }) => {
      if (path.endsWith('.xml')) {
        // Process ERN file
        await processERNDelivery(stream, path);
      } else {
        // Store asset file
        await storeAssetFile(stream, path);
      }
    });
  }
}
```

#### SFTP Server Implementation
```javascript
// SFTP server with SSH key authentication
import { Server } from 'ssh2';

class DDEXSFTPServer {
  constructor(config) {
    this.server = new Server({
      hostKeys: [config.hostKey],
      greeting: 'DDEX DSP SFTP Server'
    });
    
    this.setupAuthentication();
    this.setupSFTPHandlers();
  }
  
  setupAuthentication() {
    this.server.on('authentication', async (ctx) => {
      const feed = await findDeliveryFeed(ctx.username);
      
      if (!feed) {
        return ctx.reject();
      }
      
      // Support both password and key authentication
      if (ctx.method === 'password') {
        const valid = await validatePassword(feed, ctx.password);
        valid ? ctx.accept() : ctx.reject();
      } else if (ctx.method === 'publickey') {
        const valid = await validatePublicKey(feed, ctx.key);
        valid ? ctx.accept() : ctx.reject();
      }
    });
  }
  
  setupSFTPHandlers() {
    this.server.on('session', (accept) => {
      const session = accept();
      
      session.on('sftp', (accept) => {
        const sftp = accept();
        
        // Handle file operations
        sftp.on('WRITE', async (reqId, handle, offset, data) => {
          await handleFileWrite(handle, offset, data);
          sftp.status(reqId, STATUS_CODE.OK);
        });
        
        sftp.on('CLOSE', async (reqId, handle) => {
          const file = await closeFile(handle);
          if (file.name.endsWith('.xml')) {
            await processERNDelivery(file);
          }
          sftp.status(reqId, STATUS_CODE.OK);
        });
      });
    });
  }
}
```

#### Amazon S3 Implementation
```javascript
// S3 listener with Lambda integration
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3DeliveryListener {
  constructor(config) {
    this.s3Client = new S3Client({ 
      region: config.region,
      credentials: this.getCredentials(config)
    });
    this.bucket = config.bucket;
    this.prefix = config.prefix;
  }
  
  getCredentials(config) {
    switch(config.authentication.type) {
      case 'access-keys':
        return {
          accessKeyId: decrypt(config.authentication.accessKeyId),
          secretAccessKey: decrypt(config.authentication.secretAccessKey)
        };
      case 'iam-role':
        // Use assumed role or instance profile
        return fromTemporaryCredentials({
          params: {
            RoleArn: config.authentication.roleArn,
            ExternalId: config.authentication.externalId
          }
        });
      default:
        // Use default credentials chain
        return undefined;
    }
  }
  
  // Lambda handler for S3 events
  async handleS3Event(event) {
    console.log('Processing S3 event:', JSON.stringify(event));
    
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      
      // Skip if not in our prefix
      if (!key.startsWith(this.prefix)) {
        console.log(`Skipping ${key} - outside prefix ${this.prefix}`);
        continue;
      }
      
      // Identify the feed from the path
      const feed = await this.identifyFeedFromPath(key);
      if (!feed) {
        console.error(`No feed found for path: ${key}`);
        continue;
      }
      
      // Process based on file type
      if (key.endsWith('.xml')) {
        await this.processERN(bucket, key, feed);
      } else {
        await this.processAsset(bucket, key, feed);
      }
    }
  }
  
  async processERN(bucket, key, feed) {
    try {
      // Download the ERN file
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      const response = await this.s3Client.send(command);
      const ernContent = await streamToString(response.Body);
      
      // Process through unified pipeline
      await processERNDelivery(ernContent, {
        feedId: feed.id,
        protocol: 'S3',
        source: `s3://${bucket}/${key}`,
        bucket,
        key
      });
      
      // Move to processed folder
      await this.moveToProcessed(bucket, key);
      
    } catch (error) {
      console.error('Error processing ERN:', error);
      await this.moveToError(bucket, key, error);
      throw error;
    }
  }
  
  async processAsset(bucket, key, feed) {
    // Store asset reference for later processing
    await storeAssetReference({
      feedId: feed.id,
      protocol: 'S3',
      location: {
        bucket,
        key
      },
      metadata: {
        size: record.s3.object.size,
        etag: record.s3.object.eTag
      }
    });
  }
  
  // Generate pre-signed URLs for distributors
  async generatePresignedUrl(operation, key, expiresIn = 3600) {
    const command = operation === 'upload' 
      ? new PutObjectCommand({ Bucket: this.bucket, Key: key })
      : new GetObjectCommand({ Bucket: this.bucket, Key: key });
    
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
  
  async moveToProcessed(bucket, key) {
    // Move file to processed folder
    const processedKey = key.replace(this.prefix, `${this.prefix}processed/`);
    await this.copyObject(bucket, key, processedKey);
    await this.deleteObject(bucket, key);
  }
  
  async moveToError(bucket, key, error) {
    // Move file to error folder with error details
    const errorKey = key.replace(this.prefix, `${this.prefix}errors/`);
    await this.copyObject(bucket, key, errorKey);
    await this.putErrorDetails(bucket, `${errorKey}.error`, error);
    await this.deleteObject(bucket, key);
  }
}

// Lambda function entry point
exports.handler = async (event, context) => {
  const config = await getS3Config();
  const listener = new S3DeliveryListener(config);
  
  try {
    await listener.handleS3Event(event);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Successfully processed S3 event',
        records: event.Records.length 
      })
    };
  } catch (error) {
    console.error('Lambda execution error:', error);
    throw error;
  }
};
```

#### Google Cloud Storage Integration
```javascript
// GCS listener for deliveries
class GCSDeliveryListener {
  constructor(config) {
    this.bucket = storage.bucket(config.bucket);
    this.prefix = config.prefix;
    
    this.setupTriggers();
  }
  
  setupTriggers() {
    // Cloud Function triggered by file upload
    exports.processGCSDelivery = functions.storage
      .bucket(this.bucket.name)
      .object()
      .onFinalize(async (object) => {
        if (!object.name.startsWith(this.prefix)) return;
        
        // Identify the delivery feed
        const feed = await identifyFeedFromPath(object.name);
        if (!feed) return;
        
        // Process the delivery
        if (object.name.endsWith('.xml')) {
          await this.processERN(object, feed);
        } else {
          await this.processAsset(object, feed);
        }
      });
  }
  
  async processERN(object, feed) {
    const file = await this.bucket.file(object.name).download();
    const ern = file.toString();
    
    await processERNDelivery(ern, {
      feedId: feed.id,
      protocol: 'GCS',
      source: object.name
    });
  }
}
```

#### Unified Processing Pipeline
```javascript
// Common processing for all protocols
class UnifiedIngestionProcessor {
  async processDelivery(content, metadata) {
    const delivery = await this.createDeliveryRecord(metadata);
    
    try {
      // 1. Parse ERN
      const ern = await this.parseERN(content);
      
      // 2. Validate via Workbench
      const validation = await this.validateERN(ern);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }
      
      // 3. Process release
      const release = await this.processRelease(ern);
      
      // 4. Link assets
      await this.linkAssets(release, metadata.feedId);
      
      // 5. Send acknowledgment
      await this.sendAcknowledgment(delivery, release);
      
      // 6. Update feed status
      await this.updateFeedStatus(metadata.feedId, 'success');
      
    } catch (error) {
      await this.handleError(delivery, error);
      await this.updateFeedStatus(metadata.feedId, 'error', error);
    }
  }
  
  async validateERN(ern) {
    return workbenchAPI.validate({
      content: ern,
      type: 'ERN',
      version: this.detectVersion(ern),
      profile: this.detectProfile(ern)
    });
  }
}
```

### 2. Delivery Configuration UI

#### Feed Management Interface
```vue
<!-- DeliveryConfig.vue -->
<template>
  <div class="delivery-config">
    <h2>Delivery Feed Configuration</h2>
    
    <!-- Protocol Selection -->
    <div class="protocol-selector">
      <h3>Select Delivery Protocol</h3>
      <div class="protocol-options">
        <button 
          v-for="protocol in protocols" 
          :key="protocol"
          @click="selectedProtocol = protocol"
          :class="{ active: selectedProtocol === protocol }"
        >
          <icon :name="protocol.toLowerCase()" />
          {{ protocol }}
        </button>
      </div>
    </div>
    
    <!-- Protocol-specific Configuration -->
    <div class="protocol-config" v-if="selectedProtocol">
      <!-- FTP Configuration -->
      <div v-if="selectedProtocol === 'FTP'" class="config-form">
        <h3>FTP Server Configuration</h3>
        <form @submit.prevent="saveFTPConfig">
          <div class="form-group">
            <label>Server Address</label>
            <input v-model="ftpConfig.host" readonly>
            <small>{{ generatedFTPEndpoint }}</small>
          </div>
          
          <div class="form-group">
            <label>Username</label>
            <input v-model="ftpConfig.username" @blur="generateCredentials">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <div class="password-input">
              <input :type="showPassword ? 'text' : 'password'" 
                     v-model="ftpConfig.password">
              <button @click="generatePassword">Generate</button>
              <button @click="togglePassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Directory</label>
            <input v-model="ftpConfig.directory" 
                   placeholder="/deliveries/{{ distributorId }}">
          </div>
          
          <div class="form-options">
            <label>
              <input type="checkbox" v-model="ftpConfig.passive">
              Enable Passive Mode
            </label>
            <label>
              <input type="checkbox" v-model="ftpConfig.secure">
              Use FTPS (Secure)
            </label>
          </div>
          
          <button type="submit" class="btn-primary">
            Save FTP Configuration
          </button>
        </form>
      </div>
      
      <!-- SFTP Configuration -->
      <div v-if="selectedProtocol === 'SFTP'" class="config-form">
        <h3>SFTP Server Configuration</h3>
        <form @submit.prevent="saveSFTPConfig">
          <div class="form-group">
            <label>Server Address</label>
            <input v-model="sftpConfig.host" readonly>
            <small>{{ generatedSFTPEndpoint }}</small>
          </div>
          
          <div class="form-group">
            <label>Authentication Type</label>
            <select v-model="sftpConfig.authType">
              <option value="password">Password</option>
              <option value="key">SSH Key</option>
            </select>
          </div>
          
          <div v-if="sftpConfig.authType === 'password'" class="form-group">
            <label>Password</label>
            <input type="password" v-model="sftpConfig.password">
          </div>
          
          <div v-if="sftpConfig.authType === 'key'" class="form-group">
            <label>Public SSH Key</label>
            <textarea v-model="sftpConfig.publicKey" 
                      placeholder="Paste your public SSH key here"
                      rows="6"></textarea>
            <small>Paste the distributor's public SSH key for authentication</small>
          </div>
          
          <button type="submit" class="btn-primary">
            Save SFTP Configuration
          </button>
        </form>
      </div>
      
      <!-- Amazon S3 Configuration -->
      <div v-if="selectedProtocol === 'S3'" class="config-form">
        <h3>Amazon S3 Configuration</h3>
        <form @submit.prevent="saveS3Config">
          <div class="form-group">
            <label>Bucket Name</label>
            <input v-model="s3Config.bucket" 
                   placeholder="my-dsp-deliveries">
            <small>Create a dedicated S3 bucket for deliveries</small>
          </div>
          
          <div class="form-group">
            <label>AWS Region</label>
            <select v-model="s3Config.region">
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="eu-central-1">EU (Frankfurt)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Delivery Prefix</label>
            <input v-model="s3Config.prefix" 
                   placeholder="deliveries/{{ distributorId }}/">
            <small>S3 folder prefix for this distributor's files</small>
          </div>
          
          <div class="form-group">
            <label>Authentication Method</label>
            <select v-model="s3Config.authMethod">
              <option value="iam-role">IAM Role (Recommended)</option>
              <option value="access-keys">Access Keys</option>
              <option value="signed-url">Pre-signed URLs</option>
            </select>
          </div>
          
          <div v-if="s3Config.authMethod === 'iam-role'" class="iam-config">
            <div class="info-box">
              <h4>IAM Role Setup</h4>
              <p>Create an IAM role with the following trust policy:</p>
              <pre>{{ iamTrustPolicy }}</pre>
              <button @click="copyTrustPolicy" class="btn-secondary">
                Copy Trust Policy
              </button>
            </div>
            
            <div class="form-group">
              <label>Role ARN</label>
              <input v-model="s3Config.roleArn" 
                     placeholder="arn:aws:iam::123456789012:role/DDEXDeliveryRole">
            </div>
            
            <div class="form-group">
              <label>External ID (Optional)</label>
              <input v-model="s3Config.externalId" 
                     placeholder="unique-external-id">
              <small>For additional security in cross-account access</small>
            </div>
          </div>
          
          <div v-if="s3Config.authMethod === 'access-keys'" class="access-keys-config">
            <div class="form-group">
              <label>Access Key ID</label>
              <input v-model="s3Config.accessKeyId" 
                     placeholder="AKIAIOSFODNN7EXAMPLE">
            </div>
            
            <div class="form-group">
              <label>Secret Access Key</label>
              <input type="password" 
                     v-model="s3Config.secretAccessKey" 
                     placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY">
            </div>
            
            <div class="alert alert-warning">
              <strong>Security Note:</strong> Access keys will be encrypted before storage.
              Consider using IAM roles for better security.
            </div>
          </div>
          
          <div v-if="s3Config.authMethod === 'signed-url'" class="signed-url-config">
            <div class="info-box">
              <h4>Pre-signed URL Configuration</h4>
              <p>Distributors will request temporary upload URLs from:</p>
              <code>{{ signedUrlEndpoint }}</code>
            </div>
            
            <div class="form-group">
              <label>URL Expiration (seconds)</label>
              <input type="number" 
                     v-model="s3Config.urlExpiration" 
                     min="300" 
                     max="604800"
                     placeholder="3600">
              <small>How long upload URLs remain valid (5 min - 7 days)</small>
            </div>
          </div>
          
          <!-- Lambda Configuration -->
          <div class="lambda-config">
            <h4>Lambda Function Setup</h4>
            <div class="setup-steps">
              <div class="step" :class="{ complete: lambdaSteps.created }">
                <span class="step-number">1</span>
                <span class="step-text">Lambda function created</span>
                <button @click="createLambda" v-if="!lambdaSteps.created">
                  Create Lambda
                </button>
              </div>
              
              <div class="step" :class="{ complete: lambdaSteps.configured }">
                <span class="step-number">2</span>
                <span class="step-text">S3 trigger configured</span>
                <button @click="configureTrigger" 
                        v-if="lambdaSteps.created && !lambdaSteps.configured">
                  Configure Trigger
                </button>
              </div>
              
              <div class="step" :class="{ complete: lambdaSteps.tested }">
                <span class="step-number">3</span>
                <span class="step-text">Connection tested</span>
                <button @click="testLambda" 
                        v-if="lambdaSteps.configured && !lambdaSteps.tested">
                  Test Connection
                </button>
              </div>
            </div>
            
            <div v-if="lambdaArn" class="form-group">
              <label>Lambda Function ARN</label>
              <input :value="lambdaArn" readonly>
              <small>This Lambda will process your S3 deliveries</small>
            </div>
          </div>
          
          <button type="submit" class="btn-primary">
            Save S3 Configuration
          </button>
        </form>
      </div>
      
      <!-- Google Cloud Storage Configuration -->
      <div v-if="selectedProtocol === 'GCS'" class="config-form">
        <h3>Google Cloud Storage Configuration</h3>
        <form @submit.prevent="saveGCSConfig">
          <div class="form-group">
            <label>Bucket Name</label>
            <input v-model="gcsConfig.bucket" readonly>
            <small>{{ generatedGCSBucket }}</small>
          </div>
          
          <div class="form-group">
            <label>Delivery Prefix</label>
            <input v-model="gcsConfig.prefix" 
                   placeholder="deliveries/{{ distributorId }}/">
          </div>
          
          <div class="form-group">
            <label>Authentication Method</label>
            <select v-model="gcsConfig.authMethod">
              <option value="service-account">Service Account</option>
              <option value="signed-url">Signed URLs</option>
            </select>
          </div>
          
          <div v-if="gcsConfig.authMethod === 'service-account'">
            <button @click="generateServiceAccount" class="btn-secondary">
              Generate Service Account
            </button>
            <div v-if="serviceAccount" class="service-account-details">
              <pre>{{ serviceAccount }}</pre>
              <button @click="downloadServiceAccount">Download JSON</button>
            </div>
          </div>
          
          <div v-if="gcsConfig.authMethod === 'signed-url'">
            <div class="form-group">
              <label>Signed URL Endpoint</label>
              <input v-model="gcsConfig.signedUrlEndpoint" readonly>
              <small>Distributors will request upload URLs from this endpoint</small>
            </div>
          </div>
          
          <button type="submit" class="btn-primary">
            Save GCS Configuration
          </button>
        </form>
      </div>
    </div>
    
    <!-- Test Delivery Section -->
    <div class="test-delivery" v-if="configSaved">
      <h3>Test Your Configuration</h3>
      <p>Send a test delivery to verify your setup:</p>
      
      <div class="test-options">
        <button @click="showTestInstructions = true" class="btn-secondary">
          View Test Instructions
        </button>
        <button @click="sendTestDelivery" class="btn-primary">
          Send Test Delivery
        </button>
      </div>
      
      <!-- Test Instructions Modal -->
      <modal v-if="showTestInstructions">
        <h3>Test Delivery Instructions</h3>
        <div class="instructions">
          <div v-if="selectedProtocol === 'FTP'">
            <h4>FTP Test Commands:</h4>
            <pre>
# Using command line FTP
ftp {{ ftpConfig.host }}
Username: {{ ftpConfig.username }}
Password: {{ ftpConfig.password }}

# Upload test ERN
put test-release.xml
put audio-file.mp3
quit

# Using DDEX Distro
ddex-distro deliver \
  --protocol=ftp \
  --host={{ ftpConfig.host }} \
  --username={{ ftpConfig.username }} \
  --password={{ ftpConfig.password }} \
  --release=test-album
            </pre>
          </div>
          
          <div v-if="selectedProtocol === 'SFTP'">
            <h4>SFTP Test Commands:</h4>
            <pre>
# Using command line SFTP
sftp {{ sftpConfig.username }}@{{ sftpConfig.host }}

# Upload test ERN
put test-release.xml
put audio-file.mp3
quit

# Using DDEX Distro
ddex-distro deliver \
  --protocol=sftp \
  --host={{ sftpConfig.host }} \
  --username={{ sftpConfig.username }} \
  --key=path/to/private-key \
  --release=test-album
            </pre>
          </div>
          
          <div v-if="selectedProtocol === 'S3'">
            <h4>Amazon S3 Test:</h4>
            <pre>
# Using AWS CLI
aws s3 cp test-release.xml s3://{{ s3Config.bucket }}/{{ s3Config.prefix }}
aws s3 cp audio-file.mp3 s3://{{ s3Config.bucket }}/{{ s3Config.prefix }}

# Using DDEX Distro
ddex-distro deliver \
  --protocol=s3 \
  --bucket={{ s3Config.bucket }} \
  --region={{ s3Config.region }} \
  --prefix={{ s3Config.prefix }} \
  --release=test-album

# With IAM Role
ddex-distro deliver \
  --protocol=s3 \
  --bucket={{ s3Config.bucket }} \
  --role-arn={{ s3Config.roleArn }} \
  --release=test-album

# With Access Keys
ddex-distro deliver \
  --protocol=s3 \
  --bucket={{ s3Config.bucket }} \
  --access-key-id=YOUR_KEY_ID \
  --secret-access-key=YOUR_SECRET \
  --release=test-album
            </pre>
          </div>
          
          <div v-if="selectedProtocol === 'GCS'">
            <h4>Google Cloud Storage Test:</h4>
            <pre>
# Using gsutil
gsutil cp test-release.xml gs://{{ gcsConfig.bucket }}/{{ gcsConfig.prefix }}
gsutil cp audio-file.mp3 gs://{{ gcsConfig.bucket }}/{{ gcsConfig.prefix }}

# Using DDEX Distro
ddex-distro deliver \
  --protocol=gcs \
  --bucket={{ gcsConfig.bucket }} \
  --service-account=path/to/service-account.json \
  --release=test-album
            </pre>
          </div>
        </div>
      </modal>
    </div>
    
    <!-- Active Feeds List -->
    <div class="active-feeds">
      <h3>Active Delivery Feeds</h3>
      <table>
        <thead>
          <tr>
            <th>Distributor</th>
            <th>Protocol</th>
            <th>Status</th>
            <th>Last Delivery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feed in activeFeeds" :key="feed.id">
            <td>{{ feed.distributorName }}</td>
            <td>
              <span class="protocol-badge">{{ feed.protocol }}</span>
            </td>
            <td>
              <status-indicator :status="feed.status" />
            </td>
            <td>{{ formatDate(feed.lastDelivery) }}</td>
            <td>
              <button @click="editFeed(feed)">Edit</button>
              <button @click="testFeed(feed)">Test</button>
              <button @click="viewLogs(feed)">Logs</button>
              <button @click="deleteFeed(feed)" class="danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDeliveryStore } from '@/stores/delivery';
import { generateCredentials, testDeliveryConnection, deployLambda } from '@/services/protocols';

const deliveryStore = useDeliveryStore();

const protocols = ['FTP', 'SFTP', 'S3', 'GCS'];
const selectedProtocol = ref(null);
const configSaved = ref(false);
const showTestInstructions = ref(false);

// Protocol configurations
const ftpConfig = ref({
  host: '',
  port: 21,
  username: '',
  password: '',
  directory: '/deliveries',
  passive: true,
  secure: false
});

const sftpConfig = ref({
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  publicKey: '',
  directory: '/deliveries'
});

const s3Config = ref({
  bucket: '',
  region: 'us-east-1',
  prefix: 'deliveries/',
  authMethod: 'iam-role',
  roleArn: '',
  externalId: '',
  accessKeyId: '',
  secretAccessKey: '',
  urlExpiration: 3600
});

const gcsConfig = ref({
  bucket: '',
  prefix: 'deliveries/',
  authMethod: 'service-account',
  signedUrlEndpoint: ''
});

// Lambda setup state
const lambdaSteps = ref({
  created: false,
  configured: false,
  tested: false
});

const lambdaArn = ref('');

// Computed endpoints
const generatedFTPEndpoint = computed(() => 
  `ftp.${window.location.hostname}:21`
);

const generatedSFTPEndpoint = computed(() => 
  `sftp.${window.location.hostname}:22`
);

const generatedGCSBucket = computed(() => 
  `${projectId}-deliveries`
);

const signedUrlEndpoint = computed(() => 
  `/api/s3/generate-upload-url`
);

const iamTrustPolicy = computed(() => {
  return JSON.stringify({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "AWS": `arn:aws:iam::${distributorAccountId}:root`
      },
      "Action": "sts:AssumeRole",
      "Condition": s3Config.value.externalId ? {
        "StringEquals": {
          "sts:ExternalId": s3Config.value.externalId
        }
      } : undefined
    }]
  }, null, 2);
});

// Methods
async function createLambda() {
  try {
    const result = await deployLambda({
      functionName: `ddex-dsp-s3-processor-${Date.now()}`,
      bucket: s3Config.value.bucket,
      region: s3Config.value.region
    });
    
    lambdaArn.value = result.functionArn;
    lambdaSteps.value.created = true;
    showSuccess('Lambda function created successfully');
  } catch (error) {
    showError(`Failed to create Lambda: ${error.message}`);
  }
}

async function configureTrigger() {
  try {
    await configureS3Trigger({
      bucket: s3Config.value.bucket,
      lambdaArn: lambdaArn.value,
      prefix: s3Config.value.prefix
    });
    
    lambdaSteps.value.configured = true;
    showSuccess('S3 trigger configured successfully');
  } catch (error) {
    showError(`Failed to configure trigger: ${error.message}`);
  }
}

async function testLambda() {
  try {
    const result = await testS3Lambda({
      bucket: s3Config.value.bucket,
      lambdaArn: lambdaArn.value
    });
    
    if (result.success) {
      lambdaSteps.value.tested = true;
      showSuccess('Lambda test successful!');
    } else {
      showError(`Lambda test failed: ${result.error}`);
    }
  } catch (error) {
    showError(`Test failed: ${error.message}`);
  }
}

async function generatePassword() {
  const password = await generateCredentials('password');
  if (selectedProtocol.value === 'FTP') {
    ftpConfig.value.password = password;
  } else if (selectedProtocol.value === 'SFTP') {
    sftpConfig.value.password = password;
  }
}

async function generateServiceAccount() {
  const serviceAccount = await generateCredentials('service-account', {
    bucket: gcsConfig.value.bucket,
    prefix: gcsConfig.value.prefix
  });
  // Display service account details
}

async function sendTestDelivery() {
  const result = await testDeliveryConnection({
    protocol: selectedProtocol.value,
    config: getActiveConfig()
  });
  
  if (result.success) {
    showSuccess('Test delivery successful!');
  } else {
    showError(`Test failed: ${result.error}`);
  }
}

function getActiveConfig() {
  switch(selectedProtocol.value) {
    case 'FTP': return ftpConfig.value;
    case 'SFTP': return sftpConfig.value;
    case 'S3': return { ...s3Config.value, lambdaArn: lambdaArn.value };
    case 'GCS': return gcsConfig.value;
  }
}

function copyTrustPolicy() {
  navigator.clipboard.writeText(iamTrustPolicy.value);
  showSuccess('Trust policy copied to clipboard');
}
</script>
```

### 3. Delivery Monitoring Dashboard

#### Real-time Monitoring Interface
```vue
<!-- DeliveryMonitor.vue -->
<template>
  <div class="delivery-monitor">
    <h2>Delivery Monitor</h2>
    
    <!-- Protocol Status Overview -->
    <div class="protocol-status">
      <div class="status-card" v-for="protocol in protocolStatus" :key="protocol.type">
        <div class="protocol-header">
          <icon :name="protocol.type.toLowerCase()" />
          <h3>{{ protocol.type }}</h3>
          <status-badge :status="protocol.status" />
        </div>
        <div class="protocol-stats">
          <div class="stat">
            <span class="label">Active Connections</span>
            <span class="value">{{ protocol.activeConnections }}</span>
          </div>
          <div class="stat">
            <span class="label">Today's Deliveries</span>
            <span class="value">{{ protocol.todayDeliveries }}</span>
          </div>
          <div class="stat">
            <span class="label">Success Rate</span>
            <span class="value">{{ protocol.successRate }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Live Activity Feed -->
    <div class="activity-feed">
      <h3>Live Delivery Activity</h3>
      <div class="activity-list">
        <div v-for="activity in liveActivities" 
             :key="activity.id" 
             class="activity-item"
             :class="activity.status">
          <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          <div class="activity-protocol">
            <icon :name="activity.protocol.toLowerCase()" />
          </div>
          <div class="activity-details">
            <div class="activity-distributor">{{ activity.distributor }}</div>
            <div class="activity-file">{{ activity.fileName }}</div>
            <div class="activity-status">{{ activity.statusText }}</div>
          </div>
          <div class="activity-progress" v-if="activity.inProgress">
            <progress-bar :value="activity.progress" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Processing Queue -->
    <div class="processing-queue">
      <h3>Processing Queue</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Protocol</th>
            <th>Distributor</th>
            <th>Release</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in processingQueue" :key="item.id">
            <td>{{ formatTime(item.receivedAt) }}</td>
            <td>
              <span class="protocol-badge">{{ item.protocol }}</span>
            </td>
            <td>{{ item.distributor }}</td>
            <td>{{ item.releaseTitle || 'Processing...' }}</td>
            <td>
              <status-indicator :status="item.status" />
            </td>
            <td>
              <button @click="viewDetails(item)">Details</button>
              <button @click="retryProcessing(item)" v-if="item.status === 'failed'">
                Retry
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- S3-specific Monitoring -->
    <div class="s3-monitoring" v-if="hasS3Feeds">
      <h3>S3 Lambda Performance</h3>
      <div class="lambda-metrics">
        <div class="metric">
          <span class="label">Invocations (24h)</span>
          <span class="value">{{ s3Metrics.invocations }}</span>
        </div>
        <div class="metric">
          <span class="label">Avg Duration</span>
          <span class="value">{{ s3Metrics.avgDuration }}ms</span>
        </div>
        <div class="metric">
          <span class="label">Error Rate</span>
          <span class="value">{{ s3Metrics.errorRate }}%</span>
        </div>
        <div class="metric">
          <span class="label">Throttles</span>
          <span class="value">{{ s3Metrics.throttles }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Data Models (Enhanced)

### Firestore Collections

```typescript
// delivery_feeds collection
interface DeliveryFeed {
  id: string;
  name: string;
  distributorId: string;
  distributorName: string;
  protocol: 'FTP' | 'SFTP' | 'S3' | 'GCS';
  
  credentials: {
    ftp?: {
      username: string;
      passwordHash: string;
      directory: string;
      ipWhitelist?: string[];
    };
    sftp?: {
      username: string;
      authType: 'password' | 'key';
      passwordHash?: string;
      publicKeys?: string[];
      directory: string;
    };
    s3?: {
      bucket: string;
      region: string;
      prefix: string;
      authType: 'iam-role' | 'access-keys' | 'signed-url';
      roleArn?: string;
      externalId?: string;
      accessKeyIdHash?: string;
      secretAccessKeyEncrypted?: encrypted;
      lambdaArn?: string;
    };
    gcs?: {
      serviceAccountEmail?: string;
      bucket: string;
      prefix: string;
      signedUrlSecret?: encrypted;
    };
  };
  
  settings: {
    autoProcess: boolean;
    validateBeforeProcess: boolean;
    requireAcknowledgment: boolean;
    notificationEmail?: string;
    maxFileSize: number; // MB
    allowedFileTypes: string[];
  };
  
  monitoring: {
    active: boolean;
    lastActivity?: Timestamp;
    lastSuccessfulDelivery?: Timestamp;
    lastError?: {
      timestamp: Timestamp;
      message: string;
      details: any;
    };
    statistics: {
      totalDeliveries: number;
      successfulDeliveries: number;
      failedDeliveries: number;
      averageProcessingTime: number; // seconds
    };
  };
  
  created: Timestamp;
  updated: Timestamp;
  createdBy: string;
}

// delivery_logs collection
interface DeliveryLog {
  id: string;
  feedId: string;
  protocol: 'FTP' | 'SFTP' | 'S3' | 'GCS';
  
  connection: {
    timestamp: Timestamp;
    clientIp?: string;
    username?: string;
    protocol: string;
    port?: number;
    // S3-specific fields
    bucket?: string;
    region?: string;
    eventType?: 's3:ObjectCreated:*' | 's3:ObjectRemoved:*';
  };
  
  files: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: Timestamp;
    path: string;
    // S3-specific fields
    etag?: string;
    versionId?: string;
    storageClass?: string;
  }>;
  
  processing: {
    startedAt?: Timestamp;
    completedAt?: Timestamp;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    ernValidation?: ValidationResult;
    errors?: string[];
    // Lambda-specific fields
    lambdaRequestId?: string;
    lambdaDuration?: number;
    lambdaMemoryUsed?: number;
  };
  
  result?: {
    releaseId?: string;
    trackCount?: number;
    acknowledgmentSent?: boolean;
  };
}

// Enhanced deliveries collection
interface Delivery {
  id: string;
  feedId: string;
  protocol: 'FTP' | 'SFTP' | 'S3' | 'GCS';
  sender: string;
  
  package: {
    originalPath: string;
    size: number;
    files: string[];
    // S3-specific
    s3Location?: {
      bucket: string;
      keys: string[];
    };
  };
  
  ern: {
    messageId: string;
    version: string;
    releaseCount: number;
  };
  
  processing: {
    receivedAt: Timestamp;
    startedAt?: Timestamp;
    completedAt?: Timestamp;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errors?: ProcessingError[];
  };
  
  acknowledgment?: {
    sentAt: Timestamp;
    messageId: string;
    method: string;
  };
}
```

## CLI Commands (Enhanced)

```bash
# Configure delivery protocols
ddex-dsp protocols setup         # Interactive protocol setup
ddex-dsp protocols list          # List configured protocols
ddex-dsp protocols test <type>   # Test specific protocol

# FTP/SFTP server management
ddex-dsp servers start           # Start all configured servers
ddex-dsp servers stop            # Stop all servers
ddex-dsp servers status          # Check server status
ddex-dsp servers logs <type>     # View server logs

# S3-specific commands
ddex-dsp s3 setup                # Interactive S3 setup wizard
ddex-dsp s3 deploy-lambda        # Deploy Lambda function
ddex-dsp s3 update-lambda        # Update Lambda code
ddex-dsp s3 test-trigger         # Test S3 trigger
ddex-dsp s3 create-bucket        # Create S3 bucket with proper configuration
ddex-dsp s3 configure-cors       # Setup CORS for bucket
ddex-dsp s3 generate-policy      # Generate bucket policy

# Delivery feed management
ddex-dsp feeds create            # Create new delivery feed
ddex-dsp feeds list              # List all feeds
ddex-dsp feeds test <id>         # Test specific feed
ddex-dsp feeds disable <id>      # Disable a feed

# Testing deliveries
ddex-dsp test-delivery \
  --protocol=s3 \
  --bucket=my-dsp-deliveries \
  --region=us-east-1 \
  --feed-id=<id> \
  --ern=test/sample.xml \
  --assets=test/assets/

# Lambda management
ddex-dsp lambda logs             # View Lambda function logs
ddex-dsp lambda metrics          # View Lambda metrics
ddex-dsp lambda test-event       # Send test S3 event
```

## Security & Isolation

### Protocol Security
```javascript
// Secure credential management with S3 support
class CredentialManager {
  async storeCredentials(feedId, protocol, credentials) {
    const encrypted = await this.encrypt(credentials);
    
    // Special handling for S3 credentials
    if (protocol === 'S3' && credentials.accessKeyId) {
      encrypted.accessKeyIdHash = this.hash(credentials.accessKeyId);
      delete encrypted.accessKeyId; // Never store raw access key
    }
    
    await firestore.collection('delivery_feeds').doc(feedId).update({
      [`credentials.${protocol}`]: encrypted,
      'updated': serverTimestamp()
    });
  }
  
  async validateAccess(protocol, authInfo) {
    // Find matching feed
    const feed = await this.findFeedByAuth(protocol, authInfo);
    if (!feed) return false;
    
    // Validate credentials
    switch(protocol) {
      case 'FTP':
      case 'SFTP':
        return this.validatePassword(feed, authInfo.password);
      case 'S3':
        return this.validateS3Access(feed, authInfo);
      case 'GCS':
        return this.validateServiceAccount(feed, authInfo.serviceAccount);
    }
  }
  
  async validateS3Access(feed, authInfo) {
    // S3 access is validated through IAM policies
    // This method checks if the Lambda execution role has access
    try {
      const s3Client = new S3Client({
        region: feed.credentials.s3.region,
        credentials: await this.getS3Credentials(feed)
      });
      
      // Test access with HeadBucket
      await s3Client.send(new HeadBucketCommand({
        Bucket: feed.credentials.s3.bucket
      }));
      
      return true;
    } catch (error) {
      console.error('S3 access validation failed:', error);
      return false;
    }
  }
}
```

### S3 Bucket Security
```javascript
// S3 bucket policy generator
class S3SecurityManager {
  generateBucketPolicy(bucket, feedId, lambdaArn) {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowLambdaRead',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          },
          Action: [
            's3:GetObject',
            's3:GetObjectVersion'
          ],
          Resource: `arn:aws:s3:::${bucket}/*`,
          Condition: {
            ArnEquals: {
              'aws:SourceArn': lambdaArn
            }
          }
        },
        {
          Sid: 'AllowDistributorUpload',
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::*:root`
          },
          Action: [
            's3:PutObject',
            's3:PutObjectAcl'
          ],
          Resource: `arn:aws:s3:::${bucket}/deliveries/${feedId}/*`,
          Condition: {
            StringEquals: {
              's3:x-amz-server-side-encryption': 'AES256'
            }
          }
        }
      ]
    };
  }
  
  generateLambdaExecutionRole() {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          Resource: 'arn:aws:logs:*:*:*'
        },
        {
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:DeleteObject',
            's3:PutObject'
          ],
          Resource: 'arn:aws:s3:::*-deliveries/*'
        },
        {
          Effect: 'Allow',
          Action: [
            'secretsmanager:GetSecretValue'
          ],
          Resource: 'arn:aws:secretsmanager:*:*:secret:ddex-dsp-*'
        }
      ]
    };
  }
}
```

### Delivery Isolation
```javascript
// Isolated delivery processing with S3 support
class IsolatedProcessor {
  async processDelivery(feedId, files, protocol) {
    // Create isolated workspace
    const workspace = await this.createWorkspace(feedId);
    
    try {
      // Protocol-specific file retrieval
      if (protocol === 'S3') {
        await this.downloadFromS3(files, workspace);
      } else {
        await this.moveFilesToWorkspace(files, workspace);
      }
      
      // Common processing
      await this.scanForThreats(workspace);
      await this.validateFiles(workspace);
      await this.processERN(workspace);
      
      // Clean up S3 files after processing
      if (protocol === 'S3') {
        await this.moveS3ToProcessed(files);
      }
      
    } finally {
      // Clean up workspace
      await this.cleanupWorkspace(workspace);
    }
  }
  
  async downloadFromS3(s3Files, workspace) {
    const s3Client = new S3Client({ region: s3Files[0].region });
    
    for (const file of s3Files) {
      const command = new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.key
      });
      
      const response = await s3Client.send(command);
      const localPath = path.join(workspace, path.basename(file.key));
      
      await pipeline(
        response.Body,
        fs.createWriteStream(localPath)
      );
    }
  }
}
```

## Testing Features

### Protocol Testing Suite
```javascript
// Comprehensive protocol testing including S3
class ProtocolTestSuite {
  async testFTP(config) {
    const tests = [
      this.testConnection,
      this.testAuthentication,
      this.testFileUpload,
      this.testLargeFile,
      this.testMultipleFiles,
      this.testERNProcessing
    ];
    
    const results = [];
    for (const test of tests) {
      results.push(await test('FTP', config));
    }
    
    return {
      protocol: 'FTP',
      success: results.every(r => r.passed),
      results
    };
  }
  
  async testSFTP(config) {
    // Similar tests for SFTP
  }
  
  async testS3(config) {
    const tests = [
      this.testBucketAccess,
      this.testObjectUpload,
      this.testLambdaTrigger,
      this.testLargeFileUpload,
      this.testMultipartUpload,
      this.testSignedUrlGeneration,
      this.testEventProcessing,
      this.testErrorHandling
    ];
    
    const results = [];
    for (const test of tests) {
      results.push(await test('S3', config));
    }
    
    return {
      protocol: 'S3',
      success: results.every(r => r.passed),
      results
    };
  }
  
  async testGCS(config) {
    // Similar tests for GCS
  }
  
  // S3-specific test methods
  async testLambdaTrigger(protocol, config) {
    // Upload test file
    const testKey = `${config.prefix}test-${Date.now()}.xml`;
    await this.uploadTestFile(config.bucket, testKey);
    
    // Wait for Lambda execution
    await this.waitForProcessing(5000);
    
    // Check if file was processed
    const processed = await this.checkProcessedFolder(config.bucket, testKey);
    
    return {
      test: 'Lambda Trigger',
      passed: processed,
      details: processed ? 'Lambda triggered successfully' : 'Lambda did not process file'
    };
  }
  
  async testMultipartUpload(protocol, config) {
    const largeFile = this.generateLargeTestFile(100); // 100MB
    
    const upload = new Upload({
      client: new S3Client({ region: config.region }),
      params: {
        Bucket: config.bucket,
        Key: `${config.prefix}large-test.wav`,
        Body: largeFile
      },
      partSize: 10 * 1024 * 1024, // 10MB parts
      queueSize: 4
    });
    
    const result = await upload.done();
    
    return {
      test: 'Multipart Upload',
      passed: result.$metadata.httpStatusCode === 200,
      details: `Uploaded ${largeFile.size} bytes in ${upload.totalParts} parts`
    };
  }
}
```

### Integration with DDEX Distro
```javascript
// Seamless testing between Distro and DSP with S3
class DistroIntegrationTest {
  async testEndToEnd() {
    // 1. Create test release in DDEX Distro
    const release = await this.createTestRelease();
    
    // 2. Test each protocol
    const protocols = ['FTP', 'SFTP', 'S3', 'GCS'];
    const results = {};
    
    for (const protocol of protocols) {
      // Configure delivery in Distro
      await this.configureDistroDelivery(protocol);
      
      // Protocol-specific configuration
      if (protocol === 'S3') {
        await this.configureS3Delivery({
          bucket: 'test-dsp-deliveries',
          region: 'us-east-1',
          credentials: await this.getTestS3Credentials()
        });
      }
      
      // Send delivery
      const delivery = await this.sendDelivery(release, protocol);
      
      // Monitor reception in DSP
      const reception = await this.monitorReception(delivery.id);
      
      // Verify processing
      const processed = await this.verifyProcessing(release.id);
      
      results[protocol] = {
        sent: delivery.success,
        received: reception.success,
        processed: processed.success,
        time: processed.processingTime
      };
    }
    
    return results;
  }
}
```

## Lambda Deployment

### Serverless Configuration
```yaml
# lambda/s3-ingestion/serverless.yml
service: ddex-dsp-s3-ingestion

provider:
  name: aws
  runtime: nodejs18.x
  region: ${opt:region, 'us-east-1'}
  
  environment:
    FIREBASE_PROJECT_ID: ${env:FIREBASE_PROJECT_ID}
    FIREBASE_SERVICE_ACCOUNT: ${env:FIREBASE_SERVICE_ACCOUNT}
    WORKBENCH_API_KEY: ${env:WORKBENCH_API_KEY}
  
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:GetObject
        - s3:DeleteObject
        - s3:PutObject
      Resource:
        - arn:aws:s3:::*-deliveries/*
    - Effect: Allow
      Action:
        - secretsmanager:GetSecretValue
      Resource:
        - arn:aws:secretsmanager:*:*:secret:ddex-dsp-*

functions:
  processDelivery:
    handler: index.handler
    timeout: 300 # 5 minutes
    memorySize: 1024
    events:
      - s3:
          bucket: ${opt:bucket}
          event: s3:ObjectCreated:*
          rules:
            - prefix: deliveries/
            - suffix: .xml
          existing: true

plugins:
  - serverless-plugin-optimize
  - serverless-offline

custom:
  optimize:
    external: ['firebase-admin']
```

### Lambda Deployment Script
```javascript
// scripts/deploy-lambda.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployLambda(config) {
  console.log('🚀 Deploying S3 Lambda function...');
  
  // 1. Prepare Lambda package
  const lambdaDir = path.join(__dirname, '../lambda/s3-ingestion');
  process.chdir(lambdaDir);
  
  // 2. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --production', { stdio: 'inherit' });
  
  // 3. Deploy with Serverless
  console.log('⚡ Deploying with Serverless Framework...');
  execSync(`serverless deploy --stage ${config.stage} --region ${config.region} --bucket ${config.bucket}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      FIREBASE_PROJECT_ID: config.firebaseProjectId,
      WORKBENCH_API_KEY: config.workbenchApiKey
    }
  });
  
  // 4. Get Lambda ARN
  const info = JSON.parse(
    execSync('serverless info --json', { encoding: 'utf8' })
  );
  
  const lambdaArn = info.functions[0].arn;
  console.log(`✅ Lambda deployed: ${lambdaArn}`);
  
  // 5. Update Firestore with Lambda ARN
  await updateFirestoreConfig(config.feedId, lambdaArn);
  
  return { lambdaArn };
}

module.exports = { deployLambda };
```

## Implementation Roadmap (Updated)

### Phase 1: Foundation (Weeks 1-4)
- [ ] Create CLI scaffolding tool
- [ ] Set up package structure
- [ ] Design Firestore schema with delivery feeds
- [ ] Implement unified auth
- [ ] Create base UI components
- [ ] Setup Firebase project template

### Phase 2: Multi-Protocol Ingestion (Weeks 5-8)
- [ ] Build FTP server implementation
- [ ] Build SFTP server with SSH key support
- [ ] **Implement S3 listener with Lambda**
- [ ] **Create S3 bucket configuration tools**
- [ ] **Build Lambda deployment pipeline**
- [ ] Implement GCS listeners
- [ ] Create unified processing pipeline
- [ ] Build delivery feed management API
- [ ] Implement credential storage
- [ ] Add protocol testing framework

### Phase 3: Configuration UI (Weeks 9-10)
- [ ] Build delivery configuration interface
- [ ] Create protocol selection wizard
- [ ] **Add S3 configuration UI**
- [ ] **Implement Lambda setup wizard**
- [ ] **Add IAM role configuration helper**
- [ ] Implement credential generation
- [ ] Add test delivery functionality
- [ ] Build monitoring dashboard
- [ ] Create activity feed

### Phase 4: Core Streaming (Weeks 11-14)
- [ ] Implement catalog structure
- [ ] Build streaming API
- [ ] Add HLS/DASH support
- [ ] Create web player
- [ ] Implement basic search
- [ ] Add user library

### Phase 5: Testing & Optimization (Weeks 15-16)
- [ ] **S3 integration testing**
- [ ] **Lambda performance optimization**
- [ ] **Multi-region S3 testing**
- [ ] Protocol comparison benchmarks
- [ ] Load testing with all protocols

### Phase 6: Analytics & Reporting (Weeks 17-20)
- [ ] Implement play tracking
- [ ] Build analytics dashboard
- [ ] Create DSR generator
- [ ] Add usage reports
- [ ] **S3 cost analysis tools**
- [ ] Implement billing integration
- [ ] Add admin panel

### Phase 7: Advanced Features (Weeks 21-24)
- [ ] Add recommendation engine
- [ ] Implement offline playback
- [ ] Add podcast support
- [ ] Create artist tools
- [ ] Build mobile apps
- [ ] Add live streaming

### Phase 8: Testing & Launch (Weeks 25-28)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Demo deployment
- [ ] npm publication

## Success Metrics

### Protocol Performance Targets
- **FTP Transfer Speed**: >10MB/s
- **SFTP Transfer Speed**: >8MB/s
- **S3 Transfer Speed**: >100MB/s (leveraging AWS backbone)
- **GCS Transfer Speed**: >50MB/s
- **Protocol Switching**: <5 seconds
- **Concurrent Feeds**: Support 100+ active feeds
- **Lambda Cold Start**: <2 seconds
- **Lambda Processing Time**: <10 seconds for typical ERN

### Testing Metrics
- **Protocol Coverage**: 100% of protocols testable
- **Test Execution**: <30 seconds per protocol
- **Integration Success**: 95%+ with DDEX Distro
- **S3 Reliability**: 99.99% (AWS SLA)

## Cost Considerations

### S3 Cost Optimization
```javascript
// S3 lifecycle rules for cost optimization
const lifecycleRules = {
  transitions: [
    {
      days: 30,
      storageClass: 'STANDARD_IA' // Infrequent Access
    },
    {
      days: 90,
      storageClass: 'GLACIER_IR' // Glacier Instant Retrieval
    }
  ],
  expiration: {
    days: 365 // Delete after 1 year
  },
  noncurrentVersionExpiration: {
    days: 7 // Delete old versions after 7 days
  }
};

// Lambda cost monitoring
const costMonitor = {
  estimateMonthlyCost: (invocations, avgDuration, memorySize) => {
    const requests = invocations * 0.0000002; // $0.20 per 1M requests
    const compute = invocations * (avgDuration / 1000) * (memorySize / 1024) * 0.0000166667;
    return { requests, compute, total: requests + compute };
  }
};
```

## Future Enhancements

### Advanced S3 Features (v2.0)
1. **S3 Intelligent-Tiering**: Automatic storage class optimization
2. **S3 Batch Operations**: Bulk processing of historical deliveries
3. **S3 Event Notifications**: SNS/SQS integration for complex workflows
4. **Cross-Region Replication**: Global delivery support
5. **S3 Object Lock**: Compliance mode for regulatory requirements

### Platform Extensions
1. **CloudFront Integration**: CDN for global streaming
2. **AWS Elemental MediaConvert**: Adaptive bitrate encoding
3. **Amazon Rekognition**: Content moderation
4. **AWS Step Functions**: Complex workflow orchestration
5. **Amazon EventBridge**: Event-driven architecture

## Technical Considerations

### S3-Specific Optimizations
```javascript
// S3 Transfer Acceleration
const acceleratedUpload = {
  endpoint: 'https://my-bucket.s3-accelerate.amazonaws.com',
  benefits: [
    'Up to 50% faster uploads',
    'Optimized routing',
    'Edge location uploads'
  ]
};

// Multipart upload optimization
const multipartConfig = {
  partSize: 10 * 1024 * 1024, // 10MB parts
  queueSize: 4, // Parallel parts
  leavePartsOnError: false,
  tags: {
    'delivery-feed': feedId,
    'content-type': 'ddex-ern'
  }
};
```

### Monitoring
```javascript
// Comprehensive monitoring including S3/Lambda
import { monitor } from '@ddex/monitoring';

monitor.track('ingestion', {
  protocol: 's3',
  success: ingestSuccess,
  duration: processingTime,
  lambdaDuration: context.getRemainingTimeInMillis(),
  memoryUsed: process.memoryUsage().heapUsed,
  releaseId,
  sender
});

monitor.alert('lambda-errors', {
  threshold: 10,
  window: '5m',
  action: 'page-oncall'
});

monitor.cost('s3-usage', {
  requests: s3RequestCount,
  storage: s3StorageGB,
  transfer: s3TransferGB
});
```

## Getting Started

### Quick Start
```bash
# Install CLI
npm install -g @ddex/dsp-cli

# Create your streaming platform with S3 support
ddex-dsp create my-platform --template=streaming --protocols=s3,ftp,sftp

# Deploy with S3 configuration
cd my-platform
ddex-dsp s3 setup        # Interactive S3 setup
ddex-dsp deploy           # Deploy platform and Lambda

# Your DSP is live with S3 support! 🎵
```

### Test S3 Delivery with DDEX Distro
```bash
# Configure S3 delivery in DDEX Distro
ddex-distro delivery configure \
  --protocol=s3 \
  --bucket=my-dsp-deliveries \
  --region=us-east-1 \
  --credentials=~/.aws/credentials

# Send test delivery to S3
ddex-distro deliver \
  --protocol=s3 \
  --release=test-album

# Monitor in DSP
ddex-dsp deliveries list --protocol=s3
ddex-dsp lambda logs --tail
```

### Next Steps
1. Configure your brand
2. Set up S3 buckets and Lambda functions
3. Test with multiple protocols
4. Customize the interface
5. Launch to the world

The future of music streaming is open, compliant, and yours to build - now with the power and scale of Amazon S3.