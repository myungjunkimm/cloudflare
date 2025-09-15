'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setCloudflareConfig } from '@/lib/cloudflare';

export default function CloudflareSettings() {
  const [config, setConfig] = useState({
    apiKey: '',
    accountId: '',
    accountHash: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cloudflare-config');
      if (stored) {
        const storedConfig = JSON.parse(stored);
        setConfig(storedConfig);
        setCloudflareConfig(storedConfig);
        setIsConfigured(true);
      }
    }
  }, []);

  const handleSave = () => {
    if (!config.apiKey || !config.accountId || !config.accountHash) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setCloudflareConfig(config);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudflare-config', JSON.stringify(config));
    }
    
    setIsConfigured(true);
    alert('Cloudflare 설정이 저장되었습니다.');
  };

  const handleReset = () => {
    setConfig({
      apiKey: '',
      accountId: '',
      accountHash: ''
    });
    setIsConfigured(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cloudflare-config');
    }
  };

  if (isConfigured) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-green-600">✓ Cloudflare 설정 완료</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              파일 업로드가 활성화되었습니다.
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              설정 재구성
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-600">Cloudflare 설정 필요</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          파일 업로드 기능을 사용하려면 Cloudflare API 정보를 설정해야 합니다.
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="Cloudflare API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Account ID</label>
            <Input
              placeholder="Cloudflare Account ID"
              value={config.accountId}
              onChange={(e) => setConfig({...config, accountId: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Account Hash (Images 전용)</label>
            <Input
              placeholder="Cloudflare Images Account Hash"
              value={config.accountHash}
              onChange={(e) => setConfig({...config, accountHash: e.target.value})}
            />
          </div>
        </div>
        
        <Button onClick={handleSave} className="w-full">
          설정 저장
        </Button>
      </CardContent>
    </Card>
  );
}