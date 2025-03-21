describe('Test register', function() {
    const baseURL = Cypress.config('baseAPIURL');
    let userIds = [];
    it.only('should register a user', function() {
        cy.fixture('register-body').then((body) => {
            cy.randomEmail().then((email) =>{
                body.email = email;
                cy.request({
                    method: 'POST',
                    url: `${baseURL}/auth/register`,
                    body: body
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('userId')
                    userIds.push(response.body.userId);
                });
            })
        });
    });
    it('should not register with existing email', function() {
        cy.fixture('register-body').then((body)=>{
            body.email = 'LinhAuto@gmail.com';
            cy.request({
                method: 'POST',
                url: `${baseURL}/auth/register`,
                body: body,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', 'User with this email already exists');
            })
        })
    })
    it('should not register with missing required email field', function() {
        cy.fixture('register-body').then((body) => {
            delete body.email;
            cy.request({
                method: 'POST',
                url: `${baseURL}/auth/register`,
                body: body,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(500);
                expect(response.body).to.have.property('message', 'Error registering user');
            })
        });
    });
    it('should not register with missing required password field', function() {
        cy.fixture('register-body').then((body) => {
            delete body.password;
            cy.request({
                method: 'POST',
                url: `${baseURL}/auth/register`,
                body: body,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(500);
                expect(response.body).to.have.property('message', 'Error registering user');
            })
        });
    });
    it('should not register with missing required username field', function() {
        cy.fixture('register-body').then((body) => {
            delete body.username;
            cy.request({
                method: 'POST',
                url: `${baseURL}/auth/register`,
                body: body,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(500);
                expect(response.body).to.have.property('message', 'Error registering user');
            })
        });
    });
    it('should not register with missing all required fields', function() {
        cy.request({
            method: 'POST',
            url: `${baseURL}/auth/register`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(500);
            expect(response.body).to.have.property('message', 'Error registering user');
        })
    });
    after(() => {
        userIds.forEach((userId) => {
            cy.deleteUser(userId);
        });
    });
})