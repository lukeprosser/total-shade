# TotalShade

Shopping cart built with HTML, CSS and vanilla JavaScript.

Live demo: https://totalshade.netlify.com/

## Key Features

* Add items.
* Navigation to cart after adding items.
* Calculate totals.
* Clear all or individual cart items.
* Apply discount codes (each discount code can only be applied once).
* Update quantity, including validation for invalid entries.
* Modal dialogue displaying dynamic messages (e.g. empty cart, purchase complete, discount feedback etc.).
* Print itemised receipt (button displayed within modal upon purchase).
* Discount codes tracked using localStorage.
* Purchase state tracked using localStorage.
* Prevent duplicate items being added to cart.
* Dynamic empty cart message.

## Discount codes

The following discount codes can be used:

* SHADE10
* SHADE20
* SHADE30
* SHADE40
* SHADE50
* SHADE60
* SHADE70
* SHADE80

Each discount code corresponds to a discount percentage, which will be automatically removed from the cart total.

(For testing purposes, discount codes can be reset by clearing localStorage.)