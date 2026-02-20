export interface Website {
  id: string;
  title: string;
  link: string;
  image: string;
  description: string;
  language: string;
  credentials?: Array<{
    id: string;
    role: string;
    email: string;
    password: string;
  }>;
}

export interface MobileApp {
  id: string;
  title: string;
  androidLink: string;
  iosLink: string;
  description: string;
  language: string;
  software: string;
  image: string;
}

export interface Software {
  id: string;
  key: string;
  title: string;
  description: string;
  link: string;
  image: string;
  credentials?: Array<{
    id: string;
    role: string;
    email: string;
    password: string;
  }>;
}

export interface DigitalCard {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
}

export interface MarketingClient {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
}

export interface DigitalMarketing {
  id: string;
  title: string;
  description: string;
  pageLink: string;
  imageUrl: string;
}

export interface AdminData {
  pin: string;
  websites: Website[];
  mobileApps: MobileApp[];
  software: Software[];
  digitalCards: DigitalCard[];
  digitalMarketing: DigitalMarketing[];
  marketingClients: MarketingClient[];
}
