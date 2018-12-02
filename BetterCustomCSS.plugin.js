//META{"name":"BetterCustomCSS","Customa":"https://github.com/Customa/Customa", "Customa-Injector":"https://github.com/Customa/Customa-CSS-Injector", "Source": "https://raw.githubusercontent.com/Customa/Customa-CSS-Injector/master/BetterCustomCSS.plugin.js"}*//
/*globals BdApi*/

'use strict';
var BetterCustomCSS = function () { };
BetterCustomCSS.prototype.getAuthor = function () {
	return "kosshi - Enhanced by: GhostlyDilemma @ Customa";
};
BetterCustomCSS.prototype.getName = function () {
	return "BetterCustomCSS";
};
BetterCustomCSS.prototype.getDescription = function () {
	return `Let's you edit CSS files in your favorite Text editor and reloads them whenever you save. \n Now supports: Multiple Files, (Multiple Folders) -> Recursive Loading, Exceptions for Folders and Files`;
};
BetterCustomCSS.prototype.getVersion = function () {
	return "1.0.0";
};
BetterCustomCSS.prototype.start = function () {
	let settings = this.loadSettings();
	let fs = require('fs');
	let fileFolderToLoad = "";
	for (let i = 0; i < settings.directory.length; i++) {
		if (settings.directory[i] != "") {
			fileFolderToLoad += settings.directory[i];
		}
	}
	fileFolderToLoad = fileFolderToLoad.split(',');
	for (let k = 0; k < fileFolderToLoad.length; k++) {
		fileFolderToLoad[k] = fileFolderToLoad[k].replace(/(\r\n\t|\n|\r\t)/gm, "");
	}
	let elemOld = document.querySelectorAll('.bettercustomcss-style');
	elemOld.forEach(file => {
		file.remove();
	});

	for (let j = 0; j < fileFolderToLoad.length; j++) {
		this.appendFile(fileFolderToLoad[j]);
		let selectionIsFile = fs.lstatSync(fileFolderToLoad[j]).isFile();

		if (selectionIsFile) {
			this.watcher = fs.watch(fileFolderToLoad[j], (event, filename) => {
				this.appendFile(fileFolderToLoad[j]);
			});
		}
	}
};
BetterCustomCSS.prototype.stop = function () {
	if (document.getElementById('bettercustomcss')) {
		this.watcher.close();
		document.head.removeChild(document.getElementById('bettercustomcss'));
	}
};
BetterCustomCSS.prototype.appendFile = function (fileFolderToLoad) {
	let fs = require('fs');
	let selectionIsFile = fs.lstatSync(fileFolderToLoad).isFile();

	if (!selectionIsFile) {
		let path = new Array();
		path.push(fileFolderToLoad);
		this.loadAndAppendRecursively(fileFolderToLoad, path, fileFolderToLoad);
	} else {
		if (this.accessSync(fileFolderToLoad)) {
			fs.readFile(fileFolderToLoad, "utf8", (err, file) => {
				if (err) {
					BdApi.getCore().alert(
						"BetterCustomCSS Error",
						"Failed to read '" + fileFolderToLoad + "'. The plugin will be disabled. Go to the plugin settings and set the path correctly. This usually happens when the file is deleted or renamed."
					);
					this.stop();
					return;
				}
				let id = fileFolderToLoad.split("\\");
				let elemOld = document.getElementById(`bccss-file-${id[id.length - 1].split(".")[0]}`);
				if (elemOld != null) {
					elemOld.innerHTML = file;
				} else {
					let elem = document.createElement("style");
					elem.classList = 'bettercustomcss-style';
					elem.id = `bccss-file-${id[id.length - 1].split(".")[0]}`;


					elem.innerHTML = file;
					document.head.appendChild(elem);
				}
			});

		}
	}
};
BetterCustomCSS.prototype.loadAndAppendRecursively = function (folder, curPath, topTierElem) {
	let fs = require('fs');
	let settings = this.loadSettings();
	let exceptions = "";
	if (settings.exceptions != null && settings.exceptions != undefined) {
		for (let i = 0; i < settings.exceptions.length; i++) {
			if (settings.exceptions[i] != "") {
				exceptions += settings.exceptions[i];
			}
		}
	}
	exceptions = exceptions.split(',');
	for (let j = 0; j < exceptions.length; j++) {
		exceptions[j] = exceptions[j].replace(/(\r\n\t|\n|\r\t)/gm, "");
	}
	fs.readdirSync(folder).forEach(file => {
		let hit = false;
		if (!fs.lstatSync(folder + '\\' + file).isFile()) {
			for (let i = 0; i < exceptions.length; i++) {
				if (folder + '\\' + file == exceptions[i] || file == exceptions[i]) {
					hit = true;
				}
			}
			if (!hit) {
				curPath.push(file);
				this.loadAndAppendRecursively(folder + '\\' + file, curPath, topTierElem);
			}
		} else {
			if (file.indexOf('css') != -1) {
				this.loadFolderFile(exceptions, folder, file, topTierElem);
			}
		}
	});
};
BetterCustomCSS.prototype.loadFolderFile = function (exceptions, folder, fileName, topTierElem) {
	let fs = require('fs');
	let hit = false;
	if (this.accessSync(folder + '\\' + fileName)) {
		for (let i = 0; i < exceptions.length; i++) {
			if (folder + '\\' + fileName == exceptions[i] || fileName == exceptions[i]) {
				hit = true;
			}
		}
		if (!hit) {
			let elem = document.createElement("style");
			let folderA = folder.split("\\");
			let folderB = topTierElem.split("\\");
			let fileA = fileName.split(".");
			let folderString = "";
			fs.readFile(folder + '\\' + fileName, "utf8", (err, file) => {
				if (!err) {
					for (let i = folderA.indexOf(folderB[folderB.length - 1]); i < folderA.length; i++) {
						folderString += '-' + folderA[i];
					}
					let elemOld = document.getElementById(`bccss-folder${folderString}-file-${fileA[0]}`);
					if (elemOld != null) {
						elemOld.innerHTML = file;
					} else {
						elem.classList = 'bettercustomcss-style';
						elem.id = `bccss-folder${folderString}-file-${fileA[0]}`;
						elem.innerHTML = file;
						document.head.appendChild(elem);
						this.watcher = fs.watch(folder + '\\' + fileName, (event, filename) => {
							this.loadFolderFile(exceptions, folder, fileName, topTierElem);
						});
					}
				}
			});
		}
	}
}

BetterCustomCSS.prototype.load = function () { };
BetterCustomCSS.prototype.unload = function () { };
BetterCustomCSS.prototype.onMessage = function () { };
BetterCustomCSS.prototype.onSwitch = function () { };
BetterCustomCSS.prototype.accessSync = function (dir) {
	let fs = require('fs');
	try {
		fs.accessSync(dir, fs.F_OK);
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};
BetterCustomCSS.prototype.observer = function () { };
BetterCustomCSS.prototype.saveSettings = function (button) {
	let settings = this.loadSettings();
	let dir = document.getElementById('qs_directory').value;
	let exc = document.getElementById('qs_exceptions').value;

	let plugin = BdApi.getPlugin('BetterCustomCSS');

	settings.directory = dir;
	settings.exceptions = exc;

	BdApi.setData(this.getName(), 'config', JSON.stringify(settings));

	plugin.stop();
	plugin.start();

	button.innerHTML = "Saved and applied!";
	setTimeout(() => { button.innerHTML = "Save and apply"; }, 1000);
};

BetterCustomCSS.prototype.settingsVersion = 1;
BetterCustomCSS.prototype.defaultSettings = function () {
	return {
		version: this.settingsVersion,
		directory: "none"
	};
};

BetterCustomCSS.prototype.resetSettings = function (button) {
	let settings = this.defaultSettings();
	BdApi.setData(this.getName(), 'config', JSON.stringify(settings));
	this.stop();
	this.start();
	button.innerHTML = "Settings resetted!";
	setTimeout(function () { button.innerHTML = "Reset settings"; }, 1000);
};

BetterCustomCSS.prototype.loadSettings = function () {
	// Loads settings from localstorage
	let settings = (BdApi.getData(this.getName(), 'config')) ? JSON.parse(BdApi.getData(this.getName(), 'config')) : { version: "0" };
	if (settings.version != this.settingsVersion) {
		console.log('[' + this.getName() + '] Settings were outdated/invalid/nonexistent. Using default settings.');
		settings = this.defaultSettings();
		BdApi.setData(this.getName(), 'config', JSON.stringify(settings));
	}
	return settings;
};
BetterCustomCSS.prototype.import = function (string) {
	BdApi.setData(this.getName(), 'config', string);
	this.stop();
	this.start();
}

BetterCustomCSS.prototype.getSettingsPanel = function () {
	let settings = this.loadSettings();

	let html = `<h1 style='font-size: 24px; margin: 10px 0 0 0; font-weight: bold'>Settings Panel</h1><br>
	<h2 style='font-size: 18px!important; 
	font-weight: bold; 
	cursor: pointer'
	onclick='let setup = document.getElementById("betterCustomCSSSetup");
	if(setup.style.display == "none"){
		setup.style.display="block"
	}else{
		setup.style.display="none"
	}'>Setup (click to reveal)</h2><br>
	<div id='betterCustomCSSSetup' 
	style='display: none;
	margin-bottom: 15px'>
		Folder/File to load (loads recursively):<br>
		
		<textarea id='qs_directory'
		style='width: 100%!important;
		background-color: rgba(0,0,0,0.2);
		border: none;
		font-size: 14px!important;
		color: white!important;
		padding: 5px;
		resize: vertical;
		overflow: auto;
		height: auto'>${settings.directory}</textarea><br><br>
		
		Exceptions for folder loading<br>
		
		<textarea id='qs_exceptions'
		style='width: 100%!important;
		background-color: rgba(0,0,0,0.2);
		border: none;
		font-size: 14px!important;
		color: white!important;
		padding: 5px;
		resize: vertical;
		overflow: auto;
		height: auto'>${settings.exceptions}</textarea><br><br>
		
		<div style='display: flex;'>
			<button class='button-38aScr'
			style='margin-right: 5px; 
			height: 40px!important' 
			onclick=BdApi.getPlugin('${this.getName()}').saveSettings(this)>Save and apply</button><br>
			
			<button class='button-38aScr'
			style='height: 40px!important'
			onclick=BdApi.getPlugin('${this.getName()}').resetSettings(this)>Reset settings</button>
		</div>
	</div>
	<h2 style='font-size: 18px!important;
	font-weight: bold;
	cursor: pointer'
	onclick='let setup = document.getElementById("betterCustomCSSHowTo");
	if(setup.style.display == "none"){
		setup.style.display="block"
	}else{
		setup.style.display="none"
	}'>How to (click to reveal)</h2><br/>
	<div id='betterCustomCSSHowTo' 
	style='display: none; 
	margin-bottom: 15px'>
		- Create a CSS file that you want to use.
		<br> - Set the file/directory setting to the file/the directory the file is in.
		<br>(eg C:/Users/User/Documents/Themes/theme.css) or
		<br>(eg C:/Users/User/Documents/Themes)
		<br> - The file will be now loaded to the DOM. The plugin attempts to reload the file when it is edited.
		<br> - You can now open the file in your favorite text editor, edit it, and see the results instantly after saving the file(s).
		<br> - For further help, look at GitHub: <a class='anchor-3Z-8Bb' href='https://github.com/Customa/Customa-CSS-Injector' target='blank'>Repo</a>
	</div>
	Original Plugin made by <a class='anchor-3Z-8Bb' href='https://github.com/kosshishub/BetterCustomCSS-BD-plugin' target='blank'>kosshi</a>
	<br><span style='display: block; margin-top: 5px!important'>Enhanced with 💚 by <a class='anchor-3Z-8Bb' href='https://github.com/GhostlyDilemma' target='blank'>GhostlyDilemma</a> 
	@ 
	<a class='anchor-3Z-8Bb' href='https://github.com/Customa' target='blank'>Customa</a></span>
	<span style='display: block; margin-top: 5px!important'>Source code is available over <a class='anchor-3Z-8Bb' href='https://github.com/Customa/Customa-CSS-Injector' target='blank'>here</a></span>`;

	return html;
};