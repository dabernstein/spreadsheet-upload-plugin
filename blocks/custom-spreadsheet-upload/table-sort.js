(function ($) {
    document.addEventListener('DOMContentLoaded', function () {
        // Wait for the document to be fully loaded
    
        // Add click event listener to table header elements
        const tableHeaders = document.querySelectorAll('.spreadsheet-title');
    
        // Object to store the current sorting order for each column
        var sortingOrders = {};

        var previousHeader = null;

        var currentHeaderTitle = '';
        var previousHeaderTitleHolder = '';
    
        tableHeaders.forEach(function (header, columnIndex) {
            header.addEventListener('click', function () {

                // Get the table element
                const table = document.querySelector('.spreadsheet-table');
    
                // Get the header row
                const headerRow = table.querySelector('.title-row');
    
                if (!headerRow) {
                    console.error('Header row not found. Make sure the table has a thead element with a tr element.');
                    return;
                }
    
                // Get all rows except the header row
                const rows = Array.from(table.querySelectorAll('.spreadsheet-body .spreadsheet-row'));

                // Resets the sortingOrders object if the header is different
                if (header != previousHeader) {
                    sortingOrders = {};
                }
    
                // Get the current sorting order for the column
                const currentOrder = sortingOrders[columnIndex] || 'asc';
    
                // Toggle between ascending and descending order
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    
                // Update the sorting order for the column
                sortingOrders[columnIndex] = newOrder;
    
                // Sort the rows based on the clicked header and order
                const sortedRows = sortTableRows(rows, columnIndex, newOrder);
    
                // Create a new table body container

                const newTbody = document.createElement('div');
                newTbody.className = 'spreadsheet-body';
    
                // Append sorted rows to the new table body
                sortedRows.forEach(row => newTbody.appendChild(row));
    
                // Remove existing tbody from the table
                const existingTbody = table.querySelector('div.spreadsheet-body');
                if (existingTbody) {
                    existingTbody.remove();
                }
    
                newTbody.insertBefore(headerRow, newTbody.firstChild);

                // Append the new tbody to the table
                table.appendChild(newTbody);

                for (let index = 0; index < customFields.length; index++) {
                    if (customFields[index][1] == header.querySelector('.header-cell').innerText.trim()) {
                        if (previousHeaderTitleHolder == '') {
                            previousHeaderTitleHolder = header.querySelector('.header-cell').textContent;
                        }
                        currentHeaderTitle = header.querySelector('.header-cell').textContent;
                        header.querySelector('.header-cell').textContent = customFields[index][2];
                        break;
                    }
                    else if (customFields[index][2] == header.querySelector('.header-cell').innerText.trim()) {
                        currentHeaderTitle = header.querySelector('.header-cell').textContent;
                        break;
                    }
                    else {
                        currentHeaderTitle = '';
                    }
                }

                // Need to change firstElementChild to shorter code
                //Swap caret icon
                if (header.lastElementChild.classList.contains('dashicons-sort')) {
                    header.lastElementChild.classList.remove('dashicons-sort');
                    header.lastElementChild.classList.add('dashicons-arrow-up');
                }
                else if (header.lastElementChild.classList.contains('dashicons-arrow-down')){
                    header.lastElementChild.classList.remove('dashicons-arrow-down');
                    header.lastElementChild.classList.add('dashicons-arrow-up');
                } 
                else {
                    header.lastElementChild.classList.remove('dashicons-arrow-up');
                    header.lastElementChild.classList.add('dashicons-arrow-down');
                }

                // If previous header is assigned and isn't the current header then reset caret
                if (previousHeader != header && previousHeader != null) {
                    if (previousHeaderTitleHolder != null && previousHeaderTitleHolder != '') {
                        previousHeader.firstElementChild.textContent = previousHeaderTitleHolder;
                    }

                    previousHeader.lastElementChild.classList.remove('dashicons-arrow-down');
                    previousHeader.lastElementChild.classList.remove('dashicons-arrow-up');
                    previousHeader.lastElementChild.classList.add('dashicons-sort');

                    
                    previousHeaderTitleHolder = currentHeaderTitle;
                }

                // Setting previousHeader to previous header for reseting caret
                previousHeader = header;

                if (currentHeaderTitle == '') {
                    previousHeaderTitleHolder = header.querySelector('.header-cell').textContent;
                }
                

                // Append the header row to the table
                //table.insertBefore(headerRow, table.firstChild);
            });
        });
    
        function sortTableRows(rows, columnIndex, order) {
            return rows.sort((a, b) => {
                const aValue = a.children[columnIndex].innerText.trim();
                const bValue = b.children[columnIndex].innerText.trim();
    
                // Implement sorting logic based on data types and order
                if (order === 'asc') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            });
        }
    });
})(jQuery);