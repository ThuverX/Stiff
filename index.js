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

const AutoUpdater = require('auto-updater');
const autoupdater = new AutoUpdater({
  pathToJson: '',
  autoupdate: false,
  checkgit: true,
  jsonhost: 'raw.githubusercontent.com',
  contenthost: 'codeload.github.com',
  progressDebounce: 0,
  devmode: false
 });



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


autoupdater.on('git-clone', function() {
  stiffAlert("You have a clone of the repository. Use 'git pull' to be up-to-date");
});
autoupdater.on('check.up-to-date', function(v) {
  stiffAlert("You have the latest version: " + v,5000);
});
autoupdater.on('check.out-dated', function(v_old, v) {
  stiffAlert("Your version is outdated. " + v_old + " of " + v,5000);
});
autoupdater.on('update.downloaded', function() {
  stiffAlert("Update downloaded and ready for install",5000);
});
autoupdater.on('update.not-installed', function() {
  stiffAlert("The Update was already in your folder! It's read for install",5000);
});
autoupdater.on('update.extracted', function() {
  stiffAlert("Update extracted successfully!",5000);
});
autoupdater.on('download.start', function(name) {
  stiffAlert("Starting downloading: " + name,5000);
});
autoupdater.on('download.progress', function(name, perc) {
  //process.stdout.write("Downloading " + perc + "% \033[0G");
});
autoupdater.on('download.end', function(name) {
  stiffAlert("Downloaded " + name,5000);
});
autoupdater.on('download.error', function(err) {
  stiffAlert("Error when downloading: " + err,5000);
});
autoupdater.on('end', function() {
  stiffAlert("The app is ready to function",5000);
});
autoupdater.on('error', function(name, e) {
  stiffAlert(name + "," + e,5000);
});

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

  repaint(){
    console.log('%c[Stiff] Repainting...',logCss)
    let color = this.DI.localStorage.getItem("stiff.color") || '#ef5350'
    let bgColor = '#212121'
    if(!this.DI.localStorage.getItem("stiff.pageDrag"))
      this.DI.localStorage.setItem("stiff.pageDrag",true)
    let pageDrag = this.DI.localStorage.getItem("stiff.pageDrag") || true
    if(!DEBUG) fadeIn.className = "stiffFadeEffect stiffFadeActive"

    fs.readFile( __dirname + "/ts2.less", function (err, data) {
      let src = data.toString('utf8')
      let input = src.replace("@color:#009688",`@color:${color}`).replace(/\@bgColor\:\#212121/g,`@bgColor:${bgColor}`).replace(/\@pageDrag\:false\;/,`@pageDrag:${pageDrag};`)

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
        let id = el.querySelector(".image-EVRGPw")
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
          if(node.className === "theme-dark popouts"){
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
      if(!popoutsEl){
        popoutsEl = document.querySelector("#app-mount > .theme-dark.popouts")
        if(popoutsEl){ 
          popoutsObserver.observe(popoutsEl,settings)
          console.log('%c[Stiff][Mutator] Popouts found (late!)',logCss)
        }
      }
      if(!modalsEl){
        modalsEl = document.querySelector("#app-mount > .theme-dark:not(.popouts)")
        if(modalsEl){ 
          modalsObserver.observe(modalsEl,settings)
          console.log('%c[Stiff][Mutator] Modals found (late!)',logCss)
        }
      }
      firstObserver.disconnect()
    }, 5000)

    if(DEBUG)
      fs.watch( __dirname + "/ts2.less",  (eventType, filename) => {
        if(eventType === "change")
          p.repaint()
      })

    document.body.addEventListener('click', (e) =>{
      isElement(e)
    })

    setTimeout(() => autoupdater.fire('check'),5000);
  }

  unload() {
    console.log('%c[Stiff] Unloading...',logCss)
    console.log('%c[Stiff][Mutator] Disconnecting observers',logCss)
    document.querySelector('.stiffAlert').remove()
    popoutsObserver.disconnect()
    modalsObserver.disconnect()
    firstObserver.disconnect()
  }
}

const classList = [".dms ~ .guild > div",".containerDefault-7RImuF",".containerDefault-1bbItS",".member",".channel",".popout-UKvsJt > .image-EVRGPw",".tab-bar-item",".icon-mr9wAc",".container-3NvGrL > div" ]
function isElement(e){
  for (let i = 0; i<classList.length; i++) {
    return ripple(e.target.closest(classList[i]))
  }
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
