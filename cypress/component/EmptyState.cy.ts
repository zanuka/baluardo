import EmptyState from '@/components/EmptyState.vue'

describe('EmptyState', () => {
  it('renders title and description', () => {
    cy.mount(EmptyState, {
      props: {
        title: 'No detections in queue',
        description: 'Waiting for sensor readings.',
      },
    })

    cy.get('[data-testid="empty-state"]').should('be.visible')
    cy.contains('No detections in queue')
    cy.contains('Waiting for sensor readings.')
  })
})
