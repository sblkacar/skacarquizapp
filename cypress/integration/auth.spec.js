describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('.user-info').should('contain', 'Test User');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    
    cy.get('.alert-danger').should('be.visible');
  });
}); 