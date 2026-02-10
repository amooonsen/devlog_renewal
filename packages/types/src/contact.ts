export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
