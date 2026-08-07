/// <reference types="cypress" />

describe('Marriage Compatibility (Kundli Milan) Flow', () => {
  beforeEach(() => {
    // Navigate to the app (assuming it runs on localhost:3000)
    cy.visit('/');
    
    // Switch to the Marriage Match view
    cy.contains('button', 'Kundli Milan').click();
  });

  it('loads the Marriage Match page successfully', () => {
    // Check if the main title is present
    cy.get('h1').contains('Marriage Compatibility', { matchCase: false }).should('be.visible');
    
    // Check for both Boy and Girl forms
    cy.contains('Boy\'s Details', { matchCase: false }).should('be.visible');
    cy.contains('Girl\'s Details', { matchCase: false }).should('be.visible');
    
    // Check if the main CTA is present and initially disabled
    cy.get('button').contains('Check Compatibility', { matchCase: false })
      .should('be.visible')
      .and('be.disabled');
  });

  it('allows filling out both forms and submitting', () => {
    // Fill out Boy's details
    // We are looking for inputs inside the first PersonBirthForm (Male)
    cy.get('input[placeholder="Enter name"]').eq(0).type('John Smith');
    cy.get('input[type="date"]').eq(0).type('1990-01-01');
    cy.get('input[type="time"]').eq(0).type('10:30');
    // Simulate location search and selection
    cy.get('input[placeholder="City, State or Country"]').eq(0).type('New York');
    cy.contains('New York, NY').click(); // Assuming autocomplete dropdown appears

    // Fill out Girl's details
    cy.get('input[placeholder="Enter name"]').eq(1).type('Jane Doe');
    cy.get('input[type="date"]').eq(1).type('1992-05-15');
    cy.get('input[type="time"]').eq(1).type('14:45');
    cy.get('input[placeholder="City, State or Country"]').eq(1).type('London');
    cy.contains('London, UK').click();

    // Now the Check button should be enabled
    cy.get('button').contains('Check Compatibility', { matchCase: false })
      .should('not.be.disabled')
      .click();

    // Loading state should appear
    cy.contains('Checking...').should('be.visible');

    // Wait for API response and results to render
    // We expect the compatibility gauge and result cards to appear
    cy.contains('Total Kuta Score', { timeout: 15000 }).should('be.visible');
    cy.contains('Boy Dosha').should('be.visible');
    cy.contains('Girl Dosha').should('be.visible');
    
    // Check Lagna Chart rendering
    cy.contains("Boy's Lagna Chart (D-1)").should('be.visible');
    cy.contains("Girl's Lagna Chart (D-1)").should('be.visible');
  });
  
  it('allows switching between North/South/East Indian chart styles', () => {
    // We assume the results are already populated (could intercept/stub API here to save time)
    // For now, this is a placeholder showing intent. We'd stub the checkMarriageMatch API route.
    cy.intercept('POST', '**/marriage-match', { fixture: 'marriageMatchResult.json' }).as('getMatch');
    
    // Fill minimal data to trigger submit
    cy.get('input[placeholder="Enter name"]').eq(0).type('A');
    cy.get('input[type="date"]').eq(0).type('2000-01-01');
    cy.get('input[type="time"]').eq(0).type('12:00');
    cy.get('input[placeholder="City, State or Country"]').eq(0).type('Delhi');
    cy.get('input[placeholder="Enter name"]').eq(1).type('B');
    cy.get('input[type="date"]').eq(1).type('2000-01-01');
    cy.get('input[type="time"]').eq(1).type('12:00');
    cy.get('input[placeholder="City, State or Country"]').eq(1).type('Mumbai');
    
    cy.get('button').contains('Check Compatibility', { matchCase: false }).click();
    cy.wait('@getMatch');

    // Switch chart styles
    cy.contains('East Indian').click();
    // Verify SVG structure changes (e.g. triangles for East Indian)
    cy.get('polygon').should('exist');
    
    cy.contains('South Indian').click();
    // Verify SVG structure changes back
    cy.get('rect').should('exist');
  });
});
