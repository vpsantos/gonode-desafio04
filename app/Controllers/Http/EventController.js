'use strict'

const Kue = use('Kue')
const Job = use('App/Jobs/ShareEventMail')

const Event = use('App/Models/Event')

const moment = require('moment')

/**
 * Resourceful controller for interacting with events
 */
class EventController {
  /**
   * Show a list of all events.
   * GET events
   */
  async index ({ auth }) {
    const events = await Event.query()
      .where('user_id', auth.user.id)
      .orderBy('date', 'desc')
      .fetch()

    return events
  }

  /**
   * Create/save a new event.
   * POST events
   */
  async store ({ request, response, auth }) {
    const data = request.only(['title', 'location', 'date'])

    if (new Date(data.date).getTime() < Date.now()) {
      return response
        .status(400)
        .send({ error: { message: 'The date must be a future date' } })
    }

    const dateEventsCount = await Event.query()
      .where({ user_id: auth.user.id, date: data.date })
      .getCount()

    if (dateEventsCount > 0) {
      return response.status(400).send({
        error: {
          message: 'There is already an event scheduled for this date/time'
        }
      })
    }

    const event = await Event.create({ ...data, user_id: auth.user.id })

    return event
  }

  /**
   * Display a single event.
   * GET events/:id
   */
  async show ({ response, params, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response
        .status(401)
        .send({ error: { message: 'Permission denied' } })
    }

    await event.load('user')

    return event
  }

  /**
   * Update event details.
   * PUT or PATCH events/:id
   */
  async update ({ response, params, request, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response
        .status(401)
        .send({ error: { message: 'Permission denied' } })
    }

    if (new Date(event.date).getTime() < Date.now()) {
      return response
        .status(400)
        .send({ error: { message: 'Past events cannot be edited' } })
    }

    const data = request.only(['title', 'location', 'date'])

    if (new Date(data.date).getTime() < Date.now()) {
      return response
        .status(400)
        .send({ error: { message: 'The date must be a future date' } })
    }

    const dateEventsCount = await Event.query()
      .where({ user_id: auth.user.id, date: data.date })
      .getCount()

    if (dateEventsCount > 0) {
      return response.status(400).send({
        error: {
          message: 'There is already an event scheduled for this date/time'
        }
      })
    }

    event.merge(data)

    await event.save()

    return event
  }

  /**
   * Delete a event with id.
   * DELETE events/:id
   */
  async destroy ({ response, params, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response
        .status(401)
        .send({ error: { message: 'Permission denied' } })
    }

    if (new Date(event.date).getTime() < Date.now()) {
      return response
        .status(400)
        .send({ error: { message: 'Past events cannot be deleted' } })
    }

    event.delete()
  }

  async share ({ request, response, params, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response
        .status(401)
        .send({ error: { message: 'Permission denied' } })
    }

    const recipientEmail = request.input('recipient_email')

    const name = auth.user.name
    const email = auth.user.email
    const title = event.title
    const location = event.location
    const date = moment(event.date).format('DD/MM/YYYY')
    const time = moment(event.date).format('HH:mm:ss')

    Kue.dispatch(
      Job.key,
      { recipientEmail, name, email, title, location, date, time },
      {
        attempts: 3
      }
    )
  }
}

module.exports = EventController
