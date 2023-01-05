export interface EventMessage {
  readonly currentSceneId: string;
  readonly event: string;
  readonly actorId: string;
  readonly targetId?: string;
  readonly itemId?: string;
  readonly targetSceneId?: string;
}
