import CloudflareSettings from '@/components/CloudflareSettings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">설정</h1>
        <CloudflareSettings />
      </div>
    </div>
  );
}