(function ($) {
    console.log("sorting script");
    document.addEventListener('DOMContentLoaded', function () {
        // Wait for the document to be fully loaded
    
        // Add click event listener to table header elements
        const tableHeaders = document.querySelectorAll('.spreadsheet-table th');
    
        // Object to store the current sorting order for each column
        const sortingOrders = {};

        var previousHeader = null;
    
        tableHeaders.forEach(function (header, columnIndex) {
            header.addEventListener('click', function () {
                // Get the table element
                const table = document.querySelector('.spreadsheet-table');
    
                // Get the header row
                const headerRow = table.querySelector('tbody tr.title-row');
    
                if (!headerRow) {
                    console.error('Header row not found. Make sure the table has a thead element with a tr element.');
                    return;
                }
    
                // Get all rows except the header row
                const rows = Array.from(table.querySelectorAll('tbody tr'));
    
                // Get the current sorting order for the column
                const currentOrder = sortingOrders[columnIndex] || 'asc';
    
                // Toggle between ascending and descending order
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    
                // Update the sorting order for the column
                sortingOrders[columnIndex] = newOrder;
    
                // Sort the rows based on the clicked header and order
                const sortedRows = sortTableRows(rows, columnIndex, newOrder);
    
                // Create a new table body container
                const newTbody = document.createElement('tbody');
    
                // Append sorted rows to the new table body
                sortedRows.forEach(row => newTbody.appendChild(row));
    
                // Remove existing tbody from the table
                const existingTbody = table.querySelector('tbody');
                if (existingTbody) {
                    existingTbody.remove();
                }
    
                newTbody.insertBefore(headerRow, newTbody.firstChild);

                // Append the new tbody to the table
                table.appendChild(newTbody);

                //Swap caret icon
                if (header.firstElementChild.classList.contains('dashicons-sort')) {
                    header.firstElementChild.classList.remove('dashicons-sort');
                    header.firstElementChild.classList.add('dashicons-arrow-up');
                }
                else if (header.firstElementChild.classList.contains('dashicons-arrow-down')){
                    header.firstElementChild.classList.remove('dashicons-arrow-down');
                    header.firstElementChild.classList.add('dashicons-arrow-up');
                } 
                else {
                    header.firstElementChild.classList.remove('dashicons-arrow-up');
                    header.firstElementChild.classList.add('dashicons-arrow-down');
                }

                // If previous header is assigned and isn't the current header then reset caret
                if (previousHeader != header && previousHeader != null) {
                    previousHeader.firstElementChild.classList.remove('dashicons-arrow-down');
                    previousHeader.firstElementChild.classList.remove('dashicons-arrow-up');
                    previousHeader.firstElementChild.classList.add('dashicons-sort');
                }

                // Setting previousHeader to previous header for reseting caret
                previousHeader = header;
                

                // Append the header row to the table
                //table.insertBefore(headerRow, table.firstChild);
            });
        });
    
        function sortTableRows(rows, columnIndex, order) {
            return rows.sort((a, b) => {
                const aValue = a.cells[columnIndex].innerText.trim();
                const bValue = b.cells[columnIndex].innerText.trim();
    
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