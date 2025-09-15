"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaItem } from "@/types/review";
import { PlayIcon, DownloadIcon } from "lucide-react";

export default function BasicUploadsPage() {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  const handleFilesUploaded = (files: MediaItem[]) => {
    setUploadedMedia(files);
  };

  const videoFiles = uploadedMedia.filter(item => item.type === 'video');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Basic Video Uploads</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Your Videos</h2>
            <p className="text-gray-600 mb-4">
              Upload and manage your video content with basic features.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div>✓ Standard video upload functionality</div>
              <div>✓ Basic video processing</div>
              <div>✓ Simple playback controls</div>
              <div>✓ Standard quality options</div>
            </div>
          </div>

          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            maxFiles={10}
            maxSize={500}
          />
        </div>

        {/* Video Library Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Video Library</h2>
            {videoFiles.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <PlayIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No videos uploaded yet.</p>
                  <p className="text-sm mt-2">Upload your first video to get started!</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {videoFiles.map((video, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-24 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                        {video.animatedThumbnailUrl ? (
                          <img 
                            src={video.animatedThumbnailUrl} 
                            alt={video.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayIcon className="h-8 w-8 text-white opacity-70" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{video.fileName}</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {video.cloudflareId}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {video.isRepresentative && (
                            <Badge variant="secondary" className="text-xs">대표</Badge>
                          )}
                          {video.requiresSignedUrl && (
                            <Badge variant="outline" className="text-xs">🔒 Signed</Badge>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVideo(video)}
                            className="text-xs"
                          >
                            <PlayIcon className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          {video.streamUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(video.streamUrl, '_blank')}
                              className="text-xs"
                            >
                              <DownloadIcon className="h-3 w-3 mr-1" />
                              URL
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Video Player */}
          {selectedVideo && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Video Player</h3>
              <div className="aspect-video bg-black rounded overflow-hidden">
                {selectedVideo.cloudflareId ? (
                  <iframe
                    src={`https://iframe.videodelivery.net/${selectedVideo.cloudflareId}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <PlayIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Video processing...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium">{selectedVideo.fileName}</p>
                <p className="text-xs text-gray-500">ID: {selectedVideo.cloudflareId}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}