describe('Sign-Up', function(){
    this.beforeEach(()=>{
        cy.visit('/register');
    })
    it('should sign up a user', function(){
        cy.randomEmail().then((email) =>{
            cy.register(email, 'password123', 'testuser');
        })
        cy.window().then((win) =>{
            cy.stub(win, 'alert').callsFake((msg) =>{
                expect(msg).to.equal('Registration successful! You can now log in.')
            })
        }).then(() =>{
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/login');
        });
    })
    it('Cannot register an existing user', function(){
        cy.intercept('POST', '/api/auth/register').as('register');
        cy.window().then((win) =>{
            cy.stub(win, 'alert').callsFake((msg) =>{
                expect(msg).to.equal('Registration failed! Please try again.')
            })
        })

        cy.register('test@example.com', 'password123', 'testuser');
        cy.wait('@register').its('response.statusCode').should('eq', 400);
    })
    it('Cannot register without an email', function(){
        cy.get('#email').should('have.attr', 'required');
    })
    it('Cannot register without a password', function(){
        cy.get('#password').should('have.attr', 'required');
    })
    it('Cannot register without a username', function(){
        cy.get('#username').should('have.attr', 'required');
    })
    it('Should redirect to login page when selecting Login button', function(){
        cy.get("a[href='/login']").click()
        cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/login');
    })
})