export interface Group {
    id: string
    name: string
    code: string
    created_at: string
    creator_id: string
    creator : {
        name: string
        email: string
    };
    members : Array<{
        user: {
            name: string
            email: string
        }
    }>;
    _count: {
        tasks: number 
        members: number
    }
}

export interface GroupMember {
  id: string
  role: string
  joined_at: string
  user: {
    id: string
    name: string
    email: string
    image: string
  };
}

export interface GroupDetails {
  id: string;
  name: string;
  code: string;
  created_at: string;
  creator_id: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  members: GroupMember[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    user: {
      name: string;
      email: string;
    };
  }>;
}