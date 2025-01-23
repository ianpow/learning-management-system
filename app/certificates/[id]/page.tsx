import CertificateViewer from '@/components/certificate-viewer'

interface CertificatePageProps {
  params: {
    id: string
  }
}

export default function CertificatePage({ params }: CertificatePageProps) {
  return <CertificateViewer certificateId={params.id} />
}