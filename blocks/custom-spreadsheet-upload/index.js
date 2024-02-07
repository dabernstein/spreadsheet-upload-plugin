const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;
const { Table, TableRow, TableCell } = wp.editor;
const { Button } = wp.components;

function convertSpreadsheetToHTML(spreadsheetFile) {
    return new Promise((resolve, rejected) => {
        console.log(spreadsheetFile);
        
        //Defines reader to read spreadsheet as buffer
        const reader = new FileReader();

        //Reads spreadsheet and converts to HTML
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const htmlWorksheet = XLSX.utils.sheet_to_html(worksheet);

            resolve(htmlWorksheet);
        };

        reader.onerror = (error) => {
            rejected(error);
        }

        reader.readAsArrayBuffer(spreadsheetFile);
    });
}

function parseHTMLTable(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tableElement = doc.querySelector('table');

    if (!tableElement) {
        //console.log('bad table');
        return [];
    }

    const rows = Array.from(tableElement.querySelectorAll('tr'));

    return rows.map((row) =>
        Array.from(row.querySelectorAll('td, th')).map((cell) => cell.innerHTML)
    );
} 

function pullTableElement(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('table');
}



registerBlockType('custom-spreadsheet-upload/block', {
    title: 'Custom Spreadsheet',
    icon: 'menu',
    category: 'common',
    attributes: {
        htmlSpreadsheetData: {
            type: 'string'
        },
        tableData: {
            type: 'string'
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const onFileChange = (event) => {
            const file = event.target.files[0];

            convertSpreadsheetToHTML(file)
                .then((htmlString) => {
                    setAttributes({htmlSpreadsheetData: htmlString});
                })
                .catch((error) => {
                    console.log(error);
                })

            setAttributes({tableData: pullTableElement(attributes.htmlSpreadsheetData)});
        };

        return createElement('div', null, 
            createElement('div', null, 
                createElement('input', {
                    type: 'file',
                    onChange: onFileChange,
                    accept: '.xlsx',
                }),
                createElement(Button, {
                    onClick: function () {
                        console.log(attributes.tableData);
                    },
                }, 'Log Parsed Data'),
            )
        )
    },
    save: ({ attributes }) => {
        // Parse the HTML table content into rows and cells
        const rows = parseHTMLTable(attributes.htmlSpreadsheetData);
    
        return createElement('div', null, createElement(
            'table',
            {
                style: { textAlign: attributes.alignment },
                className: 'spreadsheet-table',
            },
            createElement('tbody', null, 
            // Iterate over the parsed rows and create TableRow components
            rows.map((row, rowIndex) =>
                createElement(
                    'tr',
                    { key: rowIndex, className: rowIndex === 0 ? 'title-row' : null },
                    // Iterate over the cells in each row and create TableCell components
                    row.map((cell, cellIndex) =>
                        createElement(
                            'td',
                            { key: cellIndex, className: 'column-' + (cellIndex+1) },
                            // The content of each cell
                            cell
                        )
                    )
                )
            )
        ))
    );
    },
});