document.addEventListener('DOMContentLoaded', function () {
  const contentElement = document.getElementById('content');
  const pageListElement = document.getElementById('pageList').querySelector('ol');
  const jsonFile = 'pages.json';
  let pages = [];

  // Fetch pages from JSON file
  fetch(jsonFile)
    .then(response => response.json())
    .then(fetchedPages => {
      pages = fetchedPages.slice(-3); // Only keep the last 3 pages
      // Create links for each page in the JSON
      pages.forEach((page, index) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${page.filename.split('.')[0]}`; // Set href to the hash corresponding to the page
        link.textContent = page.title;

        // Apply fade-in class to each link
        link.classList.add('fade-in');

        // Append link to the list item
        listItem.appendChild(link);

        // Append list item to the page list
        pageListElement.appendChild(listItem);

        // Apply fade-in class to the page list itself
        pageListElement.classList.add('fade-in');

        // Apply the loaded class after a delay to ensure proper animation
        setTimeout(() => {
          pageListElement.classList.add('loaded');
          pageListElement.querySelectorAll('.fade-in').forEach(el => el.classList.add('loaded'));
        }, 10);
      });

      // Load the page based on the current hash, or default to the home page
      loadPageFromHash();
    })
    .catch(error => console.error('Error fetching JSON:', error));

  function loadPageFromHash() {
      const hash = window.location.hash.slice(1); // Remove the '#' from the hash
      const homePage = 'home'; // Specify the default home page
      const page = pages.find(p => p.filename.split('.')[0] === (hash || homePage)); // Use home page if no hash is present
      const currentLanguage = 'de-DE'; // Set the default language here

      if (page && page.translation) {
        if (currentLanguage in page.translation) {
          let translatedFilename = `${page.filename.split('.')[0]}`;
          // Use the translation filename without the language code
          if (translatedFilename.endsWith('.' + currentLanguage)) {
            // If the title already has the language code, remove it
            translatedFilename = translatedFilename.replace(`.${currentLanguage}`, '');
          }
          translatedFilename += `.${currentLanguage}.md`;

          page.filename = translatedFilename;
        } else {
          console.warn(`No translation available for language "${currentLanguage}" for this page`);
        }
      }

      try {
        loadMarkdownPage(page.filename);
      } catch {
        console.error(`Error loading page: ${page.filename}`);
      }
    }

  // Fetch and render the markdown page
  function loadMarkdownPage(filename) {
    fetch(`pages/${filename}`)
      .then(response => response.text())
      .then(markdown => {
        const htmlContent = marked.parse(markdown);
        contentElement.innerHTML = htmlContent;

        // Apply fade-in class to all elements in the content
        const elements = contentElement.querySelectorAll('*');
        elements.forEach(el => {
          el.classList.add('fade-in');
          // Trigger fade-in effect by adding the loaded class after a short delay
          setTimeout(() => el.classList.add('loaded'), 10);
        });
      })
      .catch(error => console.error('Error fetching markdown page:', error));
  }

  

  // Listen to hash changes and load the corresponding page
  window.addEventListener('hashchange', loadPageFromHash);
});
