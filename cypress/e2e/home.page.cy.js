describe('On the home page', function () {

    context('Unauthenticated user', function () {
        this.beforeEach(function () {
            cy.visit('/home');
        });
        it('should redirect to the login page', function () {
            cy.url().should('include', '/login');
        });
    });
    context('Authenticated user', function () {
        this.beforeEach(() => {
            cy.intercept('POST', '/api/auth/login').as('loginUser');
            cy.session('loginSession', () => {
                cy.visit('/login');
                cy.login('LinhAuto@gmail.com', 'Alo123');
                cy.wait('@loginUser').then((res) => {
                    expect(res.response.body.user.username).to.eq('LinhAuto');
                    cy.wrap(res.response.body).as('loginResponse');
                });
            })
            cy.visit('/home');
        })
        it('should display the home page', function () {
            cy.get('@loginResponse').then((loginResponse) => {
                cy.url().should('include', '/home');
                const username = loginResponse.user.username;
                cy.get("div h1").should('contain.text', `Welcome, ${username}!`);
                cy.get(".iframe-container iframe").should('be.visible');
            });
        });
    });
});