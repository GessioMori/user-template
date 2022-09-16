import { Service } from 'typedi'
import { IEmailProvider } from '../../utils/providers/emailProvider/IEmailProvider'

@Service()
export class TestMailProvider implements IEmailProvider {
  async sendMail({
    to,
    subject,
    body
  }: {
    to: string
    subject: string
    body: string
  }): Promise<void> {
    const mailPromise = () => {
      return new Promise((resolve, reject) => {
        if (!to || !subject || !body) {
          reject('Missing info')
        } else {
          resolve({ to, subject, body })
        }
      })
    }
    await mailPromise()
  }
}
