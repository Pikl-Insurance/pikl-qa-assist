'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileAudio, Clock, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import type { Call } from '@/types';
import { AgentAvatar } from '@/components/agent-avatar';

function CallsContent() {
  const searchParams = useSearchParams();
  const agentFilter = searchParams.get('agentId');

  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCall, setProcessingCall] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, [agentFilter]);

  async function fetchCalls() {
    try {
      setLoading(true);
      const response = await fetch('/api/calls');
      const data = await response.json();

      if (data.success) {
        let filteredCalls = data.data.calls;

        // Filter by agent if agentFilter is present
        if (agentFilter) {
          filteredCalls = filteredCalls.filter((call: Call) =>
            call.agentId === agentFilter || call.agentName === agentFilter
          );
        }

        setCalls(filteredCalls);
      } else {
        setError(data.error || 'Failed to load calls');
      }
    } catch (err) {
      setError('Failed to fetch calls');
      console.error('Error fetching calls:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: Call['status']) {
    const statusConfig: Record<Call['status'], { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
      pending: { label: 'Pending', variant: 'secondary', icon: Clock },
      transcribing: { label: 'Transcribing', variant: 'default', icon: Loader2 },
      analyzing: { label: 'Analyzing', variant: 'default', icon: Loader2 },
      complete: { label: 'Complete', variant: 'default', icon: CheckCircle2 },
      error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(seconds?: number) {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Calls</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchCalls}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Calls Yet</CardTitle>
          <CardDescription>
            Upload your first call recording to get started with QA analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload">
            <Button>Upload Call Recording</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Recordings</h1>
          <p className="text-muted-foreground mt-2">
            View and analyze your call recordings
          </p>
          {agentFilter && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Filtered by Agent: {agentFilter}
              </Badge>
              <Link href="/calls">
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Link href="/upload">
          <Button>Upload New Call</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {calls.map((call) => (
          <Card key={call.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{call.filename}</h3>
                    {getStatusBadge(call.status)}
                    {call.overallScore && (
                      <Badge variant="outline" className="font-mono">
                        Score: {call.overallScore.toFixed(1)}/10
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {call.agentName && (
                      <span className="flex items-center gap-2">
                        <AgentAvatar agentName={call.agentName} agentId={call.agentId} size="sm" />
                        <span className="flex items-center gap-1">
                          Agent: {call.agentName}
                          {call.agentId && <span className="text-xs">({call.agentId})</span>}
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(call.createdAt)}
                    </span>
                    {call.duration && (
                      <span className="flex items-center gap-1">
                        Duration: {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>

                  {call.errorMessage && (
                    <p className="text-sm text-destructive mt-2">
                      Error: {call.errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {call.status === 'complete' && (
                    <Link href={`/calls/${call.id}`}>
                      <Button variant="outline" className="border-primary border-[3px] hover:bg-primary/10">
                        View Analysis
                      </Button>
                    </Link>
                  )}
                  {call.status === 'pending' && (
                    <Button
                      variant="secondary"
                      disabled={processingCall === call.id}
                      onClick={async () => {
                        // Trigger transcription
                        setProcessingCall(call.id);
                        try {
                          const response = await fetch('/api/transcribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ callId: call.id }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to start transcription');
                          }

                          // Wait a moment then refresh
                          setTimeout(() => {
                            fetchCalls();
                            setProcessingCall(null);
                          }, 1000);
                        } catch (err) {
                          console.error('Error starting transcription:', err);
                          alert('Failed to start transcription. Please check the console for details.');
                          setProcessingCall(null);
                        }
                      }}
                    >
                      Start Processing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CallsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CallsContent />
    </Suspense>
  );
}
