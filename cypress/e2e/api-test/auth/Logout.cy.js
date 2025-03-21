describe('Test logout', function(){
    const baseURL = Cypress.config('baseAPIURL');
    let token;
    beforeEach(function(){
        cy.loginAPI();
    })
    it('should logout successfully', function(){
        token = Cypress.env('authToken');
        cy.log(token);
        cy.request({
            method: 'POST',
            url: `${baseURL}/auth/logout`,
            headers: {
                'Authorization': `${token}`
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
        });
    })
})