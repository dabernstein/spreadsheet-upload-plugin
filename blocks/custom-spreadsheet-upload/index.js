const { registerBlockType } = wp.blocks;
const { createElement, useState } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { Button, Dropdown, PanelBody, SelectControl, ColorPicker, ColorPalette, TextControl, CheckboxControl } = wp.components;

async function convertSpreadsheetToHTML(spreadsheetFile) {
    const workbook = XLSX.read(await (spreadsheetFile).arrayBuffer());
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const htmlWorksheet = XLSX.utils.sheet_to_html(worksheet);

    return(htmlWorksheet);
}

function parseHTMLTable(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tableElement = doc.querySelector('table');

    if (!tableElement) {
        return [];
    }

    const rows = Array.from(tableElement.querySelectorAll('tr'));
    
    return Array.from(rows, (row) =>
        Array.from(row.querySelectorAll('td, th')).map((cell) => cell.innerHTML)
    );
} 

function convertTableToColumnArray(table) {
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

// Converts table headers to short header
function headerShortHand(tableHeaders) {
    if (customFields != null) {
        tableHeaders.map((header, index) => {
            for (i = 0; i < customFields.length; i++) {
                if (header === customFields[i][0]) {
                    tableHeaders[index] = customFields[i][1];
                }
            }
        });
        return tableHeaders;
    }
    else {
        return tableHeaders;
    }
}

// Assigns table header a title for a description of the column
function headerDescription(header) {
    //console.log('ran');
    if (customFields != null) {
        for (i = 0; i < customFields.length; i++) {
            if (header === customFields[i][1] || header === customFields[i][0]) {
                return customFields[i][3];
            }
        };
        return null;
    }
    else {
        return null;
    }
}

registerBlockType('custom-spreadsheet-upload/block', {
    title: 'Custom Spreadsheet',
    icon: 'menu',
    category: 'common',
    attributes: {
        htmlSpreadsheetData: { //HTML attribute for storing converted spreadsheet to html (This probably can be removed)
            type: 'string'
        },
        parsedTable: { //Parsed table attribute stored
            type: 'array',
            default: []
        },
        fileUploaded: {
            type: 'boolean',
            default: false
        },
        checkedColumnList: {
            type: 'array',
            default: null
        },
        columnSpecialCharacters: {
            type: 'array',
            default: null
        },
        headerList: {
            type: 'array',
            default: []
        },
        headerBackgroundColor: {
            type: 'string',
            default: ''
        },
        headerFontSize: {
            type: 'string',
            default: "14"
        },
        bodyBackgroundColor: {
            type: 'string',
            default: ''
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const onFileChange = async (event) => {
            const file = event.target.files[0];

            const htmlString = await convertSpreadsheetToHTML(file)
            
            setAttributes({htmlSpreadsheetData: htmlString});

            const parsedTable = parseHTMLTable(htmlString);

            console.log(headerShortHand(parsedTable[0]));

            setAttributes({headerList: parsedTable[0]});
            setAttributes({parsedTable: parsedTable});
            setAttributes({fileUploaded: true});
        };

        // Reorder Table Set Values
        const [isReordering, setIsReordering] = useState(false);

        const onReorderClick = () => {
            setIsReordering(!isReordering);
            
            if (isReordering) {
                console.log('Closed');
                const newTableOrder = tableArrayReorder(convertTableToColumnArray(attributes.parsedTable), attributes.headerList);
                setAttributes({parsedTable: newTableOrder});
            }
        };

        // Reorder Function for Table
        const onItemOrderChange = (newOrder, index) => {
            const newItemsOrder = [...attributes.headerList];
            const holdHeader = newItemsOrder[newOrder - 1];

            newItemsOrder[newOrder - 1] = newItemsOrder[index];
            newItemsOrder[index] = holdHeader;
            setAttributes({ headerList: newItemsOrder });
        };

        // Hide Columns Set Values 
        const [isHiding, setIsHiding] = useState(false);

        const onHideClick = () => {
            setIsHiding(!isHiding);

            if (isHiding) {
                console.log(isCheckedColumn);
                setAttributes({checkedColumnList: isCheckedColumn});
            }
        }

        // Checkbox Funtion for Hide Columns
        const [isCheckedColumn, setIsCheckedColumn] = useState(
           attributes.checkedColumnList == null ? Array(attributes.headerList.length).fill(false) : attributes.checkedColumnList
        );

        const onCheckedColumn = (position) => {
            const updatedCheckedColumn = isCheckedColumn.map((item, index) => 
                index === position ? !item : item
            );

            setIsCheckedColumn(updatedCheckedColumn);
        }

        // Function for Column Special Variables
        const [isSpecialCharacter, setIsSpecialCharacter] = useState(false);

        const onSpecialClick = () => {
            if (attributes.columnSpecialCharacters == null) {
                const tempArray = Array(attributes.headerList.length).fill('');
                setAttributes({columnSpecialCharacters: tempArray});
            }

            setIsSpecialCharacter(!isSpecialCharacter);
        }

        function setHeaderColor(event) {
            setAttributes({headerBackgroundColor: event});
        }

        const [headerFontSize, setHeaderFontSize] = useState(14);

        function setBodyColor(event) {
            setAttributes({bodyBackgroundColor: event});
        }

        // Edit return statment for the admin view
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
            // Block Settings
            createElement('div', null, 
            createElement(InspectorControls, null,
                // Reorder Table
                createElement(PanelBody, { title: 'Block Settings', initialOpen: true },
                    createElement(Button, {
                        onClick: onReorderClick,
                    }, isReordering ? 'Close Reorder Table' : 'Open Reorder Table'),
                    isReordering &&
                    attributes.headerList.map((item, index) => (
                        createElement(SelectControl, {
                            key: index,
                            label: `Order for ${item}`,
                            value: index + 1,  // Starting from 1
                            options: Array.from({ length: attributes.headerList.length }, (_, i) => ({
                                label: `${i + 1}`,
                                value: i + 1,
                            })),
                            onChange: (newOrder) => onItemOrderChange(newOrder, index),
                        })
                    )),
                    // Hide Columns
                    createElement(Button, {
                        onClick: onHideClick,
                    }, isHiding ? 'Set Column Visibility' : 'Open Hide Columns'),
                    isHiding &&
                    attributes.headerList.map((item, index) => (
                        createElement(CheckboxControl, {
                            key: index,
                            label: item,
                            checked: isCheckedColumn[index],
                            onChange: () => onCheckedColumn(index),
                        })
                    )),
                    // Adding special variables for columns
                    createElement(Button, {
                        onClick: onSpecialClick,
                    }, isSpecialCharacter ? 'Close Special Characters' : 'Open Special Characters'),
                    isSpecialCharacter &&
                    createElement('div', null,
                        attributes.headerList.map((item, index) => (
                            createElement(TextControl, {
                                key: index,
                                label: item,
                                type: 'text',
                                value: attributes.columnSpecialCharacters[index],
                                onChange: function (newSpecialVariable) {
                                    if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(newSpecialVariable)) {
                                        var newColumnSpecialCharacters = Array(attributes.columnSpecialCharacters);
                                        newColumnSpecialCharacters[index] = newSpecialVariable;
                                        setAttributes({columnSpecialCharacters: newColumnSpecialCharacters});
                                    }
                                }
                            })
                        ))
                    )
                )
            )),
            // Style Settings
            createElement('div', null,
                createElement(InspectorControls, {group: 'styles'},
                    createElement(PanelBody, {title: 'Header Style', initialOpen: false}, 
                        createElement('div', null, 
                            createElement(ColorPalette, {
                                value: attributes.headerBackgroundColor,
                                onChange: setHeaderColor
                            },),
                        ),
                        createElement('div', null, 
                            createElement(TextControl, {
                                label: 'Font Size',
                                type: 'number',
                                value: headerFontSize,
                                onChange: function (newFontSize) {
                                    setHeaderFontSize(newFontSize);
                                    setAttributes({headerFontSize: newFontSize});
                                }
                            })
                        )
                    ),
                    createElement(PanelBody, {title: 'Cell Body Styles', initialOpen: false},
                        createElement('div', null, 
                            createElement(ColorPalette, {
                                value: attributes.bodyBackgroundColor,
                                onChange: setBodyColor
                            },)
                        ),
                    )
                )
            )
        )
    },

    //Save return statement for the front-end view
    save: ({ attributes }) => {
        // Parse the HTML table content into rows and cells
        const rows = attributes.parsedTable

        const headerStyle = {
            backgroundColor: attributes.headerBackgroundColor,
            fontSize: attributes.headerFontSize + 'px'
        }
        const dataCellStyle = {
            backgroundColor: attributes.bodyBackgroundColor
        }
    
        return createElement('div', null, createElement(
            'table',
            {
                style: {  },
                className: 'spreadsheet-table sortableTable',
            },
            createElement('tbody', null, 
            // Iterate over the parsed rows and create TableRow components
            rows.map((row, rowIndex) =>
                createElement(
                    'tr',
                    { key: rowIndex, style: rowIndex === 0 ? headerStyle : dataCellStyle, className: rowIndex === 0 ? 'title-row' : null },
                    // Iterate over the cells in each row and create TableCell components
                    row.map((cell, cellIndex) =>
                        !attributes.checkedColumnList[cellIndex] ? createElement(
                            rowIndex === 0 ? 'th' : 'td',
                            { key: cellIndex, className: 'column-' + (cellIndex+1), title: rowIndex === 0 ? headerDescription(cell) : null },
                            rowIndex === 0 ? createElement('div', {className: 'cell-content'}, createElement('div', {className: 'cell'}, cell), createElement('span', {className: 'dashicons dashicons-sort sort-icon'})) : cell
                        ) : null
                    ) 
                ) 
            ) 
        ))
    );
    },
});