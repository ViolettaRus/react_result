export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
}


