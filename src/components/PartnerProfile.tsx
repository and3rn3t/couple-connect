import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, SignOut, Gear } from '@phosphor-icons/react';
import { Partner } from './PartnerSetup';

interface PartnerProfileProps {
  currentPartner: Partner;
  otherPartner: Partner;
  onSwitchView: () => void;
  onSignOut: () => void;
}

export default function PartnerProfile({
  currentPartner,
  otherPartner,
  onSwitchView,
  onSignOut,
}: PartnerProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {currentPartner.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{currentPartner.name}</span>
          <Badge variant="secondary" className="text-xs w-fit">
            Your View
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{currentPartner.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Currently viewing your perspective
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSwitchView}>
            <div className="flex items-center gap-2">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {otherPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Switch to {otherPartner.name}'s view
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Gear className="mr-2 h-4 w-4" />
            Partnership Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut} className="text-destructive">
            <SignOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
