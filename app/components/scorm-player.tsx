// /app/components/scorm-player.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface ScormPlayerProps {
  courseId: number;
}

interface CourseData {
  id: number;
  title: string;
  scorm_package_url: string;
  current_progress: number;
}

interface ScormAPI {
  Initialize: () => string;
  Terminate: () => string;
  GetValue: (element: string) => string;
  SetValue: (element: string, value: string) => string;
  Commit: () => string;
  GetLastError: () => string;
  GetErrorString: (errorCode: string) => string;
  GetDiagnostic: (errorCode: string) => string;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({ courseId }) => {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const scormAPIRef = useRef<ScormAPI | null>(null);

  useEffect(() => {
    const initScormAPI = () => {
      scormAPIRef.current = {
        Initialize: () => "true",
        Terminate: () => "true",
        GetValue: (element: string) => {
          switch(element) {
            case "cmi.core.lesson_status":
              return progress === 100 ? "completed" : "incomplete";
            case "cmi.core.score.raw":
              return progress.toString();
            default:
              return "";
          }
        },
        SetValue: (element: string, value: string) => {
          switch(element) {
            case "cmi.core.lesson_status":
              if (value === "completed") {
                handleCompletion();
              }
              return "true";
            case "cmi.core.score.raw":
              updateProgress(parseInt(value));
              return "true";
            default:
              return "true";
          }
        },
        Commit: () => "true",
        GetLastError: () => "0",
        GetErrorString: () => "No error",
        GetDiagnostic: () => "No diagnostic info"
      };

      // Make API available to iframe content
      (window as any).API = scormAPIRef.current;
    };

    initScormAPI();
    fetchCourse();

    return () => {
      if (scormAPIRef.current) {
        scormAPIRef.current.Terminate();
        delete (window as any).API;
      }
    };
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/content`);
      if (!response.ok) throw new Error('Failed to load course content');
      
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/content`)
        if (!response.ok) throw new Error('Failed to fetch course details')
        const data = await response.json()
        setCourse(data)
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Failed to load course')
      }
    }
    fetchCourseDetails()
  }, [courseId])

  const updateProgress = async (value: number) => {
    try {
      const progressValue = Math.min(Math.max(value, 0), 100);
      setProgress(progressValue);

      await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: progressValue,
          scormData: {
            score: value,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleCompletion = async () => {
    try {
      await fetch(`/api/courses/${courseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setProgress(100);
    } catch (err) {
      console.error('Failed to mark course as complete:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  if (error) {
    return <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>;
  }

  if (!course) {
    return <Alert variant="destructive">
      <AlertDescription>Course not found</AlertDescription>
    </Alert>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">{course.title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {progress === 100 && (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            <div className="bg-gray-200 rounded-full h-2 w-48">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-100">
      <iframe
    src={course?.scorm_package_url}
    className="w-full h-full border-none"
    title="SCORM Content"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
  />
      </div>
    </div>
  );
};

export default ScormPlayer;