<?php
/*
Plugin Name: Custom Admin Menu
Description: Custom admin menu tab for managing fields.
Version: 1.0
Author: Your Name
*/

// Add the custom admin menu
function custom_admin_menu() {
    add_menu_page(
        'Custom Fields',        // Page title
        'Custom Fields',        // Menu title
        'manage_options',       // Capability
        'custom-admin-menu',    // Menu slug
        'custom_menu_page'      // Callback function
    );
}
add_action('admin_menu', 'custom_admin_menu');

// Callback function for the custom menu page
function custom_menu_page() {
    ?>
    <div class="wrap">
        <h2>Custom Fields</h2>

        <p>Welcome to the Custom Fields admin page. Use the form below to add or modify fields.</p>

        <form method="post" action="">
            <?php
            // Check if form is submitted
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Process form data here

                // Example: Save fields to the database
                $fields = $_POST['fields'];
                update_option('custom_fields', $fields);

                echo '<div class="updated"><p>Fields saved successfully!</p></div>';
            }

            // Retrieve existing fields from the database
            $existing_fields = get_option('custom_fields', array());

            $labelNames = ['Header', 'Short Title', 'Title', 'Description'];

            // Display form for adding/modifying fields
            ?>
            <h3>Add or Modify Fields</h3>
            <table class="form-table">
                <?php
                // Generate input fields dynamically in groups of 4
                for ($i = 0; $i < count($existing_fields); $i += 4) {
                    echo '<tr valign="top">';
                    for ($j = 0; $j < 4; $j++) {
                        $index = $i + $j;
                        echo '<th scope="row"> ' . ($labelNames[$j]) . '</th>';
                        echo '<td><input type="text" name="fields[]" value="' . esc_attr($existing_fields[$index] ?? '') . '"></td>';
                    }
                    echo '</tr>';
                }
                ?>
            </table>

            <!-- Allow the addition of a new group -->
            <p><a href="#" id="add-group">Add Another Group</a></p>

            <?php submit_button('Save Fields'); ?>
        </form>

        <script>
            const labelNames = ['Header', 'Short Title', 'Title', 'Description'];
            // JavaScript to handle adding a new group of fields
            document.getElementById('add-group').addEventListener('click', function (e) {
                e.preventDefault();
                var table = document.querySelector('.form-table');
                var newRow = table.insertRow(table.rows.length - 1); // Insert before the last row (before the submit button)
                for (var i = 0; i < 4; i++) {
                    var cell = newRow.insertCell(i * 2);
                    cell.innerHTML = '<th scope="row">Field ' + (labelNames[i]) + '</th>';
                    cell = newRow.insertCell(i * 2 + 1);
                    cell.innerHTML = '<td><input type="text" name="fields[]" value=""></td>';
                }
            });
        </script>
    </div>
    <?php
}
