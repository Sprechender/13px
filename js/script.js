document.addEventListener('DOMContentLoaded', function () {
  const contentElement = document.getElementById('content');
  const pageListElement = document.getElementById('pageList').querySelector('ol');
  const jsonFile = 'pages.json';
  let pages = [];
  let currentLanguage = getCookie('language') || 'en-US'; // Get language from cookie or default to 'en-US'

  // Function to get title based on current language, with fallback
  function getTitle(page) {
    return page.translations && page.translations[currentLanguage]
      ? page.translations[currentLanguage]
      : page.title;
  }

  function loadMarkdownPage(filename) {
    return fetch(`pages/${filename}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Page not found');
        }
        return response.text();
      })
      .then(markdown => {
        const htmlContent = marked.parse(markdown);
        contentElement.innerHTML = htmlContent;

        const elements = contentElement.querySelectorAll('*');
        elements.forEach(el => {
          el.classList.add('fade-in');
          setTimeout(() => el.classList.add('loaded'), 10);
        });
      })
      .catch(error => {
        console.error('Error fetching markdown page:', error);
        window.location.href = "404.html"; // Redirect to 404 page if markdown file is not found
      });
  }

  async function loadPageFromHash() {
    const hash = window.location.hash.slice(1);
    const page = pages.find(p => p.filename.split('.')[0] === hash);

    if (page) {
      // Determine the correct file path based on language
      const filename = currentLanguage !== "en-US"
        ? page.filename.replace('.md', `.${currentLanguage}.md`)
        : page.filename;

      console.log(`Trying to load file: ${filename}`); // Debugging log

      // Fetch the markdown content
      loadMarkdownPage(filename);
    } else {
      // No hash found or matching page, load the default home page
      console.log("No hash found, loading home page...");
      loadMarkdownPage('home.md');
      window.location.hash = '#home';
    }
  }

  function changeLanguage(language) {
    if (language === currentLanguage) {
      console.log("Selected language is the same as the current language");
      return;
    }

    currentLanguage = language;
    setCookie('language', language, 30); // Save the selected language to a cookie for 30 days
    console.log(`Language changed to ${language}`);

    // Reload the page to apply the new language
    loadPageFromHash();
  }

  // Helper functions for cookies
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      const cookie = cookieArray[i].trim();
      if (cookie.indexOf(name + "=") === 0) {
        return cookie.substring((name.length + 1), cookie.length);
      }
    }
    return null;
  }

  // Fetch pages from JSON file
  fetch(jsonFile)
    .then(response => response.json())
    .then(fetchedPages => {
      pages = fetchedPages.slice(-3); // Only keep the last 3 pages
      pages.forEach((page) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        // Get the appropriate title based on the current language
        const title = getTitle(page);

        link.href = `#${page.filename.split('.')[0]}`;
        link.textContent = title;

        link.classList.add('fade-in');
        listItem.appendChild(link);
        pageListElement.appendChild(listItem);
        pageListElement.classList.add('fade-in');

        setTimeout(() => {
          pageListElement.classList.add('loaded');
          pageListElement.querySelectorAll('.fade-in').forEach(el => el.classList.add('loaded'));
        }, 10);
      });

      loadPageFromHash();
    })
    .catch(error => console.error('Error fetching JSON:', error));

  // Listen to hash changes and load the corresponding page
  window.addEventListener('hashchange', loadPageFromHash);

  // Example language change buttons
  document.getElementById('lang-en').addEventListener('click', () => changeLanguage('en-US'));
  document.getElementById('lang-de').addEventListener('click', () => changeLanguage('de-DE'));
});
