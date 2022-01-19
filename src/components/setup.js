import { Capacitor } from "@capacitor/core"
import { Storage } from "@capacitor/storage"
import { App } from "@capacitor/app"
import { SplashScreen } from "@capacitor/splash-screen"
import { Network } from "@capacitor/network"
import { Device } from "@capacitor/device"
import { StatusBar, StatusBarStyle } from "@capacitor/status-bar"
import { isPlatform } from "@ionic/core"
import { modalController, popoverController, actionSheetController, loadingController, alertController } from "@ionic/core"
import * as language from "../utils/language"
import { Filesystem, FilesystemDirectory } from "@capacitor/filesystem"
import * as workers from "../utils/workers"

const localforage = require("localforage")

export function setupListeners(){
    if(Capacitor.isNative){
        App.addListener("backButton", async (e) => {
            let goBackHistory = true

            if(this.state.searchbarOpen){
                this.hideMainSearchbar(false)

                goBackHistory = false
            }

            let isModalActive = await modalController.getTop()

            if(isModalActive && this.state.isLoggedIn){
                window.customFunctions.dismissModal()

                goBackHistory = false
            }

            let isPopoverActive = await popoverController.getTop()

            if(isPopoverActive && this.state.isLoggedIn){
                window.customFunctions.dismissPopover()

                goBackHistory = false
            }

            let isActionSheetActive = await actionSheetController.getTop()

            if(isActionSheetActive && this.state.isLoggedIn){
                window.customFunctions.dismissActionSheet()

                goBackHistory = false
            }

            let isLoadingActive = await loadingController.getTop()

            if(isLoadingActive){
                goBackHistory = false

                if(window.customVariables.isGettingPreviewData){
                    window.customVariables.stopGettingPreviewData = true
                }
            }

            if(this.state.selectedItems > 0 && this.state.isLoggedIn){
                this.clearSelectedItems()

                goBackHistory = false
            }

            let isAlertActive = await alertController.getTop()

            if(isAlertActive && this.state.isLoggedIn){
                window.customFunctions.dismissAlert()

                goBackHistory = false
            }

            let origin = window.location.origin

            if(window.location.href == origin 
            || window.location.href == origin + "/" 
            || window.location.href == origin + "/#" 
            || window.location.href == origin + "/#!" 
            || window.location.href == origin + "/#/"
            || window.location.href == origin + "/index.html"
            || window.location.href == origin + "/index.html#!/"
            || window.location.href == origin + "/index.html#!"
            || window.location.href == origin + "/index.html#"
            || window.location.href == origin + "/#!/base" 
            || window.location.href == origin + "/index.html#!/base"
            || window.location.href == origin + "/#!/shared-in"
            || window.location.href == origin + "/index.html#!/shared-in"
            || window.location.href == origin + "/#!/shared-out"
            || window.location.href == origin + "/index.html#!/shared-out"
            || window.location.href == origin + "/#!/trash"
            || window.location.href == origin + "/index.html#!/trash"
            || window.location.href == origin + "/#!/favorites"
            || window.location.href == origin + "/index.html#!/favorites"
            || window.location.href == origin + "/#!/links"
            || window.location.href == origin + "/index.html#!/links"){
                goBackHistory = false
            }

            if(goBackHistory){
                window.history.back()
            }
        })
    }
}

export async function setupStatusbar(type = "normal"){
    if(Capacitor.isNative){
        if(type == "normal"){
            if(this.state.darkMode){
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#121212"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Dark
                })

                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#1F1F1F", false)
                }
            }
            else{
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#ffffff"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Light
                })

                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#F0F0F0", true)
                }
            }
        }
        else if(type == "modal"){
            if(this.state.darkMode){
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#1E1E1E"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Dark
                })
    
                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#1E1E1E", false)
                }
            }
            else{
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#ffffff"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Light
                })

                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#ffffff", true)
                }
            }
        }
        else if(type == "image/video"){
            if(!isPlatform("ios")){
                StatusBar.setBackgroundColor({
                    color: "#000000"
                })
            }
            
            StatusBar.setStyle({
                style: StatusBarStyle.Dark
            })

            if(Capacitor.platform == "android"){
                window.NavigationBar.backgroundColorByHexString("#000000", false)
            }
        }
        else if(type == "login/register"){
            if(this.state.darkMode){
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#121212"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Dark
                })

                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#121212", false)
                }
            }
            else{
                if(!isPlatform("ios")){
                    StatusBar.setBackgroundColor({
                        color: "#ffffff"
                    })
                }
                
                StatusBar.setStyle({
                    style: StatusBarStyle.Light
                })

                if(Capacitor.platform == "android"){
                    window.NavigationBar.backgroundColorByHexString("#ffffff", true)
                }
            }
        }

        if(!isPlatform("ios")){
            StatusBar.setOverlaysWebView({
                overlay: false
            })
        }
    }
}

export async function doSetup(){
    try{
        var networkStatus = await Network.getStatus()
    }
    catch(e){
        return console.log(e)
    }

    let dirObj = []

    if(Capacitor.platform == "ios"){
        dirObj.push({
            path: "ThumbnailCache/",
            directory: FilesystemDirectory.Documents
        })

        dirObj.push({
            path: "FilenThumbnailCache/",
            directory: FilesystemDirectory.Documents
        })

        dirObj.push({
            path: "NoCloud/",
            directory: FilesystemDirectory.Documents
        })

        dirObj.push({
            path: "Filen Downloads/",
            directory: FilesystemDirectory.Documents
        })

        dirObj.push({
            path: "FilenOfflineFiles/",
            directory: FilesystemDirectory.Documents
        })

        dirObj.push({
            path: "Download/",
            directory: FilesystemDirectory.Documents
        })
    }
    else{
        dirObj.push({
            path: "ThumbnailCache/",
            directory: FilesystemDirectory.External
        })

        dirObj.push({
            path: "FilenThumbnailCache/",
            directory: FilesystemDirectory.External
        })

        dirObj.push({
            path: "NoCloud/",
            directory: FilesystemDirectory.External
        })

        dirObj.push({
            path: "Filen Downloads/",
            directory: FilesystemDirectory.External
        })

        dirObj.push({
            path: "Downloads/",
            directory: FilesystemDirectory.External
        })

        dirObj.push({
            path: "Download/",
            directory: FilesystemDirectory.External
        })
    }

    for(let i = 0; i < dirObj.length; i++){
        try{
            await Filesystem.rmdir({
                path: dirObj[i].path,
                directory: dirObj[i].directory,
                recursive: true
            })
        }
        catch(e){
            console.log(e)
        }
    }

    try{
        var getLang = await workers.localforageGetItem("lang")
        var getDarkMode = await workers.localforageGetItem("darkMode")

        if(getLang !== null){
            this.setState({
                lang: getLang,
                mainToolbarTitle: language.get(getLang, "cloudDrives")
            }, () => {
                this.forceUpdate()
            })
    
            window.customVariables.lang = getLang
        }
        else{
            let deviceLang = await Device.getLanguageCode()
            let defaultLang = "en"
    
            if(language.isAvailable(deviceLang)){
                defaultLang = deviceLang
            }
    
            this.setState({
                lang: defaultLang,
                mainToolbarTitle: language.get(defaultLang, "cloudDrives")
            }, () => {
                this.forceUpdate()
            })
    
            window.customVariables.lang = defaultLang
        }
    
        if(getDarkMode == null){
            document.body.classList.toggle("dark", true)
    
            this.setState({
                darkMode: true
            }, () => {
                this.forceUpdate()
            })
        }
        else{
            if(getDarkMode == "true"){
                document.body.classList.toggle("dark", true)
    
                this.setState({
                    darkMode: true
                }, () => {
                    this.forceUpdate()
                })
            }
            else{
                document.body.classList.toggle("dark", false)
    
                this.setState({
                    darkMode: false
                }, () => {
                    this.forceUpdate()
                })
            }
        }
    
        this.setupStatusbar()

        var getIsLoggedIn = await workers.localforageGetItem("isLoggedIn")

        if(getIsLoggedIn == null){
            return this.showLogin()
        }
        else{
            if(getIsLoggedIn !== "true"){
                return this.showLogin()
            }
        }

        var getUserEmail = await workers.localforageGetItem("userEmail")

        if(typeof getUserEmail !== "string"){
            return this.showLogin()
        }

        window.customVariables.userEmail = getUserEmail

        var getUserAPIKey = await workers.localforageGetItem("userAPIKey")
        var getUserMasterKeys = await workers.localforageGetItem("userMasterKeys")
        var getUserPublicKey = await workers.localforageGetItem("userPublicKey")
        var getUserPrivateKey = await workers.localforageGetItem("userPrivateKey")
        var getSettings = await workers.localforageGetItem("settings@" + getUserEmail)
        
        var getOfflineSavedFiles = await workers.localforageGetItem("offlineSavedFiles@" + getUserEmail)
        var getAPICache = await workers.localforageGetItem("apiCache@" + getUserEmail)
        var getCachedFiles = await workers.localforageGetItem("cachedFiles@" + getUserEmail)
        var getCachedFolders = await workers.localforageGetItem("cachedFolders@" + getUserEmail)
        var getCachedMetadata = await workers.localforageGetItem("cachedMetadata@" + getUserEmail)
        var getThumbnailCache = await workers.localforageGetItem("thumbnailCache@" + getUserEmail)
        var getGetThumbnailErrors = await workers.localforageGetItem("getThumbnailErrors@" + getUserEmail)
        var getCachedAPIItemListRequests = await workers.localforageGetItem("cachedAPIItemListRequests@" + getUserEmail)
        var getItemsCache = await workers.localforageGetItem("itemsCache@" + getUserEmail)
        var getFolderSizeCache = await workers.localforageGetItem("folderSizeCache@" + getUserEmail)
    }
    catch(e){
        return console.log(e)
    }

    if(getIsLoggedIn == null){
        return this.showLogin()
    }
    else{
        if(getIsLoggedIn == "true"){
            let settings = {
                onlyWifi: false,
                onlyWifiUploads: false,
                showThumbnails: true,
                gridModeEnabled: false,
                biometricPINCode: "",
                convertHeic: true,
                cameraUpload: {
                    enabled: false,
                    parent: "",
                    parentName: "",
                    photos: true,
                    videos: true,
                    hidden: true,
					burst: false,
					icloud: true,
					shared: false,
					convertHeic: true
                }
            }

            if(typeof getSettings == "string"){
                settings = await workers.JSONParseWorker(getSettings)
            }

            if(typeof settings.onlyWifi == "undefined"){
                settings.onlyWifi = false
            }

            if(typeof settings.onlyWifiUploads == "undefined"){
                settings.onlyWifiUploads = false
            }

            if(typeof settings.showThumbnails == "undefined"){
                settings.showThumbnails = true
            }

            if(typeof settings.gridModeEnabled == "undefined"){
                settings.gridModeEnabled = false
            }

            if(typeof settings.biometricPINCode == "undefined"){
                settings.biometricPINCode = ""
            }

            if(typeof settings.convertHeic == "undefined"){
                settings.convertHeic = true
            }

            if(typeof settings.cameraUpload == "undefined"){
                settings.cameraUpload = {
                    enabled: false,
                    parent: "",
                    parentName: "",
                    photos: true,
                    videos: true,
                    hidden: true,
					burst: false,
					icloud: true,
					shared: false,
					convertHeic: true
                }
            }
            else{
                if(typeof settings.cameraUpload.enabled == "undefined"){
                    settings.cameraUpload.enabled = false
                }

                if(typeof settings.cameraUpload.parent == "undefined"){
                    settings.cameraUpload.parent = ""
                }

                if(typeof settings.cameraUpload.parentName == "undefined"){
                    settings.cameraUpload.parentName = ""
                }

                if(typeof settings.cameraUpload.photos == "undefined"){
                    settings.cameraUpload.photos = true
                }

                if(typeof settings.cameraUpload.videos == "undefined"){
                    settings.cameraUpload.videos = true
                }

                if(typeof settings.cameraUpload.hidden == "undefined"){
                    settings.cameraUpload.hidden = true
                }

                if(typeof settings.cameraUpload.burst == "undefined"){
                    settings.cameraUpload.burst = false
                }

                if(typeof settings.cameraUpload.icloud == "undefined"){
                    settings.cameraUpload.icloud = true
                }

                if(typeof settings.cameraUpload.shared == "undefined"){
                    settings.cameraUpload.shared = false
                }

                if(typeof settings.cameraUpload.convertHeic == "undefined"){
                    settings.cameraUpload.convertHeic = true
                }
            }

            this.setState({
                userAPIKey: getUserAPIKey,
                userEmail: getUserEmail,
                userMasterKeys: await workers.JSONParseWorker(getUserMasterKeys),
                userPublicKey: getUserPublicKey,
                userPrivateKey: getUserPrivateKey,
                isLoggedIn: true,
                settings: settings
            }, () => {
                this.forceUpdate()
            })

            window.customVariables.userMasterKeys = await workers.JSONParseWorker(getUserMasterKeys)

            if(getOfflineSavedFiles == null){
                window.customVariables.offlineSavedFiles = {}
            }
            else{
                window.customVariables.offlineSavedFiles = await workers.JSONParseWorker(getOfflineSavedFiles)
            }

            if(getCachedFiles == null){
                window.customVariables.cachedFiles = {}
            }
            else{
                window.customVariables.cachedFiles = await workers.JSONParseWorker(getCachedFiles)
            }

            if(getCachedFolders == null){
                window.customVariables.cachedFolders = {}
            }
            else{
                window.customVariables.cachedFolders = await workers.JSONParseWorker(getCachedFolders)
            }

            if(getCachedMetadata == null){
                window.customVariables.cachedMetadata = {}
            }
            else{
                window.customVariables.cachedMetadata = await workers.JSONParseWorker(getCachedMetadata)
            }

            if(getThumbnailCache == null){
                window.customVariables.thumbnailCache = {}
            }
            else{
                window.customVariables.thumbnailCache = await workers.JSONParseWorker(getThumbnailCache)
            }

            if(getGetThumbnailErrors == null){
                window.customVariables.getThumbnailErrors = {}
            }
            else{
                window.customVariables.getThumbnailErrors = await workers.JSONParseWorker(getGetThumbnailErrors)
            }

            /*if(getAPICache == null){
                window.customVariables.apiCache = {}
            }
            else{
                window.customVariables.apiCache = await workers.JSONParseWorker(getAPICache)
            }*/

            /*if(getCachedAPIItemListRequests == null){
                window.customVariables.cachedAPIItemListRequests = {}
            }
            else{
                window.customVariables.cachedAPIItemListRequests = await workers.JSONParseWorker(getCachedAPIItemListRequests)
            }*/

            if(getItemsCache == null){
                window.customVariables.itemsCache = {}
            }
            else{
                window.customVariables.itemsCache = await workers.JSONParseWorker(getItemsCache)
            }

            try{
                let getCameraUpload = await workers.localforageGetItem("cameraUpload@" + getUserEmail)
    
                if(getCameraUpload){
                    window.customVariables.cameraUpload = await workers.JSONParseWorker(getCameraUpload)
                }
            }
            catch(e){
                console.log(e)
            }

            if(getFolderSizeCache == null){
                window.customVariables.folderSizeCache = {}
            }
            else{
                window.customVariables.folderSizeCache = await workers.JSONParseWorker(getFolderSizeCache)
            }
        }
        else{
            return this.showLogin()
        }
    }

    window.customVariables.apiKey = getUserAPIKey

    window.customFunctions.updateHeightAndWidthState()

    if(networkStatus.connected){
        await window.customFunctions.fetchUserInfo()

        await new Promise((resolve) => {
            this.updateUserKeys(() => {
                resolve()
            })
        })
    }

    if(typeof this.state.userMasterKeys[this.state.userMasterKeys.length - 1] !== "string"){
		return window.customFunctions.logoutUser()
	}

	if(typeof this.state.userMasterKeys[this.state.userMasterKeys.length - 1].length <= 16){
		return window.customFunctions.logoutUser()
	}

    this.updateUserUsage()

    /*clearInterval(window.customVariables.keyUpdateInterval)

    window.customVariables.keyUpdateInterval = setInterval(() => {
        this.updateUserKeys()
    }, 60000)*/

    clearInterval(window.customVariables.usageUpdateInterval)

    window.customVariables.usageUpdateInterval = setInterval(() => {
        this.updateUserUsage()
    }, 30000)

    clearInterval(window.customVariables.getNetworkInfoInterval)

    window.customFunctions.getNetworkInfo()

    window.customVariables.getNetworkInfoInterval = setInterval(() => {
        window.customFunctions.getNetworkInfo()
    }, 60000)

    if(networkStatus.connected){
        this.initSocket()
    
        window.customFunctions.checkVersion()
    }

    window.customFunctions.triggerBiometricAuth()
    //window.customFunctions.isIndexEmpty()

    setTimeout(() => {
        if(Capacitor.isNative){
            SplashScreen.hide()
        }
    }, 1000)

    return this.routeTo("/base")
}