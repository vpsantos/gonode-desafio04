'use strict'

const Mail = use('Mail')

class ShareEventMail {
  static get concurrency () {
    return 1
  }

  static get key () {
    return 'ShareEventMail-job'
  }

  async handle ({ recipientEmail, name, email, title, location, date, time }) {
    await Mail.send(
      ['emails.share_event'],
      { name, email, title, location, date, time },
      message => {
        message
          .to(recipientEmail)
          .from('admin@calendarapp.com', 'Calendar App')
          .subject(`${name} compartilhou um evento com você`)
      }
    )
  }
}

module.exports = ShareEventMail
