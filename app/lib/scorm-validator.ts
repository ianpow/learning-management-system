// /app/lib/scorm-validator.ts
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

interface ScormMetadata {
  title?: string;
  duration?: number;
  objectives?: string[];
  prerequisites?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: ScormMetadata;
}

export class ScormValidator {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async validate(): Promise<ValidationResult> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Failed to fetch SCORM package');
      }

      const buffer = await response.arrayBuffer();
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(buffer);

      // Check for imsmanifest.xml
      const manifest = zipContent.file('imsmanifest.xml');
      if (!manifest) {
        return {
          isValid: false,
          errors: ['Missing imsmanifest.xml file']
        };
      }

      // Parse manifest
      const manifestContent = await manifest.async('text');
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      const manifestData = parser.parse(manifestContent);

      // Validate manifest structure
      const errors = this.validateManifestStructure(manifestData);
      if (errors.length > 0) {
        return {
          isValid: false,
          errors
        };
      }

      // Extract metadata
      const metadata = this.extractMetadata(manifestData);

      return {
        isValid: true,
        errors: [],
        metadata
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }

  private validateManifestStructure(manifest: any): string[] {
    const errors: string[] = [];

    if (!manifest.manifest) {
      errors.push('Invalid manifest structure');
      return errors;
    }

    const { manifest: scormManifest } = manifest;

    // Check organizations
    if (!scormManifest.organizations?.organization) {
      errors.push('Missing organizations section');
    }

    // Check resources
    if (!scormManifest.resources?.resource) {
      errors.push('Missing resources section');
    }

    // Check schema version
    if (!scormManifest['@_version']) {
      errors.push('Missing SCORM version');
    }

    return errors;
  }

  private extractMetadata(manifest: any): ScormMetadata {
    const metadata: ScormMetadata = {};
    const scormManifest = manifest.manifest;

    try {
      // Extract title
      metadata.title = scormManifest.organizations?.organization?.title || 
                      scormManifest.metadata?.lom?.general?.title?.string?.['#text'];

      // Extract duration if available
      const duration = scormManifest.metadata?.lom?.technical?.duration;
      if (duration) {
        metadata.duration = this.parseDuration(duration);
      }

      // Extract objectives
      const objectives = scormManifest.metadata?.lom?.educational?.learningObjectives;
      if (objectives) {
        metadata.objectives = Array.isArray(objectives) 
          ? objectives.map(obj => obj.string['#text'])
          : [objectives.string['#text']];
      }

      // Extract prerequisites
      const prerequisites = scormManifest.metadata?.lom?.educational?.prerequisites;
      if (prerequisites) {
        metadata.prerequisites = Array.isArray(prerequisites)
          ? prerequisites.map(pre => pre.string['#text'])
          : [prerequisites.string['#text']];
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }

    return metadata;
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (PT1H30M, etc.)
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return 0;

    const [_, hours, minutes, seconds] = matches;
    return (parseInt(hours || '0') * 60) +
           parseInt(minutes || '0') +
           Math.ceil(parseInt(seconds || '0') / 60);
  }
}