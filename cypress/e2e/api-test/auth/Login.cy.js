describe('Test login', function() {
    const baseURL = Cypress.config('baseAPIURL');
    it('should login successfully with valid credentials', function() {
        cy.fixture('valid-login-body').then((body) =>{
            cy.request({
                method: 'POST',
                url: `${baseURL}/auth/login`,
                body: body
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('token');
            })
        })
    })
    it('should not login with invalid email', function() {
        cy.request({
            method: 'POST',
            url: `${baseURL}/auth/login`,
            body: {
                email: 'invalid_email',
                password: 'Alo123'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', 'User not found');
        });
    })
    it.only('should not login with invalid password', function() {
        cy.request({
            method: 'POST',
            url: `${baseURL}/auth/login`,
            body: {
                email: 'LinhAuto@gmail.com',
                password: 'invalid_password'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', 'Wrong password. Please try again!');
        });
    })
})