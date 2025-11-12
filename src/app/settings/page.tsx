'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your QA Assistant</p>
      </div>

      {/* 3CX Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>3CX Integration</CardTitle>
          </div>
          <CardDescription>
            Connect to your 3CX phone system to automatically import call recordings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="3cx-url">3CX Server URL</Label>
            <Input
              id="3cx-url"
              placeholder="https://your-3cx-server.com"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="3cx-username">Username</Label>
            <Input
              id="3cx-username"
              placeholder="admin"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="3cx-password">Password</Label>
            <Input
              id="3cx-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button disabled variant="default">
              Test Connection
            </Button>
            <Button disabled variant="outline">
              Save Configuration
            </Button>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Coming Soon:</strong> Direct 3CX integration will allow automatic import of call recordings
              without manual upload. This feature is currently in development.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>
            Your API keys for Claude and OpenAI Whisper
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key (Claude)</Label>
            <Input
              id="anthropic-key"
              type="password"
              placeholder="sk-ant-••••••••"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Used for QA analysis and scoring
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key (Whisper)</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-••••••••"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Used for audio transcription
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button disabled variant="default">
              Update API Keys
            </Button>
          </div>

          <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> API keys are currently configured through environment variables (.env file).
              UI-based key management coming in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>
            Application preferences and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auto-analyze">Automatic Analysis</Label>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="auto-analyze" disabled className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Automatically analyze calls after transcription
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention-days">Call Retention (Days)</Label>
            <Input
              id="retention-days"
              type="number"
              placeholder="90"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              How long to keep call recordings and analysis data
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button disabled variant="default">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
