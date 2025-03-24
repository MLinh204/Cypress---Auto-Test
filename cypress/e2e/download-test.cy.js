const papa = require('papaparse');

describe('Download testing', function () {
    before(function () {
        cy.session('loginSession', function () {
            cy.intercept('POST', 'https://crxextapi.qa.dmh.veritone.com/identities-api/v1/session/create').as('createSession');
            cy.loginAdminApp();
            cy.wait('@createSession').then((res) => {
                expect(res.response.statusCode).to.eq(200);
            })
        })
    });
    it('should have a expected column', function () {
        const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
        cy.deleteAllFiles(dir);
        cy.visit('https://admin.qa.dmh.veritone.com/#/report');
        cy.createDownload();
        cy.visit('https://admin.qa.dmh.veritone.com/#/report')
        cy.xpath("//table/tbody/tr[1]/td[6]/span", { timeout: 60000 })
            .should('include.text', 'Complete');
        cy.xpath('//table/tbody/tr[1]/td[9]/button').click();

        cy.wait(10000);
        cy.task('getLatestFile', { dir, extension: 'csv' }).then(filename => {
            const filePath = `${dir}/${filename}`;

            cy.readFile(filePath, 'utf8').then((content) => {
                const result = papa.parse(content, { header: true });
                const headers = result.meta.fields;

                const hasAColumn = headers.some(header =>
                    header.toLowerCase() === 'customer name');

                expect(hasAColumn).to.be.true;
            });
        });
    })

})