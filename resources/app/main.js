const electron = require('electron')
const {ipcMain} = require('electron')
const fs = require('fs-extra')
const app = electron.app

const BrowserWindow = electron.BrowserWindow
const path = require('path')
const userDataPath = app.getPath ('userData')

//read INI file
var fileSettings = "./Blockly@rduino.json"
var Settings = ''

if( !fs.existsSync(fileSettings) ) {
	console.log("File not found")
	fs.writeFileSync(fileSettings, '', (err) => {
		if(err){
			console.log("An error ocurred creating the file "+ err.message)
		}                    
		console.log("The file has been succesfully saved")
	})
	} else {
		var Settings = fs.readFileSync(fileSettings, 'utf8', (err, Settings) => {
			if(err){
				console.log("An error occured reading the file :" + err.message)
				return
			}
		// console.log("The file Settings is : " + Settings)
		})
}

let mainWindow
let termWindow
let factoryWindow

app.setPath ('userData', app.getAppPath())

app.on('window-all-closed', () => {
	mainWindow.webContents.session.clearStorageData()
	mainWindow.webContents.clearHistory()
    app.quit()
})

function createWindow () {
	splash = new BrowserWindow({
		width: 292,
		height: 218,
		backgroundColor: '#000000',
		setTitle: "Blockly@rduino...",
		frame: false
	})
	splash.loadURL(path.join(__dirname, './Blockly@rduino.png'))
	mainWindow = new BrowserWindow({
		width:1280,
		height:800,
		titleBarStyle: 'hidden',
		icon:'./favicon.ico',
		show: false,
		"webPreferences":{
			"webSecurity":false,
			"allowRunningInsecureContent":true
			}
		})
	if (Settings == '' || Settings == "undefined") {
		if (process.platform == 'win32' && process.argv.length >= 2) {
			if (((process.argv[1]).substring(0, 9)) == "index_AIO") {
				mainWindow.loadURL(path.join(__dirname, '../../www/' + process.argv[1]))
			}
			else {
				mainWindow.loadURL(path.join(__dirname, '../../www/index_AIO.html?' + process.argv[1]))
			}
		} else {
			mainWindow.loadURL(path.join(__dirname, '../../www/index_AIO.html'))
		}
	} else {
		Settings = Settings.replace('"', '')
		Settings = Settings.replace('"', '')
		mainWindow.loadURL(path.join(__dirname, "../../www/index_AIO.html" + Settings))
	}
	mainWindow.setMenu(null);
	mainWindow.webContents.openDevTools();
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		splash.close();
	});
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow)
	
app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})
	
function createTerm() {
	termWindow = new BrowserWindow({
		width: 660,
		height: 660,
		'parent':mainWindow,
		resizable:false,
		movable:true,
		frame:true,
		modal:false
		})
	termWindow.loadURL(path.join(__dirname, "../../www/tools/serialconsole/serialconsole.html"))
	termWindow.setMenu(null);
	termWindow.on('closed', function () { 
		termWindow = null 
	})
}
ipcMain.on("prompt", function () {
	createTerm()       
});

function createfactory() {
	factoryWindow = new BrowserWindow({
		width:1200,
		height:800,
		'parent':mainWindow,
		resizable:true,
		movable:true,
		frame:true,
		modal:true
		}) 
	factoryWindow.loadURL(path.join(__dirname, "../../www/tools/factory/block_factory.html"))
	factoryWindow.setMenu(null);
	factoryWindow.on('closed', function () { 
		factoryWindow = null 
	})
}
ipcMain.on("factory", function () {
	createfactory()       
});