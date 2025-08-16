import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Heart, UserPlus, Users } from '@/components/ui/InlineIcons';
import { toast } from 'sonner';

export interface Partner {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isCurrentUser: boolean;
}

interface PartnerSetupProps {
  onComplete: (currentPartner: Partner, otherPartner: Partner) => void;
}

export default function PartnerSetup({ onComplete }: PartnerSetupProps) {
  const [setupMode, setSetupMode] = useState<'new' | 'join' | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [yourName, setYourName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNew = async () => {
    if (!yourName.trim() || !partnerName.trim()) {
      toast.error('Please enter both names');
      return;
    }

    setIsLoading(true);

    // Create unique IDs for partners
    const currentPartnerId = `partner_${Date.now()}_1`;
    const otherPartnerId = `partner_${Date.now()}_2`;

    const currentPartner: Partner = {
      id: currentPartnerId,
      name: yourName.trim(),
      isCurrentUser: true,
    };

    const otherPartner: Partner = {
      id: otherPartnerId,
      name: partnerName.trim(),
      isCurrentUser: false,
    };

    // Generate a simple sharing code for the partner to join
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    toast.success(`Setup complete! Share code "${shareCode}" with ${partnerName}`);
    onComplete(currentPartner, otherPartner);
    setIsLoading(false);
  };

  const handleJoinExisting = async () => {
    if (!yourName.trim() || !partnerCode.trim()) {
      toast.error('Please enter your name and the partner code');
      return;
    }

    setIsLoading(true);

    // In a real app, this would validate the code and fetch partner data
    // For now, we'll simulate joining
    const currentPartnerId = `partner_${Date.now()}_join`;
    const otherPartnerId = `partner_existing`;

    const currentPartner: Partner = {
      id: currentPartnerId,
      name: yourName.trim(),
      isCurrentUser: true,
    };

    const otherPartner: Partner = {
      id: otherPartnerId,
      name: 'Your Partner', // In real app, this would come from the code
      isCurrentUser: false,
    };

    toast.success('Successfully joined!');
    onComplete(currentPartner, otherPartner);
    setIsLoading(false);
  };

  if (!setupMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="text-accent" size={48} weight="fill" />
            </div>
            <CardTitle className="text-2xl">Welcome to Together</CardTitle>
            <CardDescription>Start your accountability journey as a couple</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setSetupMode('new')} className="w-full" size="lg">
              <UserPlus className="mr-2" size={20} />
              Set Up New Partnership
            </Button>
            <Button
              onClick={() => setSetupMode('join')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Users className="mr-2" size={20} />
              Join Existing Partnership
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="text-accent" size={48} weight="fill" />
          </div>
          <CardTitle className="text-2xl">
            {setupMode === 'new' ? 'Create Partnership' : 'Join Partnership'}
          </CardTitle>
          <CardDescription>
            {setupMode === 'new'
              ? 'Set up your accountability partnership'
              : 'Enter the code shared by your partner'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={setupMode} className="w-full">
            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="your-name">Your Name</Label>
                <Input
                  id="your-name"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-name">Partner's Name</Label>
                <Input
                  id="partner-name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Enter your partner's name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSetupMode(null)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleCreateNew} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Creating...' : 'Create Partnership'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="join" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="your-name-join">Your Name</Label>
                <Input
                  id="your-name-join"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-code">Partner Code</Label>
                <Input
                  id="partner-code"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-letter code"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSetupMode(null)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleJoinExisting} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Joining...' : 'Join Partnership'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
