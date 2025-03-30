const papa = require('papaparse');

describe('File manage testing', function () {
    it('should add a file', function () {
        const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
        cy.addFile(dir, 'testFile.txt', 'Initial content');
    });
    it('should edit a file', function () {
        const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
        cy.editFile(`${dir}/testFile.txt`, 'Edited content');
    });
    it('should delete a file', function () {
        const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
        cy.deleteFile(`${dir}/testFile.txt`);
    });
    // it('test', function () {
    //     const dir = '/Users/linhhoang204/Documents/Sheets/Stored files';
    //     cy.task('getLatestFile', { dir, extension: 'csv' }).then(filename => {
    //         const filePath = `${dir}/${filename}`;

    //         cy.readFile(filePath, 'utf8').then((content) => {
    //             const result = papa.parse(content, { header: true });
    //             const headers = result.meta.fields;

    //             const hasAColumn = headers.some(header =>
    //                 header.toLowerCase() === 'audit id');

    //             expect(hasAColumn).to.be.true;
    //         });
    //     });
    // })
    context('Move file', function () {
        beforeEach(function () {
            const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
            cy.addFile(dir, 'testFile.txt', 'Initial content');
        });
        it.only('should move a file', function () {
            const dir = '/Users/linhhoang204/Documents/Sheets/TestFolder';
            const destinatedDir = '/Users/linhhoang204/Documents/Sheets/destinatedFolder';
            cy.deleteAllFiles(destinatedDir);
            cy.moveFile(`${dir}/testFile.txt`, `${destinatedDir}/MovedFile.txt`);
        });
    })
})