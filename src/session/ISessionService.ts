interface ISessionService {
  get({
    token,
    options,
  }: {
    token: string
    options?: { prefix?: string }
  }): Promise<string | null>
  set({
    token,
    value,
    options,
  }: {
    token: string
    value: string
    options?: { prefix?: string; expirationTime?: number }
  }): Promise<string>
  delete({
    token,
    options,
  }: {
    token: string
    options?: { prefix?: string }
  }): Promise<void>
}
