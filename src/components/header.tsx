import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-end px-6">
        <Button variant="default" size="sm" asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>
    </header>
  );
}
