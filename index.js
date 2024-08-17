/**
 * Fetch a file from a uri
 * @param uri
 * @param callback
 * @returns {Promise<*|string>}
 */
async function file_get_contents(uri, callback) {
    let res = await fetch(uri),
        ret = await res.text();
    return callback ? callback(ret) : ret; // a Promise() actually.
}

/**
 * Insert HTML code into a target element
 * @param html
 * @param dest
 * @param append
 * @param done
 * @returns {Promise<boolean>}
 */
async function insertHTML(html, dest, append=false, done){
    // if no append is requested, clear the target element
    if(!append) dest.innerHTML = '';
    // create a temporary container and insert provided HTML code
    let container = document.createElement('div');
    container.innerHTML = html;
    // let shadowRoot = container.shadowRoot || container.attachShadow({mode:"open"})
    // container.hasAttribute("replaceWith") && container.replaceWith(...shadowRoot.childNodes);
    // cache a reference to all the scripts in the container
    let scripts = container.querySelectorAll('script');
    let s = []
    // get all child elements and clone them in the target element
    let nodes = container.childNodes;
    for( let i=0; i< nodes.length; i++) dest.appendChild( nodes[i].cloneNode(true) );
    // force the found scripts to execute...
    for( let i=0; i< scripts.length; i++){
        let script = document.createElement('script');
        script.type = scripts[i].type || 'text/javascript';

        if( scripts[i].hasAttribute('src') ){

            script.src = scripts[i].src;
            script.innerHTML = scripts[i].innerHTML;
            if (scripts[i].hasAttribute('async')  || scripts[i].hasAttribute('defer') ) {
                document.head.appendChild(script);
                document.head.removeChild(script);
            } else {

                await Promise.resolve(new Promise(r => {
                    script.onload = () => {
                        document.head.removeChild(script);
                        r();
                    }
                    document.head.appendChild(script);
                }))
            }

        } else {
            script.innerHTML = scripts[i].innerHTML;
            document.head.appendChild(script);
            document.head.removeChild(script);
        }
    }

    let styles = container.querySelectorAll('link');
    for( let i=0; i< styles.length; i++){
        loadAsset(styles[i].href)
    }
    // done!
    return true;
}

/**
 * .js goes to bottom of body
 * .css goes to head
 * .html goes to target element or html content in callback
 * @param filename
 * @param onload onload-CallBack Or an HTMLElement to insert HTML if onload returns {html, setinnerHTMLToElement}, its added with css, js, tags etc in it in it
 * @param loadForHash optional RegExp to load only if location.hash matches (lazy load)
 * @returns void
 */
function loadAsset(filename, onload, loadForHash = false) {
    if (loadForHash) {
        if (loadForHash.test(location.hash)) {
            loadAsset(filename, onload)
        } else {
            var whenHashChangesToLoadFoHash = hashChangeEvent => {
                if (loadForHash.test(hashChangeEvent.newURL)){
                    loadAsset(filename, onload)
                    window.removeEventListener('hashchange', whenHashChangesToLoadFoHash)
                }
            }
            window.addEventListener('hashchange', whenHashChangesToLoadFoHash)
        }
        return;
    }
    // check if filename is array
    if (typeof filename != 'string' && filename.map) {
        return Promise.all(
            filename.map(f => new Promise(resolve => loadAsset(f,resolve)))
        ).then(onload);

    }

    if (filename.endsWith('.html')) {
        file_get_contents(filename, html => {
            // debugger;
            if (onload instanceof HTMLElement) {
                insertHTML(html, onload)
            } else if (typeof onload == 'function') {
                var onloadProcessed = onload(html);
                if (!!onloadProcessed && onloadProcessed.html) {
                    insertHTML(onloadProcessed.html, onloadProcessed.setinnerHTMLToElement)
                }
            }
        })
    } else if (filename.endsWith('.css')) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = filename
        l.onload = onload
        var h = document.getElementsByTagName('head')[0];
        h.appendChild(l);
    } else if (filename.endsWith('.js')){
        var l = document.createElement('script');
        l.type = 'text/javascript';
        l.src = filename
        l.onload = onload
        document.head.appendChild(l);
        document.head.removeChild(l);

    }

}
// var window = window || {}
// window && window.loadAsset && (window.loadAsset = loadAsset)
// window && window.insertHTML && (window.insertHTML = insertHTML)
// window && window.file_get_contents && (window.file_get_contents = file_get_contents)