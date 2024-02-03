const { registerBlockType } = wp.blocks;
const { createElement } = wp.element;
const { Table, TableRow, TableCell } = wp.editor;
const { Button } = wp.components;

function parseHTMLTable(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tableElement = doc.querySelector('table');

    //console.log(tableElement);

    if (!tableElement) {
        //console.log('bad table');
        return [];
    }

    //console.log('table ran')

    const rows = Array.from(tableElement.querySelectorAll('tr'));

    return rows.map((row) =>
        Array.from(row.querySelectorAll('td, th')).map((cell) => cell.innerHTML)
    );
} 



registerBlockType('custom-spreadsheet-upload/block', {
    title: 'Custom Spreadsheet',
    icon: 'menu',
    category: 'common',
    attributes: {
        parsedData: {
            type: 'string'
        },
        selectedFile: {
            type: 'string'
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const onFileChange = (event) => {
            setAttributes({selectedFile: event.target.files[0]})
            const file = event.target.files[0];
            if (file) {
                console.log(file);
                
                const reader = new FileReader();

                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    //console.log(XLSX.utils.sheet_to_html(worksheet));
                    const htmlWorksheet = XLSX.utils.sheet_to_html(worksheet);

                    setAttributes({parsedData: htmlWorksheet });
                    //console.log(typeof attributes.parsedData);
                };
                reader.readAsArrayBuffer(file);
            }
        };

        return createElement('div', null, 
            createElement('input', {
                type: 'file',
                onChange: onFileChange,
                accept: '.xlsx',
            }),
            createElement(Button, {
                onClick: function () {
                    console.log(attributes.parsedData);
                },
            }, 'Log Parsed Data'),
        );
    },
    save: ({ attributes }) => {
        // Parse the HTML table content into rows and cells
        const rows = parseHTMLTable(attributes.parsedData);
    
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
                    { key: rowIndex, className: rowIndex === 0 ? 'title-row' : ''},
                    // Iterate over the cells in each row and create TableCell components
                    row.map((cell, cellIndex) =>
                        createElement(
                            'td',
                            { key: cellIndex },
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