export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  feed: {
    all: ["feed"] as const,
    list: (page?: number) => ["feed", "list", page] as const,
  },
  posts: {
    all: ["posts"] as const,
    explore: (page?: number) => ["posts", "explore", page] as const,
    detail: (id: number) => ["posts", "detail", id] as const,
    comments: (id: number, page?: number) => ["posts", "comments", id, page] as const,
    likes: (id: number, page?: number) => ["posts", "likes", id, page] as const,
    myPosts: (page?: number) => ["posts", "my-posts", page] as const,
    myLikes: (page?: number) => ["posts", "my-likes", page] as const,
    mySaved: (page?: number) => ["posts", "my-saved", page] as const,
  },
  users: {
    all: ["users"] as const,
    search: (query: string, page?: number) => ["users", "search", query, page] as const,
    profile: (username: string) => ["users", "profile", username] as const,
    posts: (username: string, page?: number) => ["users", "posts", username, page] as const,
    likes: (username: string, page?: number) => ["users", "likes", username, page] as const,
    followers: (username: string, page?: number) => ["users", "followers", username, page] as const,
    following: (username: string, page?: number) => ["users", "following", username, page] as const,
    myFollowers: (page?: number) => ["users", "my-followers", page] as const,
    myFollowing: (page?: number) => ["users", "my-following", page] as const,
  },
};
