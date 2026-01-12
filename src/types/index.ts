export type ServiceRequestStatus =
  | "draft"
  | "under-review"
  | "approved"
  | "rejected";
export interface ServiceRequest {
  id: string;
  serviceName: string;
  category: string;
  status: ServiceRequestStatus;
  submittedDate: string;
  sla?: number; // Optional SLA in days
  serviceProvider?: string; // Added service provider field
  description?: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  approvers?: Array<{
    id: string;
    name: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    date?: string;
    comments?: string;
  }>;
}
export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
}
