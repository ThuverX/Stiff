const less = require('less')
const https = require('https')

if(powercord) {
  const Plugin = require('powercord/Plugin') // We are using powercord
  const { readFile } = require('fs').promises;

  module.exports = class stiff extends Plugin {
    constructor () {
      super()

      this.observer = null
      this.udbListedUser = {}
    }

    async _reloadLess(){

      const mainPath = __dirname

      let css = (await readFile(mainPath + "/src/Stiff.less")).toString()
      css = css.replace(/\@import \"modules/g,`@import "${mainPath}/src/modules`)
      css += `@injector:'PowerCord';`

      less.render(css,{ rootpath: mainPath + '/src/Stiff.less'}).then((out) => {

          console.log('Stiff loaded!')
          if(document.querySelector('.css-stiff'))
            document.querySelector('.css-stiff').parentElement.removeChild(document.querySelector('.css-stiff'))
          let div  = document.createElement('style')
          div.className= "css-stiff"
          div.innerHTML = out.css
          document.head.appendChild(div)

      }).catch(console.error)
    }

    _createMutationObserver(){

      this.observer = new MutationObserver(this._onMutation.bind(this))
      this.observer.observe(document.querySelector('.pc-popouts + .theme-dark'),{
        childList: true,
        subtree: true
      })

      let udbUserList = document.createElement('style')
      udbUserList.className = 'css-stiff-users'
      document.head.prepend(udbUserList)
    }

    _onMutation(muts){
      for(const mut of muts){
        if (!mut.addedNodes[0]) continue;
        for(const node of [ ...mut.addedNodes ]
          .concat(...mut.removedNodes)
          .concat(mut.target)
        ) {
          if (!node.classList) continue;
          if(node.classList.contains('pc-modal')) {
            this._handleUserBackground(node)
          }
        }
      }
    }
    async _handleUserBackground(element){
      let id = this._getIDfromImage(element)
      this._getUser(id).then(() => {
        this._renderUdbUserList()
        let background = element.querySelector('.pc-header')
        background.id = `udbUser${id}`
      })
    }

    _renderUdbUserList(){
      let udbList = document.querySelector('.css-stiff-users')
      let listing = []
      Object.keys(this.udbListedUser).forEach(n => {
        listing.push(`#udbUser${n}{background:url(${this.udbListedUser[n]}) center / cover no-repeat !important;}`)
      })
      udbList.innerHTML = listing.join('\n')
    }

    _getIDfromImage(element){
      let image = element.querySelector('.pc-image')
      if(!image) return
  
      let style = image.getAttribute('style')
      let id = style.toString().match(/avatars\/(.*)\//)

      return id[1]
    }

    _getUser(id){
      return new Promise((resp,rej) =>{
        https.get({host:`udb.glitch.me`,port:443,path: `/api/v2/get?id=${id}`}, (res) => {
            const data = []
    
            res.on('data',(c) => data.push(c))
    
            res.once('end', () => {
                try{
                    let result = JSON.parse(String(Buffer.concat(data)))
                    if(result[0] && result[0].url) {
                      console.log(id,result)
                      this.udbListedUser[id] = result[0].url
                      resp()
                    }
                }
                catch (e) {console.error("Couldn't convert string to JSON")}
            })
        })
      })
    }

    async start () {
      powercord
          .pluginManager
          .get('pc-commands')
          .register(
              'stiffreload',
              'Reloades stiff',
              '{c}',
              this._reloadLess.bind(this)
      )
      await this._reloadLess.call(this)
      this._createMutationObserver.call(this)
    }

    unload () {
      powercord
        .pluginManager
        .get('pc-commands')
        .unregister('stiffreload')
      document.querySelector('.css-stiff').parentElement.removeChild(document.querySelector('.css-stiff'))
      document.querySelector('.css-stiff-users').parentElement.removeChild(document.querySelector('.css-stiff-users'))
      this.udbListedUser = {}
    }
  }

}