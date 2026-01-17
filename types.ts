
export enum ReplyType {
  PROFESSIONAL = 'Professional',
  SHORT_SMART = 'Short & Smart',
  FRIENDLY = 'Friendly',
  URGENT = 'Urgent'
}

export interface WhatsAppCloudConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  isEnabled: boolean;
}

export interface GeneratorConfig {
  companyName: string;
  workingHours: string;
  workingDays: string;
  context: string;
  replyType: ReplyType;
  includeContactInfo: boolean;
  whatsappApi?: WhatsAppCloudConfig;
}

export interface SavedReply {
  id: string;
  content: string;
  timestamp: number;
  config: GeneratorConfig;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'api_active';

export interface LinkedDevice {
  id: string;
  name: string;
  platform: 'Chrome' | 'Windows' | 'macOS' | 'Safari';
  lastActive: number;
  location: string;
}

export interface ActivityLog {
  id: string;
  from: string;
  incomingMessage: string;
  outboundReply: string;
  timestamp: number;
  via: 'Simulation' | 'Cloud API';
}
