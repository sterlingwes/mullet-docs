var dox = require('dox').parseComments
  , Promise = require('es6-promise').Promise
  , fs = require('fs');

module.exports = function(config) {
    
    var apps = config._apps
      , tasks = [];
    
    Object.keys(apps).forEach(function(name) {
        var app = apps[name];
        if(!app.base || app.core)   return;
        
        var f = fs.readFileSync( app.base + '/main.js', {
            encoding: 'utf8'
        });
        var docs = dox(f, { raw: true }),
            apiDoc = [];

        docs.forEach(function(doc) {
            var tags = [];
            doc.tags.forEach(function(tag) {
                var tagTxt = (tag.type=='return' ? "*returns*" : "") + (tag.name ? "*"+tag.name+"*":"") + (tag.types && tag.types.length ? " `" + tag.types.join(',') + "` " : '') + (tag.description || tag.string);
                if(tag.string)
                    tags[tags.length-1] += "\n\t" + tagTxt;
                else
                    tags.push("*\t" + tagTxt);
            });
            if(doc.description.full) {
                apiDoc.push(doc.description.full + (tags && tags.length ? "\n" + tags.join("\n") : ""));
            }
        });
        
        if(!apiDoc.length)  return;

        apiDoc = apiDoc.join("\n\n****\n\n");
        
        tasks.push(new Promise(function(res,rej) {
            
            fs.writeFile( app.base + '/api.md', apiDoc, function(err) {
                if(err) rej(err);
                else    res( app.base + '/api.md' );
            });
        }));
    });

    Promise.all(tasks).then(function(docs) {
        // done
    })
    .catch(function(err) {
        console.error(err.stack);
    });
};