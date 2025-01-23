// /app/components/certificate-viewer.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download } from 'lucide-react';

interface CertificateViewerProps {
  certificateId: string;
}

interface Certificate {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  course: {
    title: string;
  };
  issue_date: string;
  certificate_number: string;
}

const CertificateViewer = ({ certificateId }: CertificateViewerProps) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/certificates/${certificateId}`);
        if (!response.ok) throw new Error('Failed to load certificate');
        const data = await response.json();
        setCertificate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      if (!response.ok) throw new Error('Failed to download certificate');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  if (error) {
    return <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>;
  }

  if (!certificate) {
    return <Alert variant="destructive">
      <AlertDescription>Certificate not found</AlertDescription>
    </Alert>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Certificate of Completion</h1>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="inline-block h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>

        <div className="space-y-4">
          <p>This certifies that</p>
          <p className="text-2xl font-bold">
            {certificate.user.first_name} {certificate.user.last_name}
          </p>
          <p>has successfully completed the course</p>
          <p className="text-xl font-semibold">{certificate.course.title}</p>
          <p>on {new Date(certificate.issue_date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">
            Certificate Number: {certificate.certificate_number}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;