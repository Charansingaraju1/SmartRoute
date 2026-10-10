export type UserRole = 'STUDENT' | 'TEACHER';
export type Direction = 'MORNING' | 'EVENING';
export type AssignmentStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
export type NotificationType = 'BUS_ASSIGNMENT' | 'ROUTE_CHANGE' | 'STOP_CHANGE' | 'DELAY' | 'DISRUPTION' | 'MISSED_BUS' | 'SOS' | 'PAYMENT_STATUS' | 'ANNOUNCEMENT' | 'THREE_STOPS_AWAY' | 'MORNING_TRANSPORT' | 'EVENING_TRANSPORT' | 'BUS_PASS_UPDATE' | 'CAPACITY_CHANGE';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';
export type MissedBusStatus = 'REQUESTED' | 'ACKNOWLEDGED' | 'ALTERNATIVE_BUS_ASSIGNED' | 'RESOLVED' | 'CANCELLED';
export type DelayStatus = 'PUBLISHED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
export type DisruptionType = 'TRAFFIC' | 'ROAD_CLOSURE' | 'DIVERSION' | 'BREAKDOWN' | 'STOP_UNAVAILABLE' | 'TIMING_CHANGE' | 'WEATHER' | 'OTHER';
export type DisruptionStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
export type SOSCategory = 'MEDICAL_EMERGENCY' | 'ACCIDENT' | 'SAFETY_ISSUE' | 'BUS_BREAKDOWN' | 'OTHER';
export type SOSStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED';
export type PaymentStatus = 'PENDING' | 'CREATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'EMI';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bus {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  model?: string;
  fuelType?: string;
  manufactureYear?: number;
  driverName?: string;
  driverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  active: boolean;
  gpsDeviceId?: string;
  lastLocationLat?: number;
  lastLocationLng?: number;
  lastLocationAt?: string;
  currentStudentsCount: number;
  availableCapacity: number;
  route?: Route;
  routeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  zone: Zone;
  zoneId: string;
  routeCode: string;
  routeName?: string;
  direction: Direction;
  startingPoint?: string;
  startingTime?: string;
  endingPoint?: string;
  endingTime?: string;
  description?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  active: boolean;
  displayOrder: number;
  feeAmount?: number;
  bus?: Bus;
  busId?: string;
  boardingPoints?: BoardingPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardingPoint {
  id: string;
  route: Route;
  routeId: string;
  stopName: string;
  stopDescription?: string;
  stopOrder: number;
  stopTime?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  active: boolean;
  wheelchairAccessible: boolean;
  shelterAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBusAssignment {
  id: string;
  studentId: string;
  busId: string;
  routeId: string;
  boardingPointId?: string;
  direction: Direction;
  status: AssignmentStatus;
  startDate: string;
  endDate?: string;
  assignedBy?: string;
  assignmentNotes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  user: User;
  userId: string;
  studentId?: string;
  branch?: string;
  classSection?: string;
  academicYear?: string;
  bus?: Bus;
  busId?: string;
  route?: Route;
  routeId?: string;
  boardingPoint?: BoardingPoint;
  boardingPointId?: string;
  direction?: Direction;
  pickupTime?: string;
  assignmentStatus?: AssignmentStatus;
  busPassVerified: boolean;
  busPassVerifiedAt?: string;
  busPassImageUrl?: string;
  qrCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notificationEmailEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationInAppEnabled: boolean;
  sosNotificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  user: User;
  userId: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  assignedBus?: Bus;
  assignedBusId?: string;
  canPublishLocation: boolean;
  canPublishDelays: boolean;
  canPublishDisruptions: boolean;
  canManageAssignments: boolean;
  notificationEmailEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationInAppEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherBusAssignment {
  id: string;
  teacherId: string;
  busId: string;
  isPrimary: boolean;
  canPublishLocation: boolean;
  canPublishDelays: boolean;
  canPublishDisruptions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failed: boolean;
  failureReason?: string;
  retryCount: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissedBusRequest {
  id: string;
  studentId: string;
  originalBusId?: string;
  alternativeBusId?: string;
  status: MissedBusStatus;
  requestedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  alternativeAssignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  studentNotes?: string;
  teacherNotes?: string;
  cancellationReason?: string;
  studentLocationLat?: number;
  studentLocationLng?: number;
  studentLocationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOSRequest {
  id: string;
  studentId: string;
  category: SOSCategory;
  status: SOSStatus;
  description?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  locationAt?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  respondingAt?: string;
  respondingBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  emergencyServicesContacted: boolean;
  emergencyContactNotified: boolean;
  teacherNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  orderId: string;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  description?: string;
  feeType?: string;
  academicYear?: string;
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  gatewayResponseCode?: string;
  webhookReceivedAt?: string;
  webhookVerified: boolean;
  gatewayResponse?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delay {
  id: string;
  busId: string;
  routeId?: string;
  teacherId: string;
  status: DelayStatus;
  delayMinutes: number;
  expectedArrivalTime?: string;
  reason?: string;
  notes?: string;
  publishedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  autoExpireAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disruption {
  id: string;
  busId?: string;
  routeId?: string;
  teacherId: string;
  type: DisruptionType;
  status: DisruptionStatus;
  startTime: string;
  endTime?: string;
  estimatedEndTime?: string;
  title: string;
  description?: string;
  affectedArea?: string;
  alternativeRoute?: string;
  publishedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  severity: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusPass {
  id: string;
  studentId: string;
  busId?: string;
  routeId?: string;
  status: string;
  validFrom: string;
  validUntil?: string;
  passNumber?: string;
  imageUrl?: string;
  qrCodeData?: string;
  ocrExtractedData?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  academicYear?: string;
  feePaid: boolean;
  feeAmount?: number;
  paymentRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportDisruption {
  id: string;
  routeId?: string;
  busId?: string;
  startDate: string;
  endDate?: string;
  title: string;
  description?: string;
  affectedStops?: string;
  alternativeArrangement?: string;
  active: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DelayAlert {
  id: string;
  routeId?: string;
  busId?: string;
  alertTime: string;
  delayMinutes: number;
  reason?: string;
  active: boolean;
  recurring: boolean;
  recurrencePattern?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}