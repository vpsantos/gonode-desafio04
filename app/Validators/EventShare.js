'use strict'

const Antl = use('Antl')

class EventShare {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      recipient_email: 'required|email'
    }
  }

  get messages () {
    return Antl.list('validation')
  }
}

module.exports = EventShare
