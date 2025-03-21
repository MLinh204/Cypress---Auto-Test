describe('Test get user', function(){
    const baseURL = Cypress.config('baseAPIURL');
    let token;
    let userId;
    beforeEach(function(){
        cy.loginAPI();
    })
    it('should get user successfully', function(){
        token = Cypress.env('authToken');
        userId = Cypress.env('userId');
        cy.log(token);
        cy.log('UserId: '+ userId);
        cy.request({
            method: 'GET',
            url: `${baseURL}/users/getUser/${userId}`,
            headers: {
                'Authorization': `${token}`
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.id).eql(userId);
        });
    });
    it('should not get user with invalid token', function(){
        const token = 'Invalid'
        userId = Cypress.env('userId');
        cy.request({
            method: 'GET',
            url: `${baseURL}/users/getUser/${userId}`,
            headers: {
                'Authorization': `${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('message', 'Invalid token');
        });
    });
    it('should return empty if user not found', function(){
        const token = Cypress.env('authToken');
        const userId = 'notFound';
        cy.request({
            method: 'GET',
            url: `${baseURL}/users/getUser/${userId}`,
            headers: {
                'Authorization': `${token}`
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.empty;
        });
    })
    it('should return error if user id is not provided', function(){
        const token = Cypress.env('authToken');
        cy.request({
            method: 'GET',
            url: `${baseURL}/users/getUser/`,
            headers: {
                'Authorization': `${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });
})

