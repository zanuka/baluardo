import { mount } from 'cypress/vue'
import '@/styles/main.css'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
