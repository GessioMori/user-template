export interface IEmailProvider {
  sendMail({
    to,
    subject,
    body,
  }: {
    to: string
    subject: string
    body: string
  }): Promise<void>
}
