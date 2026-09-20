"use client";

import { useState, useEffect, type ReactElement } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleUserRound,
  CreditCard,
  ReceiptText,
  Settings,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth/authService";
import { authService as userProfileService, type UserProfile } from "../../services/authService";
import { getInitials } from "../../utils/avatarUtils";

type Props = {
  trigger?: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  profile?: UserProfile | null;
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  action?: string;
};

const PROFILE_ITEMS: MenuItem[] = [
  { label: "My Profile", icon: CircleUserRound, action: "/profile" },
  { label: "My Subscription", icon: CreditCard },
  { label: "My Invoice", icon: ReceiptText },
];

const SETTINGS_ITEMS: MenuItem[] = [
  { label: "Account Settings", icon: Settings, action: "/settings" },
];

const LOGOUT_ITEM: MenuItem = {
  label: "Signout",
  icon: LogOut,
  destructive: true,
  action: "logout",
};

const itemClass =
  "p-2 text-sm font-medium text-popover-foreground cursor-pointer gap-2";

const Dropdown = ({ trigger, defaultOpen, align = "end", profile }: Props) => {
  const navigate = useNavigate();

  const handleAction = async (action?: string) => {
    if (!action) return;
    if (action === "logout") {
      await authService.logout();
      window.location.href = '/login';
    } else {
      navigate(action);
    }
  };

  const name = profile?.name || 'Security Analyst';
  const email = profile?.email || 'analyst@sentinelflow.io';
  const initials = getInitials(name);
  const avatarUrl = profile?.avatar_url;

  const defaultTrigger = (
    <div className="rounded-full hover:ring-2 hover:ring-primary/20 transition-all p-1 -m-1">
      <Avatar className="size-8 cursor-pointer">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );

  return (
    <div className="flex items-center justify-center p-0">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          className="w-56 rounded-xl duration-400"
        >
          <DropdownMenuGroup>
            {/* User Info */}
            <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Avatar className="size-10">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2 ring-background" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-popover-foreground text-sm font-medium truncate">
                  {name}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Main Links */}
            {PROFILE_ITEMS.map(({ label, icon: Icon, action }) => (
              <DropdownMenuItem key={label} className={itemClass} onClick={() => handleAction(action)}>
                <Icon size={16} />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuGroup>
              {SETTINGS_ITEMS.map(({ label, icon: Icon, action }) => (
                <DropdownMenuItem key={label} className={itemClass} onClick={() => handleAction(action)}>
                  <Icon size={16} />
                  <span>{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem 
              className={`${itemClass} text-red-500 focus:text-red-500 focus:bg-red-500/10`}
              onClick={() => handleAction(LOGOUT_ITEM.action)}
            >
              <LOGOUT_ITEM.icon size={16} />
              <span>{LOGOUT_ITEM.label}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const DropdownMenu01 = ({ defaultOpen }: { defaultOpen?: boolean }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const p = await userProfileService.getProfile();
      if (isMounted) setProfile(p);
    };

    fetchProfile();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail && isMounted) {
        setProfile(customEvent.detail);
      } else if (isMounted) {
        fetchProfile();
      }
    };

    window.addEventListener('sentinelflow_profile_updated', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sentinelflow_profile_updated', handleProfileUpdate);
    };
  }, []);

  return (
    <Dropdown
      align="end"
      defaultOpen={defaultOpen}
      profile={profile}
    />
  );
};

export default DropdownMenu01;
