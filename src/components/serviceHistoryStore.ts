import { AppRole } from './RoleBadge';

export type ServiceHistoryItem = {
  id: string;
  title: string;
  date: string;
  partner: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled';
  vehicle?: string;
  location?: string;
};

const FALLBACK: Record<AppRole, ServiceHistoryItem[]> = {
  customer: [
    { id: 'customer-demo-1', title: 'Engine overheating assistance', date: '২০২৬-০৯-05', partner: 'আব্দুর রহিম', amount: '৳৯০০', status: 'completed', vehicle: 'Car', location: 'Dhaka' },
  ],
  mechanic: [
    { id: 'mechanic-demo-1', title: 'Engine overheating repair', date: '২০২৬-০৯-12', partner: 'Customer #C102', amount: '৳৯০০', status: 'completed', vehicle: 'Car', location: 'Dhaka' },
  ],
  b2b: [
    { id: 'b2b-demo-1', title: 'ইঞ্জিন অয়েল চেঞ্জ', date: '২০২৬-০৫-১০', partner: 'রহিম মটরস', amount: '৳৪,৫০০', status: 'completed', vehicle: 'Delivery Truck X-12', location: 'গাবতলী' },
    { id: 'b2b-demo-2', title: 'এসি গ্যাস রিফিল', date: '২০২৬-০৫-২০', partner: 'Car Rescue BD Team', amount: '৳২,৮০০', status: 'completed', vehicle: 'Cargo Van Y-04', location: 'তেজগাঁও' },
  ],
  driver: [
    { id: 'driver-demo-1', title: 'Engine overheating assistance', date: '২০২৬-০৯-11', partner: 'আব্দুর রহিম', amount: '৳৯০০', status: 'completed', vehicle: 'Delivery Truck X-12', location: 'Dhaka' },
  ],
};

const store: Record<AppRole, ServiceHistoryItem[]> = {
  customer: [...FALLBACK.customer],
  mechanic: [...FALLBACK.mechanic],
  b2b: [...FALLBACK.b2b],
  driver: [...FALLBACK.driver],
};

export function getServiceHistory(role: AppRole): ServiceHistoryItem[] {
  return [...store[role]];
}

export function addServiceHistory(role: AppRole, item: ServiceHistoryItem): void {
  store[role] = [item, ...store[role].filter(existing => existing.id !== item.id)];
}

export function replaceServiceHistory(role: AppRole, items: ServiceHistoryItem[]): void {
  store[role] = [...items];
}
