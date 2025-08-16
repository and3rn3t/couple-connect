/**
 * 🎪 Cloudflare Images Demo Button
 * Quick access to see image optimization in action! ✨
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CloudflareImagesDemo } from '@/components/CloudflareImagesDemo';

export function CloudflareImagesDemoButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          🚀 Cloudflare Images Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🖼️ Cloudflare Images in Action!
          </DialogTitle>
        </DialogHeader>
        <CloudflareImagesDemo />
      </DialogContent>
    </Dialog>
  );
}
