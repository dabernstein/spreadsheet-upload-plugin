<?php

// Add the custom admin menu
function custom_admin_menu() {
    add_menu_page(
        'Ranking Fields',        // Page title
        'Ranking Fields',        // Menu title
        'manage_options',       // Capability
        'custom-admin-menu',    // Menu slug
        'custom_menu_page'      // Callback function
    );
}
add_action('admin_menu', 'custom_admin_menu');

// Callback function for the custom menu page
function custom_menu_page() {
    ?>
    <style>
        .form-table {
            display: flex;
            flex-direction: column;
        }
        .field-container {
            display: flex;
            flex-direction: column;
            max-width: fit-content;
            margin-bottom: 40px;
        }
        .top-form {
            display: flex;
            flex-direction: row;
            margin-bottom: 15px;
        }
        .bottom-form {
            display: flex;
            flex-direction: column;
        }
        .bottom-form textarea {
            width: 100%;
            height: 100px;
        }
        .field-row {
            display: flex;
            flex-direction: row;
        }
        .form-titles {
            display: flex;
            flex-direction: row;

        }
    </style>
    <div class="wrap">
        <h2>Ranking Fields</h2>

        <p>Welcome to the Ranking Fields admin page. Click on Add Another Group to add a ranking header field.</p>

        <form method="post" action="">
            <!-- Allow the addition of a new group -->
            <p><a href="#" id="add-group" class="button">Add Another Group</a></p>

            <?php submit_button('Save Fields'); ?>

            <?php
            // Check if form is submitted
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Process form data here
                $field0 = array_map('trim', $_POST['fields0']);
                $field1 = array_map('trim', $_POST['fields1']);
                $field2 = array_map('trim', $_POST['fields2']);
                $field3 = array_map('trim', $_POST['fields3']);

                // Save the fields to the database
                $fields = array();
                for ($i = 0; $i < count($field0); $i++) {
                    $fields[] = array($field0[$i], $field1[$i], $field2[$i], $field3[$i]);
                }

                //$fields[] = [$_POST['fields0'], $_POST['fields1'], $_POST['fields2'], $_POST['fields3']];
                update_option('custom_fields', $fields);

                echo '<div class="updated"><p>Fields saved successfully!</p></div>';
            }

            // Retrieve existing fields from the database
            $existing_fields = get_option('custom_fields', array());

            $labelNames = ['Spreadsheet Header', 'Short Title', 'Full Title', 'Description'];

            // Display form for adding/modifying fields
            ?>
            <h3>Add or Modify Fields</h3>
            <div class="form-table">
                <?php for ($i = 0; $i < count($existing_fields); $i++) { ?>
                    <div class="field-container">
                        <div class="top-form">
                            <?php for ($j = 0; $j < 3; $j++) { ?>
                                <div class="field-input">
                                    <div><strong> <?php echo $labelNames[$j] ?> </strong></div>
                                    <div><input type="text" name="fields<?php echo $j ?>[]" value="<?php echo $existing_fields[$i][$j] ?>"></div>
                                </div>
                            <?php } ?>
                        </div>
                        <div class="bottom-form">
                            <div><strong> <?php echo $labelNames[3] ?> </strong></div>
                            <div><textarea name="fields<?php echo $j ?>[]"> <?php echo $existing_fields[$i][3] ?> </textarea></div>
                        </div>
                    </div>
                <?php } ?>
            </div>
        </form>

        <script>
            // JavaScript to handle adding a new group of fields
            document.getElementById('add-group').addEventListener('click', function (e) {
                e.preventDefault();
                var table = document.querySelector('.form-table');
                var newForm = 
                    '<div class="field-container">' +
                    '<div class="top-form">' +
                    '<div class="field-input">' +
                    '<div><strong>Spreadsheet Header</strong></div>' +
                    '<div><input type="text" name="fields0[]" value=""></div>' +
                    '</div>' +
                    '<div class="field-input">' +
                    '<div><strong>Short Title</strong></div>' +
                    '<div><input type="text" name="fields1[]" value=""></div>' +
                    '</div>' +
                    '<div class="field-input">' +
                    '<div><strong>Full Title</strong></div>' +
                    '<div><input type="text" name="fields2[]" value=""></div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="bottom-form">' +
                    '<div><strong>Description</strong></div>' +
                    '<div><textarea name="fields3[]"></textarea></div>' +
                    '</div>' +
                    '</div>';
                table.insertAdjacentHTML('afterbegin', newForm);
            });
        </script>
    </div>
    <?php
}
