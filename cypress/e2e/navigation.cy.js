describe('Navigation', function(){
    context('Unauthenticated', function(){
        it('should redirect to the login page when visiting Home nav', function(){
            cy.visit('/home');
            cy.url().should('include', '/login');
        })
        it('should redirect to the login page when visiting Todo List nav', function(){
            cy.visit('/todo');
            cy.url().should('include', '/login');
        })
        it('should redirect to the login page when visiting Profile nav', function(){
            cy.visit('/profile/view');
            cy.url().should('include', '/login');
            cy.visit('/profile/update');
            cy.url().should('include', '/login');
        })
        it('should redirect to the login page when selecting Home nav', function(){
            cy.visit('/home');
            cy.get('li a[href="/home"]').click();
            cy.url().should('include', '/login');
        });
        it('should redirect to the login page when selecting Todo List nav', function(){
            cy.visit('/home');
            cy.get('li a[href="/todo"]').click();
            cy.url().should('include', '/login');
        });
    });
    context('Authenticated', function(){
        beforeEach(function(){
            cy.intercept('POST', '/api/auth/login').as('loginUser');
            cy.session('loginSession', () => {
                cy.visit('/login');
                cy.login('LinhAuto@gmail.com', 'Alo123');
                cy.wait('@loginUser').then((res) => {
                    expect(res.response.body.user.username).to.eq('LinhAuto');
                    cy.wrap(res.response.body).as('loginResponse');
                });
           });
           cy.visit('/home');
        });
        it('should display Home nav when logged in', function(){
            cy.get('li a[href="/home"]').should('be.visible');
        });
        it('should display Todo List nav when logged in', function(){
            cy.get('li a[href="/todo"]').should('be.visible');
        });
        it('should display Profile nav when logged in', function(){
            hoverAndClickProfileSettings();
            cy.get('li a[href="/profile/view"]').should('be.visible');
            cy.get('li a[href="/profile/update"]').should('be.visible');
            cy.xpath("//li/button[contains(text(),'Logout')]").should('be.visible');
        });
        it('should redirect to the home page when selecting Home nav', function(){
            cy.get('li a[href="/home"]').click();
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/home');
        });
        it('should redirect to the todo list page when selecting Todo List nav', function(){
            cy.get('li a[href="/todo"]').click();
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/todo');
        });
        it('should redirect to the profile view page when selecting Profile nav', function(){
            hoverAndClickProfileSettings();
            cy.get('li a[href="/profile/view"]').click();
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/profile/view');
        });
        it('should redirect to the profile update page when selecting Profile nav', function(){
            hoverAndClickProfileSettings();
            cy.get('li a[href="/profile/update"]').click();
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/profile/update');
        });
        it('should logout when selecting Logout nav', function(){
            hoverAndClickProfileSettings();
            cy.xpath("//li/button[contains(text(),'Logout')]").click();
            cy.url().should('eq','https://frabjous-malasada-7b6ce7.netlify.app/login');
            cy.getAllLocalStorage().should('be.empty');
        });
    });
})
function hoverAndClickProfileSettings(){
    cy.get('li button.profile-button').realHover().realClick();
}