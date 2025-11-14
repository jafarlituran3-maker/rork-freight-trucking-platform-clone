export type UserRole = 'shipper' | 'carrier' | 'dispatcher';

export type OrderStatus = 'created' | 'assigned' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  company?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  shipperId: string;
  carrierId?: string;
  
  origin: Location;
  destination: Location;
  
  cargoType: string;
  weight: number;
  volume: number;
  
  price: number;
  includesVAT?: boolean;
  insurance?: number;
  aggregatorCommission?: number;
  currency: string;
  
  requiredDate: string;
  createdAt: string;
  updatedAt: string;
  
  documents: Document[];
  tracking?: TrackingData;
  payment?: Payment;
  paymentStatus?: PaymentStatus;
  
  shipperCompany?: {
    name: string;
    inn: string;
    kpp: string;
    ogrn: string;
    legalAddress: string;
    actualAddress: string;
    bankName: string;
    bankAccount: string;
    bankCorrespondentAccount?: string;
    bankBic?: string;
    managerName: string;
    phone: string;
    email: string;
    directorName?: string;
  };
  transportMode?: string;
  paymentMethod?: string;
  tonnage?: number;
  distance?: number;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
}

export interface Document {
  id: string;
  type: 'contract' | 'invoice' | 'cmr' | 'waybill' | 'upd' | 'consignment_note' | 'edi' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  status?: 'draft' | 'signed' | 'approved' | 'rejected';
  signedBy?: string;
  signedAt?: string;
  attachments?: DocumentAttachment[];
  signatures?: DocumentSignature[];
  requiresSignature?: boolean;
}

export interface DocumentSignature {
  id: string;
  signatureData: string;
  signedBy: string;
  signedByRole: 'shipper' | 'carrier' | 'driver';
  signedAt: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface TrackingData {
  currentLocation: {
    lat: number;
    lng: number;
  };
  lastUpdate: string;
  estimatedArrival: string;
  distanceRemaining: number;
}

export interface Truck {
  id: string;
  licensePlate: string;
  type: string;
  capacity: number;
  carrierId: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'busy' | 'maintenance';
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  mileage?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  assignedDriverId?: string;
  documents?: TruckDocument[];
}

export interface TruckDocument {
  id: string;
  type: 'registration' | 'insurance' | 'inspection' | 'permit' | 'other';
  name: string;
  expiryDate?: string;
  url: string;
  uploadedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseExpiry: string;
  carrierId: string;
  assignedTruckId?: string;
  status: 'active' | 'inactive' | 'on_leave';
  photo?: string;
  documents?: DriverDocument[];
}

export interface DriverDocument {
  id: string;
  type: 'license' | 'medical' | 'insurance' | 'contract' | 'other';
  name: string;
  expiryDate?: string;
  url: string;
  uploadedAt: string;
}

export type ScheduleStatus = 'available' | 'busy' | 'on_break' | 'off_duty' | 'on_leave';

export interface DriverSchedule {
  id: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  orderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  carrierId: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  orderId: string;
  shipperId: string;
  carrierId: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'payment_created' | 'payment_pending' | 'payment_hold' | 'payment_confirmed' | 'payment_released' | 'payment_refund' | 'payment_failed';

export type PaymentMethodType = 'card' | 'bank_transfer' | 'invoice' | 'cash';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  details: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  carrierId?: string;
  amountTotal: number;
  amountCarrier: number;
  amountPlatformCommission: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  paymentDocuments?: string[];
  paidAt?: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  transactionId?: string;
  escrowId?: string;
  disputeReason?: string;
}

export interface CommissionConfig {
  percent: number;
  fixedAmount: number;
}

export interface PayoutHistory {
  id: string;
  paymentId: string;
  carrierId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod?: string;
  processedAt?: string;
  createdAt: string;
  errorMessage?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  legalAddress: string;
  actualAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  bankName: string;
  bankAccount: string;
  bankCorrespondentAccount: string;
  bankBic: string;
  numberOfVehicles?: number;
  directorName: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Carrier {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  vehicleType: string;
  maxCapacity: number;
  maxVolume: number;
  averageSpeed: number;
  basePricePerKm: number;
  commission: number;
  availableRegions: string[];
  phone?: string;
  email?: string;
  companyName?: string;
  averagePrice?: number;
  preferredAddresses?: string[];
  truckBrand?: string;
  truckType?: string;
  description?: string;
  sampleContract?: string;
}

export interface CargoRequest {
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  volume: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface CarrierOffer {
  carrier: Carrier;
  basePrice: number;
  commission: number;
  finalPrice: number;
  estimatedDistance: number;
  estimatedDuration: number;
}

export type TransportMode = 'truck' | 'van' | 'refrigerator' | 'container' | 'tanker' | 'flatbed';

export interface ShipperAd {
  id: string;
  shipperId: string;
  shipperRating: number;
  shipperCompany: {
    name: string;
    inn: string;
    kpp: string;
    ogrn: string;
    legalAddress: string;
    actualAddress: string;
    bankName: string;
    bankAccount: string;
    managerName: string;
    phone: string;
    email: string;
  };
  origin: {
    address: string;
    lat: number;
    lng: number;
    city: string;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
    city: string;
  };
  cargoType: string;
  tonnage: number;
  distance: number;
  price: number;
  includesVAT: boolean;
  insurance: number;
  aggregatorCommission: number;
  transportMode: TransportMode;
  requiredDate: string;
  paymentMethod: 'prepayment' | 'postpayment' | 'by_invoice' | 'cash' | 'card';
  detailedDescription?: string;
  cargoDetails?: string;
  specialRequirements?: string;
  loadingInfo?: string;
  unloadingInfo?: string;
  createdAt: string;
  status: 'active' | 'assigned' | 'completed' | 'cancelled';
}

export type TripStatus = 'scheduled' | 'loading' | 'in_transit' | 'unloading' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  orderId: string;
  status: TripStatus;
  
  origin: {
    address: string;
    lat: number;
    lng: number;
    contactName: string;
    contactPhone: string;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
    contactName: string;
    contactPhone: string;
  };
  
  cargo: {
    type: string;
    description: string;
    weight: number;
    volume: number;
    packageCount?: number;
    packageType?: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    specialRequirements?: string[];
    temperatureRange?: string;
  };
  
  carrier: {
    id: string;
    companyName: string;
    driverName: string;
    driverPhone: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleType: string;
  };
  
  schedule: {
    pickupDate: string;
    pickupTimeWindow: string;
    deliveryDate: string;
    deliveryTimeWindow: string;
  };
  
  tracking?: {
    currentLocation: {
      lat: number;
      lng: number;
      address: string;
    };
    lastUpdate: string;
    distanceCovered: number;
    distanceRemaining: number;
    estimatedArrival: string;
    speed?: number;
    route?: { lat: number; lng: number }[];
  };
  
  financial: {
    totalPrice: number;
    currency: string;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
  };
  
  documents: {
    contract?: string;
    waybill?: string;
    upd?: string;
    invoice?: string;
    consignmentNote?: string;
  };
  
  milestones?: {
    id: string;
    type: 'pickup_started' | 'pickup_completed' | 'in_transit' | 'delivery_started' | 'delivery_completed';
    timestamp: string;
    location?: { lat: number; lng: number; address: string };
    notes?: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CarrierAd {
  id: string;
  carrierId: string;
  carrierRating: number;
  carrierCompany: {
    name: string;
    inn: string;
    kpp: string;
    ogrn: string;
    legalAddress: string;
    actualAddress: string;
    bankName: string;
    bankAccount: string;
    managerName: string;
    phone: string;
    email: string;
  };
  availableFrom: {
    address: string;
    lat: number;
    lng: number;
    city: string;
  };
  availableTo: {
    address: string;
    lat: number;
    lng: number;
    city: string;
  };
  truckInfo: {
    brand: string;
    model: string;
    loadCapacity: number;
    volume: number;
    type: TransportMode;
    year: number;
    plateNumber: string;
  };
  pricePerKm: number;
  totalTripsCompleted: number;
  averagePrice: number;
  distance: number;
  availableDate: string;
  preferredRegions: string[];
  preferredAddresses: string[];
  sampleContract: string;
  detailedDescription?: string;
  specialCapabilities?: string;
  createdAt: string;
  status: 'active' | 'assigned' | 'completed' | 'cancelled';
}
