'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
  async store ({ request }) {
    const data = request.only(['name', 'email', 'password'])

    const user = await User.create(data)

    return user
  }

  async update ({ request, response, auth }) {
    const user = await User.findOrFail(auth.user.id)
    const { name, current_password, password } = request.all()

    if (current_password && password) {
      const passwordMatch = await Hash.verify(current_password, user.password)

      if (!passwordMatch) {
        return response
          .status(400)
          .send({ error: { message: 'The current password is invalid' } })
      }

      user.password = password
    }

    if (name) {
      user.name = name
    }

    await user.save()

    return user
  }
}

module.exports = UserController
