import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileInput } from '@/components/ui/mobile-input';
import { Heart, UserPlus, Users, ArrowRight, Check } from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';

interface MobilePartnerSetupProps {
  onComplete: (currentPartner: Partner, otherPartner: Partner) => void;
}

export const MobilePartnerSetup = ({ onComplete }: MobilePartnerSetupProps) => {
  const { triggerHaptic } = useHapticFeedback();

  // Setup flow state
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'method' | 'new-setup' | 'join-setup' | 'new-complete' | 'join-complete'
  >('welcome');
  const [partnerName, setPartnerName] = useState('');
  const [yourName, setYourName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Navigation helpers
  const handleStepChange = (step: typeof currentStep) => {
    triggerHaptic('light');
    setCurrentStep(step);
  };

  // Generate partner code
  const generatePartnerCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
  };

  // Handle creating new partnership
  const handleCreateNew = async () => {
    if (!yourName.trim() || !partnerName.trim()) {
      toast.error('Please enter both names');
      return;
    }

    setIsLoading(true);
    triggerHaptic('medium');

    try {
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

      // Generate partner code for sharing
      const code = generatePartnerCode();
      setGeneratedCode(code);

      // Store partnership data (in real app, this would be API call)
      localStorage.setItem(
        'couple_connect_partnership',
        JSON.stringify({
          code,
          currentPartner,
          otherPartner,
          createdAt: new Date().toISOString(),
        })
      );

      setCurrentStep('new-complete');
      toast.success('Partnership created successfully!');
    } catch (_error) {
      toast.error('Failed to create partnership');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining existing partnership
  const handleJoinExisting = async () => {
    if (!yourName.trim() || !partnerCode.trim()) {
      toast.error('Please enter your name and partner code');
      return;
    }

    if (partnerCode.length !== 6) {
      toast.error('Partner code must be 6 letters');
      return;
    }

    setIsLoading(true);
    triggerHaptic('medium');

    try {
      // In real app, this would fetch partnership from API using code
      // For demo, we'll create a mock partnership
      const currentPartnerId = `partner_${Date.now()}_2`;
      const otherPartnerId = `partner_${Date.now()}_1`;

      const currentPartner: Partner = {
        id: currentPartnerId,
        name: yourName.trim(),
        isCurrentUser: true,
      };

      // Mock other partner data (in real app, would come from API)
      const otherPartner: Partner = {
        id: otherPartnerId,
        name: 'Your Partner', // Would be fetched from API
        isCurrentUser: false,
      };

      setCurrentStep('join-complete');

      // Complete the setup after a delay to show success state
      setTimeout(() => {
        onComplete(currentPartner, otherPartner);
        toast.success('Successfully joined partnership!');
        triggerHaptic('heavy');
      }, 2000);
    } catch (_error) {
      toast.error('Failed to join partnership');
      setIsLoading(false);
    }
  };

  // Handle sharing partner code
  const handleShareCode = async () => {
    triggerHaptic('medium');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Our Couple Connect Partnership',
          text: `Use code ${generatedCode} to join our relationship accountability partnership!`,
          url: window.location.origin,
        });
      } catch (_error) {
        // Fallback to clipboard
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  // Handle copying partner code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard!');
      triggerHaptic('light');
    } catch (_error) {
      toast.error('Failed to copy code');
    }
  };

  // Complete setup with generated partnership
  const handleCompleteSetup = () => {
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

    onComplete(currentPartner, otherPartner);
    triggerHaptic('heavy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {/* Welcome Screen */}
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="text-center">
                  <CardHeader className="pb-6">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex justify-center mb-4"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="text-white" size={40} weight="fill" />
                      </div>
                    </motion.div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Couple Connect
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Build stronger relationships through accountability and understanding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Start your journey towards better communication, shared goals, and deeper
                      connection with your partner.
                    </p>
                    <MobileButton
                      onClick={() => handleStepChange('method')}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      size="lg"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </MobileButton>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Method Selection */}
            {currentStep === 'method' && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <MobileButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStepChange('welcome')}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </MobileButton>
                      <div>
                        <CardTitle className="text-xl">Setup Partnership</CardTitle>
                        <CardDescription>Choose how you'd like to begin</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MobileButton
                      onClick={() => handleStepChange('new-setup')}
                      className="w-full h-auto p-4 justify-start"
                      variant="outline"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">Create New Partnership</div>
                          <div className="text-sm text-gray-600">
                            Set up fresh and invite your partner
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </div>
                    </MobileButton>

                    <MobileButton
                      onClick={() => handleStepChange('join-setup')}
                      className="w-full h-auto p-4 justify-start"
                      variant="outline"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            Join Existing Partnership
                          </div>
                          <div className="text-sm text-gray-600">Use a code from your partner</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </div>
                    </MobileButton>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* New Partnership Setup */}
            {currentStep === 'new-setup' && (
              <motion.div
                key="new-setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <MobileButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStepChange('method')}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </MobileButton>
                      <div>
                        <CardTitle className="text-xl">Create Partnership</CardTitle>
                        <CardDescription>Tell us about both partners</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Your Name *
                        </label>
                        <MobileInput
                          value={yourName}
                          onChange={(e) => setYourName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Partner's Name *
                        </label>
                        <MobileInput
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          placeholder="Enter your partner's name"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">What happens next?</h4>
                      <p className="text-xs text-blue-700">
                        We'll create a unique code for your partner to join this partnership.
                      </p>
                    </div>

                    <MobileButton
                      onClick={handleCreateNew}
                      disabled={isLoading || !yourName.trim() || !partnerName.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      size="lg"
                    >
                      {isLoading ? 'Creating Partnership...' : 'Create Partnership'}
                    </MobileButton>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Join Partnership Setup */}
            {currentStep === 'join-setup' && (
              <motion.div
                key="join-setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <MobileButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStepChange('method')}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </MobileButton>
                      <div>
                        <CardTitle className="text-xl">Join Partnership</CardTitle>
                        <CardDescription>Enter your details and partner code</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Your Name *
                        </label>
                        <MobileInput
                          value={yourName}
                          onChange={(e) => setYourName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Partner Code *
                        </label>
                        <MobileInput
                          value={partnerCode}
                          onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                          placeholder="Enter 6-letter code"
                          maxLength={6}
                          className="w-full text-center text-lg font-mono tracking-wider"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ask your partner for the 6-letter code they received
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 mb-1">
                        Joining Partnership
                      </h4>
                      <p className="text-xs text-green-700">
                        You'll be connected to your partner's existing accountability space.
                      </p>
                    </div>

                    <MobileButton
                      onClick={handleJoinExisting}
                      disabled={isLoading || !yourName.trim() || partnerCode.length !== 6}
                      className="w-full bg-green-500 hover:bg-green-600"
                      size="lg"
                    >
                      {isLoading ? 'Joining Partnership...' : 'Join Partnership'}
                    </MobileButton>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* New Partnership Complete */}
            {currentStep === 'new-complete' && (
              <motion.div
                key="new-complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card>
                  <CardContent className="text-center p-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-10 h-10 text-green-600" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Partnership Created!</h3>
                    <p className="text-gray-600 mb-6">
                      Share this code with {partnerName} to connect:
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="text-3xl font-bold font-mono tracking-wider text-blue-600 mb-2">
                        {generatedCode}
                      </div>
                      <div className="flex gap-2">
                        <MobileButton
                          onClick={handleCopyCode}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          📋 Copy Code
                        </MobileButton>
                        <MobileButton
                          onClick={handleShareCode}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          📤 Share
                        </MobileButton>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <MobileButton
                        onClick={handleCompleteSetup}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        size="lg"
                      >
                        Continue to App
                      </MobileButton>

                      <p className="text-xs text-gray-500">
                        You can share the code later from settings
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Join Partnership Complete */}
            {currentStep === 'join-complete' && (
              <motion.div
                key="join-complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card>
                  <CardContent className="text-center p-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Heart className="w-10 h-10 text-white" weight="fill" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Successfully Connected!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You've joined the partnership. Loading your shared space...
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-6">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-3 h-3 bg-purple-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-3 h-3 bg-pink-500 rounded-full"
                      />
                    </div>

                    <p className="text-sm text-gray-500">
                      Setting up your accountability dashboard...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MobilePartnerSetup;
