'use strict'

const Route = use('Route')

Route.post('users', 'UserController.store').validator('User')
Route.post('sessions', 'SessionController.store').validator('Session')

Route.group(() => {
  Route.put('users', 'UserController.update').validator('UserUpdate')

  Route.resource('events', 'EventController')
    .apiOnly()
    .validator(new Map([[['events.store'], ['Event']]]))
  Route.post('events/:id/share', 'EventController.share').validator(
    'EventShare'
  )
}).middleware(['auth'])
