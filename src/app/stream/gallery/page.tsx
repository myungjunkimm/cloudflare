"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlayIcon, RefreshCwIcon, SearchIcon, GridIcon, ListIcon } from "lucide-react";

interface StreamVideo {
  id: string;
  status: string;
  pctComplete: number;
  meta: {
    name: string;
    created: string;
    modified: string;
    size: number;
    duration: number;
  };
  urls: {
    streamUrl: string;
    hlsUrl: string;
    dashUrl: string;
    thumbnailUrl: string;
    animatedThumbnailUrl: string;
    iframeUrl: string;
    thumbnailWebP?: string;
    preview?: string;
    altThumbnail?: string;
    altAnimated?: string;
  };
}

type ViewMode = 'grid' | 'list';

export default function StreamGalleryPage() {
  const [videos, setVideos] = useState<StreamVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedVideo, setSelectedVideo] = useState<StreamVideo | null>(null);

  // Simple iframe-based thumbnail
  const VideoThumbnail = ({ video, className }: { video: StreamVideo, className: string }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || video.status !== 'ready') {
      return (
        <div className={`${className} bg-gray-800 flex items-center justify-center`}>
          <div className="text-center text-white">
            <PlayIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              {video.status === 'ready' ? 'Loading...' : video.status}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-gray-900">
        <iframe
          src={`https://iframe.videodelivery.net/${video.id}`}
          className={className}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          style={{ pointerEvents: 'none' }}
          onLoad={() => console.log(`Iframe loaded for ${video.id}`)}
          onError={() => {
            console.error(`Iframe error for ${video.id}`);
            setHasError(true);
          }}
        />
        {/* Overlay to prevent interaction */}
        <div className="absolute inset-0 bg-transparent cursor-pointer" />
        {/* Status indicator */}
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          ▶️
        </div>
      </div>
    );
  };

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stream/list');
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (result.success) {
        setVideos(result.result);
        console.log(`Loaded ${result.result.length} videos`);
      } else {
        setError(`API Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError(`Fetch Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch('/api/stream/debug');
      const result = await response.json();
      setDebugInfo(result);
      console.log('Debug info:', result);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(video => 
    video.meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const readyVideos = filteredVideos.filter(video => video.status === 'ready');

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Video Gallery</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVideos}
            disabled={loading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDebugInfo}
            disabled={debugLoading}
          >
            {debugLoading ? 'Debugging...' : 'Debug Info'}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Badge variant="secondary">
          Total: {videos.length} videos
        </Badge>
        <Badge variant="default">
          Ready: {readyVideos.length} videos
        </Badge>
        
        {/* Debug info for first video */}
        {videos.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500">Debug URLs (first video)</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs space-y-1 max-w-4xl overflow-x-auto">
              <div><strong>ID:</strong> {videos[0].id}</div>
              <div><strong>Status:</strong> {videos[0].status}</div>
              <div><strong>Animated GIF:</strong> 
                <a href={videos[0].urls.animatedThumbnailUrl} target="_blank" className="text-blue-600 underline ml-2">
                  {videos[0].urls.animatedThumbnailUrl}
                </a>
              </div>
              <div><strong>Static JPG:</strong> 
                <a href={videos[0].urls.thumbnailUrl} target="_blank" className="text-blue-600 underline ml-2">
                  {videos[0].urls.thumbnailUrl}
                </a>
              </div>
              <div><strong>Alt Animated:</strong> 
                <a href={videos[0].urls.altAnimated} target="_blank" className="text-blue-600 underline ml-2">
                  {videos[0].urls.altAnimated}
                </a>
              </div>
              <div><strong>Alt Thumbnail:</strong> 
                <a href={videos[0].urls.altThumbnail} target="_blank" className="text-blue-600 underline ml-2">
                  {videos[0].urls.altThumbnail}
                </a>
              </div>
              <div className="pt-2">
                <strong>Alternative URLs to test:</strong>
                <div className="ml-4 space-y-1">
                  <div>
                    <a href={`https://iframe.videodelivery.net/${videos[0].id}/thumbnail.jpg`} target="_blank" className="text-blue-600 underline">
                      Iframe JPG
                    </a>
                  </div>
                  <div>
                    <a href={`https://iframe.videodelivery.net/${videos[0].id}/thumbnail.gif`} target="_blank" className="text-blue-600 underline">
                      Iframe GIF
                    </a>
                  </div>
                  <div>
                    <a href={`https://customer-${videos[0].id}.cloudflarestream.com/${videos[0].id}/thumbnails/thumbnail.gif`} target="_blank" className="text-purple-600 underline">
                      Customer subdomain GIF
                    </a>
                  </div>
                  <div>
                    <a href={`/api/stream/thumbnail/${videos[0].id}?type=gif&time=1s&duration=3s`} target="_blank" className="text-green-600 underline">
                      Proxy GIF (might 404)
                    </a>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <strong>Original URLs (likely 401):</strong>
                <div className="ml-4 space-y-1">
                  <div>
                    <a href={`https://videodelivery.net/${videos[0].id}/thumbnails/thumbnail.gif`} target="_blank" className="text-red-600 underline">
                      videodelivery.net GIF
                    </a>
                  </div>
                  <div>
                    <a href={`https://videodelivery.net/${videos[0].id}/thumbnails/thumbnail.jpg`} target="_blank" className="text-red-600 underline">
                      videodelivery.net JPG
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </details>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <details className="text-xs mb-4">
            <summary className="cursor-pointer text-gray-700 font-medium">🔍 Cloudflare Stream Debug Information</summary>
            <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-3 max-h-96 overflow-y-auto">
              <div><strong>Total Videos:</strong> {debugInfo.totalVideos}</div>
              <div><strong>Account ID:</strong> {debugInfo.accountInfo?.accountId}</div>
              
              {debugInfo.sampleVideos?.map((video: any, index: number) => (
                <div key={index} className="border-t pt-3">
                  <div className="font-medium mb-2">Video {index + 1}: {video.id}</div>
                  
                  {video.error ? (
                    <div className="text-red-600">Error: {video.error}</div>
                  ) : (
                    <>
                      <div><strong>Status:</strong> {video.status?.state || 'unknown'}</div>
                      <div><strong>Require Signed URLs:</strong> {video.requireSignedURLs ? 'Yes' : 'No'}</div>
                      <div><strong>Allowed Origins:</strong> {video.allowedOrigins ? JSON.stringify(video.allowedOrigins) : 'None'}</div>
                      
                      <div className="mt-2">
                        <strong>Thumbnail URL Tests:</strong>
                        <div className="ml-2 space-y-1">
                          {video.thumbnailTests?.map((test: any, testIndex: number) => (
                            <div key={testIndex} className={`${test.ok ? 'text-green-600' : 'text-red-600'}`}>
                              {test.ok ? '✅' : '❌'} {test.url} 
                              {test.status && ` (${test.status})`}
                              {test.error && ` - ${test.error}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {error && (
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <div className="text-red-700">
            <p className="text-lg mb-2">⚠️ Error Loading Videos</p>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVideos}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading videos...</p>
          </div>
        </div>
      ) : !error && filteredVideos.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <PlayIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg mb-2">No videos found</p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload some videos to get started'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div 
                    className="aspect-[9/16] bg-gray-900 relative group"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.status === 'ready' ? (
                      <VideoThumbnail 
                        video={video} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <PlayIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">{video.status}</p>
                          {video.status === 'inprogress' && (
                            <p className="text-xs">{video.pctComplete}%</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={video.status === 'ready' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {video.meta.name || 'Untitled'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mb-2">
                      ID: {video.id.substring(0, 8)}...
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatDuration(video.meta.duration)}</span>
                      <span>{formatFileSize(video.meta.size)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-20 h-36 bg-gray-900 rounded overflow-hidden flex-shrink-0 cursor-pointer relative group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {video.status === 'ready' ? (
                        <VideoThumbnail 
                          video={video} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <PlayIcon className="h-6 w-6 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <PlayIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {video.meta.name || 'Untitled'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {video.id}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Duration: {formatDuration(video.meta.duration)}</span>
                            <span>Size: {formatFileSize(video.meta.size)}</span>
                            <span>Created: {formatDate(video.meta.created)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={video.status === 'ready' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {video.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVideo(video)}
                            disabled={video.status !== 'ready'}
                          >
                            <PlayIcon className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedVideo.meta.name || 'Untitled'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="aspect-[9/16] bg-black rounded overflow-hidden mb-4">
                {selectedVideo.status === 'ready' ? (
                  <iframe
                    src={selectedVideo.urls.iframeUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <PlayIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Video not ready for playback</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>ID:</strong> {selectedVideo.id}</p>
                  <p><strong>Status:</strong> {selectedVideo.status}</p>
                  <p><strong>Duration:</strong> {formatDuration(selectedVideo.meta.duration)}</p>
                </div>
                <div>
                  <p><strong>Size:</strong> {formatFileSize(selectedVideo.meta.size)}</p>
                  <p><strong>Created:</strong> {formatDate(selectedVideo.meta.created)}</p>
                  <p><strong>Modified:</strong> {formatDate(selectedVideo.meta.modified)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}