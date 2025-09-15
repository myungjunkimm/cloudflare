'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            후기 PoC
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/reviews">
              <Button 
                variant={pathname === '/reviews' ? 'default' : 'ghost'}
                size="sm"
              >
                후기 보기
              </Button>
            </Link>
            <Link href="/write">
              <Button 
                variant={pathname === '/write' ? 'default' : 'ghost'}
                size="sm"
              >
                후기 작성
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={pathname.startsWith('/images') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Images
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/images/direct-upload" className="cursor-pointer">
                    Direct Creator Upload
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/images/custom-id" className="cursor-pointer">
                    Custom ID Upload
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/images/signed-url" className="cursor-pointer">
                    Signed URL
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={pathname.startsWith('/gallery') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Gallery
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/gallery" className="cursor-pointer">
                    Public Gallery
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/gallery/signed-url" className="cursor-pointer">
                    Signed URL Gallery
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Stream menu disabled
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={pathname.startsWith('/stream') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Stream
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/stream/basic-uploads" className="cursor-pointer">
                    Basic video uploads
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stream/creator-uploads" className="cursor-pointer">
                    Direct creator uploads
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stream/gallery" className="cursor-pointer">
                    Video Gallery
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            {/* Settings menu disabled
            <Link href="/settings">
              <Button 
                variant={pathname === '/settings' ? 'default' : 'ghost'}
                size="sm"
              >
                설정
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}