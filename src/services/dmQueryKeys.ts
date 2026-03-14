export const dmQueryKeys = {
  inbox: (userId: string) => ["dm", "inbox", userId] as const,
  inboxProfiles: (userIds: string[]) => ["dm", "inbox-profiles", ...userIds] as const,
  threadMessages: (conversationId: string) => ["dm", "thread", "messages", conversationId] as const,
  threadMeta: (conversationId: string, userId: string) =>
    ["dm", "thread", "meta", conversationId, userId] as const,
};
