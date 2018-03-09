const { Plugin } = require('elements')
const less = require('less')
const fs = require('fs')
const colorSort = require('color-sort')
const https = require('https')

const DEBUG = true

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
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(let i = this.length - 1; i >= 0; i--) {
      if(this[i] && this[i].parentElement) {
          this[i].parentElement.removeChild(this[i])
      }
  }
}
let fadeIn
const logCss = 'background:red;color:white;padding:2px;'
const popoutBackground = ".header-3budic"
const modalBackground = ".header-2Lg0Oe"
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
      z-index: 9000;
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

  repaint(){
    console.log('%c[Stiff] Repainting...',logCss)
    let color = this.DI.localStorage.getItem("stiff.color")?this.DI.localStorage.getItem("stiff.color"):'#ef5350'
    let bgColor = '#212121'
    if(!DEBUG) fadeIn.className = "stiffFadeEffect stiffFadeActive"

    fs.readFile( __dirname + "/ts2.less", function (err, data) {
      let src = data.toString('utf8');
      let input = src.replace("@color:#009688",`@color:${color}`).replace(/\@bgColor\:\#212121/g,`@bgColor:${bgColor}`)

      let stiffStyle = document.createElement('style')
      stiffStyle.id = "stiffStyle"

      less.render(input, function (e, output) {
        if(e) return console.error(e)
        stiffStyle.innerHTML = output.css
        let stiffElements = document.querySelectorAll("#stiffStyle")
        stiffElements.forEach((el) => {
          el.remove()
        })
        fs.readFile( __dirname + "/style.css", function (err, data) {
          stiffStyle.innerHTML += data.toString('utf8').replace(/\#abab00ab/g,color)
          document.body.prepend(stiffStyle)
          if(!DEBUG) setTimeout(() => fadeIn.className = "stiffFadeEffect stiffFadeToInActive", 500);
        })
      })
    })
  }

  load(){
    let p = this
    document.addEventListener ( "keydown" , function (zEvent) { if (zEvent.ctrlKey  &&  zEvent.altKey  &&  zEvent.code === "KeyT") { p.repaint( ) } } )
    this.registerSettingsTab('Stiff', require('./settingsPage'))

    let popoutsEl
    let modalsEl
    const settings = {attributes: true, childList: true}

    let popoutsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(!mutation.addedNodes[0] || !mutation.addedNodes[0].className.includes("popout")) return
        let el = mutation.addedNodes[0]
        let id = el.querySelector(".image-EVRGPw")
        if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)[0].replace(/(avatars|\/)/g,'')
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
        let id = el.querySelector(".image-EVRGPw")
        if(id) id = id.getAttribute("style").match(/\/avatars\/*.*\//g)[0].replace(/(avatars|\/)/g,'')
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
        if(mutation.addedNodes[0].className === "theme-dark popouts"){
          console.log('%c[Stiff][Mutator] Popouts found',logCss)
          popoutsEl = mutation.addedNodes[0]
          popoutsObserver.observe(popoutsEl,settings)
        }
        if(mutation.addedNodes[0].className === "theme-dark"){
          console.log('%c[Stiff][Mutator] Modals found',logCss)
          modalsEl = mutation.addedNodes[0]
          modalsObserver.observe(modalsEl,settings)
        }
      })
    })
    setTimeout(() => {
      if(!popoutsEl){
        popoutsEl = document.querySelector(".theme-dark.popouts")
        if(popoutsEl) console.log('%c[Stiff][Mutator] Popouts found',logCss)
        popoutsObserver.observe(popoutsEl,settings)
      }
      if(!modalsEl){
        modalsEl = document.querySelector(".theme-dark:not(.popouts)")
        if(popoutsEl) console.log('%c[Stiff][Mutator] Modals found',logCss)
        popoutsObserver.observe(modalsEl,settings)
      }
      firstObserver.disconnect()
    }, 5000)

    if(DEBUG)
      fs.watch( __dirname + "/ts2.less",  (eventType, filename) => {
        if(eventType === "change")
          p.repaint()
      })

    firstObserver.observe(document.querySelector("#app-mount"),settings)
  }

  unload() {
    console.log('%c[Stiff] Unloading...',logCss)
    console.log('%c[Stiff][Mutator] Disconnecting observers',logCss)
    popoutsObserver.disconnect()
    modalsObserver.disconnect()
    firstObserver.disconnect()
  }
}
