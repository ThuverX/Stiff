const { Plugin } = require('elements')
const less = require('less')
const fs = require('fs')
const colorSort = require('color-sort')
const https = require('https')
const path = require('path')

const getUserImage = (id) => {
  https.get({host:`udb.glitch.me`,port:443,path: `/api/v2/get?id=${id}`}, function (res) {
    res.on('data', function (data) {
      let result = JSON.parse(data.toString('utf8'))
      if(!result[0]) return
      let image = result[0].url
      let imageStyle = document.querySelector("#udbUserImageStyle" + id)
      if(imageStyle){
        let oldImage = imageStyle.innerHTML.toString().match(/background\-image\:url\(*.*\)/g)[0].replace(/background\-image\:url\(/g,'').replace(/\)/g,'')
        if(oldImage !== image) imageStyle.innerHTML = `#udbImage${id}{background-image:url(${image}) !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;}`
        else return
      } 
      else {
        let style = document.createElement('style')
        style.id = "udbUserImageStyle" + id
        style.innerHTML = `#udbImage${id}{background-image:url(${image}) !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;}`
        document.body.prepend(style)
      }
    })
  })
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this)
}


let zi = 50000
function stiffAlert(html,time){
  let alert = document.createElement('div')
  alert.innerHTML = html;
  let id = Math.round(Math.random() * 1000) + "stiffalert"
  alert.id = id
  alert.style.zIndex = zi
  zi--
  alert.className = "stiffAlert respawn"
  document.body.appendChild(alert)
  setTimeout(() => {
    document.getElementById(id).className = "stiffAlert hide"
    setTimeout(() => document.getElementById(id).remove(),500);
    let aa = document.querySelectorAll('.stiffAlert:not(.hide)')
    aa.forEach((a) => {
      a.className = "stiffAlert"
      setTimeout(() => a.className = "stiffAlert respawn",0);
    })
  },time)
}


NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(let i = this.length - 1; i >= 0; i--) {
      if(this[i] && this[i].parentElement) {
          this[i].parentElement.removeChild(this[i])
      }
  }
}


function checkForUpdate(c){
  const current = require('./package.json')

  https.get(`https://raw.githubusercontent.com/ThuverX/Stiff/${current.repository.branch}/package.json`, (res) => {
      res.setEncoding('utf8')
      res.on('data', function (body) {
        const web = JSON.parse(body);
        console.log("versions, current:",parseInt(current.version.replace(/\./g,'')),"web:", parseInt(web.version.replace(/\./g,'')))
        if(parseInt(current.version.replace(/\./g,'')) < parseInt(web.version.replace(/\./g,''))){
          c({old:current,new:web})
        }
      })
  })
}

function rf(){
  let dirname = path.join(__dirname, 'addons')
  let addons = []
  if(!fs.existsSync(dirname)) return
  let files = fs.readdirSync(dirname)
  files.forEach(function(filename) {
    let f = path.join(dirname, filename)
    if(filename.endsWith(".css")) {
      let content = fs.readFileSync(f, 'utf-8')
      let creator = content.match(/@creator:(.*)/)[1]
      let name = content.match(/@name:(.*)/)[1]
      addons.push({
        file:f,
        name,
        creator,
        type:"css",
        content
      })
    }
    else if(filename.endsWith(".less")) {
      let content = fs.readFileSync(f, 'utf-8')
      let creator = content.match(/@creator:(.*)/)[1]
      let name = content.match(/@name:(.*)/)[1]
      addons.push({
        file:f,
        name,
        creator,
        type:"less",
        content
      })
    }
  })
  return addons
}

let fadeIn
const logCss = 'background:red;color:white;padding:2px;'
const popoutBackground = ".header-2BwW8b"
const modalBackground = ".header-QKLPzZ"
module.exports = class stiffv2 extends Plugin {
  preload () {
    fadeIn = document.createElement('div')
    fadeIn.className = "stiffFadeEffect"
    document.body.prepend(fadeIn)

    let fadeInStyle = document.createElement('style')
    fadeInStyle.innerHTML = `
    @keyframes fadeInEffect{
      0%{
        opacity:0;
      }
      100%{
        opacity:1;
      }
    }
    @keyframes fadeOutEffect{
      0%{
        opacity:1;
      }
      100%{
        opacity:0;
      }
    }
    .stiffFadeEffect{
      opacity:0;
      position: absolute;
      left:0;
      top:0;
      width:100vw;
      height:100vh;
      overflow:hidden;
      z-index: 29000;
      pointer-events: none;
    }
    .stiffFadeActive{
      animation: fadeInEffect .2s;
      background:black;
      opacity:1;
      pointer-events: all;
    }
    .stiffFadeToInActive{
      animation: fadeOutEffect .2s;
      background:black;
      opacity:0;
      pointer-events: none;
    }`
    fadeInStyle.className = "fadeInStylingForStiffDoNOTedit"
    document.body.prepend(fadeInStyle)

    this.repaint()
  }

  repaint(silent = false){
    let id = document.querySelector('.container-2Thooq > .avatar-small')
    if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)
    if(id) id = id[0].replace(/(avatars|\/)/g,'')
    if(id != window.discordID) window.discordID = id
    console.log('%c[Stiff] Repainting...',logCss)
    let color = this.DI.localStorage.getItem("stiff.color") || '#ef5350'
    if(this.DI.localStorage.getItem("stiff.pageDrag") == null)
      this.DI.localStorage.setItem("stiff.pageDrag",false)
    
    if(this.DI.localStorage.getItem("stiff.devMode") == null)
      this.DI.localStorage.setItem("stiff.devMode",false)
    let pageDrag = this.DI.localStorage.getItem("stiff.pageDrag") || false

    let DEBUG = this.DI.localStorage.getItem("stiff.devMode") == 'true' || false
    if(!DEBUG) fadeIn.className = "stiffFadeEffect stiffFadeActive"

    let addons = null
    if(!silent) addons = rf()
    let cssString = `--color:${color};--pageDrag:${pageDrag? 1 : 0};--bgColor:#212121;\n`
    let lessString = `@color:${color};@pageDrag:${pageDrag};@bgColor:#212121;\n`
    if(addons) addons.forEach((f) => {
      if(f.type == "css") cssString += "\n" + f.content
      else lessString += "\n" + f.content
    })

    fs.readFile( __dirname + "/ts2.less", function (err, data) {
      let src = data.toString('utf8')
      let input = src.replace("@color:#009688",`@color:${color}`).replace(/\@pageDrag\:false\;/,`@pageDrag:${pageDrag};`)

      let stiffStyle = document.createElement('style')
      stiffStyle.id = "stiffStyle"
      less.render(lessString,(err,add) => {
        less.render(input, function (e, output) {
          if(e) return console.error(e)
          stiffStyle.innerHTML = output.css
          if(err) {
            console.error(err)
            let start = err.extract[1].substring(0,err.column).length
            let middle = Math.round(err.extract[1].substring(err.column).length/2)
            let loc = start + middle - 1
            loc = loc >= 1 ? loc : 3
            stiffAlert(`<div class="stiffUpdateNotice">
              <div class="stiffCode">Error in LESS code:<br/><br/>
                ${err.message}<br/>${'-'.repeat(err.message.length+2)}<br/>
                ${err.line-1}:${err.extract[0] || ""}<br/>
                ${err.line}:${err.extract[1] || ""}<br/>
                ${'&nbsp;'.repeat(loc)}^<br/>
                ${err.line+1}: ...<br/>
              </div><br/>
            Check console for details!</div>`
            ,10000)
          }
          else stiffStyle.innerHTML += add.css
          document.querySelectorAll("#stiffStyle").forEach((el) => {
            el.remove()
          })
          checkForUpdate((d) => {
            stiffAlert(`<div class="stiffUpdateNotice">Stiff is out of date!<br/> Please update to v${d.new.version}</div>`,5000)
          })
          fs.readFile( __dirname + "/style.css", function (err, data) {
            stiffStyle.innerHTML += data.toString('utf8').replace(/\#abab00ab/g,color)
            stiffStyle.innerHTML += lessString
            stiffStyle.innerHTML += cssString
            document.body.prepend(stiffStyle)
            if(!DEBUG) setTimeout(() => fadeIn.className = "stiffFadeEffect stiffFadeToInActive", 500);
          })
        })
      })
    })
  }

  load(){
    let p = this
    this.registerSettingsTab('Stiff', require('./settingsPage'))
    document.addEventListener ( "keydown" , function (zEvent) { if (zEvent.ctrlKey  &&  zEvent.altKey  &&  zEvent.code === "KeyT") { p.repaint() } } )

    let popoutsEl
    let modalsEl
    const settings = {attributes: true, childList: true}

    let popoutsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(!mutation.addedNodes[0] || !mutation.addedNodes[0].className.includes("popout")) return
        let el = mutation.addedNodes[0]
        let id = el.querySelector(".image-33JSyf")
        if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)
        if(id) id = id[0].replace(/(avatars|\/)/g,'')
        let bgEl = el.querySelector(popoutBackground)
        if(bgEl){
          bgEl.id = "udbImage" + id
          getUserImage(id)
        }
      })
    })

    let modalsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(!mutation.addedNodes[0] || !mutation.addedNodes[0].className.includes("modal")) return
        let el = mutation.addedNodes[0]
        let id = el.querySelector(".image-33JSyf")
        if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)
        if(id) id = id[0].replace(/(avatars|\/)/g,'')
        let bgEl = el.querySelector(modalBackground)
        if(bgEl){
          bgEl.id = "udbImage" + id
          getUserImage(id)
        }
      })
    })

    console.log('%c[Stiff][Mutator] Observer created',logCss)
    let firstObserver = new MutationObserver((mutations) =>{
      mutations.forEach((mutation) => {
        if(!mutation.addedNodes[0]) return
        mutation.addedNodes.forEach((node) => {
          console.log(node.className)
          if(node.className === "theme-dark popouts-3dRSmE"){
            console.log('%c[Stiff][Mutator] Popouts found',logCss)
            popoutsEl = node
            popoutsObserver.observe(node,settings)
          }
          if(node.className === "theme-dark"){
            console.log('%c[Stiff][Mutator] Modals found',logCss)
            modalsEl = node
            modalsObserver.observe(node,settings)
          }
        })
      })
    })

    firstObserver.observe(document.querySelector("#app-mount"),settings)

    setTimeout(() => {
      let id = document.querySelector('.container-2Thooq > .avatar-small')
      if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)
      if(id) id = id[0].replace(/(avatars|\/)/g,'')
      if(id) window.discordID = id
      if(!popoutsEl){
        popoutsEl = document.querySelector("#app-mount > .theme-dark.popouts-3dRSmE")
        if(popoutsEl){ 
          popoutsObserver.observe(popoutsEl,settings)
          console.log('%c[Stiff][Mutator] Popouts found (late!)',logCss)
        }
      }
      if(!modalsEl){
        modalsEl = document.querySelector("#app-mount > .theme-dark:not(.popouts-3dRSmE)")
        if(modalsEl){ 
          modalsObserver.observe(modalsEl,settings)
          console.log('%c[Stiff][Mutator] Modals found (late!)',logCss)
        }
      }
      firstObserver.disconnect()
    }, 5000)
    /*
    if(DEBUG)
      fs.watch( __dirname + "/ts2.less",  (eventType, filename) => {
        if(eventType === "change")
          p.repaint()
      })
    */
    document.body.addEventListener('click', (e) =>{
      isElement(e)
    })
  }

  unload() {
    console.log('%c[Stiff] Unloading...',logCss)
    console.log('%c[Stiff][Mutator] Disconnecting observers',logCss)
    document.querySelector('.stiffAlert').remove()
    document.querySelector('div[id*="udbUserImageStyle"]').remove()
    popoutsObserver.disconnect()
    modalsObserver.disconnect()
    firstObserver.disconnect()
  }
}

const classList = [".dms ~ .guild > div",".containerDefault-7RImuF",".containerDefault-1bbItS",".member",".channel",".popout-UKvsJt > .image-EVRGPw",".tab-bar-item",".icon-mr9wAc",".container-3NvGrL > div" ]
function isElement(e){
  /*for (let i = 0; i<classList.length; i++) {
    return ripple(e.target.closest(classList[i]))
  }*/
}

function ripple(el){
  if(!el) return
  document.querySelectorAll('.ripple').remove()
  let buttonWidth = el.offsetWidth,
      buttonHeight =  el.offsetHeight
  let span  = document.createElement('span')
  span.className = "ripple"
  el.prepend(span)

  if(buttonWidth >= buttonHeight) buttonHeight = buttonWidth;else buttonWidth = buttonHeight

  span.style.width = buttonWidth + "px"
  span.style.height = buttonHeight + "px"
  span.className += " rippleEffect"
}
