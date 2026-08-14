describe('watchdesk shell', () => {
  it('loads the detections queue with shell chrome', () => {
    cy.visit('/')
    cy.contains('h1', 'Detections')
    cy.get('[data-testid="app-shell"]').should('be.visible')
    cy.get('[data-testid="site-switcher"]').should('be.visible')
    cy.get('[data-testid="api-mode"]').should('contain', 'MSW')
    cy.get('[data-testid="detections-list"]').should('be.visible')
    cy.contains('Anomalous RF burst near perimeter fence')
  })

  it('navigates to detection detail by id', () => {
    cy.visit('/detections/det-001')
    cy.contains('h1', 'Detection')
    cy.contains('Anomalous RF burst near perimeter fence')
    cy.get('[data-testid="ack-button"]').should('be.visible')
  })

  it('shows a toast from the demo control', () => {
    cy.visit('/detections')
    cy.get('[data-testid="toast-demo"]').click()
    cy.get('[data-testid="toast-stack"]').contains('Queue synced')
  })

  it('persists site selection in the switcher', () => {
    cy.visit('/detections')
    cy.get('[data-testid="site-switcher"] option[value="site-alpha"]').should('exist')
    cy.get('[data-testid="site-switcher"]').select('site-alpha')
    cy.get('[data-testid="site-switcher"]').should('have.value', 'site-alpha')
  })
})
