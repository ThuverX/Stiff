const React = require('react')
const { BrowserWindow } = require('electron').remote
const https = require('https')
const { ChromePicker , CirclePicker } = require('react-color')

const colorSort = require('color-sort')
const colorList = colorSort(["rgb(244,67,54)","rgb(233,30,99)","rgb(156,39,176)","rgb(103,58,183)","rgb(63,81,181)","rgb(33,150,243)","rgb(3,169,244)","rgb(0,188,212)","rgb(0,150,136)","rgb(76,175,80)",
"rgb(139,195,74)","rgb(255,152,0)","rgb(255,87,34)","rgb(121,85,72)","rgb(96,125,139)","rgb(239,154,154)","rgb(244,143,177)","rgb(206,147,216)","rgb(179,157,219)","rgb(159,168,218)","rgb(188,170,164)",
"rgb(229,115,115)","rgb(240,98,146)","rgb(186,104,200)","rgb(149,117,205)","rgb(121,134,203)","rgb(100,181,246)","rgb(79,195,247)","rgb(77,182,172)","rgb(129,199,132)","rgb(255,138,101)","rgb(161,136,127)",
"rgb(144,164,174)","rgb(239,83,80)","rgb(236,64,122)","rgb(171,71,188)","rgb(126,87,194)","rgb(92,107,192)","rgb(66,165,245)","rgb(41,182,246)","rgb(38,198,218)","rgb(38,166,154)","rgb(102,187,106)",
"rgb(255,167,38)","rgb(255,112,67)","rgb(141,110,99)","rgb(120,144,156)","rgb(158,158,158)","rgb(229,57,53)","rgb(216,27,96)","rgb(142,36,170)","rgb(94,53,177)","rgb(57,73,171)","rgb(30,136,229)","rgb(3,155,229)",
"rgb(0,172,193)","rgb(0,137,123)","rgb(67,160,71)","rgb(124,179,66)","rgb(251,140,0)","rgb(244,81,30)","rgb(109,76,65)","rgb(84,110,122)","rgb(211,47,47)","rgb(194,24,91)","rgb(123,31,162)","rgb(81,45,168)",
"rgb(48,63,159)","rgb(25,118,210)","rgb(2,136,209)","rgb(0,151,167)","rgb(0,121,107)","rgb(56,142,60)","rgb(104,159,56)","rgb(175,180,43)","rgb(255,160,0)","rgb(245,124,0)","rgb(230,74,25)","rgb(93,64,55)",
"rgb(69,90,100)","rgb(198,40,40)","rgb(173,20,87)","rgb(106,27,154)","rgb(69,39,160)","rgb(40,53,147)","rgb(21,101,192)","rgb(2,119,189)","rgb(0,131,143)","rgb(0,105,92)","rgb(46,125,50)","rgb(85,139,47)",
"rgb(158,157,36)","rgb(249,168,37)","rgb(255,143,0)","rgb(239,108,0)","rgb(216,67,21)","rgb(78,52,46)","rgb(55,71,79)","rgb(183,28,28)","rgb(136,14,79)","rgb(74,20,140)","rgb(49,27,146)","rgb(26,35,126)",
"rgb(13,71,161)","rgb(1,87,155)","rgb(0,96,100)","rgb(0,77,64)","rgb(27,94,32)","rgb(51,105,30)","rgb(130,119,23)","rgb(245,127,23)","rgb(255,111,0)","rgb(230,81,0)","rgb(191,54,12)","rgb(62,39,35)",
"rgb(38,50,56)","rgb(255,138,128)","rgb(255,128,171)","rgb(234,128,252)","rgb(179,136,255)","rgb(140,158,255)","rgb(130,177,255)","rgb(255,158,128)","rgb(255,82,82)","rgb(255,64,129)","rgb(224,64,251)",
"rgb(124,77,255)","rgb(83,109,254)","rgb(68,138,255)","rgb(64,196,255)","rgb(255,110,64)","rgb(255,23,68)","rgb(245,0,87)","rgb(213,0,249)","rgb(101,31,255)","rgb(61,90,254)","rgb(41,121,255)",
"rgb(0,176,255)","rgb(0,230,118)","rgb(255,145,0)","rgb(255,61,0)","rgb(213,0,0)","rgb(197,17,98)","rgb(170,0,255)","rgb(98,0,234)","rgb(48,79,254)","rgb(41,98,255)","rgb(0,145,234)","rgb(0,184,212)",
"rgb(0,191,165)","rgb(0,200,83)","rgb(255,171,0)","rgb(255,109,0)","rgb(221,44,0)"]).reverse()

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

const openUDB = (id) => {
  let win = new BrowserWindow({width: 800, height: 700,frame: false,transparent:true})
	win.loadURL(`https://udb.glitch.me/upload`)
	win.once('ready-to-show', () => {
		win.show()
    win.setClosable(false)
  })
	win.webContents.on('did-get-redirect-request', (event,oldURL,newURL) =>{
		if(newURL === "https://udb.glitch.me/success" || newURL === "https://udb.glitch.me" || newURL === "https://udb.glitch.me/"){
      win.close()
      getUserImage(id)
	  }
  })
  win.webContents.on('did-navigate',(event,url) => {
    if(url === "https://udb.glitch.me/success" || url === "https://udb.glitch.me" || url === "https://udb.glitch.me/"){
      win.close()
      getUserImage(id)
	  }
  })
  win.webContents.on('did-navigate-in-page',(event,url) => {
    if(url === "https://udb.glitch.me/success" || url === "https://udb.glitch.me" || url === "https://udb.glitch.me/"){
      win.close()
      getUserImage(id)
	  }
  })
  win.webContents.on('did-finish-load', function() {
    win.webContents.executeJavaScript("alert('fucko');var style = document.createElement('style');style.innerHTML = '.custom-file-upload:after{background:" + p.props.plugin.DI.localStorage.getItem("stiff.color") || '#ef5350' + " !important;}';document.body.appendChild(style);");
  });
}

let id = ""
let p

module.exports = class SettingsGeneral extends React.PureComponent {
  constructor(props){
    super(props)
    p = this
    this.state = {currentPage:"info",userSwitch:(p.props.plugin.DI.localStorage.getItem("stiff.pageDrag")||true)}
  }

  openImageChanger () {
    openUDB(id)
  }

  handleColorChange (color,event){
    p.props.plugin.DI.localStorage.setItem('stiff.colorUnset',color.hex)
    document.querySelector('.sidebar').style.background = color.hex
    document.querySelector('.stiffPageWrapper').style.background = color.hex
  }

  handleColorChangeComplete (color,event){
    p.props.plugin.DI.localStorage.setItem('stiff.color',color.hex)
    document.querySelector('.sidebar').style.background = color.hex
    document.querySelector('.stiffPageWrapper').style.background = color.hex
    p.props.plugin.manager.get('stiff').repaint()
  }

  clickPickerExitButton () {
    document.querySelector('.sidebar').style.background = p.props.plugin.DI.localStorage.getItem('stiff.color')?p.props.plugin.DI.localStorage.getItem('stiff.color'):'#ef5350';
    document.querySelector('.stiffPageWrapper').style.background = p.props.plugin.DI.localStorage.getItem('stiff.color')?p.props.plugin.DI.localStorage.getItem('stiff.color'):'#ef5350';
    document.querySelector('.chrome-picker').style.display = "none"
    document.querySelector('.pickerButtonExit').style.display = "none"
    document.querySelector('.pickerButton').className = "pickerButton"
  }

  clickPickerButton () {
    if(p.props.plugin.DI.localStorage.getItem('stiff.colorUnset') !== p.props.plugin.DI.localStorage.getItem('stiff.color') && document.querySelector('.pickerButton').className.includes("pickerButtonCheck")){
      p.props.plugin.DI.localStorage.setItem('stiff.color',p.props.plugin.DI.localStorage.getItem('stiff.colorUnset'))
      p.props.plugin.manager.get('stiff').repaint()
    }
    if(document.querySelector('.chrome-picker').style.display !== "none"){
      document.querySelector('.chrome-picker').style.display = "none"
      document.querySelector('.pickerButton').className = "pickerButton"
      document.querySelector('.pickerButtonExit').style.display = "none"
    }
    else{
      document.querySelector('.chrome-picker').style.display = "block"
      document.querySelector('.pickerButton').className = "pickerButton pickerButtonCheck"
      document.querySelector('.pickerButtonExit').style.display = "block"
    }
  }

  clickUserSwitch(){
    let previous = p.props.plugin.DI.localStorage.getItem("stiff.pageDrag")
    p.props.plugin.DI.localStorage.setItem("stiff.pageDrag",!previous)
    p.props.plugin.manager.get('stiff').repaint()
  }

  render () {
    const changelog = require('./changelog.json')
    id = window.discordID || "unknown"
    getUserImage(id)
    
    let imageId = "udbImage" + id
        return (
          <div class="stiffSettingsPage">
            <div class="stiffHeaderImage"></div>
            <div onClick={() => this.setState({ currentPage: "info" })} class="stiffSelectorDiv info"></div>
            <div onClick={() => this.setState({ currentPage: "background" })} class="stiffSelectorDiv background"></div>
            <div onClick={() => this.setState({ currentPage: "color" })} class="stiffSelectorDiv color"></div>
            <div onClick={() => this.setState({ currentPage: "css" })} class="stiffSelectorDiv css"></div>
            <div class="stiffSelectorDiv fix"></div>
            { this.state.currentPage === "info" ?
            <div class="stiffPageWrapper" id="info">
              <div class="stiffInfoStrip">
              <div class="stiffUpdateButton"><a href="https://github.com/ThuverX/Stiff" target="_blank" rel="noreferrer noopener">Github</a></div>
              <div class="stiffUpdateButton" style={{background:'#e62365',marginRight:'80px'}} ><a href="https://discord.gg/8T2rWM6" target="_blank" rel="noreferrer noopener">Discord</a></div>
              <p class="stiffCTitle">{changelog.title}</p>
              {changelog.updates.map((u,i) => {
                return <div class="stiffCVersions"><p class="version">v{u.version} {u.name} <p class="rdate">{u.releaseDate}</p></p><p>{u.text}</p></div>
              })}
            </div>
            </div>
            : '' }
            {this.state.currentPage === "background" ?
            <div class="stiffPageWrapper" id="background">
              <div class="stiffImagePicker" id={imageId} onClick={ this.openImageChanger }></div>
              <div class="stiffInfoStrip">Click the image to change your user background image.</div>
              {false?
              <div class="stiffSwitchWrapper">Extend the userpopout all the way?
                <div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC valueChecked-3Bzkbm value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style={{flex:" 0 0 auto",float:"right"}}>
                  <input type="checkbox" onclick={this.clickUserSwitch} class="checkboxEnabled-4QfryV checkbox-1KYsPm" value={this.state.userSwitch?'on':'off'}></input>
                </div>
              </div>
              :''}
            </div>
            : '' }
            {this.state.currentPage === "css" ?
            <div class="stiffPageWrapper" id="css">
              <div class="stiffInfoStrip">Nothing here yet.</div>
            </div>
            : '' }
            { this.state.currentPage === "color" ?
            <div class="stiffPageWrapper" id="color">
              <div class="pickerButton" onClick={this.clickPickerButton}></div>
              <div class="stiffCustomColor">Custom color</div>
              <div class="pickerButtonExit" style={{display:"none"}} onClick={ this.clickPickerExitButton}></div>
              <ChromePicker style={{display:"none"}} disableAlpha={true} onChange={this.handleColorChange} />
              <CirclePicker colors={colorList} onChange={ this.handleColorChangeComplete } />
              <div class="stiffInfoStrip">Choose your Stiff color! This color will change how your theme looks!</div>
            </div>
            : '' }
            <div class="stiffInfoStrip">Press <b>CTRL + ALT + T</b> to refresh the styles.</div>
          </div>
        )
        
  }
}
