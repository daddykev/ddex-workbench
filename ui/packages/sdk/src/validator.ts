// packages/sdk/src/validator.ts
import { DDEXClient } from "./client";
import {
  ValidationResult,
  ValidationOptions,
  ValidationErrorDetail,
  ERNVersion,
  ERNProfile,
  PassedRule,
  SVRLStatistics,
  ValidationSummary,
  BatchValidationOptions,
  BatchValidationResult,
} from "./types";
import { warnDeprecated } from "./deprecation";


/**
 * DDEX Validator - High-level validation helper
 *
 * @example
 * ```typescript
 * const validator = client.validator;
 * 
 * // Auto-detect version
 * const version = validator.detectVersion(xmlContent);
 * 
 * // Validate with SVRL
 * const result = await validator.validateWithSVRL(xmlContent, {
 *   version: '4.3',
 *   profile: 'AudioAlbum'
 * });
 * ```
 */
export class DDEXValidator {
  constructor(private readonly client: DDEXClient) {}

  /**
   * Validate with automatic version detection
   *
   * @param content - XML content
   * @param profile - Optional profile
   * @returns Validation result
   */
  async validateAuto(
    content: string,
    profile?: ERNProfile,
  ): Promise<ValidationResult> {
    const version = this.detectVersion(content);
    if (!version) {
      throw new Error("Could not detect ERN version from XML content");
    }

    return this.client.validate(content, { version, profile });
  }

  /**
   * Validate with SVRL report generation
   *
   * @param content - XML content
   * @param options - Validation options
   * @returns Validation result with SVRL
   */
  async validateWithSVRL(
    content: string,
    options: ValidationOptions,
  ): Promise<ValidationResult> {
    return this.client.validateWithSVRL(content, options);
  }

  /**
   * Validate multiple files in batch
   *
   * @param items - Array of content and options
   * @param batchOptions - Batch processing options
   * @returns Batch validation results
   */
  async validateBatch(
    items: Array<{ content: string; options: ValidationOptions }>,
    batchOptions?: BatchValidationOptions,
  ): Promise<BatchValidationResult> {
    return this.client.validateBatch(items, batchOptions);
  }

  /**
   * Check if content is valid (simplified check)
   *
   * @param content - XML content
   * @param options - Validation options
   * @returns Boolean indicating validity
   */
  async isValid(
    content: string,
    options: ValidationOptions,
  ): Promise<boolean> {
    const result = await this.client.validate(content, options);
    return result.valid;
  }

  /**
   * Get only errors (no warnings)
   *
   * @param content - XML content
   * @param options - Validation options
   * @returns Array of errors
   */
  async getErrors(
    content: string,
    options: ValidationOptions,
  ): Promise<ValidationErrorDetail[]> {
    const result = await this.client.validate(content, options);
    return result.errors;
  }

  /**
   * Get only critical errors (severity: error or fatal)
   *
   * @param result - Validation result
   * @returns Array of critical errors
   */
  getCriticalErrors(result: ValidationResult): ValidationErrorDetail[] {
    return result.errors.filter(
      (error) => error.severity === "error" || error.severity === "fatal",
    );
  }

  /**
   * Get only schematron-specific errors
   *
   * @param result - Validation result
   * @returns Array of schematron errors
   */
  getSchematronErrors(result: ValidationResult): ValidationErrorDetail[] {
    return result.errors.filter(
      (error) => error.rule && error.rule.startsWith("Schematron-"),
    );
  }

  /**
   * Get only XSD schema errors
   *
   * @param result - Validation result
   * @returns Array of XSD errors
   */
  getXSDErrors(result: ValidationResult): ValidationErrorDetail[] {
    return result.errors.filter(
      (error) => error.rule && (error.rule.startsWith("XSD-") || error.rule === "XSD"),
    );
  }

  /**
   * Get only business rule errors
   *
   * @param result - Validation result
   * @returns Array of business rule errors
   */
  getBusinessRuleErrors(result: ValidationResult): ValidationErrorDetail[] {
    return result.errors.filter(
      (error) => error.rule && error.rule.startsWith("BusinessRule-"),
    );
  }

  /**
   * Parse SVRL report to extract statistics
   *
   * @param svrl - SVRL XML string
   * @returns SVRL statistics
   */
  parseSVRL(svrl: string): SVRLStatistics {
    // Count failed-assert elements by their role attribute. The API's SVRL
    // has no successful-report elements, so those aren't used.
    const failedAsserts = svrl.match(/<svrl:failed-assert\b[^>]*>/g) || [];
    let failures = 0;
    let warnings = 0;
    for (const tag of failedAsserts) {
      const role = (tag.match(/\brole="([^"]*)"/)?.[1] || "error").toLowerCase();
      if (role === "warning" || role === "info") {
        warnings++;
      } else {
        failures++;
      }
    }
    const assertions = failedAsserts.length;
    const firedRules = (svrl.match(/<svrl:fired-rule\b/g) || []).length;

    // Extract profile and schema version if present
    const profileMatch = svrl.match(/profile="([^"]+)"/);
    const schemaMatch = svrl.match(/schemaVersion="([^"]+)"/);

    return {
      assertions,
      failures,
      warnings,
      firedRules,
      profile: profileMatch ? profileMatch[1] : undefined,
      schemaVersion: schemaMatch ? schemaMatch[1] : undefined,
    };
  }

  /**
   * Get profile compliance report
   *
   * @deprecated The API doesn't return passed rules, so `passedRules` is
   * always 0 and `complianceRate` is always 0%. Use `client.validate()` with a
   * profile and check `valid`, `errors` and `warnings` instead. Will be removed in 2.0.
   *
   * @param content - XML content
   * @param version - ERN version
   * @param profile - ERN profile
   * @returns Detailed compliance report
   */
  async getProfileCompliance(
    content: string,
    version: ERNVersion,
    profile: ERNProfile,
  ): Promise<{
    compliant: boolean;
    profile: string;
    version: string;
    errors: number;
    warnings: number;
    passedRules: number;
    failedRules: number;
    complianceRate: number;
    svrlAvailable: boolean;
    details?: PassedRule[];
  }> {
    warnDeprecated(
      "getProfileCompliance()",
      "passedRules and complianceRate are always 0 because the API doesn't return passed rules. It will be removed in 2.0.",
    );

    const result = await this.client.validate(content, {
      version,
      profile,
      generateSVRL: true,
    });

    const passedRulesCount = result.passedRules?.length || 0;
    const failedRulesCount = result.errors.filter(
      (e) => e.rule && e.rule.startsWith("Schematron-"),
    ).length;
    const totalRules = passedRulesCount + failedRulesCount;
    const complianceRate = totalRules > 0 
      ? (passedRulesCount / totalRules) * 100 
      : 0;

    return {
      compliant: result.valid,
      profile,
      version,
      errors: result.errors.length,
      warnings: result.warnings.length,
      passedRules: passedRulesCount,
      failedRules: failedRulesCount,
      complianceRate: Math.round(complianceRate * 100) / 100,
      svrlAvailable: result.svrl !== undefined,
      details: result.passedRules,
    };
  }

  /**
   * Generate validation summary
   *
   * @deprecated The API doesn't return passed rules, so `passedRules` is
   * always 0 and `complianceRate` is always 0%. Use `result.valid`,
   * `getXSDErrors()` and `getSchematronErrors()` instead. Will be removed in 2.0.
   *
   * @param result - Validation result
   * @returns Validation summary
   */
  generateSummary(result: ValidationResult): ValidationSummary {
    warnDeprecated(
      "generateSummary()",
      "passedRules and complianceRate are always 0 because the API doesn't return passed rules. It will be removed in 2.0.",
    );
    const passedRules = result.passedRules?.length || 0;
    const failedRules = result.errors.filter((e) => e.rule).length;
    const totalRules = passedRules + failedRules;
    const complianceRate = totalRules > 0 
      ? (passedRules / totalRules) * 100 
      : 0;

    const schemaErrors = this.getXSDErrors(result).length;
    const schematronErrors = this.getSchematronErrors(result).length;

    return {
      totalRules,
      passedRules,
      failedRules,
      complianceRate: Math.round(complianceRate * 100) / 100,
      profileCompliant: schematronErrors === 0,
      schemaCompliant: schemaErrors === 0,
    };
  }

  /**
   * Format validation errors for display
   *
   * @param errors - Array of errors
   * @param options - Formatting options
   * @returns Formatted error string
   */
  formatErrors(
    errors: ValidationErrorDetail[],
    options: {
      includeContext?: boolean;
      includeSuggestions?: boolean;
      groupByRule?: boolean;
      maxErrors?: number;
    } = {},
  ): string {
    const errorsToShow = options.maxErrors 
      ? errors.slice(0, options.maxErrors)
      : errors;

    if (options.groupByRule) {
      const grouped = this.groupErrorsByRule(errorsToShow);
      return Object.entries(grouped)
        .map(([rule, ruleErrors]) => {
          const errorList = ruleErrors
            .map((e) => this.formatSingleError(e, options))
            .join("\n  ");
          return `${rule} (${ruleErrors.length} errors):\n  ${errorList}`;
        })
        .join("\n\n");
    }

    return errorsToShow
      .map((e) => this.formatSingleError(e, options))
      .join("\n");
  }

  /**
   * Format a single error
   */
  private formatSingleError(
    error: ValidationErrorDetail,
    options: {
      includeContext?: boolean;
      includeSuggestions?: boolean;
    },
  ): string {
    let formatted = `Line ${error.line}:${error.column} - ${error.message}`;
    
    if (options.includeContext && error.context) {
      formatted += ` (Context: ${error.context})`;
    }
    
    if (options.includeSuggestions && error.suggestion) {
      formatted += `\n    Suggestion: ${error.suggestion}`;
    }
    
    return formatted;
  }

  /**
   * Group errors by rule
   */
  private groupErrorsByRule(
    errors: ValidationErrorDetail[],
  ): Record<string, ValidationErrorDetail[]> {
    return errors.reduce((acc, error) => {
      const rule = error.rule || "Unknown";
      if (!acc[rule]) {
        acc[rule] = [];
      }
      acc[rule].push(error);
      return acc;
    }, {} as Record<string, ValidationErrorDetail[]>);
  }

  /**
   * Detect ERN version from XML content
   *
   * @param content - XML content
   * @returns Detected version or null
   */
  detectVersion(content: string): ERNVersion | null {
    // Check for ERN 4.3
    if (
      content.includes('xmlns:ern="http://ddex.net/xml/ern/43"') ||
      content.includes('MessageSchemaVersionId="ern/43"') ||
      content.includes('/ern/43')
    ) {
      return "4.3";
    }

    // Check for ERN 4.2
    if (
      content.includes('xmlns:ern="http://ddex.net/xml/ern/42"') ||
      content.includes('MessageSchemaVersionId="ern/42"') ||
      content.includes('/ern/42')
    ) {
      return "4.2";
    }

    // Check for ERN 3.8.3 (before 3.8.2, so "383" is never caught by a looser check)
    if (
      content.includes('xmlns:ern="http://ddex.net/xml/ern/383"') ||
      content.includes('MessageSchemaVersionId="ern/383"') ||
      content.includes('/ern/383') ||
      content.includes('xmlns:ernm="http://ddex.net/xml/ern/383"')
    ) {
      return "3.8.3";
    }

    // Check for ERN 3.8.2
    if (
      content.includes('xmlns:ern="http://ddex.net/xml/ern/382"') ||
      content.includes('MessageSchemaVersionId="ern/382"') ||
      content.includes('/ern/382') ||
      content.includes('xmlns:ernm="http://ddex.net/xml/ern/382"')
    ) {
      return "3.8.2";
    }

    // Legacy version detection
    if (content.includes('xmlns:ern="http://ddex.net/xml/ern/38"')) {
      return "3.8.2";
    }

    return null;
  }

  /**
   * Detect profile from XML content
   *
   * @param content - XML content
   * @returns Detected profile or null
   */
  detectProfile(content: string): ERNProfile | null {
    const profilePatterns: Record<ERNProfile, RegExp[]> = {
      AudioAlbum: [
        /ReleaseProfileVersionId="[^"]*AudioAlbum/i,
        /Profile[^>]*AudioAlbum/i,
      ],
      AudioSingle: [
        /ReleaseProfileVersionId="[^"]*AudioSingle/i,
        /Profile[^>]*AudioSingle/i,
      ],
      Video: [
        /ReleaseProfileVersionId="[^"]*Video/i,
        /Profile[^>]*Video/i,
      ],
      Mixed: [
        /ReleaseProfileVersionId="[^"]*Mixed/i,
        /Profile[^>]*Mixed/i,
      ],
      ReleaseByRelease: [
        /ReleaseProfileVersionId="[^"]*ReleaseByRelease/i,
        /Profile[^>]*ReleaseByRelease/i,
      ],
    };

    for (const [profile, patterns] of Object.entries(profilePatterns)) {
      if (patterns.some((pattern) => pattern.test(content))) {
        return profile as ERNProfile;
      }
    }

    return null;
  }

  /**
   * Extract metadata from XML content
   *
   * @param content - XML content
   * @returns Extracted metadata
   */
  extractMetadata(content: string): {
    version?: ERNVersion;
    profile?: ERNProfile;
    messageId?: string;
    createdDate?: string;
    releaseCount?: number;
  } {
    const metadata: ReturnType<typeof this.extractMetadata> = {};

    // Detect version and profile
    metadata.version = this.detectVersion(content) || undefined;
    metadata.profile = this.detectProfile(content) || undefined;

    // Extract MessageId
    const messageIdMatch = content.match(/MessageId>([^<]+)</);
    if (messageIdMatch) {
      metadata.messageId = messageIdMatch[1];
    }

    // Extract CreatedDate
    const createdDateMatch = content.match(/MessageCreatedDateTime>([^<]+)</);
    if (createdDateMatch) {
      metadata.createdDate = createdDateMatch[1];
    }

    // Count releases
    const releaseMatches = content.match(/<Release[^>]*>/g);
    if (releaseMatches) {
      metadata.releaseCount = releaseMatches.length;
    }

    return metadata;
  }
}