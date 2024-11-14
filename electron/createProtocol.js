const { session, protocol } = require('electron')
const path = require('path')
const { readFile } = require('fs')
const { URL } = require('url')

module.exports = function(scheme, partit) {
  let customeProtocol;
  if(partit){
    customeProtocol = session.fromPartition(partit).protocol;
  } 
  else {
    customeProtocol = protocol
  }
  customeProtocol.registerBufferProtocol(
    scheme,
    (request, respond) => {
      let pathName = new URL(request.url).pathname
      pathName = decodeURI(pathName) 

      readFile(path.join(__dirname, pathName), (error, data) => {
        if (error) {
          console.error(
            `Failed to read ${pathName} on ${scheme} protocol`,
            error
          )
        }
        const extension = path.extname(pathName).toLowerCase()
        let mimeType = ''

        if (extension === '.js') {
          mimeType = 'text/javascript'
        } else if (extension === '.html') {
          mimeType = 'text/html'
        } else if (extension === '.css') {
          mimeType = 'text/css'
        } else if (extension === '.svg' || extension === '.svgz') {
          mimeType = 'image/svg+xml'
        } else if (extension === '.json') {
          mimeType = 'application/json'
        } else if (extension === '.wasm') {
          mimeType = 'application/wasm'
        }

        respond({ mimeType, data })
      })
    }
  )
}
