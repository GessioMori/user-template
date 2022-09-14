import nodemailer, { Transporter } from 'nodemailer'
import { Service } from 'typedi'
import { IEmailProvider } from '../IEmailProvider'

@Service()
export class EtherealMailProvider implements IEmailProvider {
  private client: Transporter
  private clientConstructor = async () => {
    const account = await nodemailer.createTestAccount()
    this.client = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    })
  }

  async sendMail({
    to,
    subject,
    body,
  }: {
    to: string
    subject: string
    body: string
  }): Promise<void> {
    if (!this.client) {
      await this.clientConstructor()
    }

    const message = await this.client.sendMail({
      to,
      from: 'dev <dev@dev.com>',
      subject,
      text: body,
      html: body,
    })
    console.log('Message sent: %s', message.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message))
  }
}
