export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  location: string | null;
  province: string | null;
  district: string | null;
  phone: string | null;
  role: "CLIENT" | "WORKER" | "ADMIN";
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  successRate: number;
  avgResponseTime: number | null;
  verified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isBlocked: boolean;
  skills: string[];
  specialties: string[];
  yearsExperience: number | null;
  portfolio: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  province: string | null;
  district: string | null;
  budget: number;
  deadline: string | null;
  photos: string[];
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  urgent: boolean;
  isDraft: boolean;
  viewCount: number;
  createdAt: string;
  clientId: string;
  client: User;
  bids: Bid[];
  acceptedBid?: Bid | null;
  reviews?: Review[];
  payment?: Payment | null;
  _count?: { bids: number };
}

export interface Bid {
  id: string;
  amount: number;
  message: string;
  estimatedDuration: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  taskId: string;
  task?: Task;
  workerId: string;
  worker: User;
}

export interface Message {
  id: string;
  content: string;
  images: string[];
  read: boolean;
  readAt: string | null;
  createdAt: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  taskId?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  type: string;
  createdAt: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  taskId: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, any>;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  serviceFee: number;
  workerPayout: number;
  status: "PENDING" | "ESCROWED" | "RELEASED" | "REFUNDED";
  stripePaymentId?: string;
  createdAt: string;
  taskId: string;
}
