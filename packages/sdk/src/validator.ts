// packages/sdk/src/validator.ts
import { DDEXClient } from './client';
import { 
  ValidationResult, 
  ValidationOptions,
  ValidationErrorDetail,
  ERNVersion,
  ERNProfile
} from './types';

/**
 * High-level validation helper
 */
export class DDEXValidator {
  constructor(private client: DDEXClient) {}

  /**
   * Validate ERN 4.3 content
   */
  async validateERN43(
    content: string,
    profile?: ERNProfile
  ): Promise<ValidationResult> {
    return this.client.validate(content, {
      type: 'ERN',
      version: '4.3',
      profile
    });
  }

  /**
   * Validate ERN 4.2 content
   */
  async validateERN42(
    content: string,
    profile?: ERNProfile
  ): Promise<ValidationResult> {
    return this.client.validate(content, {
      type: 'ERN',
      version: '4.2',
      profile
    });
  }

  /**
   * Validate ERN 3.8.2 content
   */
  async validateERN382(
    content: string,
    profile?: ERNProfile
  ): Promise<ValidationResult> {
    return this.client.validate(content, {
      type: 'ERN',
      version: '3.8.2',
      profile
    });
  }

  /**
   * Auto-detect ERN version and validate
   */
  async validateAuto(content: string): Promise<ValidationResult> {
    const version = this.detectVersion(content);
    
    if (!version) {
      return {
        valid: false,
        errors: [{
          line: 0,
          column: 0,
          message: 'Unable to detect ERN version from XML content',
          severity: 'error',
          rule: 'Version-Detection'
        }],
        warnings: [],
        metadata: {
          processingTime: 0,
          schemaVersion: 'unknown',
          validatedAt: new Date().toISOString(),
          errorCount: 1,
          warningCount: 0,
          validationSteps: []
        }
      };
    }

    return this.client.validate(content, {
      type: 'ERN',
      version
    });
  }

  /**
   * Batch validate multiple files
   */
  async validateBatch(
    items: Array<{ content: string; options: ValidationOptions }>
  ): Promise<ValidationResult[]> {
    const results = await Promise.allSettled(
      items.map(item => this.client.validate(item.content, item.options))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      
      // Return error result for failed validations
      return {
        valid: false,
        errors: [{
          line: 0,
          column: 0,
          message: `Validation failed: ${result.reason.message}`,
          severity: 'error' as const,
          rule: 'Batch-Validation'
        }],
        warnings: [],
        metadata: {
          processingTime: 0,
          schemaVersion: items[index].options.version,
          validatedAt: new Date().toISOString(),
          errorCount: 1,
          warningCount: 0,
          validationSteps: []
        }
      };
    });
  }

  /**
   * Check if content is valid (simplified check)
   */
  async isValid(content: string, options: ValidationOptions): Promise<boolean> {
    const result = await this.client.validate(content, options);
    return result.valid;
  }

  /**
   * Get only errors (no warnings)
   */
  async getErrors(
    content: string,
    options: ValidationOptions
  ): Promise<ValidationErrorDetail[]> {
    const result = await this.client.validate(content, options);
    return result.errors;
  }

  /**
   * Detect ERN version from XML content
   */
  detectVersion(content: string): ERNVersion | null {
    // Check for ERN 4.3
    if (content.includes('xmlns:ern="http://ddex.net/xml/ern/43"') ||
        content.includes('MessageSchemaVersionId="ern/43"')) {
      return '4.3';
    }
    
    // Check for ERN 4.2
    if (content.includes('xmlns:ern="http://ddex.net/xml/ern/42"') ||
        content.includes('MessageSchemaVersionId="ern/42"')) {
      return '4.2';
    }
    
    // Check for ERN 3.8.2
    if (content.includes('xmlns:ern="http://ddex.net/xml/ern/382"') ||
        content.includes('MessageSchemaVersionId="ern/382"')) {
      return '3.8.2';
    }

    return null;
  }
}