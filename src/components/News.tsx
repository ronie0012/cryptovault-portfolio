"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink } from 'lucide-react';

export default function News() {
  const mockNews = [
    {
      id: 1,
      title: "Bitcoin Reaches New All-Time High",
      summary: "Bitcoin surges past previous records as institutional adoption continues to grow.",
      source: "CryptoNews",
      time: "2 hours ago",
      sentiment: "positive"
    },
    {
      id: 2,
      title: "Ethereum 2.0 Staking Rewards Increase",
      summary: "New staking mechanisms show promising returns for ETH holders.",
      source: "BlockchainDaily",
      time: "4 hours ago",
      sentiment: "positive"
    },
    {
      id: 3,
      title: "Regulatory Updates in Cryptocurrency",
      summary: "New guidelines released for cryptocurrency trading and taxation.",
      source: "FinanceToday",
      time: "6 hours ago",
      sentiment: "neutral"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crypto News</h1>
        <p className="text-muted-foreground">Latest cryptocurrency news and market updates</p>
      </div>

      <div className="space-y-4">
        {mockNews.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{article.source}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{article.time}</span>
                    <Badge 
                      variant={article.sentiment === 'positive' ? 'default' : 
                              article.sentiment === 'negative' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {article.sentiment}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-muted-foreground">{article.summary}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}