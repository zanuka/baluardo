describe('watchdesk shell', () => {
  it('loads the detections queue with shell chrome', () => {
    cy.visit('/')
    cy.contains('h1', 'Detections')
    cy.get('[data-testid="app-shell"]').should('be.visible')
    cy.get('[data-testid="site-switcher"]').should('be.visible')
    cy.get('[data-testid="empty-state"]').should('be.visible')
    cy.contains('No detections in queue')
  })

  it('navigates to detection detail by id', () => {
    cy.visit('/detections/det-001')
    cy.contains('h1', 'Detection')
    cy.contains('det-001')
    cy.get('[data-testid="empty-state"]').should('be.visible')
  })

  it('shows a toast from the demo control', () => {
    cy.visit('/detections')
    cy.get('[data-testid="toast-demo"]').click()
    cy.get('[data-testid="toast-stack"]').contains('Phase 2')
  })

  it('persists site selection in the switcher', () => {
    cy.visit('/detections')
    cy.get('[data-testid="site-switcher"]').select('site-alpha')
    cy.get('[data-testid="site-switcher"]').should('have.value', 'site-alpha')
  })
})
