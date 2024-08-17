# loadAsset
Load Assets supported: html,js,css; script,link,style
Loads js to global scope; style and html to provided dom element 

- loadAsset (load/cache asset provides onload)
- insertHTML (loads html/js/css/link/script etc)
- file_get_contents (loads url content, uses fetch)
  `npm i @hasnat/loadasset` ( https://www.npmjs.com/package/@hasnat/loadasset )
```javascript
e.g.
// simply
loadAsset('/somepage.html', document.body);


///// 

// or example somewhere adding add tab pane using a-ui-tab.html as template html

var tab = document.createElement('div');
tab.setAttribute("class", "tab-pane");
tab.setAttribute("id", "tab-ui");

loadAsset('https://example.com/a-ui-tab.html', function (html) {
    return {
        setinnerHTMLToElement: tab, // this is a dom element
        html: html.replaceAll(/\$API_KEY/g, `$API_KEY`) // say some post processing needed on .html (being used as template)
    }
});

