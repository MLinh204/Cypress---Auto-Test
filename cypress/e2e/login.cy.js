describe('Login', function(){
    this.beforeEach(()=>{
        cy.visit('https://frabjous-malasada-7b6ce7.netlify.app/login');
    })
    it('should login successfully', function(){
        cy.intercept('POST', 'api/auth/login').as('loginSuccess')
        cy.login('LinhAuto@gmail.com', 'Alo123');
        cy.wait('@loginSuccess').its('response.statusCode').should('eq', 200);
        cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/home');
    })
    it('should not logged in with no password', function(){
        cy.get('#password').should('have.attr', 'required');
    })
    it('should not logged in with no email', function(){
        cy.get('#email').should('have.attr', 'required');
    })
    it('should not allow login with incorrect password', function(){
        cy.intercept('POST', 'api/auth/login').as('loginFailed')
        cy.window().then((win) =>{
            cy.stub(win, 'alert').callsFake((msg) =>{
                expect(msg).to.equal('Invalid email or password')
            })
        })
        cy.login('LinhAuto@gmail.com', 'Alo12345');
        cy.wait('@loginFailed').its('response.statusCode').should('eq', 400);
    });
    it('should not allow login with non-existing email', function(){
        cy.intercept('POST', 'api/auth/login').as('loginFailed')
        cy.window().then((win) =>{
            cy.stub(win, 'alert').callsFake((msg) =>{
                expect(msg).to.equal('Invalid email or password')
            })
        })
        cy.login('LinhAutoTestNonExist@gmail.com', 'Alo123');
        cy.wait('@loginFailed').its('response.statusCode').should('eq', 400);
    })
    it.only('Should redirect to register page when selecting Register button', function(){
        cy.get("a[href='/register']").click()
        cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/register');
    })
})