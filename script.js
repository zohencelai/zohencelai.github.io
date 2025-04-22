$(document).ready(function() { // Use jQuery's ready function

    // --- Configuration ---
    const SCROLL_OFFSET = 80; // Adjust as needed for sticky nav height
    const SCROLL_REVEAL_CONFIG = {
        distance: '50px',
        duration: 800,
        easing: 'ease-in-out',
        origin: 'bottom',
        interval: 150, // Stagger effect for multiple items
        reset: false // Animation only happens once
    };

    // --- Initialize Libraries ---
    ScrollReveal().reveal('.reveal-on-scroll', SCROLL_REVEAL_CONFIG);
    $('#stats .counter').counterUp({
        delay: 10,
        time: 1500
    });

    // --- Sticky Navbar ---
    const navbar = $('#navbar');
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 50) {
            navbar.addClass('scrolled');
        } else {
            navbar.removeClass('scrolled');
        }
    });

    // --- Smooth Scrolling for Nav Links ---
    $('.nav-menu a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const targetId = $(this).attr('href');
        const targetElement = $(targetId);

        if (targetElement.length) {
            $('html, body').animate({
                scrollTop: targetElement.offset().top - (navbar.height() || SCROLL_OFFSET) + 1 // +1 for precision
            }, 800); // Animation duration

            // Close mobile menu if open
            $('.nav-menu').removeClass('active');
            $('#hamburger-button').removeClass('active');
        }
    });

    // --- Active Nav Link Highlighting on Scroll ---
     $(window).on('scroll', function() {
        let scrollPos = $(document).scrollTop() + SCROLL_OFFSET + 50; // Adjust offset as needed
        $('.nav-menu a[href^="#"]').each(function() {
            let currLink = $(this);
            let refElement = $(currLink.attr('href'));
            if (refElement.length && refElement.offset().top <= scrollPos && refElement.offset().top + refElement.height() > scrollPos) {
                $('.nav-menu a').removeClass('active');
                currLink.addClass('active');
            } else {
                currLink.removeClass('active');
            }
        });

        // Handle edge case for top of page
        if (scrollPos < $('#features').offset().top) {
             $('.nav-menu a').removeClass('active');
        }
        // Handle edge case for bottom of page (highlight contact)
        if($(window).scrollTop() + $(window).height() > $(document).height() - 100) { // Near bottom
            $('.nav-menu a').removeClass('active');
            $('.nav-menu a[href="#contact"]').addClass('active');
        }
    });


    // --- Hamburger Menu Toggle ---
    $('#hamburger-button').on('click', function() {
        $(this).toggleClass('active');
        $('.nav-menu').toggleClass('active');
    });

    // --- Documentation Loading Function ---
    async function loadDocumentation(buttonId, containerId, htmlFile) {
        const learnMoreBtn = $(`#${buttonId}`);
        const documentationContainer = $(`#${containerId}`);
        const loadingIndicator = documentationContainer.find('.loading-indicator');
        let isDocumentationLoaded = documentationContainer.data('loaded') || false; // Use data attribute

        // Toggle visibility immediately if already loaded
        if (isDocumentationLoaded) {
            documentationContainer.slideToggle(300); // Use slide effect
             learnMoreBtn.text(documentationContainer.is(':visible') ? 'Hide Documentation' : 'View Documentation');
            return;
        }

        // Show loading indicator and container before fetch
        loadingIndicator.show();
        documentationContainer.slideDown(300); // Show container smoothly
        learnMoreBtn.text('Loading...');
        learnMoreBtn.prop('disabled', true); // Disable button while loading


        try {
            const response = await fetch(htmlFile);
            let contentHtml = '';
            let errorMessage = '';

            if (response.ok) {
                contentHtml = await response.text();
                isDocumentationLoaded = true;
            } else {
                errorMessage = `<p class="error-message">Failed to load documentation. Status: ${response.status}</p>`;
                isDocumentationLoaded = false; // Ensure it's marked as not loaded on error
            }

            // Hide loading indicator
            loadingIndicator.hide();

             // Create Shadow DOM if not exists (only needed once per container)
            if (!documentationContainer.get(0).shadowRoot) {
                 documentationContainer.get(0).attachShadow({ mode: 'open' });
            }
            const shadowRoot = documentationContainer.get(0).shadowRoot;

            // Clear previous content
            shadowRoot.innerHTML = '';

            // Inject styles into Shadow DOM
            // Inject styles into Shadow DOM (UPDATED COLORS)
            const style = document.createElement('style');
            style.textContent = `
                /* Basic Reset & Font */
                :host { display: block; }
                * { box-sizing: border-box; }
                body { font-family: 'Open Sans', sans-serif; line-height: 1.6; color: #384959; padding: 15px; } /* New Text Color */
                h1, h2, h3 { font-family: 'Source Serif Pro', serif; color: #6A89A7; margin: 1.5rem 0 0.8rem 0; line-height: 1.3; } /* New Primary Color */
                h1 { font-size: 1.8rem; }
                h2 { font-size: 1.5rem; }
                h3 { font-size: 1.2rem; color: #5a748d; } /* Darker shade of primary */
                p { margin-bottom: 1rem; font-size: 0.95rem; }
                ul, ol { margin-left: 25px; margin-bottom: 1rem; }
                li { margin-bottom: 0.5rem; }
                a { color: #88BDF2; text-decoration: underline; } /* New Secondary Color */
                a:hover { color: #6A89A7; } /* New Primary Color */
                pre { background-color: #2d3748; color: #e2e8f0; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; margin: 1rem 0; font-family: 'Courier New', Courier, monospace; } /* Darker bg */
                code { font-family: 'Courier New', Courier, monospace; }
                img { max-width: 100%; height: auto; border-radius: 5px; margin: 1rem 0; display: block; box-shadow: 0 2px 5px rgba(56, 73, 89, 0.1); } /* Shadow with dark color */
                .error-message { color: #e53e3e; font-weight: bold; background-color: #fed7d7; border: 1px solid #fbb6ce; padding: 10px; border-radius: 4px; text-align: center; } /* Keep error colors */
                /* Add any other specific styles needed for the documentation content */
            `;
            shadowRoot.appendChild(style);

            // Add the fetched HTML content or error message
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = errorMessage || contentHtml;
            shadowRoot.appendChild(contentDiv);


            documentationContainer.data('loaded', isDocumentationLoaded); // Store loaded state

        } catch (error) {
            console.error('Error loading documentation:', error);
            loadingIndicator.hide();
            if (documentationContainer.get(0).shadowRoot) {
                 documentationContainer.get(0).shadowRoot.innerHTML = `<style>:host{display:block;}</style><p class="error-message">An error occurred: ${error.message}</p>`; // Display error inside shadow DOM
            } else {
                 documentationContainer.html(`<p class="error-message">An error occurred: ${error.message}</p>`); // Fallback if shadow DOM fails
            }
             documentationContainer.data('loaded', false);
        } finally {
            // Update button text and state regardless of success/failure
            learnMoreBtn.text(documentationContainer.is(':visible') ? 'Hide Documentation' : 'View Documentation');
            learnMoreBtn.prop('disabled', false); // Re-enable button
        }
    }

    // --- Event Listeners for Documentation Buttons ---
    $('#learn-more-mlbot-btn').on('click', () => loadDocumentation('learn-more-mlbot-btn', 'documentation-mlbot-container', 'mlbot_v0.html'));
    $('#learn-more-va-btn').on('click', () => loadDocumentation('learn-more-va-btn', 'documentation-va-container', 'Voice_assistant.html'));
    $('#learn-more-cb-btn').on('click', () => loadDocumentation('learn-more-cb-btn', 'documentation-cb-container', 'Chart_bot.html'));


    // --- Footer Current Year ---
    $('#current-year').text(new Date().getFullYear());

}); // End document ready
