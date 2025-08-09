jQuery(function($) {
    'use strict';

    // --- Caching DOM Elements ---
    const $checkoutForm = $('form.checkout');
    const $invoiceCheckbox = $('#billing_invoice_request');
    const $buyerInfoWrapper = $('#ccif-buyer-info-wrapper');
    const $personTypeSelect = $('#billing_person_type');
    const $realPersonWrapper = $('.ccif-real-person-fields-wrapper');
    const $legalPersonWrapper = $('.ccif-legal-person-fields-wrapper');

    // --- City/State Data Check ---
    if (typeof ccifData === 'undefined' || !ccifData.cities) {
        console.error('CCIF Iran Checkout: City data is not available.');
        return;
    }
    const cities = ccifData.cities;

    /**
     * Toggles the required status and visual indicator for a set of fields.
     * @param {jQuery} $wrapper - The jQuery object containing the fields.
     * @param {boolean} isRequired - Whether the fields should be required.
     */
    function setFieldsRequired($wrapper, isRequired) {
        const $fields = $wrapper.find('input, select');
        $fields.each(function() {
            const $field = $(this);
            const $parentRow = $field.closest('.form-row');

            $field.prop('required', isRequired);
            $parentRow.toggleClass('ccif-is-required', isRequired);

            // If making not required, also remove WooCommerce's 'validate-required' class if it exists
            if (!isRequired) {
                $parentRow.removeClass('validate-required');
            } else {
                 $parentRow.addClass('validate-required');
            }
        });
    }

    /**
     * Shows/hides fields based on the selected person type ('real' or 'legal').
     */
    function togglePersonFields() {
        const personType = $personTypeSelect.val();

        // Hide both sections initially and mark fields as not required
        $realPersonWrapper.slideUp(250);
        setFieldsRequired($realPersonWrapper, false);

        $legalPersonWrapper.slideUp(250);
        setFieldsRequired($legalPersonWrapper, false);

        // Show the selected section and mark its fields as required
        if (personType === 'real') {
            $realPersonWrapper.slideDown(350);
            setFieldsRequired($realPersonWrapper, true);
        } else if (personType === 'legal') {
            $legalPersonWrapper.slideDown(350);
            setFieldsRequired($legalPersonWrapper, true);
        }
    }

    /**
     * Shows/hides the entire buyer information section based on the invoice checkbox.
     */
    function toggleInvoiceSection() {
        const isChecked = $invoiceCheckbox.is(':checked');

        if (isChecked) {
            // Show the main buyer info wrapper
            $buyerInfoWrapper.slideDown(350);
            // Mark person type as required
            setFieldsRequired($personTypeSelect.closest('.form-row'), true);
            // Trigger the person fields toggle to show the correct sub-section
            togglePersonFields();
        } else {
            // Hide the main buyer info wrapper
            $buyerInfoWrapper.slideUp(250);
            // Mark all fields within as not required
            setFieldsRequired($buyerInfoWrapper, false);
            // Also hide the person-specific sub-wrappers
            $realPersonWrapper.hide();
            $legalPersonWrapper.hide();
        }
    }

    /**
     * Populates the custom city dropdown based on the custom state dropdown.
     */
    function populateCustomCities() {
        const state = $('#billing_custom_state').val();
        const $cityField = $('#billing_custom_city');
        const originalCityVal = $('#billing_city').val(); // Get value from original hidden field

        $cityField.empty().append($('<option>', { value: '', text: 'ابتدا استان را انتخاب کنید' }));

        if (state && cities[state]) {
            $.each(cities[state], function(index, cityName) {
                $cityField.append($('<option>', {
                    value: cityName,
                    text: cityName,
                    selected: cityName === originalCityVal
                }));
            });
             // After populating, if there was an original city value, ensure it's selected
            if (originalCityVal) {
                $cityField.val(originalCityVal);
            }
        }
        // Ensure the custom city's value is synced to the original
        $cityField.trigger('change');
    }

    // --- Event Handlers ---

    // When the VISIBLE custom state changes...
    $checkoutForm.on('change', '#billing_custom_state', function() {
        $('#billing_state').val($(this).val()).trigger('change');
        populateCustomCities();
    });

    // When the VISIBLE custom city changes...
    $checkoutForm.on('change', '#billing_custom_city', function() {
        $('#billing_city').val($(this).val()).trigger('change');
    });

    // When the invoice checkbox changes...
    $checkoutForm.on('change', '#billing_invoice_request', toggleInvoiceSection);

    // When the person type changes...
    $checkoutForm.on('change', '#billing_person_type', togglePersonFields);

    // --- Initial Page Load Logic ---

    // Set initial custom state value from the original hidden field
    $('#billing_custom_state').val($('#billing_state').val());
    // Trigger the change handler to populate cities on load
    populateCustomCities();

    // Set the initial state of the invoice and person sections
    toggleInvoiceSection();
});
