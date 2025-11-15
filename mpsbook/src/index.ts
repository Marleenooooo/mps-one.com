export interface Profile {
  id: string;
  name: string;
  company?: string;
  title?: string;
}

export interface Relationship {
  followerId: string;
  followingId: string;
  blocked?: boolean;
}

export interface Invite {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

