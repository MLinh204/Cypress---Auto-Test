describe('On the todo list page', function(){
    context('Test Intercept', function(){
        beforeEach(function(){
            cy.intercept('POST', '/api/auth/login').as('loginUser');
            cy.session('loginSession', () => {
                cy.visit('/login');
                cy.login('LinhAuto@gmail.com', 'Alo123');
                cy.wait('@loginUser').then((res) => {
                    expect(res.response.body.user.username).to.eq('LinhAuto');
                    let userId = res.response.body.user.id;
                    sessionStorage.setItem('userId', userId);
                });
            });
        })
        it('intercepts on response', () => {
            cy.window().then((win) => {
                const userId = win.sessionStorage.getItem('userId'); 
                expect(userId).to.exist; 
                cy.log(`Retrieved userId: ${userId}`);
        
                cy.intercept('GET', `/api/todos/getTodos/${userId}`, (req) => {
                    req.reply((res) => {
                        if (res.body[1]) {
                            res.body[1].title = 'Intercepted';
                            res.body[1].description = 'Intercepted';
                            res.body[1].userId = userId;
                        }
                        return res;
                    });
                });
                cy.visit('/todo');
            });
        });
        
    })
})