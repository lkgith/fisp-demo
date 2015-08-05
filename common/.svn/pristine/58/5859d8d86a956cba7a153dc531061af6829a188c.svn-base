/**
 * localStorage
 * Thanks to:
 *     - https://github.com/marcuswestin/store.js/blob/master/store.js
 */
require("./json.js");
typeof window.localStorage == 'undefined' &&
    (function(){
        var localStorage = window.localStorage = {hah: 1},
            blankFn = function(){},
            localStorageName = 'localStorage',
            scriptTag = 'script',
            storage;

        localStorage.getItem =
            localStorage.setItem = 
            localStorage.removeItem = 
            localStorage.clear = blankFn

        if (!document.documentElement.addBehavior){
            return;
        }

        var serialize = function(value) {
            return JSON.stringify(value)
        }
        var deserialize = function(value) {
            if (typeof value != 'string') { return undefined }
            try { return JSON.parse(value) }
            catch(e) { return value || undefined }
        }

        var storageOwner,
            storageContainer
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
            storageContainer = new ActiveXObject('htmlfile')
            storageContainer.open()
            storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
            storageContainer.close()
            storageOwner = storageContainer.w.frames[0].document
            storage = storageOwner.createElement('div')
        } catch(e) {
            // somehow ActiveXObject instantiation failed (perhaps some special
            // security settings or otherwse), fall back to per-path storage
            storage = doc.createElement('div')
            storageOwner = doc.body
        }
        var withIEStorage = function(storeFunction) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0)
                args.unshift(storage)
                // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storageOwner.appendChild(storage)
                storage.addBehavior('#default#userData')
                storage.load(localStorageName)
                var result = storeFunction.apply(localStorage, args)
                storageOwner.removeChild(storage)
                return result
            }
        }

        // In IE7, keys cannot start with a digit or contain certain chars.
        // See https://github.com/marcuswestin/store.js/issues/40
        // See https://github.com/marcuswestin/store.js/issues/83
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
        function ieKeyFix(key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
        }
        localStorage.setItem = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key)
            if (val === undefined) { return localStorage.removeItem(key) }
            storage.setAttribute(key, val)
            storage.save(localStorageName)
            return val
        })
        localStorage.getItem = withIEStorage(function(storage, key, defaultVal) {
            key = ieKeyFix(key)
            var val = storage.getAttribute(key)
            return (val === undefined ? defaultVal : val)
        })
        localStorage.removeItem = withIEStorage(function(storage, key) {
            key = ieKeyFix(key)
            storage.removeAttribute(key)
            storage.save(localStorageName)
        })
        localStorage.clear = withIEStorage(function(storage) {
            var attributes = storage.XMLDocument.documentElement.attributes
            storage.load(localStorageName)
            for (var i=0, attr; attr=attributes[i]; i++) {
                storage.removeAttribute(attr.name)
            }
            storage.save(localStorageName)
        })

    })();