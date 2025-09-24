"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Plus } from 'lucide-react';

export default function Watchlist() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-muted-foreground">Track cryptocurrencies you're interested in</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Your Watchlist
            </span>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No assets in watchlist</h3>
            <p>Add cryptocurrencies to track their performance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}