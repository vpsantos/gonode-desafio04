'use strict'

const Schema = use('Schema')

class EventSchema extends Schema {
  up () {
    this.create('events', table => {
      table.increments()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.string('title').notNullable()
      table.string('location').notNullable()
      table.timestamp('date').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = EventSchema
