const { registerBlockType } = wp.blocks;
const { createElement, useState } = wp.element;
const { Table, TableRow, TableCell, InspectorControls } = wp.editor;
const { Button, Dropdown, PanelBody, SelectControl } = wp.components;

async function convertSpreadsheetToHTML(spreadsheetFile) {
    //return new Promise((resolve, rejected) => {
        console.log(spreadsheetFile);
        
        //Defines reader to read spreadsheet as buffer
        //const reader = new FileReader();

        //Reads spreadsheet and converts to HTML
        //reader.onload = (e) => {
            const data = new Array(spreadsheetFile);
            const workbook = XLSX.read(await (spreadsheetFile).arrayBuffer());
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const htmlWorksheet = XLSX.utils.sheet_to_html(worksheet);

            return(htmlWorksheet);
       // };

        // reader.onerror = (error) => {
        //     rejected(error);
        // }

        //reader.readAsArrayBuffer(spreadsheetFile);
    //});
}

function parseHTMLTable(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tableElement = doc.querySelector('table');

    if (!tableElement) {
        //console.log('bad table');
        return [];
    }

    const rows = Array.from(tableElement.querySelectorAll('tr'));
    
    return Array.from(rows, (row) =>
        Array.from(row.querySelectorAll('td, th')).map((cell) => cell.innerHTML)
    );
} 

function convertTableToColumnArray(table) {
    // const rows = parseHTMLTable(table);

    console.log("This is table");
    console.log(table);

    var columnArray = table[0].map((_, colIndex) => table.map(row => row[colIndex]));;

    return columnArray;
}

//Converts array back into table from column
function convertTableToRowArray(table) {
    console.log("This is table");
    console.log(table);

    var columnArray = table[0].map((_, colIndex) => table.map(row => row[colIndex]));;

    return columnArray;
}

//Example newOrderArray = {[name, 2], [name, 3]}
function tableArrayReorder(currentTableColumnArray, newOrderHeaderArray) {
    var newArrayOrder = [];
    newOrderHeaderArray.map((header, index) => {
        for (i = 0; i < currentTableColumnArray.length; i++) {
            if (currentTableColumnArray[i][0] === header) {
                newArrayOrder.push(currentTableColumnArray[i])
                break
            }
        }
    }
    );

    return convertTableToRowArray(newArrayOrder);
}

registerBlockType('custom-spreadsheet-upload/block', {
    title: 'Custom Spreadsheet',
    icon: 'menu',
    category: 'common',
    attributes: {
        htmlSpreadsheetData: {
            type: 'string'
        },
        parsedTable: {
            type: 'array',
            default: []
        },
        fileUploaded: {
            type: 'boolean',
            default: false
        },
        headerList: {
            type: 'array',
            default: [1, 2, 3]
        },
        swapStepList: { //Values store as [[newOrder, index], [newOrder, index]]
            type: 'array',
            default: []
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const onFileChange = async (event) => {
            const file = event.target.files[0];

            const htmlString = await convertSpreadsheetToHTML(file)
            
            setAttributes({htmlSpreadsheetData: htmlString});

            const parsedTable = parseHTMLTable(htmlString);

            setAttributes({headerList: parsedTable[0]});
            setAttributes({parsedTable: parsedTable});
            setAttributes({fileUploaded: true});
        };

        const [isReordering, setIsReordering] = useState(false);

        const onReorderClick = () => {
            setIsReordering(!isReordering);
            
            if (isReordering) {
                console.log('Closed');
                const newTableOrder = tableArrayReorder(convertTableToColumnArray(attributes.parsedTable), attributes.headerList);
                setAttributes({parsedTable: newTableOrder});
            }
        };

        const onItemOrderChange = (newOrder, index) => {
            const newItemsOrder = [...attributes.headerList];
            const holdHeader = newItemsOrder[newOrder - 1];

            newItemsOrder[newOrder - 1] = newItemsOrder[index];
            newItemsOrder[index] = holdHeader;
            setAttributes({ headerList: newItemsOrder });
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
                        console.log(attributes.parsedTable);
                    },
                }, 'Log Parsed Data'),
            ),
            createElement('div', null, 
            createElement(InspectorControls, null,
                createElement(PanelBody, { title: 'Block Settings', initialOpen: true },
                    createElement(Button, {
                        onClick: onReorderClick,
                    }, isReordering ? 'Close Reorder Table' : 'Open Reorder Table'),
                    isReordering &&
                    attributes.headerList.map((item, index) => (
                        createElement(SelectControl, {
                            key: index,
                            label: `Order for ${item}`,
                            //value: 0,
                            value: index + 1,  // Starting from 1
                            options: Array.from({ length: attributes.headerList.length }, (_, i) => ({
                                label: `${i + 1}`,
                                value: i + 1,
                            })),
                            onChange: (newOrder) => onItemOrderChange(newOrder, index),
                        })
                    ))
                )
            ))
        )
    },
    save: ({ attributes }) => {
        // Parse the HTML table content into rows and cells
        const rows = attributes.parsedTable
    
        return createElement('div', null, createElement(
            'table',
            {
                style: {  },
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