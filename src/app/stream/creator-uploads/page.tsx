export default function CreatorUploadsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Direct Creator Uploads</h1>
      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-gray-600 mb-4">
          Advanced upload features for content creators with enhanced controls.
        </p>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Direct upload to Cloudflare Stream</li>
            <li>Advanced video processing options</li>
            <li>Custom thumbnails and metadata</li>
            <li>Multiple quality streams</li>
            <li>Analytics and engagement metrics</li>
            <li>Live streaming capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}