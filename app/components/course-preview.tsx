// /app/components/course-preview.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CoursePreviewProps {
  courseId: number;
  scormUrl: string;
  onValidationComplete: (isValid: boolean) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    title?: string;
    duration?: number;
    objectives?: string[];
    prerequisites?: string[];
  };
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ 
  courseId, 
  scormUrl, 
  onValidationComplete 
}) => {
  const [validating, setValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [previewMode, setPreviewMode] = useState<'metadata' | 'content'>('metadata');

  useEffect(() => {
    validateScormPackage();
  }, [courseId, scormUrl]);

  const validateScormPackage = async () => {
    try {
      setValidating(true);
      const response = await fetch(`/api/courses/${courseId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scormUrl })
      });

      if (!response.ok) throw new Error('Validation failed');

      const result: ValidationResult = await response.json();
      setValidationResult(result);
      onValidationComplete(result.isValid);
    } catch (err) {
      setValidationResult({
        isValid: false,
        errors: [(err as Error).message]
      });
      onValidationComplete(false);
    } finally {
      setValidating(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600">Validating SCORM package...</p>
      </div>
    );
  }

  if (!validationResult) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to validate course</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {validationResult.isValid ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>SCORM package is valid</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>SCORM package validation failed:</div>
            <ul className="list-disc list-inside mt-2">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setPreviewMode('metadata')}
            className={`py-4 px-1 border-b-2 font-medium text-sm
              ${previewMode === 'metadata'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setPreviewMode('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm
              ${previewMode === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Preview Content
          </button>
        </nav>
      </div>

      {/* Preview Content */}
      {previewMode === 'metadata' && validationResult.metadata && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Title</h3>
            <p className="mt-1">{validationResult.metadata.title}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
            <p className="mt-1">{validationResult.metadata.duration} minutes</p>
          </div>
          {validationResult.metadata.objectives && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Learning Objectives</h3>
              <ul className="mt-1 list-disc list-inside">
                {validationResult.metadata.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
          {validationResult.metadata.prerequisites && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Prerequisites</h3>
              <ul className="mt-1 list-disc list-inside">
                {validationResult.metadata.prerequisites.map((prerequisite, index) => (
                  <li key={index}>{prerequisite}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {previewMode === 'content' && validationResult.isValid && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <iframe
            src={scormUrl}
            className="w-full h-[600px] border-none"
            title="Course Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default CoursePreview;